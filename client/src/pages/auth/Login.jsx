import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { homeRouteFor } from '../../routes/ProtectedRoute';
import Button from '../../components/Button';
import FormField, { TextInput, Select } from '../../components/FormField';
import { getErrorMessage } from '../../utils/errorMessage';
import './Login.css';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'CONTRACTOR', label: 'Contractor' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('SUPERVISOR');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(loginId, password, selectedRole);
      navigate(homeRouteFor(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ClipboardCheck size={24} />
          </div>
          <h1 className="login-title">AMS Admin</h1>
          <p className="login-subtitle">Sign in to manage attendance and workforce records.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <FormField label="Login As" required>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Login ID" required>
            <TextInput value={loginId} onChange={(e) => setLoginId(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Password" required>
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" className="login-submit-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
