import React from 'react';

function Notifications({ notifications }) {
  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
      {notifications.map((notification, index) => (
        <div className="notification" key={index}>
          <div className="notification-header">
            <strong>New Notification</strong>
            <small>Just Now</small>
          </div>
          <div className="notification-body">
            {notification.message}
            <a href="#" onClick={notification.onClick}>View Notification</a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
