import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UserCog,
  Users,
  UserPlus,
  Briefcase,
  Layers,
  Search,
  CalendarCheck,
  LogIn,
  AlertTriangle,
  IdCard,
  FileText,
  FileWarning,
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  ChevronDown,
  Bell,
} from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const SUPERVISOR_SECTIONS = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ to: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Daily Attendance',
    icon: CalendarCheck,
    items: [{ to: '/attendance', label: 'Daily Attendance', icon: CalendarCheck }],
  },
  {
    title: 'Worker Registration',
    icon: UserPlus,
    items: [{ to: '/workers/new', label: 'Register Worker', icon: UserPlus }],
  },
  {
    title: 'KYC Lookup',
    icon: Search,
    items: [{ to: '/kyc', label: 'KYC Lookup', icon: Search }],
  },
  {
    title: '90-Days Form',
    icon: FileText,
    items: [{ to: '/reports/90-days', label: '90-Days Form', icon: FileText }],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [{ to: '/notifications', label: 'Notifications', icon: Bell }],
  },
];

const CONTRACTOR_SECTIONS = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ to: '/contractor/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Workers',
    icon: Users,
    items: [{ to: '/workers', label: 'Workers', icon: Users }],
  },
  {
    title: 'KYC Lookup',
    icon: Search,
    items: [{ to: '/kyc', label: 'KYC Lookup', icon: Search }],
  },
  {
    title: 'Attendance',
    icon: CalendarCheck,
    items: [{ to: '/attendance', label: 'Attendance', icon: CalendarCheck }],
  },
  {
    title: 'Policies',
    icon: ShieldCheck,
    items: [{ to: '/policies', label: 'Policies', icon: ShieldCheck }],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [{ to: '/notifications', label: 'Notifications', icon: Bell }],
  },
];

