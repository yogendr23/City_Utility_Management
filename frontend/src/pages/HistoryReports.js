import React, { useEffect, useState } from 'react';
import { getAllHistory } from '../api'; // Adjust this import if necessary
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import './HistoryReports.css';

const ArchivedHistoryReports = () => {
  const { user, logout } = useAuth();
  const [historyReports, setHistoryReports] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetchHistoryReports = async () => {
      try {
        const data = await getAllHistory(); // Call your API function here
        console.log('Fetched History Reports:', data);
        setHistoryReports(data);
      } catch (error) {
        console.error('Error fetching history reports:', error);
      }
    };

    // Redirect if user is not logged in
    if (!user) {
      history.push('/login');
    } else {
      fetchHistoryReports(); // Fetch histories if the user is logged in
    }
  }, [user, history]);

  const formatDateToIST = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    };
    return date.toLocaleString('en-IN', options);
  };

  return (
    <div className="ArchivedHistoryReports-container">
      <header className="ArchivedHistoryReports-header">
        <h2 className="ArchivedHistoryReports-title">Archived History Reports</h2>
        {user && (
          <div className="ArchivedHistoryReports-user-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="ArchivedHistoryReports-logout-button" onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      <div className="ArchivedHistoryReports-list">
        {historyReports.length > 0 ? (
          historyReports.map(report => (
            <div key={report._id} className="ArchivedHistoryReports-report-card">
              <h3 className="ArchivedHistoryReports-report-type">{report.type}</h3>
              <p className="ArchivedHistoryReports-report-description">{report.description}</p>
              <p className="ArchivedHistoryReports-report-status"><strong>Status:</strong> {report.status}</p>
              <p className="ArchivedHistoryReports-report-assigned"><strong>Assigned Employee:</strong> {report.assignedEmployee || 'Not assigned'}</p>
              <p className="ArchivedHistoryReports-report-dates">
                <strong>Created At:</strong> {formatDateToIST(report.createdAt)} <br />
                <strong>Resolved:</strong> {formatDateToIST(report.updatedAt)}
              </p>
              <p className="ArchivedHistoryReports-report-coordinates"><strong>Coordinates:</strong> [{report.coordinates?.join(', ')}]</p>
              <p className="ArchivedHistoryReports-report-user-id"><strong>User ID:</strong> {report.userId}</p>
            </div>
          ))
        ) : (
          <p className="ArchivedHistoryReports-no-reports">No history reports found.</p>
        )}
      </div>
    </div>
  );
};

export default ArchivedHistoryReports;
