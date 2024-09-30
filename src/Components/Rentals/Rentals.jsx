import React, { useState, useEffect } from "react";
import "./Rentals.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import BuildingMap from "../Map/BuildingMap";

const Rentals = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  const bicycles = [
    {
      name: "Bicycle A",
      location: "OLS",
      availability: "10/20",
      distance: "5m",
    },
    {
      name: "Bicycle B",
      location: "FNB",
      availability: "10/20",
      distance: "50m",
    },
    {
      name: "Bicycle C",
      location: "Wits sports hall",
      availability: "10/20",
      distance: "100m",
    },
    {
      name: "Bicycle D",
      location: "NCB",
      availability: "10/20",
      distance: "150m",
    },
    {
      name: "Bicycle E",
      location: "NCB",
      availability: "10/20",
      distance: "200m",
    },
  ];

  const handleRentClick = (bike) => {
    setSelectedBike(bike);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBike(null);
  };

  return (
    <div className="rentals-container map-back">
      <div className="">
        <div className="back">
          <BuildingMap />
        </div>

        <div className="front">
          <SideMenu />
          <div>
            <SearchBar />
            <div className="bicycle-list" id="rentalsWidth">
              {bicycles.map((bike, index) => (
                <div className="bicycle-item" key={index}>
                  <h3>{bike.name}</h3>
                  <p>
                    Location: {bike.location} Availability: {bike.availability}
                  </p>
                  <p>Distance: {bike.distance}</p>
                  <a
                    href="#"
                    className="rent-link"
                    onClick={() => handleRentClick(bike)}
                  >
                    Rent
                  </a>
                </div>
              ))}
            </div>
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h4>Rent {selectedBike?.name}</h4>
                <p>
                  Are you sure you want to rent this bicycle? <br />
                  Location: {selectedBike?.location} <br />
                  Distance: {selectedBike?.distance}
                </p>
                <button className="rentBtn" onClick={handleClosePopup}>
                  rent
                </button>
                <button className="closeBtn" onClick={handleClosePopup}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rentals;
