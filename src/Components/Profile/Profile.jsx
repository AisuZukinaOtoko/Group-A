import React, { useEffect, useState } from "react";
import "./Profile.css";
import SideMenu from "../SideMenu/SideMenu";
import SearchBar from "../SearchBar/SearchBar";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";
import auth from "../../utils/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BuildingMap from "../Map/BuildingMap";

const Profile = () => {
  const [buses, setBuses] = useState([]);
  const [fullName, setFullName] = useState("John Doe"); // Default to "John Doe" for now
  const [email, setEmail] = useState("uhone1593@gmail.com"); // Existing email
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle password reset form within the card

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add("hide-mapbox-controls");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("hide-mapbox-controls");
    };
  }, []);

  // Get data
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

  // Handle password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email); // Use the email stored in state
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false); // Close the form after sending the email
    } catch (error) {
      console.error(error.message);
      toast.error("Error sending password reset email. Please try again.");
    }
  };

  return (
    <div className="Profile-container map-back">
      <div className="back">
        <BuildingMap />
      </div>

      <div className="front">
        <SideMenu />
        <div>
          <SearchBar id="busSearch" />

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-picture">
                <FaUser className="ProfileIcon1" />
              </div>
              <div className="profile-info">
                <h2>Hello</h2>
                <p className="name">{fullName}</p>
                <p className="name">{email}</p>
                {/* Change Password Link */}
                <div className="change">
                  <a href="#" onClick={() => setShowForgotPassword(true)}>
                    Change password
                  </a>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "60%" }}></div>
                  </div>
                  <span>
                    <p className="credits">40/60 KuduBucks</p>
                  </span>
                </div>
              </div>
            </div>

            {!showForgotPassword ? (
              <>
                {/* Profile Stats */}
                <div className="profile-stats">
                  <div className="stat-item">
                    <h3>2</h3>
                    <p>Rented vehicles</p>
                  </div>
                  <div className="stat-item">
                    <h3>40</h3>
                    <p>KuduBucks</p>
                  </div>
                  <div className="stat-item">
                    <h3>23</h3>
                    <p>Vehicles Available</p>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="rent-history">
                  <h4>Rent History</h4>
                  <p className="rentinfo">
                    24/09/2024 - Rented a bicycle(BikeID) at FNB
                  </p>
                  <p className="rentinfo">
                    24/09/2024 - Rented a bicycle at FNB
                  </p>
                  <p className="rentinfo">
                    24/09/2024 - Rented a bicycle at FNB
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Reset Password Form inside the card */}
                <form onSubmit={handleForgotPassword} className="reset">
                  <h2>Reset Password</h2>
                  <p>A reset link will be sent to your email: {email}</p>
                  <button type="submit" className="btn-">
                    Send Reset Email
                  </button>
                  <br />
                  <br />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="btn-"
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;
