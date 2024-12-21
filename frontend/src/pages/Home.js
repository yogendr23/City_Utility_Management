import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css'; // Ensure your CSS file has styles for the layout

const Home = () => {
  const { user, logout } = useAuth(); // Assume logout is a function from AuthContext
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
  const history = useHistory();

  useEffect(() => {
    // Check if user is not logged in or doesn't have the 'citizen' role
    if (!user || user.role !== 'citizen') {
      history.push('/login'); // Redirect to login page
    }
  }, [user, history]); // Dependency array includes user and history

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false); // Close dropdown after logging out
  };
  
  const handleProfileUpdate = () => {
    history.push('/profile/update'); // Navigate to Profile Update page
    setDropdownOpen(false); // Close dropdown after navigation
  };

  // If the user is logged in and has the correct role, render the home content
  if (!user || user.role !== 'citizen') {
    return null; // This part will never render because of the redirect in useEffect
  }

  return (
    <div className="home-container mt-5">
      <header className="home-header">
        <h1 className="home-welcome">Welcome, {user.name}!</h1>
        <div className="home-profile">
          <button onClick={handleToggleDropdown} className="home-profile-button">
            {user.name.charAt(0)} {/* Display initial letter */}
          </button>
          {dropdownOpen && (
            <div className="home-dropdown">
              <button onClick={handleProfileUpdate} className="home-dropdown-item">Profile Update</button>
              <button onClick={handleLogout} className="home-dropdown-item">Logout</button>
            </div>
          )}
        </div>
      </header>

      <section className="home-welcome-message">
        <p className="home-info-text">This is a reporting and information system for Pochinki City. Here, you can report utility issues and view community announcements.</p>
      </section>

      <div className="home-tile-container">
        <div className="home-tile">
          <h2>Report an Issue</h2>
          <p>Click below to report a utility issue.</p>
          <Link to="/submit-report" className="home-btn btn-secondary">Go to Report Form</Link>
        </div>
        <div className="home-tile">
          <h2>Your Reports</h2>
          <p>View your reported issues and track their status.</p>
          <Link to="/my-reports" className="home-btn btn-secondary">View Your Reports</Link>
        </div>
        <div className="home-tile">
          <h2>Announcements</h2>
          <p>Check out the latest announcements from Pochinki City.</p>
          <Link to="/announcements" className="home-btn btn-secondary">View Announcements</Link>
        </div>
      </div>

      {/* Informational Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p className="footer-text">© 2024 Pochinki City. All rights reserved.</p>
          <div className="footer-links">
            <a href="/about" className="footer-link">About Us</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
