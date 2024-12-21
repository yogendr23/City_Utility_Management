import React, { useEffect, useState } from 'react';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api';
import { useAuth } from '../context/AuthContext';
import './Announcements.css'; // Ensure your CSS file has styles for the layout

const Announcements = () => {
  const { user, token, logout } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'maintenance',
    startDate: '',
    endDate: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        // Sort the announcements by createdAt in descending order
        const sortedAnnouncements = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(sortedAnnouncements);
      } catch (err) {
        setError('Failed to fetch announcements');
      }
    };
    loadAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields based on type
    const isMaintenance = formData.type === 'maintenance';
    const isPolicy = formData.type === 'policy';
    const isSafety = formData.type === 'safety';

    if (isMaintenance && (!formData.startDate || !formData.endDate)) {
      setError('Both start and end dates are mandatory for maintenance announcements.');
      return;
    }
    
    if (isPolicy && formData.startDate === '') {
      setError('Start date is required for policy announcements.');
      return;
    }

    // For safety, no mandatory checks
    try {
      if (editingId) {
        const updatedAnnouncement = await updateAnnouncement(editingId, formData, token);
        setAnnouncements(announcements.map(ann => (ann._id === editingId ? updatedAnnouncement : ann)));
        setSuccess('Announcement updated successfully!');
      } else {
        const newAnnouncement = await createAnnouncement(formData, token);
        // Add the new announcement to the state and sort again
        const updatedAnnouncements = [...announcements, newAnnouncement];
        const sortedAnnouncements = updatedAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(sortedAnnouncements);
        setSuccess('Announcement created successfully!');
      }
      resetForm();
    } catch (err) {
      setError(editingId ? 'Failed to update announcement' : 'Failed to create announcement');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      startDate: announcement.startDate,
      endDate: announcement.endDate,
    });
    setEditingId(announcement._id);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id, token);
      setAnnouncements(announcements.filter(ann => ann._id !== id));
      setSuccess('Announcement deleted successfully!');
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', type: 'maintenance', startDate: '', endDate: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="announcement-container">
      <header className="announcement-header">
        <h2 className="announcement-title">🎉 Public Announcements 🎉</h2>
        {user && (
          <div className="announcement-user-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="announcement-logout-button" onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      {user?.role === 'admin' && (
        <div className="announcement-form-container">
          <h3 className="announcement-form-title">{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
          <form className="announcement-form" onSubmit={handleSubmit}>
            <div className="announcement-form-group">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="announcement-input"
              />
              <select name="type" value={formData.type} onChange={handleChange} className="announcement-select">
                <option value="maintenance">Maintenance</option>
                <option value="policy">Policy</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <textarea
              name="content"
              placeholder="Description"
              value={formData.content}
              onChange={handleChange}
              required
              className="announcement-textarea"
            />
            <div className="announcement-form-group">
              {formData.type === 'maintenance' && (
                <>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="announcement-date-input"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="announcement-date-input"
                  />
                </>
              )}
              {formData.type === 'policy' && (
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="announcement-date-input"
                />
              )}
              {formData.type === 'safety' && (
                <>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="announcement-date-input"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="announcement-date-input"
                  />
                </>
              )}
            </div>
            <div className="announcement-form-actions">
              <button type="submit" className="announcement-submit-button">
                {editingId ? 'Update Announcement' : 'Create Announcement'}
              </button>
              {editingId && (
                <button type="button" className="announcement-cancel-button" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {error && <p className="announcement-error">{error}</p>}
      {success && <p className="announcement-success">{success}</p>}

      <ul className="announcement-list">
        {announcements.map((announcement) => (
          <li key={announcement._id} className="announcement-card">
            <div className="announcement-card-header">
              <h3 className="announcement-card-title">{announcement.title}</h3>
              <p className="announcement-card-type"><strong>Type:</strong> {announcement.type}</p>
            </div>
            <div className="announcement-card-dates">
              <p><strong>Effective from:</strong> {announcement.startDate ? new Date(announcement.startDate).toLocaleDateString() : 'N.A.'}</p>
              <p><strong>Until:</strong> {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : 'N.A.'}</p>
            </div>
            <p className="announcement-card-content">{announcement.content}</p>
            {user?.role === 'admin' && (
              <div className="announcement-card-actions">
                <button className="announcement-edit-button" onClick={() => handleEdit(announcement)}>Edit</button>
                <button className="announcement-delete-button" onClick={() => handleDelete(announcement._id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Announcements;
