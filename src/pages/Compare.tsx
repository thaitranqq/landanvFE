import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PurchaseLinks from '../components/PurchaseLinks';
import '../App.css';

const Compare = () => {
  const { comparisonList, fetchProductDetails } = useProducts();
  const [detailedProducts, setDetailedProducts] = useState<[Product | null, Product | null]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (comparisonList.length < 2) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productA, productB] = await Promise.all([
          fetchProductDetails(comparisonList[0].id),
          fetchProductDetails(comparisonList[1].id)
        ]);

        if (!productA || !productB) {
          throw new Error('Không thể tải chi tiết một trong hai sản phẩm.');
        }
        
        setDetailedProducts([productA, productB]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? 'Lỗi khi tải dữ liệu so sánh.');
        setError(message || 'Lỗi khi tải dữ liệu so sánh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [comparisonList, fetchProductDetails]);

  if (loading) {
    return <LoadingSpinner message="Đang tải dữ liệu so sánh..." />;
  }

  if (error) {
    return (
        <main className="main-content">
            <div className="card info-card"><h3>Lỗi</h3><p>{error}</p></div>
        </main>
    );
  }

  if (detailedProducts.some(p => p === null)) {
    // If we don't have two products to compare, redirect away.
    return <Navigate to="/routines" />;
  }

  // We can now safely assume productA and productB are not null due to the check above.
  const [productA, productB] = detailedProducts as [Product, Product];

  // Safely access ingredients, providing an empty array as a fallback.
  const ingredientsA = productA.ingredients?.map(i => i.inciName) || [];
  const ingredientsB = productB.ingredients?.map(i => i.inciName) || [];
  const commonIngredients = ingredientsA.filter(i => ingredientsB.includes(i));

  const renderIngredients = (product: Product) => {
    // Use optional chaining and provide a fallback empty array.
    if (!product.ingredients || product.ingredients.length === 0) {
        return <li>Không có thông tin thành phần.</li>;
    }

    return product.ingredients.map((ing) => {
      if (!ing) return null; // Safety check for malformed ingredient data
      const isCommon = commonIngredients.includes(ing.inciName);
      let dotClass = 'dot-good';
      if (ing.riskLevel === 'Không nên dùng') dotClass = 'dot-bad';
      else if (ing.riskLevel === 'Trung bình') dotClass = 'dot-medium';

      return (
        <li key={ing.id} className={isCommon ? 'ingredient-common' : 'ingredient-unique'}>
          <span className={`dot ${dotClass}`}></span> {ing.inciName}
        </li>
      );
    });
  };

  return (
    <main className="main-content">
      <div className="greeting">
        <h2>So sánh sản phẩm</h2>
        <p>Đối chiếu chi tiết hai sản phẩm bạn đã chọn.</p>
      </div>

      <div className="compare-grid">
        {/* Column for Product A */}
        <div className="compare-column">
          <div className="card compare-product-card">
            <img src={productA.imageUrl} alt={productA.name} />
            <h3>{productA.name}</h3>
            <p>{productA.brandName}</p>
          </div>
          <div className="card">
            {/* Safely pass purchaseLinks */}
            <PurchaseLinks links={productA.purchaseLinks || []} />
          </div>
          <div className="card">
            <h4>Thành phần</h4>
            <ul className="ingredient-list">{renderIngredients(productA)}</ul>
          </div>
          <div className="card">
            <h4>Điểm theo loại da</h4>
            <ul className="score-list">
              {/* Safely access skinTypeScore */}
              {Object.entries(productA.skinTypeScore || {}).map(([type, score]) => (
                <li key={type}><span>{type}</span> <strong>{score}/10</strong></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column for Product B */}
        <div className="compare-column">
          <div className="card compare-product-card">
            <img src={productB.imageUrl} alt={productB.name} />
            <h3>{productB.name}</h3>
            <p>{productB.brandName}</p>
          </div>
          <div className="card">
            {/* Safely pass purchaseLinks */}
            <PurchaseLinks links={productB.purchaseLinks || []} />
          </div>
          <div className="card">
            <h4>Thành phần</h4>
            <ul className="ingredient-list">{renderIngredients(productB)}</ul>
          </div>
          <div className="card">
            <h4>Điểm theo loại da</h4>
            <ul className="score-list">
              {/* Safely access skinTypeScore */}
              {Object.entries(productB.skinTypeScore || {}).map(([type, score]) => (
                <li key={type}><span>{type}</span> <strong>{score}/10</strong></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Compare;
