import React, { useState } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for portals
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useProducts } from '../hooks/useProducts';
import '../App.css';

const BarcodeScannerModal = () => {
  const { isBarcodeModalOpen, closeBarcodeModal } = useModal();
  const { searchByBarcode } = useProducts();
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!barcode) return;

    setError('');
    setIsSearching(true);

    try {
      const foundProduct = await searchByBarcode(barcode);

      if (foundProduct) {
        closeBarcodeModal();
        navigate(`/product/${foundProduct.id}`);
      } else {
        setError('Không tìm thấy sản phẩm với mã vạch này.');
      }
    } catch (err) {
      setError('Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setBarcode('');
    setError('');
    closeBarcodeModal();
  }

  if (!isBarcodeModalOpen) {
    return null;
  }

  // The modal content to be rendered
  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={handleClose} className="modal-close-btn"><i className="fas fa-times"></i></button>
        <h4>Quét mã vạch sản phẩm</h4>
        <p>Nhập mã số bên dưới mã vạch của sản phẩm để tìm kiếm.</p>
        <div className="barcode-input-group">
          <input 
            type="text" 
            placeholder="Ví dụ: 8809663751019"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Allow searching with Enter key
          />
          <button onClick={handleSearch} className="btn btn-primary" disabled={isSearching}>
            {isSearching ? <i className="fas fa-spinner fa-spin"></i> : 'Tìm kiếm'}
          </button>
        </div>
        {error && <p className="modal-error">{error}</p>}
      </div>
    </div>
  );

  // Use a portal to render the modal at the end of the body
  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default BarcodeScannerModal;
