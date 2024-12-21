import React, { useEffect, useState } from 'react';
import { getAllReports, getEmployees, assignReportToEmployee, sendEmail, createHistory, deleteReport } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import { useHistory } from 'react-router-dom'; 
import './AdminDashboard.css'; 

const AdminDashboard = () => {
  const { user, logout } = useAuth(); 
  const [reports, setReports] = useState([]); 
  const [employees, setEmployees] = useState([]); 
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(''); 
  const [selectedReportIds, setSelectedReportIds] = useState([]); 
  const [sendEmailOption, setSendEmailOption] = useState(false); 
  const history = useHistory(); 

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllReports(); 
        console.log('Fetched Reports:', data);
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    // Redirect if user is not admin
    if (!user) {
      history.push('/login');
    } else if (user.role === 'admin') {
      fetchReports();
      fetchEmployees();
    } else {
      switch (user.role) {
        case 'employee':
          history.push('/employee');
          break;
        case 'citizen':
          history.push('/');
          break;
        default:
          history.push('/login'); // Fallback for any other roles
      }
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
      timeZone: 'Asia/Kolkata' 
    };
    return date.toLocaleString('en-IN', options);
  };

  const handleAssignReport = async () => {
    if (!selectedEmployeeId || selectedReportIds.length === 0) {
      console.error('Employee ID is missing or no report selected');
      return; 
    }
    
    try {
      const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);
      if (!selectedEmployee) {
        console.error('Selected employee not found');
        return;
      }

      const updatedReports = reports.map(report => {
        if (selectedReportIds.includes(report._id)) {
          return {
            ...report,
            assignedEmployee: selectedEmployeeId,
          };
        }
        return report;
      });

      setReports(updatedReports);

      for (const reportId of selectedReportIds) {
        await assignReportToEmployee(reportId, selectedEmployeeId);
      }

      // Send email notification if the option is selected
      if (sendEmailOption) {
        await sendEmail({
          to: selectedEmployee.email,
          subject: 'Report Assignment Notification',
          data: `You have been assigned new reports. Report IDs: ${selectedReportIds.join(', ')}`
        });
      }

      setSelectedReportIds([]);
      setSelectedEmployeeId('');
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const handleAchieveReports = async (reportIds) => {
    if (!reportIds || reportIds.length === 0) {
        console.error('No report selected for achieving');
        return;
    }

    try {
        for (const reportId of reportIds) {
            try {
                const report = reports.find(r => r._id === reportId);
                if (!report) {
                    console.warn(`Report with ID ${reportId} not found in the reports list.`);
                    continue;
                }

                const historyData = {
                    userId: report.userId,
                    type: report.type,
                    description: report.description,
                    coordinates: report.location.coordinates,
                    status: report.status,
                    assignedEmployee: report.assignedEmployee,
                    createdAt: report.createdAt,
                    updatedAt: report.updatedAt,
                };

                await createHistory(historyData);

                // Delete the report after archiving it
                await deleteReport(reportId);
                console.log(`Successfully deleted report ID ${reportId}`);

                // Update local state by filtering out the archived report
                setReports((prevReports) => prevReports.filter((r) => r._id !== reportId));
            } catch (error) {
                console.error(`Error achieving report ID ${reportId}:`, error);
            }
        }

        // Clear selected report IDs after processing
        setSelectedReportIds([]);
    } catch (outerError) {
        console.error('Error in handleAchieveReports:', outerError);
    }
  };


  const handleReportSelection = (reportId) => {
    setSelectedReportIds((prevSelected) => {
      if (prevSelected.includes(reportId)) {
        return prevSelected.filter(id => id !== reportId);
      } else {
        return [...prevSelected, reportId];
      }
    });
  };

  // Sort reports by status
  const sortedReports = reports.sort((a, b) => {
    const statusOrder = { pending: 1, 'in-progress': 2, completed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="AdminDashboard-container">
      <header className="AdminDashboard-header">
        <h2 className="AdminDashboard-title">Admin Dashboard</h2>
        {user && (
          <div className="AdminDashboard-user-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="AdminDashboard-logout-button" onClick={logout}>Logout</button>
          </div>
        )}
      </header>

      {user && user.role === 'admin' ? (
        <>
          <div className="AdminDashboard-assign-card">
            <h3 className="AdminDashboard-assign-title">Assign Reports to Employee</h3>
            <p className="AdminDashboard-instruction">Select an employee and choose whether to send them an email notification.</p>

            <div className="AdminDashboard-employee-selection">
              <label htmlFor="employee-select" className="AdminDashboard-select-label">Assign to Employee:</label>
              <select
                id="employee-select"
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                value={selectedEmployeeId}
                className="AdminDashboard-select"
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="AdminDashboard-email-option-group">
              <label className="AdminDashboard-email-option">
                <input 
                  type="radio" 
                  id="sendEmail" 
                  name="emailOption" 
                  value="send" 
                  checked={sendEmailOption} 
                  onChange={() => setSendEmailOption(true)} 
                />
                Send Email
              </label>

              <label className="AdminDashboard-email-option">
                <input 
                  type="radio" 
                  id="noEmail" 
                  name="emailOption" 
                  value="noSend" 
                  checked={!sendEmailOption} 
                  onChange={() => setSendEmailOption(false)} 
                />
                Assign Without Sending Email
              </label>
            </div>

            <button className="AdminDashboard-assign-button" onClick={handleAssignReport}>
              Assign Selected Reports
            </button>
          </div>

          <h3 className="AdminDashboard-reports-title">Reported Utility Issues</h3>
          <div className="AdminDashboard-report-grid">
            {sortedReports.map(report => {
              let statusClass = '';
              if (!report.assignedEmployee && report.status === 'pending') {
                statusClass = 'AdminDashboard-not-assigned-pending'; 
              } else if (report.assignedEmployee && report.status === 'pending') {
                statusClass = 'AdminDashboard-assigned-pending'; 
              } else if (report.assignedEmployee && report.status === 'in-progress') {
                statusClass = 'AdminDashboard-assigned-in-progress'; 
              } else if (report.assignedEmployee && report.status === 'completed') {
                statusClass = 'AdminDashboard-assigned-completed'; 
              }

              if (selectedReportIds.includes(report._id)) {
                statusClass += ' AdminDashboard-selected'; 
              }

              return (
                <div key={report._id} className={`AdminDashboard-report-item ${statusClass}`}>
                  <input
                    type="checkbox"
                    checked={selectedReportIds.includes(report._id)}
                    onChange={() => handleReportSelection(report._id)}
                    className="AdminDashboard-report-checkbox"
                  />
                  <div className="AdminDashboard-report-info">
                    <strong>Type:</strong> {report.type} <br />
                    <strong>Status:</strong> <span>{report.status}</span><br />
                    <strong>Description:</strong>
                    <div className="AdminDashboard-description-box">
                      {report.description}
                    </div>
                    <strong>Assigned to:</strong> 
                    <span>
                      {report.assignedEmployee ? 
                        employees.find(emp => emp._id === report.assignedEmployee)?.email || 'unassigned' 
                        : 'unassigned'}
                    </span>
                    <br />
                    <strong>Created At:</strong> {formatDateToIST(report.createdAt)} <br />
                    <strong>Last Updated:</strong> {formatDateToIST(report.updatedAt)} <br />

                    {/* Location details */}
                    <div>
                      <strong>Address:</strong> {report.location?.address}, {report.location?.city}, {report.location?.country} <br />
                      <strong>Postal Code:</strong> {report.location?.postalCode} <br />
                      <strong>Coordinates:</strong> [{report.location?.coordinates?.join(', ')}] <br />
                    </div>
                  </div>

                  {/* Archive Button for completed reports with assigned employees */}
                  {report.assignedEmployee && report.status === 'completed' && (
                    <button 
                      className="AdminDashboard-achieve-button"
                      onClick={() => handleAchieveReports([report._id])} // Pass the specific report ID to achieve
                    >
                      Archive Report
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p>You do not have access to this page.</p>
      )}
    </div>
  );
};

export default AdminDashboard;


