import React, { useState } from "react";
import "./SignupForm.css";
import { FaRegListAlt } from "react-icons/fa";
import { IoEyeSharp, IoEyeOffSharp, IoMailSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../../utils/firebase";

const db = getFirestore();

const validatePassword = (password) => {
  // Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
};

const SignUpForm = () => {
  const navigate = useNavigate();

  // State variables for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      );
      return;
    }
    try {
      // Create a new user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Add the user's details to Firestore
      await setDoc(doc(db, "Users", userCredential.user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
      });

      toast.success("Account created successfully! Please verify your email.");
      navigate("/", { state: { success: true } });
    } catch (error) {
      // Handle any errors that may occur during signup
      toast.error(error.message);
    }
  };

  const handleLoginClick = () => {
    // If the user navigates to login without signing up, do not pass the success state
    navigate("/");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="wrapper_signup">
      <div className="wrapper_alpha_signup">
        <form className="SignupForm" onSubmit={handleSubmit}>
          <h1>Welcome to On-Site</h1>
          <div className="register-link">
            <p>
              Already have an account? <a onClick={handleLoginClick}>Log In</a>
            </p>
          </div>

          <div className="wrapper_beta">
            <div className="input-box-small1">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <FaRegListAlt className="icon" />
            </div>

            <div className="input-box-small2">
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <FaRegListAlt className="icon" />
            </div>
          </div>

          <div className="input-box">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <IoMailSharp className="icon" />
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"} // Toggle between password and text
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Toggle icon between show/hide */}
            {showPassword ? (
              <IoEyeOffSharp
                className="icon"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <IoEyeSharp className="icon" onClick={togglePasswordVisibility} />
            )}
          </div>

          <button type="submit">Sign up</button>
        </form>
        {/* Toast container to display notifications */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignUpForm;
