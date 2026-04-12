import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import RecruiterDash from './pages/RecruiterDash';
import AdminDash from './pages/AdminDash';

function RequireAuth({ children, requireRole }: { children: JSX.Element, requireRole?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole && user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/explore" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/explore" element={<Directory />} />
        <Route path="/u/:username" element={<Profile />} />

        {/* Protected Member Routes */}
        <Route 
          path="/onboarding" 
          element={<RequireAuth><Onboarding /></RequireAuth>} 
        />
        <Route 
          path="/profile/me" 
          element={<RequireAuth><Onboarding /></RequireAuth>} 
        />

        {/* Recruiter Routes */}
        <Route 
          path="/recruiter" 
          element={<RequireAuth requireRole="RECRUITER"><RecruiterDash /></RequireAuth>} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<RequireAuth requireRole="ADMIN"><AdminDash /></RequireAuth>} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
