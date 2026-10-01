import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css';
import { useAuth } from '../context/AuthContext';

export function homeRouteFor(role) {
  if (role === 'SUPERVISOR') return '/supervisor/dashboard';
  if (role === 'CONTRACTOR') return '/contractor/dashboard';
  return '/dashboard';
}

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-route-loading">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeRouteFor(user.role)} replace />;
  }

  return children;
}
