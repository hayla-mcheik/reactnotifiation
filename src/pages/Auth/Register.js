import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import url from '../url';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
function Register() {


  const navigate = useNavigate();
  const [registerInput, setRegister] = useState({
    name: '',
    email: '',
    password: '',
    error_list: {},
  });

  const handleInput = (e) => {
    e.persist();
    setRegister({ ...registerInput, [e.target.name]: e.target.value });
  };

  const registerSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: registerInput.name,
      email: registerInput.email,
      password: registerInput.password,
    };

    try {

      const registerResponse = await axios.post(`${url.baseURL}/register`, data);

      if (registerResponse.data.status === 200) {

        localStorage.setItem('auth_token', registerResponse.data.token);
        localStorage.setItem('auth_name', registerResponse.data.username);
        Swal.fire('Success', registerResponse.data.message, 'success');
        Swal.fire('Info', 'Please check your email for verification.', 'info');
        navigate(`/verify/email/${registerInput.email}`);


      } else {

        setRegister({ ...registerInput, error_list: registerResponse.data.validation_errors });
      }

    }




     catch (error) {
      console.error('Registration failed:', error);
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
                <h4>Register</h4>
              </div>
              <div className="card-body">
                <form onSubmit={registerSubmit}>
                  <div className="form-group mb-3">
                    <label>Full Name</label>
                    <input type="text" name="name" onChange={handleInput} value={registerInput.name} className="form-control" />
                    <span>{registerInput.error_list.name}</span>
                  </div>
                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input type="text" name="email" onChange={handleInput} value={registerInput.email} className="form-control" />
                    <span>{registerInput.error_list.email}</span>
                  </div>
                  <div className="form-group mb-3">
                    <label>Password</label>
                    <input type="password" name="password" onChange={handleInput} value={registerInput.password} className="form-control" />
                    <span>{registerInput.error_list.password}</span>
                  </div>
                  <div className="form-group mb-3">
                    <button type="submit" className="btn btn-primary">Register</button>
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

export default Register;
