import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', textAlign: 'center', padding: '24px' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}
