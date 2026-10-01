import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span>
        Page {page} of {totalPages} ({total} total)
      </span>
      <div className="pagination-buttons">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-button"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="pagination-button"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
