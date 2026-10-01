import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div>
      <PageHeader title="My Profile" description="Your account details for this Admin portal." />

      <div className="profile-page-card">
        <div className="profile-page-header">
          <div className="profile-page-avatar">
            {initials(user?.fullName || user?.loginId)}
          </div>
          <div>
            <p className="profile-page-name">{user?.fullName || user?.loginId}</p>
            <p className="profile-page-login-id">Login ID: {user?.loginId}</p>
            <span className="profile-page-role-badge">
              {user?.role}
            </span>
          </div>
        </div>

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
