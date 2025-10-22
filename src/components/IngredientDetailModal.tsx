import React, { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { api } from '../api/api';
import type { IngredientDTO } from '../types/api';
import LoadingSpinner from './LoadingSpinner';
import '../App.css';

const IngredientDetailModal = () => {
  const { isIngredientModalOpen, selectedIngredient, closeIngredientModal } = useModal();
  const [ingredientDetails, setIngredientDetails] = useState<IngredientDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isIngredientModalOpen && selectedIngredient) {
      const fetchIngredientDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          // Use the ID from selectedIngredient (which is a ProductContext.Product.ingredients item)
          const response = await api.get<IngredientDTO>(`/ingredients/${selectedIngredient.id}`);
          if (response.success && response.data) {
            setIngredientDetails(response.data);
          } else {
            throw new Error(response.error?.message || 'Không thể tải chi tiết thành phần.');
          }
        } catch (err: unknown) {
          // err may be unknown (network error, thrown Error, or other)
          const message = err instanceof Error ? err.message : String(err ?? 'Lỗi khi tải chi tiết thành phần.');
          setError(message || 'Lỗi khi tải chi tiết thành phần.');
        } finally {
          setLoading(false);
        }
      };
      fetchIngredientDetails();
    } else {
      // Reset state when modal is closed
      setIngredientDetails(null);
      setLoading(false);
      setError(null);
    }
  }, [isIngredientModalOpen, selectedIngredient]);

  if (!isIngredientModalOpen) {
    return null;
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content ingredient-modal">
          <LoadingSpinner message="Đang tải chi tiết thành phần..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content ingredient-modal">
          <button onClick={closeIngredientModal} className="modal-close-btn"><i className="fas fa-times"></i></button>
          <div className="card info-card"><h3>Lỗi</h3><p>{error}</p></div>
        </div>
      </div>
    );
  }

  if (!ingredientDetails) {
    return (
      <div className="modal-overlay">
        <div className="modal-content ingredient-modal">
          <button onClick={closeIngredientModal} className="modal-close-btn"><i className="fas fa-times"></i></button>
          <div className="card info-card"><h3>Không tìm thấy</h3><p>Không tìm thấy chi tiết cho thành phần này.</p></div>
        </div>
      </div>
    );
  }

  const { inciName, aliasVi, descriptionVi, functions, riskLevel } = ingredientDetails;

  return (
    <div className="modal-overlay" onClick={closeIngredientModal}>
      <div className="modal-content ingredient-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={closeIngredientModal} className="modal-close-btn"><i className="fas fa-times"></i></button>
        
        <div className="ingredient-modal-header">
          <h2>{aliasVi || inciName}</h2>
          {aliasVi && <p className="ingredient-inci-name">Tên INCI: {inciName}</p>}
        </div>

        <div className="ingredient-modal-body">
            <div className="info-section">
                <h4><i className="fas fa-info-circle"></i> Mô tả</h4>
                <p>{descriptionVi || 'Đang cập nhật...'}</p>
            </div>
            <div className="info-section">
                <h4><i className="fas fa-cogs"></i> Chức năng</h4>
                <p>{functions || 'Đang cập nhật...'}</p>
            </div>
            <div className="info-section">
                <h4><i className="fas fa-shield-alt"></i> Đánh giá rủi ro</h4>
                <p>LADANV đánh giá thành phần này ở mức: <strong>{riskLevel || 'Đang cập nhật...'}</strong></p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default IngredientDetailModal;
