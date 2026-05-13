// AdminRoutes.js
import ProtectedRoute from "./ProtectedRoute";

const AdminRoutes = ({ children }) => {
  return (
    <ProtectedRoute >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoutes;