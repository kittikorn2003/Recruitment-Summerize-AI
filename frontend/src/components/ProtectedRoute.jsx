
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  user,
  loading,
  allowedRoles,
  children,
}) {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}
