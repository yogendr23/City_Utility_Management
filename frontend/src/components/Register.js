import React, { useState } from 'react';
import { registerUser, sendEmail } from '../api';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import RegisterScreenModal from './RegisterScreenModal';
import './Register.css';

const MAX_ATTEMPTS = 5;

const Register = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateVerificationCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const sendVerificationEmail = async (email, code) => {
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Registration Code',
        data: {
          text: `Your verification code is ${code}. Enter this code to complete your registration.`,
        },
      });
      console.log('Verification email sent successfully');
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('Error sending verification email. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const code = generateVerificationCode();
    setVerificationCode(code);

    try {
      await sendVerificationEmail(formData.email, code);
      setShowVerificationModal(true);
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (userCode === verificationCode) {
      try {
        const response = await registerUser(formData);
        if (response.user) {
          login(response.user, response.token || '');
          setIsVerified(true); // Set to true to show the success message
        } else {
          throw new Error('User data not found in response');
        }
      } catch (err) {
        setError('Registration failed. Please try again later.');
      }
    } else {
      setRemainingAttempts(prev => prev - 1);

      if (remainingAttempts - 1 <= 0) {
        alert('Maximum attempts reached. Please try registering again.');
        setShowVerificationModal(false);
        window.location.reload();
      } else {
        setError(`Incorrect verification code. ${remainingAttempts - 1} attempts remaining.`);
      }
    }
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    history.push('/login'); // Redirect to login after successful registration
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2 className="register-title">Create an Account</h2>
        <form onSubmit={handleSubmit} className="register-form">
          {error && <p className="register-error-message">{error}</p>}
          <div className="register-field">
            <label htmlFor="name" className="register-label">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Your Name"
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="register-field">
            <label htmlFor="email" className="register-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Your Email"
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="register-field">
            <label htmlFor="password" className="register-label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Create a Password"
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>
          <div className="register-field">
            <label htmlFor="role" className="register-label">Role</label>
            <select
              name="role"
              id="role"
              onChange={handleChange}
              value={formData.role}
              className="register-select"
            >
              <option value="citizen">Citizen</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Verification modal */}
        {showVerificationModal && (
          <RegisterScreenModal
            message="Enter the verification code sent to your email"
            onClose={handleCloseModal}
            onVerify={handleVerificationSubmit}
            userCode={userCode}
            setUserCode={setUserCode}
            remainingAttempts={remainingAttempts}
            isVerified={isVerified}
          />
        )}
      </div>
    </div>
  );
};

export default Register;
