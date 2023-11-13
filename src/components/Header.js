import React, { useState } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import { Link , useLocation , Routes , Route} from 'react-router-dom';
import url from '../pages/url';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ViewRequest from "../pages/ViewRequest";

function Header() {

const [name , setName] =useState("");

  const logoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url.baseURL}/logout`);
      const res = response.data;
      if (res.status === 200) {
        console.log(res);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_name');
        Swal.fire("Success", res.message, "success");
        setTimeout(()=>{
        const url = '/login';
        window.location.href = url;
        }, 1000);

      }    
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow sticky-top">
        <div className="container-fluid m-3">
          <a className="navbar-brand" href="#">
            <img src="https://tecomsa.me/content/assets/images/new/logo70.png" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">

            <li className="nav-item">
                <a className="nav-link text-white text-capitalize">{localStorage.getItem('auth_name')}</a>
              </li>

              <li className="nav-item">
                <a className="nav-link text-white" type="submit" onClick={logoutSubmit}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>


      
    </div>
  );
}

export default Header;
