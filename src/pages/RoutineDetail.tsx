import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRoutines } from '../context/RoutineContext';
import type { RoutineItem } from '../context/RoutineContext';
import { useProducts } from '../hooks/useProducts';
import { useSchedules } from '../context/ScheduleContext';
import { useModal } from '../context/ModalContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

// Helper type to ensure we construct the full Product type correctly
type EnrichedRoutineItem = Required<RoutineItem>;

const RoutineDetail = () => {
  const { id } = useParams();
  const { getRoutineById, updateRoutine, deleteRoutineItem, reorderRoutineItems } = useRoutines();
  const { products, loading: productsLoading } = useProducts();
  const { getSchedulesForProduct, deleteSchedule } = useSchedules();
  const { openSetScheduleModal } = useModal();

  const [isEditing, setIsEditing] = useState(false);
  const routine = getRoutineById(Number(id));
  const [editedTitle, setEditedTitle] = useState(routine?.title || '');

  useEffect(() => {
    setEditedTitle(routine?.title || '');
  }, [routine]);

  if (productsLoading) {
    return <LoadingSpinner />;
  }

  if (!routine) {
    return (
      <main className="main-content">
        <div className="card info-card"><h3>Không tìm thấy liệu trình</h3></div>
      </main>
    );
  }

  const enrichedItems: EnrichedRoutineItem[] = [];
  for (const item of routine.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;
    enrichedItems.push({
      ...item,
      product: {
        ...product,
        skinTypeScore: {},
        ingredients: [],
        purchaseLinks: [],
        reviews: [],
        regulatoryLabels: []
      }
    } as EnrichedRoutineItem);
  }
  enrichedItems.sort((a, b) => a.step - b.step);

  const handleSave = () => {
    if (editedTitle !== routine.title) {
      updateRoutine(routine.id, editedTitle);
    }
    setIsEditing(false);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...enrichedItems];
    const itemToMove = newItems[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;

    newItems[index] = newItems[swapIndex];
    newItems[swapIndex] = itemToMove;

    reorderRoutineItems(routine.id, newItems);
  };

  return (
    <main className="main-content">
      <div className="greeting-with-action">
        <div className="greeting">
          {isEditing ? (
            <input 
              type="text" 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)} 
              className="routine-title-input"
            />
          ) : (
            <h2>{routine.title}</h2>
          )}
          <Link to="/routines" className="back-link">&lt; Quay lại danh sách liệu trình</Link>
        </div>
        {isEditing ? (
          <button onClick={handleSave} className="btn btn-primary"><i className="fas fa-save"></i> Lưu</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary"><i className="fas fa-edit"></i> Chỉnh sửa</button>
        )}
      </div>

      <div className="routine-detail-list">
        {enrichedItems.length > 0 ? (
          enrichedItems.map((item, index) => {
            const schedules = getSchedulesForProduct(item.product!.id);
            return (
              <div key={item.product!.id} className={`card routine-item-card ${isEditing ? 'editing' : ''}`}>
                  <div className="routine-step-container">
                    <span className="routine-step">Bước {item.step}</span>
                    {isEditing && (
                        <div className="reorder-controls">
                            <button onClick={() => moveItem(index, 'up')} disabled={index === 0}>▲</button>
                            <button onClick={() => moveItem(index, 'down')} disabled={index === enrichedItems.length - 1}>▼</button>
                        </div>
                    )}
                  </div>
                  <div className="routine-item-product">
                      <img src={item.product!.imageUrl} alt={item.product!.name} />
                      <div className="routine-item-info">
                          <h4>{item.product!.name}</h4>
                          <p>{item.product!.brandName}</p>
                          <span className="badge badge-medium">{item.timeOfDay}</span>
                      </div>
                  </div>
                  <div className="routine-item-actions">
                    {!isEditing ? (
                        <>
                            <div className="schedule-display">
                                {schedules.map(schedule => (
                                    <div key={schedule.id} className="schedule-tag">
                                    <i className="fas fa-clock"></i> {schedule.description}
                                    <button onClick={() => deleteSchedule(schedule.id)} className="delete-schedule-btn">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => openSetScheduleModal(item.product!)} className="btn btn-secondary btn-small"><i className="fas fa-plus"></i> Đặt lịch</button>
                            <Link to={`/product/${item.product!.id}`} className="btn btn-secondary btn-small">Xem SP</Link>
                        </>
                    ) : (
                        <button onClick={() => deleteRoutineItem(routine.id, item.productId)} className="btn btn-danger btn-small">
                            <i className="fas fa-trash"></i> Xóa
                        </button>
                    )}
                  </div>
              </div>
            )
          })
        ) : (
          <div className="card info-card">
            <p>Liệu trình này chưa có sản phẩm nào. Hãy thêm sản phẩm ngay!</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default RoutineDetail;
