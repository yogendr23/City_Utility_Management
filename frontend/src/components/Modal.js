import React from 'react';
import './Modal.css'; // Import CSS for styling

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{message}</h3>
        <button onClick={onClose} className="modal-button">Go to Login</button>
      </div>
    </div>
  );
};

export default Modal;
