import React, { useState, useEffect } from "react";
import "./LoginForm.css";
import { IoEyeSharp, IoEyeOffSharp, IoMailSharp } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import auth from "../../utils/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState(""); // For resetting password
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle between login and forgot password form
  const [showPassword, setShowPassword] = useState(false); //showing/hiding password

  useEffect(() => {
    // Show success message if redirected from signup
    if (location.state?.success) {
      toast.success("Sign-up successful! Please log in.", {
        position: "top-right",
        autoClose: 6000,
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSignUpClick = () => {
    navigate("/Signup");
  };

  const onLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/homepage"); // Redirect to homepage on successful login
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  // Handle password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false); // Close the forgot password form
    } catch (error) {
      console.error(error.message);
      toast.error("Error sending password reset email. Please try again.");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="wrapper_login">
      <div className="wrapper_alpha_login">
        {!showForgotPassword ? (
          <form onSubmit={onLogin}>
            <h1>Welcome to On-Site</h1>
            <div className="register-link">
              <p>
                Don't have an account?{" "}
                <a onClick={handleSignUpClick}>Sign Up</a>
              </p>
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
                <IoEyeSharp
                  className="icon"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
            <div className="forgot">
              <a href="#" onClick={() => setShowForgotPassword(true)}>
                Forgot password ?
              </a>
            </div>
            <button type="submit">Sign in</button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <h1>Reset Password</h1>
            <p>Enter your email to receive a password reset link.</p>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <IoMailSharp className="icon" />
            </div>

            <button type="submit">Send Reset Email</button>
            <br />
            <br />
            <button type="button" onClick={() => setShowForgotPassword(false)}>
              Cancel
            </button>
          </form>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default LoginForm;
