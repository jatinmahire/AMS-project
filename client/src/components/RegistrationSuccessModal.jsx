import { KeyRound } from 'lucide-react';
import './RegistrationSuccessModal.css';
import Modal from './Modal';
import Button from './Button';

export default function RegistrationSuccessModal({ open, roleLabel, code, loginId, password, onContinue }) {
  return (
    <Modal open={open} onClose={onContinue} title={`${roleLabel} Registered`} size="sm">
      <p className="registration-success-message">
        {roleLabel} registered successfully as <span className="registration-success-code">{code}</span>.
        Share these credentials with them to sign in — this password is only shown once.
      </p>

      <div className="registration-success-credentials">
        <div className="registration-success-credentials-header">
          <KeyRound size={16} />
          Login Credentials
        </div>
        <div>
          <p className="registration-success-field-label">Login ID</p>
          <p className="registration-success-field-value">{loginId}</p>
        </div>
        <div>
          <p className="registration-success-field-label">Password</p>
          <p className="registration-success-field-value">{password}</p>
        </div>
      </div>

      <div className="registration-success-actions">
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </Modal>
  );
}
