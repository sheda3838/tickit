import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import "./Signin.css";
import axios from "axios";
import { notifySuccess, notifyError } from "../utils/toast";

function Signin() {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/user");
        if (r.data.loggedin) {
          setName(r.data.name);
        } else {
          console.log("Unauthorized access");
          navigate("/signin");
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchUser(); // 👈 actually call it
  }, []);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [values, setValues] = useState({
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

    axios
      .post("/api/signin", values)
      .then((r) => {
        if (r.data.error) {
          notifyError(r.data.error); // ✅ works fine
          return;
        }
        if (r.data.success) {
          notifySuccess("Signin successful! 🎉");
          navigate("/");
        }
      })
      .catch((err) => {
        notifyError(err.message || "Something went wrong!");
      });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("/api/google/token", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        notifySuccess("Signed in with Google successfully! 🚀");
        navigate("/");
      }
    } catch (err) {
      notifyError(err.message || "Google Signin failed!");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        
        <h1>Signin</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email..."
            onChange={handleInput}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password..."
            onChange={handleInput}
          />

          <button>Signin</button>
        </form>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => notifyError("Google Signin Failed")}
          />
        </div>

        <h3>Don't have an account?</h3>
        <Link to="/signup">Signup</Link>
      </div>
    </div>
  );
}

export default Signin;
