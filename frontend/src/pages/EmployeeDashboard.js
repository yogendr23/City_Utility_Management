import React, { useState, useEffect } from 'react';
import { getAssignedReports, updateReportStatus, getUserById, sendEmail } from '../api';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const [emailConfirmed, setEmailConfirmed] = useState({}); // Store checkbox states
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getAssignedReports();
        console.log("Fetched reports:", data);
        setReports(data);
      } catch (err) {
        console.error('Error fetching assigned reports:', err);
        setError('Error fetching assigned reports');
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchReports();
  }, []);

  const handleCheckboxChange = (reportId, checked) => {
    setEmailConfirmed(prev => ({ ...prev, [reportId]: checked }));
  };

  const handleStatusChange = async (reportId, newStatus, report, sendEmailConfirmation) => {
    try {
      const updatedReport = await updateReportStatus(reportId, newStatus);
      setReports((prevReports) =>
        prevReports.map((r) => (r._id === reportId ? updatedReport : r))
      );

      // If the user chose to send an email
      if (sendEmailConfirmation) {
        // Fetch the creator's email
        const creatorEmailResponse = await getUserById(report.userId);
        const emailToSend = creatorEmailResponse.email;

        console.log('Fetched creator email:', emailToSend);

        if (!emailToSend) {
          console.error('Creator email not found');
          setError('Error: Creator email not found');
          return; // Exit early to avoid sending email
        }

        // Prepare email content
        let subject;
        let emailData;

        if (newStatus === 'in-progress') {
          subject = 'Your Report is Being Addressed';
          emailData = {
            type: report.type,
            status: newStatus,
            description: report.description,
            location: report.location,
          };
        } else if (newStatus === 'completed') {
          subject = 'Your Report has been Resolved';
          emailData = {
            type: report.type,
            status: newStatus,
            description: report.description,
            location: report.location,
          };
        }

        // Send email notification
        try {
          await sendEmail({
            to: emailToSend,
            subject,
            data: emailData,
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          setError('Error sending email notification');
        }
      }
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Error updating report status');
    }
  };

  // Redirect function for unauthorized access
  useEffect(() => {
    // Check user role and redirect accordingly
    if (!user) {
      history.push('/login'); // Redirect to login if no user
    } else {
      switch (user.role) {
        case 'AdminHome':
          history.push('/admin');
          break;
        case 'employee':
          // Stay on the employee page
          break;
        case 'citizen':
          history.push('/'); // Redirect citizen to home
          break;
        default:
          history.push('/login'); // Fallback in case of an unexpected role
      }
    }
  }, [user, history]);

  // If the user is not an employee, redirecting is already handled in useEffect
  // You can add any additional rendering logic for the employee page below if needed
  if (user?.role !== 'employee') {
    return null; // This will prevent rendering if not an employee
  }

  // Sort reports by status
  const statusOrder = {
    pending: 1,
    'in-progress': 2,
    completed: 3,
  };

  const sortedReports = [...reports].sort((a, b) => {
    return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
  });

  return (
    <div className="emp-employee-dashboard">
      <header className="emp-header">
        <h2>Employee Dashboard</h2>
        <div className="emp-user-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
        </div>
        <div className="emp-user-info">
          <button className="emp-profile-button" onClick={() => history.push('/profile/update')}>
            Profile Update
          </button>
          <button className="emp-logout-button" onClick={logout}>Logout</button>
        </div>
      </header>


      {loading && <p>Loading reports...</p>} {/* Loading message */}
      {error && <p className="emp-error-message">{error}</p>}
      {sortedReports.length === 0 ? (
        <p>No reports assigned to you.</p>
      ) : (
        <ul className="emp-report-list">
          {sortedReports.map((report) => (
            <li key={report._id} className={`emp-report-item emp-status-${report.status}`}>
              <div className="emp-report-info">
                <strong>Type:</strong> {report.type} <br />
                <strong>Status:</strong> {report.status} <br />
                <div className="emp-address-info">
                  <strong>Address:</strong> {report.location?.address} <br />
                  <strong>Postal Code:</strong> {report.location?.postalCode} <br />
                  <strong>Coordinates:</strong> [{report.location?.coordinates?.join(', ')}]
                </div>
                <div className="emp-description-box">
                  <strong>Description:</strong> <br />
                  {report.description}
                </div>
              </div>
              <div className="emp-report-actions">
                {report.status === 'pending' && (
                  <>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={emailConfirmed[report._id] || false} 
                        onChange={(e) => handleCheckboxChange(report._id, e.target.checked)} 
                      />
                      Send confirmation email
                    </label>
                    <button 
                      onClick={() => handleStatusChange(report._id, 'in-progress', report, emailConfirmed[report._id])} 
                      className="emp-status-button emp-in-progress-button">
                      Mark In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(report._id, 'completed', report, false)} 
                      className="emp-status-button emp-completed-button">
                      Mark Completed
                    </button>
                  </>
                )}
                {report.status === 'in-progress' && (
                  <>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={emailConfirmed[report._id] || false} 
                        onChange={(e) => handleCheckboxChange(report._id, e.target.checked)} 
                      />
                      Send confirmation email
                    </label>
                    <button 
                      onClick={() => handleStatusChange(report._id, 'completed', report, emailConfirmed[report._id])} 
                      className="emp-status-button emp-completed-button">
                      Mark Completed
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeDashboard;
