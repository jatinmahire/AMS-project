import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import FormField, { TextInput } from '../../components/FormField';
import { getErrorMessage } from '../../utils/errorMessage';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginId, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <ClipboardCheck size={24} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AMS Admin</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage attendance and workforce records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Login ID" required>
            <TextInput value={loginId} onChange={(e) => setLoginId(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Password" required>
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
