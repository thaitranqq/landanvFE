import React from 'react';
import { useAdmin } from '../context/AdminContext';
import '../App.css';

const AdminEvents = () => {
  const { events, loading } = useAdmin();

  if (loading) {
    return <div>Loading events...</div>;
  }

  const formatPayload = (payloadJson: string) => {
    try {
      const payload = JSON.parse(payloadJson);
      return Object.entries(payload)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (e) {
      return payloadJson; // Return raw string if not valid JSON
    }
  };

  return (
    <div className="admin-events-page">
      <div className="greeting">
        <h2>Nhật ký Sự kiện Hệ thống</h2>
        <p>Theo dõi các hành động gần đây của người dùng trên nền tảng.</p>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="events-table">
          <thead>
            <tr>
              <th>Loại Sự kiện</th>
              <th>User ID</th>
              <th>Dữ liệu</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <span className={`event-type-badge event-type-${event.type.toLowerCase()}`}>
                    {event.type}
                  </span>
                </td>
                <td>{event.userId}</td>
                <td>{formatPayload(event.payloadJson)}</td>
                <td>{new Date(event.timestamp).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEvents;
