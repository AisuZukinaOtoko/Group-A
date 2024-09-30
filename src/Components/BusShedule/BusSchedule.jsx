import React, { useEffect, useState } from "react";
import "./BusSchedule.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import BuildingMap from "../Map/BuildingMap";
import axios from "axios";
//import { FaRegListAlt } from "react-icons/fa";
//import { IoEyeSharp, IoMailSharp } from "react-icons/io5";
//import { useNavigate } from "react-router-dom";

const Busschedule = () => {
  const [buses, setBuses] = useState([]);

  //Get data
  useEffect(() => {
    // Fetch data from your API
    axios
      .get("https://campus-transport.azurewebsites.net/getSchedule")
      .then((response) => {
        setBuses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="Bus-container">
      <div className="content-container map-back">
        <div className="back">
          <BuildingMap />
        </div>
        <div className="front">
          <SideMenu />
          <div>
            <SearchBar id="busSearch" />
            <div className="bus-schedule-container">
              <h2 className="BUs">Bus Schedule</h2>
              <div className="schedule">
                {buses.map((item, index) => (
                  <div className="schedule-item" key={index}>
                    <div className="time">{item.time}</div>
                    <div className="circle"></div>
                    <div className="details">
                      <h3>{item.routename}</h3>
                      <p>{item.route}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Busschedule;
