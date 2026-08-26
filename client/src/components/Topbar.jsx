import { useState } from 'react';
import { ChevronDown, KeyRound, LogOut, Menu, Moon, Sun, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChangePasswordModal from './ChangePasswordModal';

export default function Topbar({ onOpenMobileSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={onOpenMobileSidebar}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-3 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <UserCircle size={20} />
            <span className="hidden sm:inline">{user?.fullName || user?.loginId}</span>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg animate-[fadeIn_150ms_ease-out] dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => {
                    setChangePasswordOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <KeyRound size={16} />
                  Change Password
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
}
