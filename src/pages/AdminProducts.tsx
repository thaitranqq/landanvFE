import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { ProductDTO } from '../types/api';
import '../App.css';

// Modal for creating/editing a product
const ProductEditModal = ({ product, onClose, onSave }: { product: Partial<ProductDTO> | null, onClose: () => void, onSave: (id: number | null, data: FormData) => void }) => {
  const { brands } = useAdmin();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    upcEan: product?.upcEan || '',
    category: product?.category || '',
    country: product?.country || '',
    brandId: product?.brandId || (brands.length > 0 ? brands[0].id : ''),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, String(value));
    });
    if (imageFile) {
      submissionData.append('image', imageFile);
    }
    if (product?.id && !imageFile) {
        submissionData.append('deleteImage', 'false');
    }

    onSave(product?.id || null, submissionData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <button onClick={onClose} className="modal-close-btn"><i className="fas fa-times"></i></button>
        <h4>{product?.id ? 'Chỉnh sửa Sản phẩm' : 'Tạo Sản phẩm mới'}</h4>
        <form onSubmit={handleSubmit} className="grid-form">
          <div className="form-group full-span">
            <label>Tên sản phẩm</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mã vạch (UPC/EAN)</label>
            <input name="upcEan" value={formData.upcEan} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Danh mục</label>
            <input name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Quốc gia</label>
            <input name="country" value={formData.country} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Thương hiệu</label>
            <select name="brandId" value={formData.brandId} onChange={handleChange} required>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group full-span">
            <label>Hình ảnh sản phẩm</label>
            <input type="file" name="image" onChange={handleFileChange} accept="image/*" />
            {product?.imageUrl && !imageFile && <img src={product.imageUrl} alt="Current" style={{maxWidth: '100px', marginTop: '10px'}}/>}
          </div>
          <div className="form-group full-span button-group">
            <button type="submit" className="btn btn-primary">Lưu Sản phẩm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const { products, createProduct, updateProduct, deleteProduct, loading } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ProductDTO> | null>(null);

  const handleOpenModal = (product: Partial<ProductDTO> | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = async (id: number | null, data: FormData) => {
    try {
      if (id) {
        await updateProduct(id, data);
      } else {
        await createProduct(data);
      }
      handleCloseModal();
    } catch (error) {
      alert('Đã có lỗi xảy ra.');
    }
  };

  const handleDelete = (product: ProductDTO) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Quản lý Sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus"></i> Thêm Sản phẩm mới
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <img src={product.imageUrl} alt={product.name} style={{width: '40px', height: '40px', objectFit: 'contain'}}/>
                        <span>{product.name}</span>
                    </div>
                </td>
                <td>{product.brandName}</td>
                <td>{product.category}</td>
                <td className="actions-cell">
                  <button onClick={() => handleOpenModal(product)} className="btn-icon edit-btn"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(product)} className="btn-icon delete-btn"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductEditModal 
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminProducts;
