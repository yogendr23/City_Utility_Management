import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const API_URL_REPORTS = 'http://localhost:5001/api/reports';
const API_URL_LOCATION = 'http://localhost:5002/api/location';
const API_URL_public = 'http://localhost:5004/api/announcements';
const API_URL_history = 'http://localhost:5006/api/history';
const API_URL_email = 'http://localhost:5005/send-email';


// const API_URL_REPORTS='http://10.52.108.110:5001/api/reports';
// const API_URL_LOCATION='http://10.52.108.110:5002/api/location';
// const API_URL_public='http://10.52.108.110:5004/api/announcements';
// const API_URL_history='http://10.52.108.110:5006/api/history';
// const API_URL_email='http://10.52.108.110:5005/send-email';


// User Authentication
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data; // Return the user data
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error; // Throw the error for handling in the calling component
  }
};

export const updateUser = async (userId, userData, token) => {
  const response = await axios.put(`${API_URL}/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteUserById = async (userId) => {
  try {
    // Use axios.delete instead of axios.get
    await axios.delete(`${API_URL}/${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error; // Throw the error for handling in the calling component
  }
};


// Set up a base URL for API requests
// const API_URL_REPORTS = 'http://localhost:5001/api/reports'; // Utility Reporting Service


// Utility Reporting Service
export const createReport = async (reportData) => {
  const token = localStorage.getItem('token'); // Fetch token from local storage
  const response = await axios.post(API_URL_REPORTS, reportData, {
    headers: {
      Authorization: `Bearer ${token}`, // Set the token in the headers
    },
  });
  return response.data;
};

export const getReports = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL_REPORTS, {
    headers: {
      Authorization: `Bearer ${token}`, // Set the token in the headers
    },
  });
  return response.data;
};

// Delete a report by ID
export const deleteReport = async (reportId) => {
  const token = localStorage.getItem('token'); // Authorization token
  const response = await axios.delete(`${API_URL_REPORTS}/${reportId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// New function to get all reports for admin dashboard
export const getAllReports = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_URL_REPORTS}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data; // Return the full list of reports
    } else {
      throw new Error(`Error fetching reports: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};



// New function to assign a report to an employee
export const assignReportToEmployee = async (reportId, employeeId) => {
  const token = localStorage.getItem('token'); // Authorization token
  const response = await axios.put(
    `${API_URL_REPORTS}/assign`, 
    { reportId, employeeId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// const API_URL_LOCATION = 'http://localhost:5002/api/location'; // Location Service

// Location Service that fetches location data
export const getLocation = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${API_URL_LOCATION}?latitude=${latitude}&longitude=${longitude}`);
    return response.data; // Return the location data
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw new Error('Could not fetch location data'); // Error handling for the ReportForm
  }
};





// New function to get all employees (assuming there's a user endpoint for employees)
export const getEmployees = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error.response || error.message);
    throw error; // Rethrow the error to handle in UI if needed
  }
};


// Fetch reports assigned to the employee
export const getAssignedReports = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL_REPORTS}/assigned`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update report status
export const updateReportStatus = async (reportId, status) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL_REPORTS}/status`, { reportId, status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// const API_URL_public = 'http://localhost:5004/api/announcements'; // Point this to your announcement microservice

// Fetch all announcements
export const fetchAnnouncements = async () => {
  const response = await axios.get(`${API_URL_public}`);
  return response.data;
};

// Create a new announcement (Admin only)
export const createAnnouncement = async (announcementData, token) => {
  const response = await axios.post(
    `${API_URL_public}`,
    announcementData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Update an announcement
export const updateAnnouncement = async (announcementId, announcementData, token) => {
  const response = await axios.put(
    `${API_URL_public}/${announcementId}`,
    announcementData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Delete an announcement
export const deleteAnnouncement = async (announcementId, token) => {
  const response = await axios.delete(
    `${API_URL_public}/${announcementId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};


// const API_URL_email = 'http://localhost:5005/send-email';
export const sendEmail = async ({ to, subject, data }) => {
  try {
    const response = await axios.post(API_URL_email, {
      to,
      subject,
      data
    });
    return response.data;
  } catch (error) {
    throw new Error('Error sending email: ' + error.message);
  }
};




// Set up a base URL for API requests for history
// const API_URL_history = 'http://localhost:5006/api/history';

export const createHistory = async (historyData) => {
  const token = localStorage.getItem('token'); // Fetch token from local storage
  const response = await axios.post(API_URL_history, historyData, {
    headers: {
      Authorization: `Bearer ${token}`, // Set the token in the headers
    },
  });
  return response.data;
};

// New function to get all history for admin dashboard
export const getAllHistory = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_URL_history}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data; // Return the full list of histories
    } else {
      throw new Error(`Error fetching histories: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching histories:', error);
    throw error;
  }
};


export const getHistoryByUserId = async (userId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get(`${API_URL_history}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return response.data; // Return the history for the specified user
    } else {
      throw new Error(`Error fetching history for user ID ${userId}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error fetching history for user ID ${userId}:`, error);
    throw error;
  }
};