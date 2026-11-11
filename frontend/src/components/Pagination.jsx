import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total, hasPrevPage, hasNextPage } = pagination;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        style={{ padding: '6px 12px', cursor: hasPrevPage ? 'pointer' : 'not-allowed' }}
      >
        Previous
      </button>

      <span>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total)
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        style={{ padding: '6px 12px', cursor: hasNextPage ? 'pointer' : 'not-allowed' }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
