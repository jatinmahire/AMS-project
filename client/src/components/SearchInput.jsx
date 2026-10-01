import { Search } from 'lucide-react';
import './SearchInput.css';

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-input-wrapper">
      <Search size={16} className="search-input-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input-field"
      />
    </div>
  );
}