const ADMIN_SECTIONS = [
  {
    title: 'Admin Dashboard',
    icon: LayoutDashboard,
    items: [{ to: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Master',
    icon: Layers,
    items: [
      { to: '/supervisors', label: 'Supervisor Master', icon: UserCog },
      { to: '/contractors', label: 'Contractor Master', icon: Building2 },
      { to: '/workers', label: 'Worker Master', icon: Users },
      { to: '/designations', label: 'Designation', icon: Briefcase },
      { to: '/labour-categories', label: 'Labour Category', icon: Layers },
      { to: '/attendance', label: 'Attendance Master', icon: CalendarCheck },
      { to: '/gate-logs', label: 'Gate Movement', icon: LogIn },
    ],
  },
  {
    title: 'Registration Form',
    icon: UserPlus,
    items: [
      { to: '/supervisors/new', label: 'Supervisor Registration Form', icon: UserPlus },
      { to: '/contractors/new', label: 'Contractor Registration Form', icon: UserPlus },
      { to: '/workers/new', label: 'Worker Registration Form', icon: UserPlus },
    ],
  },
  {
    title: 'Forms',
    icon: AlertTriangle,
    items: [
      { to: '/reports/statutory?type=advance', label: 'Advance', icon: ClipboardList },
      { to: '/reports/statutory?type=accident', label: 'Accident', icon: ClipboardList },
      { to: '/reports/statutory?type=damage', label: 'Damage or Loss', icon: ClipboardList },
      { to: '/reports/statutory?type=fine', label: 'Fine', icon: ClipboardList },
      { to: '/reports/statutory?type=overtime', label: 'Overtime', icon: ClipboardList },
    ],
  },
  {
    title: 'Reports',
    icon: FileText,
    items: [
      { to: '/reports/90-days', label: '90 Days Form', icon: FileText },
      { to: '/reports/muster-roll', label: 'Muster Roll', icon: FileWarning },
      { to: '/reports/pf-chalan', label: 'PF Chalan', icon: FileWarning },
      { to: '/reports/id-card', label: 'Worker ID Card', icon: IdCard },
    ],
  },
  {
    title: 'KYC',
    icon: Search,
    items: [
      { to: '/kyc?type=supervisor', label: 'Supervisor KYC', icon: Search },
      { to: '/kyc?type=contractor', label: 'Contractor KYC', icon: Search },
      { to: '/kyc?type=worker', label: 'Worker KYC', icon: Search },
    ],
  },
  {
    title: 'Daily Attendance',
    icon: CalendarCheck,
    items: [{ to: '/attendance', label: 'Daily Attendance', icon: CalendarCheck }],
  },
  {
    title: 'Policy/Licence',
    icon: ShieldCheck,
    items: [
      { to: '/policies/new', label: 'Policy Registration', icon: ShieldCheck },
      { to: '/policies', label: 'Policy Master', icon: ShieldCheck },
    ],
  },
  {
    title: 'Holiday',
    icon: CalendarDays,
    items: [
      { to: '/holidays?type=WEEKLY_OFF', label: 'Weekly Off', icon: CalendarDays },
      { to: '/holidays?type=PAID_LEAVE', label: 'Paid Leaves', icon: CalendarDays },
    ],
  },
];

function isSectionActive(section, pathname) {
  return section.items.some((item) => {
    if (!item.to) return false;
    const base = item.to.split('?')[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

function DesktopNav({ sections, onAction }) {
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpenSection(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenSection(null);
  }, [location.pathname]);

  return (
    <nav ref={containerRef} className="no-print navbar-desktop">
      <div className="navbar-desktop-inner">
        {sections.map((section) => {
          if (section.items.length === 1) {
            const item = section.items[0];
            return (
              <NavLink
                key={section.title}
                to={item.to}
                className={({ isActive }) =>
                  `navbar-link ${
                    isActive ? 'navbar-link-active' : 'navbar-link-inactive'
                  }`
                }
              >
                {section.title}
              </NavLink>
            );
          }

          const active = isSectionActive(section, location.pathname);
          const open = openSection === section.title;

          return (
            <div key={section.title} className="navbar-section">
              <button
                onClick={() => setOpenSection(open ? null : section.title)}
                className={`navbar-section-trigger ${
                  active || open ? 'navbar-section-trigger-active' : 'navbar-section-trigger-inactive'
                }`}
              >
                {section.title}
                <ChevronDown size={14} className={`navbar-section-chevron ${open ? 'navbar-section-chevron-open' : ''}`} />
              </button>

              {open && (
                <div className="navbar-section-menu">
                  {section.items.map((item) =>
                    item.to ? (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpenSection(null)}
                        className={({ isActive }) =>
                          `navbar-section-menu-item ${
                            isActive ? 'navbar-section-menu-item-active' : 'navbar-section-menu-item-inactive'
                          }`
                        }
                      >
                        <item.icon size={16} className="navbar-section-menu-item-icon" />
                        {item.label}
                      </NavLink>
                    ) : (
                      <button
                        key={item.action}
                        onClick={() => {
                          setOpenSection(null);
                          onAction?.(item.action);
                        }}
                        className="navbar-section-menu-item navbar-section-menu-item-inactive"
                      >
                        <item.icon size={16} className="navbar-section-menu-item-icon" />
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function MobileNav({ open, onClose, sections, onAction }) {
  if (!open) return null;

  return (
    <div className="navbar-mobile-overlay">
      <div className="navbar-mobile-backdrop" onClick={onClose} />
      <aside className="navbar-mobile-panel">
        <nav className="navbar-mobile-nav">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="navbar-mobile-section-title">
                <section.icon size={14} />
                {section.title}
              </p>
              <div className="navbar-mobile-section-items">
                {section.items.map((item) =>
                  item.to ? (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `navbar-mobile-link ${
                          isActive ? 'navbar-mobile-link-active' : 'navbar-mobile-link-inactive'
                        }`
                      }
                    >
                      <item.icon size={18} className="navbar-mobile-link-icon" />
                      {item.label}
                    </NavLink>
                  ) : (
                    <button
                      key={item.action}
                      onClick={() => {
                        onClose();
                        onAction?.(item.action);
                      }}
                      className="navbar-mobile-link navbar-mobile-link-inactive"
                    >
                      <item.icon size={18} className="navbar-mobile-link-icon" />
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default function Navbar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const sections =
    user?.role === 'SUPERVISOR' ? SUPERVISOR_SECTIONS : user?.role === 'CONTRACTOR' ? CONTRACTOR_SECTIONS : ADMIN_SECTIONS;

  return (
    <>
      <DesktopNav sections={sections} />
      <MobileNav open={mobileOpen} onClose={onCloseMobile} sections={sections} />
    </>
  );
}
