import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Pusher from 'pusher-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaList } from 'react-icons/fa';

function Layout({ children }) {
  const navigate = useNavigate();
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    const initializeAudioContext = () => {
      if (!audioContext) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);
      }
    };

    document.addEventListener('click', initializeAudioContext);

    return () => {
      document.removeEventListener('click', initializeAudioContext);
    };
  }, [audioContext]);

  useEffect(() => {
    const pusher = new Pusher('c92de035c19a321f7907', {
      cluster: 'ap2',
      encrypted: true,
    });

    const channel = pusher.subscribe('approval-updates');

    channel.bind('App\\Events\\ApprovalStatusUpdated', (data) => {
      console.log('Received event:', data);

      if (audioContext) {
        fetch('/notification-sound.mp3')
        .then((response) => response.arrayBuffer())
        .then((data) => audioContext.decodeAudioData(data))
        .then((buffer) => {
          const sound = audioContext.createBufferSource();
          sound.buffer = buffer;
          sound.connect(audioContext.destination);
          sound.start();
        })
        .catch((error) => console.error('Error decoding audio data', error));
      
      }

      toast.success(`Status updated: ${data.message}`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          const url = '/viewrequest';
          window.location.href = url;
        },
      });
    });

    return () => {
      channel.unbind('App\\Events\\ApprovalStatusUpdated');
      pusher.unsubscribe('approval-updates');
    };
  }, [navigate, audioContext]);

  return (
    <div>
      <Header />
      <div className="container-fluid">
        <div className="row flex-nowrap">
          <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
            <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
              <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link align-middle px-0">
                    <FaHome className="fs-4 me-2" style={{ color: 'white' }} /> <span className="ms-1 d-none d-sm-inline text-white">Dashboard</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/viewrequest" className="nav-link align-middle px-0">
                    <FaList className="fs-4 me-2" style={{ color: 'white' }} /> <span className="ms-1 d-none d-sm-inline text-white">View Requests</span>
                  </Link>
                </li>
              </ul>
              <hr />
            </div>
          </div>

          <div className="col py-3">
            <div className="container mt-5">
              <ToastContainer />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
