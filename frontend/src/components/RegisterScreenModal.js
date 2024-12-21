import React from 'react';
import './RegisterScreenModal.css';

const RegisterScreenModal = ({ message, onClose, onVerify, userCode, setUserCode, remainingAttempts, isVerified }) => {
  return (
    <div className="register-screen-modal-overlay">
      <div className="register-screen-modal-content">
        {isVerified ? (
          <>
            <p>Registration successful! You can now log in.</p>
            <button onClick={onClose} className="register-screen-modal-close-button">
              Go to Login
            </button>
          </>
        ) : (
          <>
            <p>{message}</p>
            <p>Remaining attempts: {remainingAttempts}</p>
            <input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Enter Verification Code"
              className="register-screen-modal-input"
            />
            <button
              onClick={onVerify}
              className="register-screen-modal-verify-button"
              disabled={remainingAttempts <= 0}
            >
              Verify
            </button>
            <button onClick={onClose} className="register-screen-modal-close-button">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterScreenModal;
