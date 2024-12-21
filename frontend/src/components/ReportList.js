// src/pages/ReportList.js
// import React, { useEffect, useState } from 'react';
// import { getReports, deleteReport, getHistoryByUserId } from '../api';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';
// import './ReportList.css';

// const ReportList = () => {
//   const { user } = useAuth();
//   const [reports, setReports] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   console.log("Current User:", user);

//   if (!user || user.role !== 'citizen') {
//     return (
//       <div className="reportlist-container mt-5">
//         <p>You do not have permission to view this page. Please log in as a citizen.</p>
//         <Link to="/login" className="reportlist-login-button">Login</Link>
//       </div>
//     );
//   }

//   useEffect(() => {
//     const fetchReports = async () => {
//       if (!user) {
//         setError("You need to be logged in to view your reports.");
//         setLoading(false);
//         return;
//       }
//       setError(null);

//       try {
//         console.log("Fetching reports and history for User ID:", user._id);

//         const reportsData = await getReports();
//         const userReports = reportsData.filter(report => report.userId === user._id);
//         setReports(userReports);

//         const historyData = await getHistoryByUserId(user._id);
//         setHistory(historyData);
//       } catch (error) {
//         console.error("Error fetching reports or history:", error);
//         setError("Reports or History not found for the user.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, [user]);

//   const handleDeleteReport = async (reportId) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this report?");
//     if (!confirmDelete) return;

//     try {
//       console.log("Deleting report with ID:", reportId);
//       await deleteReport(reportId);
//       setReports(reports.filter(report => report._id !== reportId));
//     } catch (error) {
//       console.error("Error deleting report:", error);
//       setError("Failed to delete the report.");
//     }
//   };

//   const sortedReports = reports.sort((a, b) => {
//     const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 };
//     return statusOrder[a.status] - statusOrder[b.status];
//   });

//   const sortedHistory = history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//   return (
//     <div className="reportlist">
//       <div className="reportlist-header">
//         <Link to="/" className="reportlist-home-button">Go Home</Link>
//         <h2 className="reportlist-title">Reported Utility Issues</h2>
//       </div>
//       {loading && <p className="reportlist-loading">Loading reports and history...</p>}
//       {error && <p className="reportlist-error">{error}</p>}
//       {reports.length === 0 && !loading && <p className="reportlist-no-reports">No reports available.</p>}

//       <div className="reportlist-grid">
//         {sortedReports.map((report) => (
//           <div key={report._id} className={`reportlist-item reportlist-status-${report.status}`}>
//             <div className="reportlist-header">
//               <div className="reportlist-type-status">
//                 <strong>Type:</strong> {report.type} <span className={`reportlist-status reportlist-status-${report.status}`}>Status: {report.status}</span>
//               </div>
//               <div className="reportlist-location">
//                 <strong>Location:</strong>
//                 <ul>
//                   <li><strong>Address:</strong> {report.location?.address || 'N/A'}</li>
//                   <li><strong>City:</strong> {report.location?.city || 'N/A'}</li>
//                   <li><strong>Country:</strong> {report.location?.country || 'N/A'}</li>
//                   <li><strong>Postal Code:</strong> {report.location?.postalCode || 'N/A'}</li>
//                   <li><strong>Coordinates:</strong> {report.location?.coordinates ? report.location.coordinates.join(', ') : 'N/A'}</li>
//                 </ul>
//               </div>
//             </div>
//             <div className="reportlist-description">
//               <strong>Description:</strong>
//               <div className="reportlist-description-box">
//                 {report.description}
//               </div>
//             </div>
//             <button 
//                 className="reportlist-delete-button" 
//                 onClick={() => handleDeleteReport(report._id)} 
//                 disabled={report.status === 'in-progress' || report.status === 'completed'}
//                 title={report.status === 'in-progress' || report.status === 'completed' 
//                   ? `Cannot delete, report is ${report.status}` 
//                   : 'Once deleted, you will not be able to recover'}
//                 style={{
//                   cursor: report.status === 'in-progress' || report.status === 'completed' ? 'not-allowed' : 'pointer'
//                 }}
//               >
//                 Delete
//               </button>

//           </div>
//         ))}
//       </div>

