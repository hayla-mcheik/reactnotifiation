import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import url from '../url';
import { useNavigate } from 'react-router-dom';

function VerifyCode() {
  const navigate = useNavigate();
  const { email } = useParams(); 

  const [verifycode, setVerifyCode] = useState({
    code: '',
    error_list: {},
  });

  const handleInput = (e) => {
    setVerifyCode({ ...verifycode, [e.target.name]: e.target.value });
  }

  const verificationcodeSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      email: email,
      verification_code: verifycode.code,
    };
  
    try {
      const verifyresponse = await axios.post(`${url.baseURL}/verification-code/${email}`, data);
  
      if (verifyresponse.data.success) {
        if (verifyresponse.data.status === 'active') {
          console.log(verifyresponse.data);
          Swal.fire("You are verified and can log in", verifyresponse.data.message, "success");
          navigate('/dashboard');
        } else {
          Swal.fire("You are not verified and cannot log in", verifyresponse.data.message, "warning");
        }
      } else {
        Swal.fire("Verification failed", verifyresponse.data.message, "error");
      }
    } catch (error) {
      console.error('Incorrect Code:', error);
    }
  }
  

  return (
    <div>
      <div className="container mt-5">
        <div className="row">
          <div className="col-12 col-md-6">
       
              <h6 >Verification Code</h6>
              <input type="text" name="code" className="form-control mb-2" onChange={handleInput} />
              <button class="btn btn-primary" onClick={verificationcodeSubmit}>Submit</button>
     
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCode;
