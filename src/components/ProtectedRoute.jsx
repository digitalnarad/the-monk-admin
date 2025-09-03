import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if user is authenticated
  const isAuthenticated = Boolean(localStorage.getItem('auth-token'));
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
