import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ClipboardCheck, KeyRound, LogOut, Menu, Search, User, X } from 'lucide-react';
import './Topbar.css';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';
import { searchWorkers } from '../api/workers';
import ChangePasswordModal from './ChangePasswordModal';
import NotificationBell from './NotificationBell';

function useTopbarSearch(navigate, onNavigated) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchWorkers(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function selectWorker(worker) {
    navigate(`/workers/${worker.id}`);
    setQuery('');
    setResults([]);
    setOpen(false);
    onNavigated?.();
  }

  return { query, setQuery, results, open, setOpen, selectWorker };
}

export default function Topbar({ onToggleNav }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const desktopSearch = useTopbarSearch(navigate);
  const mobileSearch = useTopbarSearch(navigate, () => setMobileSearchOpen(false));
  const desktopSearchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        desktopSearch.setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [desktopSearch]);

  return (
    <header className="no-print topbar">
      <div className="topbar-inner">
      <button
        onClick={onToggleNav}
        className="topbar-nav-toggle"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="topbar-brand">
        <div className="topbar-brand-icon">
          <ClipboardCheck size={18} />
        </div>
        <span className="topbar-brand-name">AMS</span>
      </div>

      <div className="topbar-search" ref={desktopSearchRef}>
        <div className="topbar-search-input-wrapper">
          <Search size={16} className="topbar-search-icon" />
          <input
            type="text"
            value={desktopSearch.query}
            onChange={(e) => {
              desktopSearch.setQuery(e.target.value);
              desktopSearch.setOpen(true);
            }}
            onFocus={() => desktopSearch.setOpen(true)}
            placeholder="Search workers by code or name..."
            className="topbar-search-field"
          />
          {desktopSearch.open && desktopSearch.results.length > 0 && (
            <div className="topbar-search-results">
              {desktopSearch.results.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => desktopSearch.selectWorker(w)}
                  className="topbar-search-result"
                >
                  <span className="topbar-search-result-code">{w.workerCode}</span>
                  <span className="topbar-search-result-name"> — {w.firstName} {w.lastName}</span>
                  <span className="topbar-search-result-meta">{w.contractor?.contractorName} · {w.designation?.designationName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="topbar-mobile-search-toggle"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <NotificationBell />

        <div className="topbar-avatar-menu">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="topbar-avatar-trigger"
          >
            <span className="topbar-avatar-badge">
              {initials(user?.fullName || user?.loginId)}
            </span>
            <ChevronDown size={16} className="topbar-avatar-chevron" />
          </button>

          {menuOpen && (
            <>
              <div className="topbar-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="topbar-menu-panel">
                <div className="topbar-menu-header">
                  <span className="topbar-menu-avatar">
                    {initials(user?.fullName || user?.loginId)}
                  </span>
                  <div className="topbar-menu-name-wrapper">
                    <p className="topbar-menu-name">
                      {user?.fullName || user?.loginId}
                    </p>
                    <p className="topbar-menu-login-id">{user?.loginId}</p>
                  </div>
                </div>
                <div className="topbar-menu-divider" />
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="topbar-menu-item"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setChangePasswordOpen(true);
                    setMenuOpen(false);
                  }}
                  className="topbar-menu-item"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>
                <div className="topbar-menu-divider" />
                <button
                  onClick={logout}
                  className="topbar-menu-item-danger"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {mobileSearchOpen && (
        <div className="topbar-mobile-search-panel">
          <div className="topbar-mobile-search-row">
            <Search size={18} className="topbar-mobile-search-icon" />
            <input
              type="text"
              autoFocus
              value={mobileSearch.query}
              onChange={(e) => mobileSearch.setQuery(e.target.value)}
              placeholder="Search workers by code or name..."
              className="topbar-mobile-search-field"
            />
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                mobileSearch.setQuery('');
              }}
              className="topbar-mobile-search-close"
            >
              <X size={20} />
            </button>
          </div>
          {mobileSearch.results.length > 0 && (
            <div className="topbar-mobile-search-results">
              {mobileSearch.results.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => mobileSearch.selectWorker(w)}
                  className="topbar-mobile-search-result"
                >
                  <span className="topbar-search-result-code">{w.workerCode}</span>
                  <span className="topbar-search-result-name"> — {w.firstName} {w.lastName}</span>
                  <span className="topbar-search-result-meta">{w.contractor?.contractorName} · {w.designation?.designationName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
}
