import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminHome.css';

const AdminHome = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      history.push('/login');
    }
  }, [user, history]);

  const handleToggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleProfileUpdate = () => {
    history.push('/profile/update');
    setDropdownOpen(false);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-home-container">
      <header className="admin-home-header">
        <div className="admin-home-header-content">
          <h1 className="admin-home-header-title">Welcome, Admin {user.name}!</h1>
          <div className="admin-home-profile">
            <button onClick={handleToggleDropdown} className="admin-home-profile-btn">
              {user.name.charAt(0)}
            </button>
            {dropdownOpen && (
              <div className="admin-home-dropdown">
                <button onClick={handleProfileUpdate} className="admin-home-dropdown-item">Profile</button>
                <button onClick={handleLogout} className="admin-home-dropdown-item">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="admin-home-welcome-message">
        <p className="admin-home-description">This is the administration panel for managing Pochinki City's announcements and reports.</p>
      </section>

      <div className="admin-home-tile-container">
        <div className="admin-home-tile">
          <h2 className="admin-home-tile-title">Announcements</h2>
          <p className="admin-home-tile-description">Manage and post city announcements for public information.</p>
          <Link to="/announcements" className="admin-home-btn-primary">Manage Announcements</Link>
        </div>
        <div className="admin-home-tile">
          <h2 className="admin-home-tile-title">Admin Panel</h2>
          <p className="admin-home-tile-description">Access the admin panel for managing reports.</p>
          <Link to="/admin" className="admin-home-btn-primary">Go to Admin Panel</Link>
        </div>
        <div className="admin-home-tile">
          <h2 className="admin-home-tile-title">Employee Management</h2>
          <p className="admin-home-tile-description">Register or Remove employees to manage the city.</p>
          <Link to="/register_employee" className="admin-home-btn-primary">Manage Employee</Link>
        </div>
        <div className="admin-home-tile">
          <h2 className="admin-home-tile-title">Archived Reports</h2>
          <p className="admin-home-tile-description">View and manage archived reports for city documentation.</p>
          <Link to="/archived/reports" className="admin-home-btn-primary">View Archived Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
