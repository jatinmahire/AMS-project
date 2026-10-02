import { useState } from 'react';
import { Check, KeyRound, Pencil, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { TextInput } from '../../components/FormField';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../api/auth';
import { getErrorMessage } from '../../utils/errorMessage';
import { displayName, initials } from '../../utils/format';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  function cancelEdit() {
    setName(user?.fullName || '');
    setEditing(false);
  }

  const canEditName = user?.role === 'ADMIN';
  const nameChanged = name.trim() !== (user?.fullName || '').trim();

  async function handleSaveName(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ fullName: name });
      updateUser({ fullName: updated.fullName });
      setName(updated.fullName || '');
      setEditing(false);
      showToast('Display name updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Your account details for this Admin portal." />

      <div className="profile-page-card">
        <div className="profile-page-header">
          <div className="profile-page-avatar">
            {initials(displayName(user))}
          </div>
          <div>
            <p className="profile-page-name">{displayName(user)}</p>
            <p className="profile-page-login-id">Login ID: {user?.loginId}</p>
            <span className="profile-page-role-badge">
              {user?.role}
            </span>
          </div>
        </div>

        {canEditName && (
          <div className="profile-page-name-form">
            <p className="profile-page-name-label">Display Name</p>
            {editing ? (
              <form onSubmit={handleSaveName} className="profile-page-name-edit-row">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Admin"
                  autoFocus
                  className="profile-page-name-input"
                />
                <Button type="submit" icon={Check} disabled={saving || !nameChanged}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" icon={X} onClick={cancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="profile-page-name-display-row">
                <span className="profile-page-name-display">{displayName(user)}</span>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="profile-page-name-edit-btn"
                  aria-label="Edit display name"
                  title="Edit display name"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="profile-page-actions">
          <Button variant="secondary" icon={KeyRound} onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>
        </div>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </div>
  );
}
