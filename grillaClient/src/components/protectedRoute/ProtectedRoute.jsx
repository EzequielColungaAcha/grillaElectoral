import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

export const ProtectedRoute = ({ children, privacy }) => {
  const { user } = useContext(AuthContext);
  if (user && privacy.includes(user.rol)) {
    return children;
  } else if (!!user) {
    return <Navigate to="/" />;
  } else {
    return <Navigate to="/login" />;
  }
};
