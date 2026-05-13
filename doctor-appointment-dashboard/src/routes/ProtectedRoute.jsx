// ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  

  
  return <>{children}</>;
};

export default ProtectedRoute;