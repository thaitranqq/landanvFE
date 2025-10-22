import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import '../App.css';

const CompareTray: React.FC = () => {
  const { comparisonList, toggleCompare, clearCompare } = useProducts();

  if (comparisonList.length === 0) {
    return null; // Don't show the tray if it's empty
  }

  return (
    <div className="compare-tray">
      <div className="compare-tray-items">
        {comparisonList.map(product => (
          <div key={product.id} className="compare-item">
            <img src={product.imageUrl || ''} alt={product.name} />
            <span>{product.name}</span>
            <button onClick={() => toggleCompare(product)} className="remove-item-btn"><i className="fas fa-times"></i></button>
          </div>
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: 2 - comparisonList.length }).map((_, index) => (
            <div key={`placeholder-${index}`} className="compare-item placeholder">
                <span>Chọn một sản phẩm để so sánh</span>
            </div>
        ))}
      </div>
      <div className="compare-tray-actions">
        <Link to="/compare" className={`btn btn-primary ${comparisonList.length < 2 ? 'disabled' : ''}`}>
          So sánh ngay
        </Link>
        <button onClick={clearCompare} className="btn btn-secondary">Xóa tất cả</button>
      </div>
    </div>
  );
};

export default CompareTray;
