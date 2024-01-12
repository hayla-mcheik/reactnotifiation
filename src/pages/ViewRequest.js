// AddRequest.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import url from './url';
import Echo from 'laravel-echo';

function ViewRequest() {
  const { token } = useParams();

  const [approvalInput, setApproval] = useState({
    reqapproval: '',
    reqdays: '',
    error_list: {},
  });
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [isDeleteModalVisible, setDeleteModalVisibility] = useState(false);

  
  const formatDateTime = (dateTimeString) => {
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
  };

  const canEditRequest = (status) => {
    return status.toLowerCase() === 'pending';
  };
  

  const handleEdit = (requestId) => {
    setEditingRequestId(requestId);

    const requestToEdit = approvalRequests.find((request) => request.id === requestId);
    if (requestToEdit) {
      setApproval({
        reqapproval: requestToEdit.reqapproval,
        reqdays: requestToEdit.reqdays,
        error_list: {},
      });
    }

    const editModal = document.getElementById('editModal');
    if (editModal) {
      editModal.classList.add('show');
      editModal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  };

  const closeModal = () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    });
  };

  const fetchApprovalRequests = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };

      const response = await axios.get(`${url.baseURL}/approval-requests`, { headers });

      if (response.data.status === 200) {
        setApprovalRequests(response.data.approvalRequests);
      }
    } catch (error) {
      console.error('Failed to fetch approval requests:', error);
    }
  };

  useEffect(() => {
    fetchApprovalRequests();

    const echo = new Echo({
      broadcaster: 'pusher',
      key: 'c92de035c19a321f7907',
      cluster: 'ap2',
      encrypted: true,
    });

    echo.channel('approval-updates').listen('ApprovalStatusUpdated', (event) => {
      fetchApprovalRequests();
    });

    return () => {
      echo.leaveChannel('approval-updates');
    };
  }, [token]);

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
  
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };
  
    try {
      const ApprovalResponse = await axios.post(`${url.baseURL}/submit-request`, data, { headers });
  
      if (ApprovalResponse.data.status === 200) {
        Swal.fire('Success', ApprovalResponse.data.message, 'success').then(() => closeModal());
        setApprovalRequests((prevApprovalRequests) => [
          ...prevApprovalRequests,
          { reqapproval: approvalInput.reqapproval, reqdays: approvalInput.reqdays, status: 'Pending' },
        ]);
        setApproval({ reqapproval: '', reqdays: '', error_list: {} });
      } else if (ApprovalResponse.data.status === 400) {
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
        Swal.fire('info', ApprovalResponse.data.message, 'info');
      } else {
        setApproval({ ...approvalInput, error_list: ApprovalResponse.data.validation_errors });
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('Reached 403 block');
        Swal.fire('warning', error.response.data.message, 'warning').then(() => closeModal());
      } else {
        console.error('Approval request failed:', error);
      }
    }
  };
  
  

  const ApprovalUpdate = async (e) => {
    e.preventDefault();
  
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };
      
      const data = {
        reqapproval: approvalInput.reqapproval,
        reqdays: approvalInput.reqdays,
      };
  
      const UpdateResponse = await axios.post(`${url.baseURL}/update-pending-request/${editingRequestId}`, data, { headers });
  
      if (UpdateResponse.data.status === 200) {
        // Update the state with the new values after a successful update
        setApprovalRequests((prevApprovalRequests) =>
          prevApprovalRequests.map((request) =>
            request.id === editingRequestId
              ? {
                  ...request,
                  reqapproval: approvalInput.reqapproval,
                  reqdays: approvalInput.reqdays,
                }
              : request
          )
        );
  
        // Reset the editing state
        setEditingRequestId(null);
  
        Swal.fire('Success', UpdateResponse.data.message, 'success').then(() => {
          closeModal();
        });
      } else {
        setApproval({ ...approvalInput, error_list: UpdateResponse.data.validation_errors });
      }
    } catch (error) {
      console.error('Approval update failed:', error);
    }
  };

  const confirmDelete = (requestId) => {
    setDeletingRequestId(requestId);
    setDeleteModalVisibility(true);
  };

  const handleDelete = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      };

      const deleteResponse = await axios.delete(`${url.baseURL}/delete-pending-request/${deletingRequestId}`, { headers });

      if (deleteResponse.data.status === 200) {
        // Fetch the updated approval requests after successful deletion
        await fetchApprovalRequests();

        closeModal();
        console.log(deleteResponse.data.message);
      } else {
        console.error('Failed to delete:', deleteResponse.data.message);
      }
    } catch (error) {
      console.error('Delete request failed:', error);
    } finally {
      // Reset the deletingRequestId and hide the delete modal
      setDeletingRequestId(null);
      setDeleteModalVisibility(false);
    }
  };

  
  
  
  return (
    <Layout>
      <div>
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                 Add Request
                </h5>
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
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Close
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Edit Request
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={ApprovalUpdate}>
                  <div className="form-group mb-3">
                    <label>Reason of Request</label>
                    <textarea
                      rows="3"
                      cols="7"
                      name="reqapproval"
                      value={approvalInput.reqapproval}
                      onChange={handleInput}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Number of Days Needed</label>
                    <input
                      type="text"
                      name="reqdays"
                      value={approvalInput.reqdays}
                      onChange={handleInput}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <button type="submit" className="btn btn-primary">
                      Update Request
                    </button>
                  </div>
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Close
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>



  {/* Delete Modal */}
  <div className={`modal fade ${isDeleteModalVisible ? 'show' : ''}`} id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden={!isDeleteModalVisible}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setDeleteModalVisibility(false)}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this request?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setDeleteModalVisibility(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      </div>


        <div className="mt-5">
          <div className="d-flex justify-content-between">
            <h3>Your Requests</h3>
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
              Add Request
            </button>
          </div>

          <div className="table-responsive">
          <table className="table mt-5">
  <thead className="thead-dark">
    <tr>
      <th scope="col">#</th>
      <th scope="col">Reason</th>
      <th scope="col">Days</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {approvalRequests.map((request, index) => (
      <tr key={index}>
        <th scope="row">{index + 1}</th>
        <td>{request.reqapproval}</td>
        <td>{request.reqdays}</td>
        <td>{request.status}</td>
        <td>
          {request.status.toLowerCase() === 'pending' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#editModal"
                onClick={() => handleEdit(request.id)}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn btn-primary mx-2"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal"
                onClick={() => confirmDelete(request.id)}
              >
                Delete
              </button>
            </>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ViewRequest;
