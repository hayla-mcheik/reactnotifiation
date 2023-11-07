import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyCode  from "./pages/Auth/VerifyCode";
import ApprovalRequest from "./pages/Auth/ApprovalRequest";
import Dashboard from "./pages/Dashboard";


import axios from 'axios'

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Now you can use csrfToken in your Axios request
axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

// import pusher from './pusher'; 

function App() {


  return (
    <div className="App">
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/approvalrequest/:token" element={<ApprovalRequest />} />
          <Route path="/verify/email/:email" element={<VerifyCode />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
