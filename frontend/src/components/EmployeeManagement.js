import React, { useState, useEffect } from 'react';
import { registerUser, getEmployees, deleteUserById } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import { useHistory } from 'react-router-dom'; 
import RegisterEmployeePopup from './RegisterEmployeePopup'; 
import './EmployeeManagement.css'; 

const EmployeeManagement = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    if (!user) {
      history.push('/login');
    } else if (user.role === 'admin') {
      fetchEmployees();
    } else {
      history.push('/');
    }
  }, [user, history]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerUser(formData);
      if (response.user) {
        setShowModal(true);
        const updatedEmployees = await getEmployees();
        setEmployees(updatedEmployees);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err.response ? err.response.data.message : 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    history.push('/AdminHome');
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteUserById(employeeId);
        setEmployees(employees.filter(employee => employee._id !== employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Error deleting employee. Please try again.');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>You do not have permission to access this page.</p>;
  }

  return (
    <div className="employee-management-container">
      <div className="employee-list">
        <h2>Employee List</h2>
        {employees.length > 0 ? (
          employees.map(employee => (
            <div key={employee._id} className="employee-item">
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Role:</strong> {employee.role}</p>
              <button onClick={() => handleDeleteEmployee(employee._id)} className="delete-button">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No employees available.</p>
        )}
      </div>

      <div className="register-form">
        <h2>Register Employee</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="form-input"
          />
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Registering...' : 'Register Employee'}
          </button>
        </form>

        {showModal && (
          <RegisterEmployeePopup
            message="Employee Registration Successful"
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
