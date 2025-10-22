import React, { useState, useEffect } from 'react';
import { useModal, UIProduct } from '../context/ModalContext';
import { useRoutines } from '../context/RoutineContext';
import { useUser } from '../context/UserContext'; // Import user context
import { useAlerts } from '../context/AlertContext'; // Import alert context
import '../App.css';

const AddToRoutineModal: React.FC = () => {
  const { isAddToRoutineModalOpen, closeAddToRoutineModal, productToAdd } = useModal();
  const { routines, addProductToRoutine } = useRoutines();
  const { profile } = useUser();
  const { createAlert } = useAlerts();

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [timeOfDay, setTimeOfDay] = useState<'Sáng' | 'Tối' | 'Bất kỳ'>('Sáng');

  useEffect(() => {
    if (routines.length > 0) {
      setSelectedRoutineId(routines[0].id.toString());
    }
  }, [isAddToRoutineModalOpen, routines]);

  // Minimal ingredient shape that UI code may provide
  type IngredientLike = { name?: string; inciName?: string };

  // Narrow UIProduct to something that has an ingredients array
  const hasIngredients = (p: UIProduct | null): p is UIProduct & { ingredients: IngredientLike[] } => {
    return !!p && typeof p === 'object' && Array.isArray((p as { ingredients?: unknown }).ingredients);
  };

  const getProductName = (p: UIProduct | null) => {
    if (!p) return 'Sản phẩm';
    return (p as { name?: string }).name ?? (p as { productName?: string }).productName ?? 'Sản phẩm';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToAdd || !selectedRoutineId) {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    // Check for allergens before adding to routine
    let allergenicIngredientName: string | null = null;
    if (hasIngredients(productToAdd) && profile && Array.isArray(profile.allergies)) {
      const allergenicIngredient = productToAdd.ingredients.find((ing) => {
        const name = (ing.name ?? ing.inciName ?? '').toString().toLowerCase().trim();
        return profile.allergies.includes(name);
      });
      if (allergenicIngredient) allergenicIngredientName = (allergenicIngredient.name ?? allergenicIngredient.inciName) || null;
    }

    if (allergenicIngredientName) {
      createAlert('ALLERGY_WARNING', {
        productName: getProductName(productToAdd),
        ingredient: allergenicIngredientName
      });
    }

    // Use id and name safely
    const productId = ('id' in (productToAdd ?? {}) ? Number((productToAdd as { id?: number }).id) : undefined);
    const productName = getProductName(productToAdd);

    if (typeof productId !== 'number' || Number.isNaN(productId)) {
      alert('Không thể xác định sản phẩm để thêm.');
      return;
    }

    addProductToRoutine(Number(selectedRoutineId), productId, step, timeOfDay);
    alert(`Đã thêm "${productName}" vào liệu trình!`);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTimeOfDay('Sáng');
    closeAddToRoutineModal();
  }

  if (!isAddToRoutineModalOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleClose} className="modal-close-btn"><i className="fas fa-times"></i></button>
        <h4>Thêm vào liệu trình</h4>
        <p>Thêm sản phẩm <strong>{getProductName(productToAdd)}</strong> vào liệu trình của bạn.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="routineSelect">Chọn liệu trình</label>
            <select id="routineSelect" value={selectedRoutineId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRoutineId(e.target.value)} required>
              {routines.map(r => <option key={r.id} value={r.id.toString()}>{r.title}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="step">Thứ tự bước</label>
              <input type="number" id="step" min="1" value={step} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStep(Number(e.target.value) || 1)} required />
            </div>
            <div className="form-group">
              <label htmlFor="timeOfDay">Thời điểm</label>
              <select id="timeOfDay" value={timeOfDay} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeOfDay(e.target.value as 'Sáng' | 'Tối' | 'Bất kỳ')} required>
                <option value="Sáng">Sáng</option>
                <option value="Tối">Tối</option>
                <option value="Bất kỳ">Bất kỳ</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">Thêm sản phẩm</button>
        </form>
      </div>
    </div>
  );
};

export default AddToRoutineModal;
