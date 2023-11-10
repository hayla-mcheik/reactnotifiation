import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams , Link} from 'react-router-dom';
import Header from "../components/Header";
import url from './url';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {


  const [notifications, setNotifications] = useState([]);

  const { token } = useParams();
  const [approvalInput, setApproval] = useState({
    reqapproval: '',
    reqdays: '',
    error_list: {},
  });
  const [approvalRequests, setApprovalRequests] = useState([]); 

  const handleInput = (e) => {
    e.persist();
    setApproval({ ...approvalInput, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    const modal = document.getElementById('exampleModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  };

  useEffect(() => {

    const fetchApprovalRequests = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        };

        const response = await axios.get(`${url.baseURL}/approval-requests`, { headers });

        if (response.data.status === 200) {
          setApprovalRequests(response.data.approvalRequests);
        }
      } catch (error) {
        console.error('Failed to fetch approval requests:', error);
      }
    };

    fetchApprovalRequests();
  }, [token]);
  const ApprovalSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      reqapproval: approvalInput.reqapproval,
      reqdays: approvalInput.reqdays,
    };
  
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      };
  
      const ApprovalResponse = await axios.post(`${url.baseURL}/submit-request`, data, { headers });
      if (ApprovalResponse.data.status === 200) {
   
        Swal.fire("Success", ApprovalResponse.data.message, "success").then(() => {
          closeModal(); 
        });
  

        setApprovalRequests((prevApprovalRequests) => [
          ...prevApprovalRequests,
          {
            reqapproval: approvalInput.reqapproval,
            reqdays: approvalInput.reqdays,
            status: 'Pending',
          }
        ]);
  
        setApproval({
          reqapproval: '',
          reqdays: '',
          error_list: {},
        });
  
      } else if (ApprovalResponse.data.status === 400) {
        console.log(ApprovalResponse.data);
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
        Swal.fire("info", ApprovalResponse.data.message, "info");
      } else if (ApprovalResponse.data.status === 420) {
        Swal.fire("warning", ApprovalResponse.data.message, "warning");
      } else {
        console.log(ApprovalResponse.data.token);
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
      }
    } catch (error) {
      console.error('Approval request failed:', error);
    }
  };
  


  const [approvalUpdates, setApprovalUpdates] = useState([]);



  useEffect(() => {
    const pusher = new Pusher('c92de035c19a321f7907', {
      cluster: 'ap2',
      encrypted: true,
    });

    const channel = pusher.subscribe('approval-updates');
    channel.bind('App\\Events\\ApprovalStatusUpdated', (data) => {
      console.log('Received event:', data);

      // Show a notification when the status is updated
      toast.success(`Status updated: ${data.message}`, {
        position: 'top-right',
        autoClose: 3000, // Close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // You can also update the component state or perform other actions based on the event data
    });

    return () => {
      // Unsubscribe when the component unmounts
      pusher.unsubscribe('approval-updates');
    };
  }, []);
  
  return (
    <div>
      <Header />
      <div className="container-fluid">
    <div className="row flex-nowrap">

        <div className="col py-3">
        <div className="container mt-5">



        <ToastContainer />

        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Send Request
        </button>

        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Send Request</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={ApprovalSubmit}>
                  <div className="form-group mb-3">
                    <label>Reason of Request</label>
                    <textarea
                      rows="3"
                      cols="7"
                      name="reqapproval"
                      onChange={handleInput}
                      value={approvalInput.reqapproval}
                      className="form-control"
                      required
                    />
                    <span>{approvalInput.error_list.reqapproval}</span>
                  </div>

                  <div className="form-group mb-3">
                    <label>Number of Days Needed</label>
                    <input
                      type="text"
                      name="reqdays"
                      onChange={handleInput}
                      value={approvalInput.reqdays}
                      className="form-control"
                      required
                    />
                    <span>{approvalInput.error_list.reqdays}</span>
                  </div>

                  <div className="form-group mb-3">
                    <button type="submit" className="btn btn-primary">
                      Send Request
                    </button>
                  </div>
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
</div>

<div className="container mt-5">
        <h3>Your Requests</h3>
        <table className="table mt-5">
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Reason</th>
              <th scope="col">Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {approvalRequests.map((request, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{request.reqapproval}</td>
                <td>{request.reqdays}</td>
                <td>{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
