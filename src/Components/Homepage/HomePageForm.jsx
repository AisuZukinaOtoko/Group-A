import React, { useEffect, useState } from "react";
import "./HomePageForm.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { useLocation } from "react-router-dom";
import BuildingMap from "../Map/BuildingMap.jsx";
//import { FaRegListAlt } from "react-icons/fa";
//import { IoEyeSharp, IoMailSharp } from "react-icons/io5";
//import { useNavigate } from "react-router-dom";

const HomepageForm = () => {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (location.state && location.state.fullName) {
      setFullName(location.state.fullName);
      setShowWelcome(true);

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="homepage-container">
      <SideMenu />
      <div className="content-container map-back">
        <div className="back">
          <BuildingMap />
        </div>
        <div className="front">
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default HomepageForm;
