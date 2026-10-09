// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, allowedRoles, children }) {
  // ยังโหลด user อยู่ (fetchUserData ยังไม่เสร็จ) รอก่อน ไม่ควร redirect เร็วเกินไป
  if (user === undefined) {
    return <p>Loading…</p>;
  }

  // ไม่ได้ login เลย
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // login แล้วแต่ role ไม่ตรง
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}