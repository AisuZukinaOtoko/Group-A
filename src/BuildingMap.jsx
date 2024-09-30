import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapStyle } from "./MapStyle";

const fallbackLatitude = -26.1893;
const fallbackLongitude = 28.0271;

const BuildingMap = () => {
  const mapRef = useRef(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [directions, setDirections] = useState(() => {
    const savedDirections = localStorage.getItem("directions");
    return savedDirections ? JSON.parse(savedDirections) : null;
  });
  const [selectedMode, setSelectedMode] = useState("WALKING");
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Initialize isDarkStyle with value from localStorage
  const [isDarkStyle, setIsDarkStyle] = useState(() => {
    const savedStyle = localStorage.getItem("isDarkStyle");
    return savedStyle ? JSON.parse(savedStyle) : true; // Default to dark style
  });

  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyCcnTZtoi3rJFmg07rgC28QM5cdyKV8hTo",
      version: "weekly",
      libraries: ["places"],
    });
    loader
      .load()
      .then((google) => {
        setGoogleMaps(google);
        setDirectionsService(new google.maps.DirectionsService());
        const renderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
        });
        setDirectionsRenderer(renderer);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              const id = navigator.geolocation.watchPosition(
                (pos) => {
                  setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  });
                },
                (error) => {
                  console.error("Error watching position:", error);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
              );
              setWatchId(id);
            },
            (error) => {
              console.error("Error getting initial position:", error);
              setUserLocation({
                lat: fallbackLatitude,
                lng: fallbackLongitude,
              });
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          console.log("Error: Your browser doesn't support geolocation.");
          setUserLocation({ lat: fallbackLatitude, lng: fallbackLongitude });
        }
      })
      .catch((error) => console.error("Error loading Google Maps:", error));

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (googleMaps && mapRef.current && userLocation) {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 17,
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          streetViewControl: true,
          styles: isDarkStyle ? MapStyle : [],
        });
        directionsRenderer.setMap(mapInstanceRef.current);
        new googleMaps.maps.Marker({
          position: userLocation,
          map: mapInstanceRef.current,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        window.addEventListener("resize", () =>
          mapInstanceRef.current.setCenter(userLocation)
        );

        mapInstanceRef.current.addListener("click", (e) => {
          calculateAndDisplayRoute(e.latLng);
        });

        loadPersistedRoute();
      } else {
        mapInstanceRef.current.setOptions({
          center: userLocation,
          styles: isDarkStyle ? MapStyle : [],
        });
      }
    }
  }, [googleMaps, userLocation, isDarkStyle]);

  const loadPersistedRoute = () => {
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
  };

  const createMarkersAndCalculateRoute = (originLatLng, destinationLatLng) => {
    if (originMarker) originMarker.setMap(null); // Remove previous origin marker
    if (destinationMarker) destinationMarker.setMap(null); // Remove previous destination marker

    const newOriginMarker = new googleMaps.maps.Marker({
      position: originLatLng,
      map: directionsRenderer.getMap(),
      draggable: true,
    });

    const newDestinationMarker = new googleMaps.maps.Marker({
      position: destinationLatLng,
      map: directionsRenderer.getMap(),
      draggable: true,
    });

    setOriginMarker(newOriginMarker);
    setDestinationMarker(newDestinationMarker);

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
  };

  const calculateAndDisplayRoute = (destination) => {
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
  };

  const calculateRoute = (origin, destination) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: googleMaps.maps.TravelMode[selectedMode],
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
          const routeDetails = response.routes[0].legs[0];
          setDirections(routeDetails);

          localStorage.setItem("directions", JSON.stringify(routeDetails));

          if (originMarker) {
            originMarker.setPosition(routeDetails.start_location);
          }

          if (destinationMarker) {
            destinationMarker.setPosition(routeDetails.end_location);
          }

          // Persist updated route
          localStorage.setItem(
            "route",
            JSON.stringify({
              origin: routeDetails.start_location.toJSON(),
              destination: routeDetails.end_location.toJSON(),
            })
          );
        } else {
          console.log("Directions request failed due to " + status);
        }
      }
    );
  };

  // Toggle function that also updates localStorage
  const toggleMapStyle = () => {
    setIsDarkStyle((prevIsDarkStyle) => !prevIsDarkStyle);

    // Save the current style preference in localStorage
    localStorage.setItem("isDarkStyle", JSON.stringify(!isDarkStyle));
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {directions && (
        <div
          className="turn-by-turn hidden"
          style={{
            position: "absolute",
            top: "90px",
            left: "30px",
            zIndex: 1000,
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            maxHeight: "calc(100vh - 120px)",
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
            <h3 style={{ margin: 0 }}>Directions:</h3>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                if (directions && originMarker && destinationMarker) {
                  calculateRoute(
                    originMarker.getPosition(),
                    destinationMarker.getPosition()
                  );
                }
              }}
              style={{ padding: "5px" }}
            >
              <option value="DRIVING">Driving</option>
              <option value="WALKING">Walking</option>
              <option value="BICYCLING">Bicycling</option>
              <option value="TRANSIT">Transit</option>
            </select>
          </div>
          <button
            onClick={toggleMapStyle}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: isDarkStyle ? "#aab9c9" : "#1d2c4d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isDarkStyle ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          <p>Distance: {directions.distance.text}</p>
          <p>Duration: {directions.duration.text}</p>
          <ol style={{ paddingLeft: "30px" }}>
            {directions.steps.map((step, index) => (
              <li
                key={index}
                dangerouslySetInnerHTML={{ __html: step.instructions }}
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
