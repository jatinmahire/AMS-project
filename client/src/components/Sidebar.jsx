import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UserCog,
  Users,
  Briefcase,
  Layers,
  Search,
  CalendarCheck,
  AlertTriangle,
  Gavel,
  Siren,
  Wallet,
  Clock,
  IdCard,
  FileText,
  ClipboardList,
  FileWarning,
  ShieldCheck,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Master Data',
    items: [
      { to: '/contractors', label: 'Contractors', icon: Building2 },
      { to: '/supervisors', label: 'Supervisors', icon: UserCog },
      { to: '/workers', label: 'Workers', icon: Users },
      { to: '/designations', label: 'Designations', icon: Briefcase },
      { to: '/labour-categories', label: 'Labour Categories', icon: Layers },
    ],
  },
  {
    title: 'Daily Operations',
    items: [
      { to: '/kyc', label: 'KYC Lookup', icon: Search },
      { to: '/attendance', label: 'Daily Attendance', icon: CalendarCheck },
    ],
  },
  {
    title: 'Operational Forms',
    items: [
      { to: '/damages', label: 'Damage', icon: AlertTriangle },
      { to: '/fines', label: 'Fine', icon: Gavel },
      { to: '/accidents', label: 'Accident', icon: Siren },
      { to: '/advances', label: 'Advance', icon: Wallet },
      { to: '/overtimes', label: 'Overtime', icon: Clock },
    ],
  },
  {
    title: 'Reports',
    items: [
      { to: '/reports/id-card', label: 'Worker ID Card', icon: IdCard },
      { to: '/reports/90-days', label: '90-Days Form', icon: FileText },
      { to: '/reports/statutory', label: 'Statutory Registers', icon: ClipboardList },
      { to: '/reports/muster-roll', label: 'Muster Roll', icon: FileWarning },
      { to: '/reports/pf-chalan', label: 'PF Chalan', icon: FileWarning },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { to: '/policies', label: 'Policy', icon: ShieldCheck },
      { to: '/holidays', label: 'Holiday', icon: CalendarDays },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="flex h-16 flex-none items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-indigo-600 text-white">
          <ClipboardCheck size={18} />
        </div>
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">AMS Admin</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className="hidden h-screen w-64 flex-none flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl animate-[slideIn_200ms_ease-out] dark:bg-slate-900">
            <SidebarContent onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
