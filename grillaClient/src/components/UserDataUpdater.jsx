import { useSubscription } from '@apollo/client';
import { useContext, useEffect, useState } from 'react';
import { USER_TABLE_ASSIGNMENT_UPDATED } from '../graphql/subscription.js';
import { AuthContext } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export const UserDataUpdater = () => {
  const { user, updateUser, refreshUserFromContext } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const hashBrowser = import.meta.env.VITE_HASH_BROWSER;
  const [hasProcessedInitialRedirect, setHasProcessedInitialRedirect] =
    useState(false);

  // Check if current route is unauthorized for fiscal user and redirect - returns true if redirected
  const checkAndRedirectFiscalUser = (assignedTable) => {
    if (user?.rol === 'fiscal') {
      const currentPath = location.pathname;

      // Check if user is on a table-specific page
      const tableMatch = currentPath.match(/\/mesas\/([^\/]+)$/);

      if (tableMatch) {
        const currentTableId = tableMatch[1];

        if (assignedTable) {
          // User has assigned table - redirect if on wrong table
          if (currentTableId !== assignedTable._id) {
            const tableUrl = `${hashBrowser === 'true' ? '#/' : '/'}mesas/${
              assignedTable._id
            }`;
            navigate(tableUrl, { replace: true });
            return true;
          }
        }
      } else if (currentPath === '/mesas' && assignedTable) {
        // User is on tables list but has assigned table - redirect to assigned table
        const tableUrl = `${hashBrowser === 'true' ? '#/' : '/'}mesas/${
          assignedTable._id
        }`;
        navigate(tableUrl, { replace: true });
        return true;
      }
    }
    return false;
  };

  // Subscribe to table assignment updates - this is the main mechanism for real-time updates
  const { data: tableAssignmentUpdated } = useSubscription(
    USER_TABLE_ASSIGNMENT_UPDATED,
    {
      onData: (data) => {
        const updatedUser = data.data.data.userTableAssignmentUpdated;

        if (updatedUser && user && updatedUser._id === user.user_id) {
          // Generate new token with updated table assignment and store it
          const currentToken = localStorage.getItem('token');
          if (currentToken) {
            try {
              const decodedToken = jwt_decode(currentToken);

              // Create new token payload with updated assignedTable
              const newPayload = {
                user_id: decodedToken.user_id,
                username: decodedToken.username,
                name: decodedToken.name,
                rol: decodedToken.rol,
                assignedTable: updatedUser.assignedTable,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
                iat: Math.floor(Date.now() / 1000),
              };

              // Create a simple JWT-like token (base64 encoded)
              // This is a simplified approach since we can't use jsonwebtoken in browser
              const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
              const payload = btoa(JSON.stringify(newPayload));
              const newToken = `${header}.${payload}.signature`;

              localStorage.setItem('token', newToken);
            } catch (error) {
              console.error('UserDataUpdater: Error updating token:', error);
            }
          }

          // Update the user data in context
          updateUser({
            assignedTable: updatedUser.assignedTable,
          });

          // Immediately redirect based on new assignment
          checkAndRedirectFiscalUser(updatedUser.assignedTable, false);
        }
      },
      onError: (error) => {
        console.error('UserDataUpdater: Subscription error:', error);
      },
    }
  );

  // Handle initial redirect and location changes
  useEffect(() => {
    if (!user) return;

    // For initial page load/refresh, use the current context user data (which gets updated by subscription)
    if (!hasProcessedInitialRedirect) {
      const redirected = checkAndRedirectFiscalUser(user.assignedTable, true);
      setHasProcessedInitialRedirect(true);
      return;
    }

    // For subsequent location changes (manual navigation)
    if (user.rol === 'fiscal') {
      checkAndRedirectFiscalUser(user.assignedTable, false);
    }
  }, [
    location.pathname,
    user?.assignedTable?._id,
    user?.rol,
    hasProcessedInitialRedirect,
  ]);

  return null; // This component doesn't render anything
};
