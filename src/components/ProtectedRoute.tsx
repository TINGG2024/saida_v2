import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, selectedRole } = useApp();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === '管理员') {
    if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
      return <>{children}</>;
    }
    return <Navigate to="/admin" replace />;
  }

  if (!selectedRole) {
    if (location.pathname === '/select-role') {
      return <>{children}</>;
    }
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
}
