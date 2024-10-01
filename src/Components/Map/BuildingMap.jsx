import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapStyle } from "./MapStyle";

const fallbackLatitude = -26.1893;
const fallbackLongitude = 28.0271;

const customLocations = [
  { name: "Bicycle Rental Station", lat: -26.188, lng: 28.025 },
  { name: "Skateboard Rental Station", lat: -26.189, lng: 28.028 },
  { name: "Bicycle Rental Station", lat: -26.188, lng: 28.029 },
  { name: "Skateboard Rental Station", lat: -26.192, lng: 28.028 },
  { name: "Bicycle Rental Station", lat: -26.191, lng: 28.025 },
  { name: "Skateboard Rental Station", lat: -26.19, lng: 28.026 },
  { name: "Bicycle Rental Station", lat: -26.191, lng: 28.029 },
  { name: "Skateboard Rental Station", lat: -26.189, lng: 28.03 },
  { name: "Bus Station", lat: -26.1907, lng: 28.0282 },
];

const BuildingMap = () => {
  const mapRef = useRef(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [directions, setDirections] = useState(() => {
    const savedDirections = localStorage.getItem("directions");
    return savedDirections ? JSON.parse(savedDirections) : null;
  });
  const [selectedMode, setSelectedMode] = useState("WALKING");
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [isDarkStyle, setIsDarkStyle] = useState(() => {
    const savedStyle = localStorage.getItem("isDarkStyle");
    return savedStyle ? JSON.parse(savedStyle) : true;
  });
  const mapInstanceRef = useRef(null);

  const filterWheelchairAccessibleSteps = (steps) => {
    // Filter out steps that mention stairs or other non-wheelchair-accessible instructions
    return steps.filter((step) => {
      const instruction = step.instructions.toLowerCase();
      return !instruction.includes("stairs") && !instruction.includes("step");
    });
  };

  const calculateRoute = useCallback(
    (origin, destination) => {
      const travelMode =
        selectedMode === "WHEELCHAIR" ? "WALKING" : selectedMode;
      const request = {
        origin: origin,
        destination: destination,
        travelMode: googleMaps.maps.TravelMode[travelMode],
      };

      directionsServiceRef.current.route(request, (response, status) => {
        if (status === "OK") {
          if (selectedMode === "WHEELCHAIR") {
            // Filter the steps to simulate wheelchair accessibility
            response.routes[0].legs[0].steps = filterWheelchairAccessibleSteps(
              response.routes[0].legs[0].steps
            );
          }
          directionsRendererRef.current.setDirections(response);
          const routeDetails = response.routes[0].legs[0];
          setDirections(routeDetails);
          localStorage.setItem("directions", JSON.stringify(routeDetails));
          if (originMarkerRef.current) {
            originMarkerRef.current.setPosition(routeDetails.start_location);
          }
          if (destinationMarkerRef.current) {
            destinationMarkerRef.current.setPosition(routeDetails.end_location);
          }
          localStorage.setItem(
            "route",
            JSON.stringify({
              origin: routeDetails.start_location.toJSON(),
              destination: routeDetails.end_location.toJSON(),
            })
          );
        } else {
          console.log("Directions request failed due to " + status);
          if (status === "ZERO_RESULTS") {
            alert(
              "No route could be found between the origin and destination."
            );
          }
        }
      });
    },
    [googleMaps, selectedMode]
  );

  const createMarkersAndCalculateRoute = useCallback(
    (originLatLng, destinationLatLng) => {
      if (originMarkerRef.current) originMarkerRef.current.setMap(null);
      if (destinationMarkerRef.current)
        destinationMarkerRef.current.setMap(null);

      const newOriginMarker = new googleMaps.maps.Marker({
        position: originLatLng,
        map: directionsRendererRef.current.getMap(),
        draggable: true,
      });
      const newDestinationMarker = new googleMaps.maps.Marker({
        position: destinationLatLng,
        map: directionsRendererRef.current.getMap(),
        draggable: true,
      });
      setOriginMarker(newOriginMarker);
      setDestinationMarker(newDestinationMarker);
      originMarkerRef.current = newOriginMarker;
      destinationMarkerRef.current = newDestinationMarker;

      localStorage.setItem(
        "route",
        JSON.stringify({
          origin: originLatLng.toJSON(),
          destination: destinationLatLng.toJSON(),
        })
      );

      newOriginMarker.addListener("dragend", () => {
        calculateRoute(
          newOriginMarker.getPosition(),
          newDestinationMarker.getPosition()
        );
      });
      newDestinationMarker.addListener("dragend", () => {
        calculateRoute(
          newOriginMarker.getPosition(),
          newDestinationMarker.getPosition()
        );
      });

      calculateRoute(originLatLng, destinationLatLng);
    },
    [googleMaps, calculateRoute]
  );

  const loadPersistedRoute = useCallback(() => {
    if (googleMaps) {
      const savedRoute = localStorage.getItem("route");
      if (savedRoute) {
        const { origin, destination } = JSON.parse(savedRoute);
        const originLatLng = new googleMaps.maps.LatLng(origin.lat, origin.lng);
        const destinationLatLng = new googleMaps.maps.LatLng(
          destination.lat,
          destination.lng
        );
        createMarkersAndCalculateRoute(originLatLng, destinationLatLng);
      }
    }
  }, [googleMaps, createMarkersAndCalculateRoute]);

  const calculateAndDisplayRoute = useCallback(
    (destination) => {
      if (!userLocation || !googleMaps) {
        alert(
          "Unable to access your location or Google Maps is not loaded. Please try again."
        );
        return;
      }
      const originLatLng = new googleMaps.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      );
      createMarkersAndCalculateRoute(originLatLng, destination);
    },
    [userLocation, googleMaps, createMarkersAndCalculateRoute]
  );

  const addCustomLocationMarkers = useCallback(() => {
    if (googleMaps && mapInstanceRef.current) {
      customLocations.forEach((location) => {
        let icon;

        // Define custom icons based on location type
        switch (location.name) {
          case "Bicycle Rental Station":
            icon = {
              url: "https://img.icons8.com/?size=100&id=24077&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(30, 30),
            };
            break;
          case "Skateboard Rental Station":
            icon = {
              url: "https://img.icons8.com/?size=100&id=22466&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(30, 30),
            };
            break;
          case "Bus Station":
            icon = {
              url: "https://img.icons8.com/?size=100&id=rbzJQybQmfOt&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(30, 30),
            };
            break;
          default:
            icon = {
              url: "https://img.icons8.com/?size=100&id=77850&format=png&color=000000",
              scaledSize: new googleMaps.maps.Size(30, 30),
            };
        }

        const marker = new googleMaps.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstanceRef.current,
          icon: icon,
          title: location.name,
        });

        // Create an info window for each marker
        const infoWindow = new googleMaps.maps.InfoWindow({
          content: `<div><h3>${location.name}</h3>
          <p>Lat: ${location.lat}, Lng: ${location.lng}</p>
          <p>Add links and logic here</p>
          </div>`,
        });

        // Add click listener to open info window
        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      });
    }
  }, [googleMaps]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "API KEY HERE",
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then((google) => {
        setGoogleMaps(google);
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });

            watchIdRef.current = navigator.geolocation.watchPosition(
              (pos) =>
                setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              (error) => console.error("Error watching position:", error),
              { enableHighAccuracy: true, timeout: 20000 }
            );
          },
          (error) => {
            console.error("Error getting initial position:", error);
            setUserLocation({ lat: fallbackLatitude, lng: fallbackLongitude });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      })
      .catch((error) => console.error("Error loading Google Maps:", error));

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      googleMaps &&
      mapRef.current &&
      userLocation &&
      !mapInstanceRef.current
    ) {
      mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 17,
        fullscreenControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: true,
        styles: isDarkStyle ? MapStyle : [],
      });

      directionsRendererRef.current.setMap(mapInstanceRef.current);

      new googleMaps.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        icon: {
          path: googleMaps.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#4285F4",
          fillOpacity: 1,
        },
      });

      window.addEventListener("resize", () =>
        mapInstanceRef.current.setCenter(userLocation)
      );

      loadPersistedRoute();

      addCustomLocationMarkers();

      mapInstanceRef.current.addListener("click", (e) =>
        calculateAndDisplayRoute(e.latLng)
      );
    }
  }, [
    googleMaps,
    userLocation,
    calculateAndDisplayRoute,
    isDarkStyle,
    loadPersistedRoute,
    addCustomLocationMarkers,
  ]);

  const toggleMapStyle = () => {
    setIsDarkStyle((prevIsDarkStyle) => {
      const newIsDarkStyle = !prevIsDarkStyle;
      localStorage.setItem("isDarkStyle", JSON.stringify(newIsDarkStyle));

      if (mapInstanceRef.current && googleMaps) {
        mapInstanceRef.current.setOptions({
          styles: newIsDarkStyle ? MapStyle : [],
        });
      }

      return newIsDarkStyle;
    });
  };

  const recenterMapToUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.panTo(userLocation);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {directions && (
        <div
          className="turn-by-turn hidden"
          style={{
            position: "absolute",
            top: "90px",
            left: "30px",
            zIndex: "1000",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px6px rgba(0 ,0 ,0 ,0.3)",
            maxHeight: "calc(100vh -120px)",
            overflowY: "auto",
            minWidth: "300px",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: "0" }}>Directions:</h3>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                if (originMarker && destinationMarker) {
                  calculateRoute(
                    originMarker.getPosition(),
                    destinationMarker.getPosition()
                  );
                }
              }}
              style={{ padding: "5px" }}
            >
              <option value="WALKING">Walking</option>
              <option value="DRIVING">Driving</option>
              <option value="BICYCLING">Bicycling</option>
              <option value="TRANSIT">Transit</option>
              <option value="WHEELCHAIR">Wheelchair Accessible</option>
            </select>
          </div>

          {selectedMode === "WHEELCHAIR" && (
            <div style={{ marginBottom: "10px", color: "red" }}>
              <strong>Disclaimer:</strong> These directions attempt to provide
              wheelchair-accessible routes but may not account for all
              obstacles.
            </div>
          )}

          <button
            onClick={toggleMapStyle}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: isDarkStyle ? "#aab9c9" : "#1d2c4d",
              color: "white",
              borderRadius: "5px",
            }}
          >
            {isDarkStyle ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>

          <button
            onClick={recenterMapToUserLocation}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Recenter Map
          </button>

          <p>Distance: {directions.distance.text}</p>
          <p>Duration: {directions.duration.text}</p>

          <ol style={{ paddingLeft: "30px" }}>
            {directions.steps.map((step, index) => (
              <li
                key={index}
                dangerouslySetInnerHTML={{
                  __html: step.instructions.replace(/walk/gi, "proceed"),
                }}
                style={{ marginBottom: "10px" }}
              ></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default BuildingMap;
