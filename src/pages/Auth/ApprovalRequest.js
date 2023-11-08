import React, { useState } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import { Link } from 'react-router-dom';
import url from '../url'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function ApprovalRequest() {
   const navigate = useNavigate();
   const { token } = useParams(); 
  const [approvalInput, setApproval] = useState({
    reqapproval: '',
    reqdays: '',
    error_list: {},
  });

  const handleInput = (e) => {
    e.persist();
    setApproval({ ...approvalInput, [e.target.name]: e.target.value });
  };

  const ApprovalSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      reqapproval: approvalInput.reqapproval,
      reqdays: approvalInput.reqdays,
    };
  
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+token
      }

      const ApprovalResponse = await axios.post(`${url.baseURL}/submit-request`, data, {headers: headers})

      if (ApprovalResponse.data.status === 200) {
        Swal.fire("Success", ApprovalResponse.data.message, "success");
          navigate('/dashboard');
      } else if (ApprovalResponse.data.status === 400) {
        console.log(ApprovalResponse.data);
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
        Swal.fire("info", ApprovalResponse.data.message, "info");
      } 
      else if(ApprovalResponse.data.status === 420){
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
        Swal.fire("warning", ApprovalResponse.data.message, "warning");
      }
      else {
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });      
      }

    } catch (error) {
      console.error('Approval request failed:', error);
    }
  };
  
  return (
    <div>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4>Approval Request</h4>
              </div>
              <div className="card-body">
                <form onSubmit={ApprovalSubmit}>
                  <div className="form-group mb-3">
                    <label>Reason of Request</label>
                    <textarea
                      rows="3"
                      cols="7"
                      name="reqapproval"
                      onChange={handleInput}
                      value={approvalInput.reqapproval} // Correct variable name
                      className="form-control" required
                    />
                           <span>{approvalInput.error_list.reqapproval}</span>
                  </div>

                  <div className="form-group mb-3">
                    <label>Number of Days Needed</label>
                    <input
                      type="text"
                      name="reqdays"
                      onChange={handleInput}
                      value={approvalInput.reqdays} // Correct variable name
                      className="form-control" required
                    />
                        <span>{approvalInput.error_list.reqdays}</span>
                  </div>

                  <div className="form-group mb-3">
                    <button type="submit" className="btn btn-primary">
                      Send Request
                    </button>
                  </div>
                </form>

                <div className="form-group mb-3">
                  <Link to="/dashboard" className="btn btn-primary text-white">
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalRequest;
