import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom'; 
import url from '../url';

function Login() {
  const [loginInput, setLogin] = useState({
    email: '',
    password: '',
    error_list: {},
    
  });
  
  const [token,setToken]=useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setLogin({ ...loginInput, [name]: value });
  }



const loginSubmit = async (e) => {
  e.preventDefault();

  const data = {
    email: loginInput.email,
    password: loginInput.password,
    
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    }
    const loginResponse = await axios.post(`${url.baseURL}/login`, data, {headers: headers});

    if (loginResponse.data.status === 200) {
      console.log(loginResponse.data.token);
      setToken(loginResponse.data.token);
      setIsAuthenticated(true);
      Swal.fire("Please make an approval request", loginResponse.data.message, "success");
    } else if (loginResponse.data.status === 401) {
      Swal.fire("Warning", loginResponse.data.message, "warning");
      // Handle the case where the user is not authenticated, e.g., redirect to the login page.
    } else {
      Swal.fire("Please Verify your email to log in", loginResponse.data.message, "info");
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}


  return (
    <div>
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
                {isAuthenticated ? (
                  <div className="form-group mb-3">
                    <Link to={"/approvalrequest/"+token} className="btn btn-primary text-white">
                      Approval Request
                    </Link>
                  </div>
                ) : (
                  <div className="form-group mb-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        Swal.fire("Please login before making an approval request", "", "info");
                      }}
                    >
                      Approval Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
