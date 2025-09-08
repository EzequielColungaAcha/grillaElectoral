import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/simpleAuthContext';
import { URL } from '../../config';

export const ProtectedRoute = ({ children, privacy }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-white'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${URL}/login`} />;
  }

  // Since we only have admin users in offline mode, allow access to all routes
  if (user && user.rol === 'admin') {
    return children;
  }

  return <Navigate to={`${URL}/`} />;
};
