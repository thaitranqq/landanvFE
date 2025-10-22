import React from 'react';
import '../App.css';

const LoadingSpinner = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
