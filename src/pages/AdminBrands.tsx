import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { BrandDTO } from '../types/api';
import '../App.css';

// Modal for creating/editing a brand
const BrandEditModal = ({ brand, onClose, onSave }: { brand: Partial<BrandDTO> | null, onClose: () => void, onSave: (id: number | null, name: string) => void }) => {
  const [name, setName] = useState(brand?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Tên thương hiệu không được để trống.');
      return;
    }
    onSave(brand?.id || null, name);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn"><i className="fas fa-times"></i></button>
        <h4>{brand?.id ? 'Chỉnh sửa Thương hiệu' : 'Tạo Thương hiệu mới'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="brandName">Tên thương hiệu</label>
            <input 
              type="text" 
              id="brandName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Lưu</button>
        </form>
      </div>
    </div>
  );
};

const AdminBrands = () => {
  const { brands, createBrand, updateBrand, deleteBrand, loading } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandDTO> | null>(null);

  const handleOpenModal = (brand: Partial<BrandDTO> | null = null) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBrand(null);
    setIsModalOpen(false);
  };

  const handleSave = async (id: number | null, name: string) => {
    try {
      if (id) {
        await updateBrand(id, name);
      } else {
        await createBrand(name);
      }
      handleCloseModal();
    } catch (error) {
      alert('Đã có lỗi xảy ra.');
    }
  };

  const handleDelete = (brand: BrandDTO) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}"?`)) {
      deleteBrand(brand.id);
    }
  };

  if (loading) {
    return <div>Loading brands...</div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Quản lý Thương hiệu</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus"></i> Thêm Thương hiệu mới
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Thương hiệu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(brand => (
              <tr key={brand.id}>
                <td>{brand.id}</td>
                <td>{brand.name}</td>
                <td className="actions-cell">
                  <button onClick={() => handleOpenModal(brand)} className="btn-icon edit-btn"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(brand)} className="btn-icon delete-btn"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <BrandEditModal 
          brand={editingBrand}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminBrands;
