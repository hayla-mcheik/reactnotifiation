import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import url from '../url'
function Login() {
  const navigate = useNavigate();
  const [loginInput, setLogin] = useState({
    email: '',
    password: '',
    error_list: {},
  });

  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setLogin({ ...loginInput, [name]: value });
  }

  useEffect(() => {

    const auth_token = localStorage.getItem('auth_token');
    if (auth_token) {
      setIsAuthenticated(true);
    }
  }, []);

  const loginSubmit = async (e) => {
    e.preventDefault();
  
    if (isAuthenticated) {
      setAlreadyLoggedIn(true);
      return;
    }
  
    const data = {
      email: loginInput.email,
      password: loginInput.password,
    };
  
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      };
      const loginResponse = await axios.post(`${url.baseURL}/login`, data, { headers: headers });
  
      if (loginResponse.data.status === 200) {
        localStorage.setItem('auth_token', loginResponse.data.token);
        localStorage.setItem('auth_name', loginResponse.data.username);
        setToken(loginResponse.data.token);
        setIsAuthenticated(true);
        Swal.fire("You are logged in", loginResponse.data.message, "success");

        setTimeout(() => {
          const url = '/dashboard';
          window.location.href = url;
        }, 1000); 
      } else if (loginResponse.data.status === 401) {
        Swal.fire("Warning", loginResponse.data.message, "warning");
      } else {
        Swal.fire("Please Verify your email to log in", loginResponse.data.message, "info");
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4>Login</h4>
              </div>
              <div className="card-body">

                <form onSubmit={loginSubmit}>
                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input
                      type="text"
                      name="email"
                      onChange={handleInput}
                      value={loginInput.email}
                      className="form-control"
                    />
                    <span>{loginInput.error_list.email}</span>
                  </div>
                  <div className="form-group mb-3">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      onChange={handleInput}
                      value={loginInput.password}
                      className="form-control"
                    />
                    <span>{loginInput.error_list.password}</span>
                  </div>
                  <div className="form-group mb-3">
                    <button className="btn btn-primary">Login</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
