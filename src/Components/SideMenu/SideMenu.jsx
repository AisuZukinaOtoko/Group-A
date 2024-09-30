import React from "react";
import { useNavigate } from "react-router-dom";
import "./SideMenu.css"; // Import your CSS file
import logo from "../Assets/black_logo.jpg";
import { MdLocationPin } from "react-icons/md";
import { MdDirectionsBus } from "react-icons/md";
import { TbRoute } from "react-icons/tb";
import { MdAccountCircle } from "react-icons/md";
import { MdLogout } from "react-icons/md";

const SideMenu = () => {
  const navigate = useNavigate();

  const handleHOME = () => {
    navigate("/Homepage");
  };

  const handleBUS = () => {
    navigate("/BusSchedule");
  };

  const handleRentals = () => {
    navigate("/Rentals");
  };

  const handleLogOut = () => {
    navigate("/Logout");
  };

  const handleProfile = () => {
    navigate("/Profile");
  };

  return (
    <div className="side-menu">
      <img src={logo} alt="logo" className="logo" />
      <div className="menu-divider"></div> {/* Divider Line */}
      <div className="menu-item">
        <a onClick={handleHOME}>
          <span>
            {" "}
            <MdLocationPin className="icon" />
          </span>
          <span className="menu-text">Home</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleBUS}>
          <span>
            <MdDirectionsBus className="icon" />
          </span>
          <span className="menu-text">Bus Schedule</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleRentals}>
          <span>
            <TbRoute className="icon" />
          </span>
          <span className="menu-text">Rentals</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleProfile}>
          <span>
            <MdAccountCircle className="icon" />
          </span>
          <span className="menu-text">Profile</span>
        </a>
      </div>
      <div className="menu-item">
        <a onClick={handleLogOut}>
          <span>
            <MdLogout className="icon" />
          </span>
          <span className="menu-text">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default SideMenu;
