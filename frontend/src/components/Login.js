import React, { useState } from 'react';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './Login.css'; // Import CSS for styling

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      login(data.user, data.token);
      switch (data.user.role) {
        case 'employee':
          history.push('/employee');
          break;
        case 'admin':
          history.push('/AdminHome');
          break;
        case 'citizen':
        default:
          history.push('/');
          break;
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Login failed. Please try again.');
    }
  };

  const handleRegisterRedirect = () => {
    history.push('/register');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      <p className="register-prompt">
        Don't have an account? 
        <button onClick={handleRegisterRedirect} className="register-button">Register</button>
      </p>
    </div>
  );
};

export default Login;
