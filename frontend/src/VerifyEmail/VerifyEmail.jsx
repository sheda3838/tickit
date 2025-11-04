import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from "../utils/toast";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [status, setStatus] = useState("Verifying your email...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid verification link");
      return;
    }

    axios
      .get(`/api/verify-email?token=${token}`)
      .then((res) => {
        setStatus(res.data || "Email verified successfully!");
        notifySuccess("Email verified successfully! Please log in.");
        setTimeout(() => navigate("/signin"), 2000);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Verification failed or token expired.");
        setStatus("Verification failed or token expired.");
      });
  }, [searchParams, navigate]);

  return (
     <div className="verify-container">
      <div className="verify-box">
        <h2 className={`verify-title ${status.includes("failed") || status.includes("Invalid") ? "error" : "success"}`}>
          {status}
        </h2>
        <p className="verify-subtext">
          {status.includes("successfully") ? "Redirecting to login..." : ""}
        </p>
        <div className="verify-loader"></div>
      </div>
    </div>
  );
}

export default VerifyEmail;
