import React from 'react';
import { Link } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import type { Alert } from '../context/AlertContext';
import '../App.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { alerts, unreadCount, markAllAsRead } = useAlerts();

  if (!isOpen) {
    return null;
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'NEW_RECOMMENDATION': return 'fas fa-lightbulb';
      case 'ROUTINE_REMINDER': return 'fas fa-clock';
      case 'ALLERGY_WARNING': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
    }
  };

  const getAlertMessage = (alert: Alert) => {
    const payload = JSON.parse(alert.payloadJson);
    switch (alert.type) {
      case 'NEW_RECOMMENDATION':
        return <>Gợi ý mới: <strong>{payload.productName}</strong> có thể phù hợp với bạn.</>;
      case 'ROUTINE_REMINDER':
        return <>Đã đặt lịch cho <strong>{payload.productName}</strong>: {payload.schedule}.</>;
      case 'ALLERGY_WARNING':
        return <>Cảnh báo: <strong>{payload.productName}</strong> chứa <strong>{payload.ingredient}</strong>.</>;
      default:
        return 'Bạn có thông báo mới.';
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Thông báo</h3>
        <div className="notification-header-actions">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read-btn">Đánh dấu tất cả đã đọc</button>
          )}
          {onClose && (
            <button onClick={onClose} className="notification-close-btn" aria-label="Đóng">×</button>
          )}
        </div>
      </div>
      <div className="notification-list">
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <Link to={`/routines`} key={alert.id} className={`notification-item ${alert.status.toLowerCase()}`}>
              <i className={`${getAlertIcon(alert.type)} notification-icon`}></i>
              <div className="notification-content">
                <p>{getAlertMessage(alert)}</p>
                <span className="notification-time">{new Date(alert.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="notification-empty">Không có thông báo nào.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
