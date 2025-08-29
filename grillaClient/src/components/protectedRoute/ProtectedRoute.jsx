import { Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { useContext } from 'react';

export const ProtectedRoute = ({
  children,
  privacy,
  requireTableAccess = false,
}) => {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const hashBrowser = import.meta.env.VITE_HASH_BROWSER;

  if (user && privacy.includes(user.rol)) {
    // Additional check for fiscal users accessing specific tables
    if (
      requireTableAccess &&
      user.rol === 'fiscal' &&
      user.assignedTable &&
      params.id
    ) {
      // If fiscal user has assigned table but is trying to access a different table
      if (user.assignedTable._id !== params.id) {
        // Redirect to their assigned table
        return (
          <Navigate
            to={`${hashBrowser === 'true' ? '#/' : '/'}mesas/${
              user.assignedTable._id
            }`}
            replace
          />
        );
      }
    }

    // Check if fiscal user with assigned table is trying to access tables list
    if (
      user.rol === 'fiscal' &&
      user.assignedTable &&
      window.location.pathname === '/mesas' &&
      !params.id
    ) {
      // Redirect to their assigned table
      return (
        <Navigate
          to={`${hashBrowser === 'true' ? '#/' : '/'}mesas/${
            user.assignedTable._id
          }`}
          replace
        />
      );
    }

    // Check if fiscal user without assigned table is trying to access a specific table
    if (
      requireTableAccess &&
      user.rol === 'fiscal' &&
      !user.assignedTable &&
      params.id
    ) {
      // Allow access - Fiscal General can access any table
      return children;
    }

    return children;
  } else if (!!user) {
    return <Navigate to='/' />;
  } else {
    return <Navigate to='/login' />;
  }
};
