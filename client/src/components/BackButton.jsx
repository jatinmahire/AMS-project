import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();

  function handleClick() {
    if (to) navigate(to);
    else navigate(-1);
  }

  return (
    <button
      onClick={handleClick}
      className="back-button"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}
