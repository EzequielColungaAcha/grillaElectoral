import React, { useReducer, createContext } from 'react';
import jwtDecode from 'jwt-decode';

const initialState = {
  user: null,
};

// Helper function to decode and validate token
const getValidUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);

    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return {
      user_id: decodedToken.user_id,
      username: decodedToken.username,
      name: decodedToken.name,
      rol: decodedToken.rol,
      assignedTable: decodedToken.assignedTable || null,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// Initialize state from token
if (localStorage.getItem('token')) {
  const user = getValidUserFromToken();
  if (user) {
    initialState.user = user;
  }
}

const AuthContext = createContext({
  user: null,
  login: (userData) => {},
  logout: () => {},
  updateUser: (userData) => {},
});

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    const decodedToken = jwtDecode(userData.token);
    dispatch({
      type: 'LOGIN',
      payload: {
        user_id: decodedToken.user_id,
        username: decodedToken.username,
        name: decodedToken.name,
        rol: decodedToken.rol,
        assignedTable: decodedToken.assignedTable || null,
      },
    });
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  // Function to refresh user data from current context (not token)
  const refreshUserFromContext = () => {
    // This ensures we use the current context data, not stale token data
    return state.user;
  };

  function logout() {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        login,
        logout,
        updateUser,
        refreshUserFromContext,
      }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };
