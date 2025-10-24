import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--primary-bg)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(45, 212, 166, 0.1)',
            borderTopColor: 'var(--accent-green)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no profile (new user)
  if (profile?.role === 'pending') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check role requirement
  if (requireRole && profile?.role !== requireRole) {
    // If user is trying to access provider pages as buyer or vice versa
    if (profile?.role === 'buyer' && requireRole === 'provider') {
      return <Navigate to="/buyer-dashboard" replace />;
    }
    if (profile?.role === 'provider' && requireRole === 'buyer') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
