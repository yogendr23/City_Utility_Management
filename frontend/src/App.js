import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Announcements from './pages/Announcements';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import EmployeeManagement from './components/EmployeeManagement';
import ProfileUpdate from './pages/ProfileUpdate';
import HistoryReports from './pages/HistoryReports';
import AboutUs from './pages/AboutUs';
import PrivacyPage from './pages/PrivacyPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/register" component={Register} />
      <Route path="/register_employee" component={EmployeeManagement} />
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} exact />
      <Route path="/AdminHome" component={AdminHome} exact />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/employee" component={EmployeeDashboard} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/submit-report" component={ReportForm} />
      <Route path="/my-reports" component={ReportList} />
      <Route path="/profile/update" component={ProfileUpdate} />
      <Route path="/archived/reports" component={HistoryReports} />
      <Route path="/about" component={AboutUs} />
      <Route path="/privacy" component={PrivacyPage} />
    </Switch>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
