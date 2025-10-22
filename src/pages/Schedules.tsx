import React, { useState, useEffect } from 'react';
import { useSchedules } from '../context/ScheduleContext';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

// A simple utility to parse cron expressions (for mock display only)
const parseCron = (cron: string) => {
  try {
    const parts = cron.split(' ');
    const minute = parts[0];
    const hour = parts[1];
    const dayOfWeek = parts[4];

    const days = {
      '*': 'Mỗi ngày',
      '1-5': 'Ngày trong tuần',
      '1,3,5': 'Thứ 2, 4, 6',
      '0,6': 'Cuối tuần'
    }[dayOfWeek] || `vào các ngày ${dayOfWeek}`;

    return `Vào ${hour}:${minute.padStart(2, '0')}, ${days}`;
  } catch {
    return 'Lịch trình không hợp lệ';
  }
};

const Schedules = () => {
  const { schedules, createSchedule, deleteSchedule } = useSchedules();
  const { products, loading: productsLoading } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [newProductId, setNewProductId] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newDays, setNewDays] = useState('*'); // Default to every day

  useEffect(() => {
    if (products.length > 0 && !newProductId) {
      setNewProductId(products[0].id.toString());
    }
  }, [products]);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductId) return;

    const [hour, minute] = newTime.split(':');
    const cronExpr = `${minute} ${hour} * * ${newDays}`;
    
    // Create schedule with full object instead of individual args
    createSchedule({
      productId: Number(newProductId),
      cronExpr,
      channel: 'PUSH_NOTIFICATION',
      description: `${newTime} ${newDays === '*' ? 'hàng ngày' : newDays}`
    });
    setShowForm(false);
  };

  if (productsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>Lịch trình & Nhắc nhở</h2>
        <p>Thiết lập lời nhắc để không bao giờ quên các bước chăm sóc da quan trọng.</p>
      </div>

      <div className="schedule-container">
        <div className="journal-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
            {showForm ? 'Đóng Form' : 'Tạo lịch trình mới'}
          </button>
        </div>

        {showForm && (
          <form className="card schedule-form" onSubmit={handleCreateSchedule}>
            <h4>Tạo lịch trình mới</h4>
            <div className="form-group">
              <label htmlFor="productSelect">Chọn sản phẩm để nhắc nhở</label>
              <select id="productSelect" value={newProductId} onChange={e => setNewProductId(e.target.value)} required>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time">Thời gian nhắc (24h)</label>
                <input type="time" id="time" value={newTime} onChange={e => setNewTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="days">Lặp lại vào</label>
                <select id="days" value={newDays} onChange={e => setNewDays(e.target.value)} required>
                  <option value="*">Mỗi ngày</option>
                  <option value="1-5">Các ngày trong tuần</option>
                  <option value="0,6">Các ngày cuối tuần</option>
                  <option value="1,3,5">Thứ 2, 4, 6</option>
                  <option value="2,4,6">Thứ 3, 5, 7</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full">Lưu lịch trình</button>
          </form>
        )}

        <div className="schedules-list">
          {schedules.map(schedule => {
            const product = products.find(p => p.id === schedule.productId);
            if (!product) return null;

            return (
              <div key={schedule.id} className="card schedule-card">
                <img src={product.imageUrl} alt={product.name} className="schedule-product-image" />
                <div className="schedule-info">
                  <h4>{product.name}</h4>
                  <p><i className="fas fa-clock"></i> {parseCron(schedule.cronExpr)}</p>
                </div>
                <button onClick={() => deleteSchedule(schedule.id)} className="btn-delete-schedule">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Schedules;
