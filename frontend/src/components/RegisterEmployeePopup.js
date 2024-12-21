import React from 'react';
import './RegisterEmployeePopup.css'; // Import CSS for styling

const RegisterEmployeePopup = ({ message, onClose, additionalActions }) => {
  return (
    <div className="RegisterEmployeePopup-overlay">
      <div className="RegisterEmployeePopup-content">
        <h3 className="RegisterEmployeePopup-message">{message}</h3>
        <div className="RegisterEmployeePopup-actions">
          <button className="RegisterEmployeePopup-close-btn" onClick={onClose}>
            Close
          </button>
          {additionalActions && additionalActions.map((action, index) => (
            <button 
              key={index} 
              className="RegisterEmployeePopup-action-btn" 
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterEmployeePopup;
