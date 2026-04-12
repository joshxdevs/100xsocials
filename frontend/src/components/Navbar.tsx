import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import BrandMark from './BrandMark';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const primaryAction = user?.role === 'MEMBER'
    ? { to: '/profile/me', label: 'My Profile' }
    : user?.role === 'RECRUITER'
      ? { to: '/recruiter', label: 'Dashboard' }
      : user?.role === 'ADMIN'
        ? { to: '/admin', label: 'Admin' }
        : null;

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] border-b border-border/50 bg-bg/70 backdrop-blur-2xl transition-colors duration-500">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-10">
        <Link to="/" className="group flex items-center gap-3">
          <div className="transition-transform duration-300 group-hover:scale-[1.03]">
            <BrandMark size="sm" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-semibold tracking-tight text-content">
              100x Socials
            </span>
            <span className="mt-1 text-[11px] font-medium text-muted">
              Private network for builders
            </span>
          </div> 
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/explore" className="text-sm font-medium text-muted transition-colors hover:text-content">
            Explore
          </Link>
          {user && (
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] text-muted">
              {user.role}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface/90 text-muted transition-all duration-300 hover:border-border-hover hover:bg-surface-high hover:text-content"
            title="Switch theme"
          >
            {theme === 'light' ? (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {primaryAction && (
                <Link to={primaryAction.to} className="btn-primary px-4 py-2.5 text-sm">
                  {primaryAction.label}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface/90 text-muted transition-all duration-300 hover:border-border-hover hover:bg-surface-high hover:text-content"
                title="Sign Out"
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-5 py-2.5 text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
