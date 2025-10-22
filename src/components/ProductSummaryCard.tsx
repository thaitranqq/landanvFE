import { Link } from 'react-router-dom';
import React from 'react';
import type { Product } from '../types/api';
import '../App.css';

interface ProductSummaryCardProps {
  product: Product & { recommendationScore?: number };
}

const ProductSummaryCard: React.FC<ProductSummaryCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="card product-summary-card">
      <div className="product-image-summary">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-details-summary">
        <h4>{product.name}</h4>
        <p>{product.brandName}</p>
        {product.recommendationScore !== undefined && (
          <span className="badge badge-good">Điểm: {product.recommendationScore}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductSummaryCard;
