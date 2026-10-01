import { useState } from 'react';
import './ChangePasswordModal.css';
import Modal from './Modal';
import Button from './Button';
import FormField, { TextInput } from './FormField';
import { changePassword } from '../api/auth';
import { getErrorMessage, getFieldErrors } from '../utils/errorMessage';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await changePassword(form);
      showToast('Password updated successfully');
      handleClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Change Password" size="sm">
      <form onSubmit={handleSubmit} className="change-password-modal-form">
        <FormField label="Current Password" required error={errors.currentPassword}>
          <TextInput
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            error={errors.currentPassword}
          />
        </FormField>
        <FormField label="New Password" required error={errors.newPassword}>
          <TextInput
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            error={errors.newPassword}
          />
        </FormField>
        <FormField label="Confirm New Password" required error={errors.confirmPassword}>
          <TextInput
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />
        </FormField>
        <div className="change-password-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
