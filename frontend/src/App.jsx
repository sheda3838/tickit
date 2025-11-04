import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./Signup/Signup";
import Signin from "./Signin/Signin";
import Home from "./Home/Home";
import VerifyEmail from "./VerifyEmail/VerifyEmail";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/signup" element={<Signup />}/>
          <Route path="/signin" element={<Signin />}/>
          <Route path="/verify-email" element={<VerifyEmail />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
