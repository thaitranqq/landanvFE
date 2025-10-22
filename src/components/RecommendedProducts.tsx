import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { getRecommendedProducts } from '../utils/recommendation';
import ProductSummaryCard from './ProductSummaryCard'; // Import the new component
import '../App.css';

const RecommendedProducts = () => {
  const { products, loading } = useProducts();
  const { profile } = useUser();

  if (loading || !profile) {
    return null; // Don't render recommendations if products are loading or profile is not available
  }

  const recommended = getRecommendedProducts(products, profile).slice(0, 3);

  if (recommended.length === 0) {
    return (
        <div className="card info-card full-width-card">
            <h3>Chưa có gợi ý nào</h3>
            <p>Hãy cập nhật hồ sơ cá nhân của bạn để chúng tôi có thể đưa ra những gợi ý tốt nhất!</p>
        </div>
    );
  }

  return (
    <div className="recommended-products-section">
      <h3 className="section-title">✨ Gợi ý dành riêng cho bạn</h3>
      <div className="dashboard-results-grid">
        {recommended.map((product) => (
          <ProductSummaryCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
