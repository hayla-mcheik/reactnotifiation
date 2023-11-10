import React from 'react';
import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom'; // Import Navigate
import Navbar from "./components/Navbar";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import VerifyCode from "./pages/Auth/VerifyCode";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import {useLocation } from "react-router-dom";
import axios from 'axios';

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('auth_token');
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

function App() {
  const isUserAuthenticated = !!localStorage.getItem('auth_token');


  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              isUserAuthenticated ? 
                <Navigate to="/dashboard" /> : <Login />             
            }
          />
          <Route
            path="/register"
            element={
              isUserAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Register />
              )
            }
          />
          <Route path="/verify/email/:email" element={<VerifyCode />} />
          <Route
            path="/dashboard"
            element={
              isUserAuthenticated ? (
                <Dashboard />
              ) : (
                <Login />
              )
            }
          />


          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
