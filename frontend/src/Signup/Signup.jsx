import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import axios from "axios";
import { notifySuccess, notifyError, notifyInfo } from "../utils/toast";

function Signup() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const r = await axios.post("/api/signup", values);

    if (r.data.error) {
      notifyError(r.data.error);
      return;
    }

    if (r.data.exists) {
      notifyInfo("Email already exists - Please sign in");
      return;
    }

    if (r.data.success) {
      notifyInfo("Signup successful! Check your email to verify your account.");
    }
  } catch (err) {
    notifyError(err.message);
  }
};


  // ----------------- Google Signup/Login -----------------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("/api/google/token", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        notifySuccess("Signup success");
        navigate("/"); // redirect after Google signup/login
      }
    } catch (err) {
      notifyError("Google Signup/Login Error:", err.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name here..."
            onChange={handleInput}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email here..."
            onChange={handleInput}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password here..."
            onChange={handleInput}
          />

          <button>Signup</button>
        </form>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Signup Failed")}
            text="signup_with"
          />
        </div>

        <h3>Already have an account?</h3>
        <Link to="/signin">Signin</Link>
      </div>
    </div>
  );
}

export default Signup;
