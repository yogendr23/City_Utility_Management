// ProfileUpdate.js
import React, { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { getUserById, updateUser, deleteUserById } from '../api'; // Import deleteUserById
import { useAuth } from '../context/AuthContext';
import './ProfileUpdate.css';

const ProfileUpdate = () => {
  const history = useHistory();
  const { user, token } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete confirmation

  useEffect(() => {
    const fetchUser = async () => {
      if (!user || !user._id) {
        history.push('/login');
        return;
      }

      try {
        const fetchedUser = await getUserById(user._id, token);
        setUserData({
          name: fetchedUser.name || '',
          email: fetchedUser.email || '',
          password: '',
        });
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('User not found or could not load data.');
        history.push('/login');
      }
    };

    fetchUser();
  }, [user, token, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(user._id, userData, token);
      setModalOpen(true); // Open modal on successful update
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    }
  };

  const handleConfirm = () => {
    setModalOpen(false);
    history.push('/login'); // Redirect to login after confirmation
  };

  const handleCancel = () => {
    setModalOpen(false); // Close modal without action
  };

  const handleDelete = async () => {
    try {
      await deleteUserById(user._id, token);
      setDeleteModalOpen(false);
      history.push('/login'); // Redirect to login after deletion
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      console.error(err);
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteModalOpen(true); // Open delete confirmation modal
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false); // Close delete modal
  };

  return (
    <div className="profile-update-main">
      <div className="profile-update-card">
        <h2 className="profile-update-title">Update Your Profile</h2>
        {error && <p className="profile-update-error">{error}</p>}
        <form onSubmit={handleSubmit} className="profile-update-form">
          <div className="profile-update-form-group">
            <label htmlFor="name" className="profile-update-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
              className="profile-update-input"
            />
          </div>
          <div className="profile-update-form-group">
            <label htmlFor="email" className="profile-update-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              className="profile-update-input"
            />
          </div>
          <div className="profile-update-form-group">
            <label htmlFor="password" className="profile-update-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="profile-update-input"
            />
          </div>
          <button type="submit" className="profile-update-button">Update Profile</button>
        </form>
        {/* Show delete button only for users with role "citizen" */}
        {user.role === 'citizen' && (
          <button
          onClick={handleOpenDeleteModal}
          className="profile-delete-icon"
          title="Delete Account"
        >
          <FaTrashAlt />
        </button>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Success</h2>
            <p>Your profile has been updated successfully!</p>
            <p>You need to Login Again</p>
            <button onClick={handleConfirm}>Login</button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <p>Your profile will de deleted but your reports will be kept of quality purposes.</p>
            <button onClick={handleDelete}>Confirm</button>
            <button onClick={handleCloseDeleteModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdate;