//       {/* Section for displaying history */}
//       <div className="reportlist-history">
//         <h2 className="reportlist-title">History</h2>
//         {sortedHistory.length === 0 && <p>No history found.</p>}
//         {sortedHistory.map((item) => (
//           <div key={item._id} className={`reportlist-item reportlist-status-${item.status}`}>
//             <div className="reportlist-header">
//               <div className="reportlist-type-status">
//                 <strong>Type:</strong> {item.type} <span className={`reportlist-status reportlist-status-${item.status}`}>Status: {item.status}</span>
//               </div>
//               <div className="reportlist-location">
//                 <strong>Coordinates:</strong> {item.coordinates.join(', ')}
//               </div>
//             </div>
//             <div className="reportlist-description">
//               <strong>Description:</strong>
//               <div className="reportlist-description-box">
//                 {item.description}
//               </div>
//             </div>
//             <div className="reportlist-timestamps">
//               <div><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</div>
//               <div><strong>Solved:</strong> {new Date(item.updatedAt).toLocaleString()}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ReportList;

import React, { useEffect, useState } from 'react';
import { getReports, deleteReport, getHistoryByUserId } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './ReportList.css';

const ReportList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteReportId, setDeleteReportId] = useState(null); // To track the report to be deleted

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setError("You need to be logged in to view your reports.");
        setLoading(false);
        return;
      }
      setError(null);

      try {
        const reportsData = await getReports();
        const userReports = reportsData.filter(report => report.userId === user._id);
        setReports(userReports);

        const historyData = await getHistoryByUserId(user._id);
        setHistory(historyData);
      } catch (error) {
        setError("Reports or History not found for the user.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleDeleteReport = async () => {
    try {
      await deleteReport(deleteReportId);
      setReports(reports.filter(report => report._id !== deleteReportId));
      setDeleteReportId(null); // Close the popup after successful deletion
    } catch (error) {
      console.error("Error deleting report:", error);
      setError("Failed to delete the report.");
    }
  };

  const sortedReports = reports.sort((a, b) => {
    const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const sortedHistory = history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="reportlist">
      <div className="reportlist-header">
        <Link to="/" className="reportlist-home-button">Go Home</Link>
        <h2 className="reportlist-title">Reported Utility Issues</h2>
      </div>
      {loading && <p className="reportlist-loading">Loading reports and history...</p>}
      {error && <p className="reportlist-error">{error}</p>}
      {reports.length === 0 && !loading && <p className="reportlist-no-reports">No reports available.</p>}

      <div className="reportlist-grid">
        {sortedReports.map((report) => (
          <div key={report._id} className={`reportlist-item reportlist-status-${report.status}`}>
            <div className="reportlist-header">
              <div className="reportlist-type-status">
                <strong>Type:</strong> {report.type} <span className={`reportlist-status reportlist-status-${report.status}`}>Status: {report.status}</span>
              </div>
              <div className="reportlist-location">
                <strong>Location:</strong>
                <ul>
                  <li><strong>Address:</strong> {report.location?.address || 'N/A'}</li>
                  <li><strong>City:</strong> {report.location?.city || 'N/A'}</li>
                  <li><strong>Country:</strong> {report.location?.country || 'N/A'}</li>
                  <li><strong>Postal Code:</strong> {report.location?.postalCode || 'N/A'}</li>
                  <li><strong>Coordinates:</strong> {report.location?.coordinates ? report.location.coordinates.join(', ') : 'N/A'}</li>
                </ul>
              </div>
            </div>
            <div className="reportlist-description">
              <strong>Description:</strong>
              <div className="reportlist-description-box">
                {report.description}
              </div>
            </div>

            {/* Conditionally render the delete button */}
            {report.status === 'pending' && (
              <button 
                className="reportlist-delete-button" 
                onClick={() => setDeleteReportId(report._id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* History Section */}
      <div className="reportlist-history">
        <h2 className="reportlist-title">History</h2>
        {sortedHistory.length === 0 && <p>No history found.</p>}
        {sortedHistory.map((item) => (
          <div key={item._id} className={`reportlist-item reportlist-status-${item.status}`}>
            <div className="reportlist-header">
              <div className="reportlist-type-status">
                <strong>Type:</strong> {item.type} <span className={`reportlist-status reportlist-status-${item.status}`}>Status: {item.status}</span>
              </div>
              <div className="reportlist-location">
                <strong>Coordinates:</strong> {item.coordinates.join(', ')}
              </div>
            </div>
            <div className="reportlist-description">
              <strong>Description:</strong>
              <div className="reportlist-description-box">
                {item.description}
              </div>
            </div>
            <div className="reportlist-timestamps">
              <div><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</div>
              <div><strong>Solved:</strong> {new Date(item.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Popup */}
      {deleteReportId && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="popup-actions">
              <button onClick={handleDeleteReport} className="popup-confirm-button">Confirm</button>
              <button onClick={() => setDeleteReportId(null)} className="popup-cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
