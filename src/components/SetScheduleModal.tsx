import React, { useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useSchedules } from '../context/ScheduleContext';
import { useAlerts } from '../context/AlertContext'; // Import alert context
import '../App.css';

const scheduleOptions = [
  { description: 'Mỗi buổi sáng (8:00)', cronExpr: '0 8 * * *' },
  { description: 'Mỗi buổi tối (21:00)', cronExpr: '0 21 * * *' },
  { description: 'Mỗi ngày (trưa 12:00)', cronExpr: '0 12 * * *' },
];

const SetScheduleModal = () => {
  const { isSetScheduleModalOpen, closeSetScheduleModal, productToSchedule } = useModal();
  const { createSchedule } = useSchedules();
  const { createAlert } = useAlerts(); // Get the createAlert function

  const [selectedCron, setSelectedCron] = useState(scheduleOptions[0].cronExpr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToSchedule || !selectedCron) {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    const selectedOption = scheduleOptions.find(opt => opt.cronExpr === selectedCron);
    if (!selectedOption) return;

    createSchedule({
      productId: productToSchedule.id,
      cronExpr: selectedOption.cronExpr,
      channel: 'PUSH_NOTIFICATION',
      description: selectedOption.description,
    });

    // Create a confirmation alert
    createAlert('ROUTINE_REMINDER', { 
        productName: productToSchedule.name,
        schedule: selectedOption.description
    });

    alert(`Đã đặt lịch nhắc nhở cho "${productToSchedule.name}".`);
    closeSetScheduleModal();
  };

  if (!isSetScheduleModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={closeSetScheduleModal} className="modal-close-btn"><i className="fas fa-times"></i></button>
        <h4>Đặt lịch nhắc nhở</h4>
        <p>Chọn thời điểm bạn muốn được nhắc nhở sử dụng <strong>{productToSchedule?.name}</strong>.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="scheduleSelect">Chọn lịch trình</label>
            <select id="scheduleSelect" value={selectedCron} onChange={e => setSelectedCron(e.target.value)} required>
              {scheduleOptions.map(opt => (
                <option key={opt.cronExpr} value={opt.cronExpr}>{opt.description}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Lưu lịch trình</button>
        </form>
      </div>
    </div>
  );
};

export default SetScheduleModal;
