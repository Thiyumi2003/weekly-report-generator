import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Import all application page views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyReports from './pages/MyReports';
import CreateReport from './pages/CreateReport';
import EditReport from './pages/EditReport';
import Projects from './pages/Projects';
import ManagerDashboard from './pages/ManagerDashboard';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Protected Workspace Paths */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Team Member Restricted Paths */}
              <Route element={<RoleProtectedRoute allowedRoles={['Team Member']} />}>
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/create-report" element={<CreateReport />} />
                <Route path="/edit-report/:id" element={<EditReport />} />
              </Route>

              {/* Manager Restricted Paths */}
              <Route element={<RoleProtectedRoute allowedRoles={['Manager']} />}>
                <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Redirection */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
