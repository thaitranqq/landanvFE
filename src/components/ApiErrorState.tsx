import React from 'react';
import '../App.css';

interface ApiErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  loading?: boolean;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({ error, onRetry, loading }) => {
  if (!error) return null;

  return (
    <div className="api-error-state">
      <div className="error-content">
        <i className="fas fa-exclamation-circle error-icon"></i>
        <h3>Không thể tải dữ liệu</h3>
        <p>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="retry-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang thử lại...
              </>
            ) : (
              <>
                <i className="fas fa-redo"></i>
                Thử lại
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
