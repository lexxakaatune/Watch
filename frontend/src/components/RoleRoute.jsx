import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useAuth';

export default function RoleRoute({ allowedRoles }) {
  const { isAuthenticated, loading } = useAuth();
  const { role } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
