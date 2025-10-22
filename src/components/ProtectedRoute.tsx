import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Import the loading spinner

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // While the initial authentication check is running, show a loading screen.
  if (loading) {
    return <LoadingSpinner message="Đang xác thực..." />;
  }

  // After loading, if the user is not authenticated, redirect to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (the protected page).
  return <Outlet />;
};

export default ProtectedRoute;
