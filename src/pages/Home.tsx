import React from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductSummaryCard from '../components/ProductSummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FilterSidebar from '../components/FilterSidebar';
import RecommendedProducts from '../components/RecommendedProducts';
import '../App.css';

const Home = () => {
  const { products, loading, error, page, totalPages, goToPage } = useProducts();

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Number of page buttons to display
    let startPage = Math.max(0, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-controls">
        <button 
          onClick={() => goToPage(0)} 
          disabled={page === 0 || loading} 
          className="btn btn-pagination"
        >
          Đầu
        </button>
        <button 
          onClick={() => goToPage(page - 1)} 
          disabled={page === 0 || loading} 
          className="btn btn-pagination"
        >
          Trước
        </button>
        {startPage > 0 && <span className="pagination-ellipsis">...</span>}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => goToPage(number)}
            className={`btn btn-pagination ${number === page ? 'active' : ''}`}
            disabled={loading}
          >
            {number + 1}
          </button>
        ))}
        {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
        <button 
          onClick={() => goToPage(page + 1)} 
          disabled={page === totalPages - 1 || loading} 
          className="btn btn-pagination"
        >
          Sau
        </button>
        <button 
          onClick={() => goToPage(totalPages - 1)} 
          disabled={page === totalPages - 1 || loading} 
          className="btn btn-pagination"
        >
          Cuối
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <FilterSidebar />
      <div className="dashboard-main-content">
        <RecommendedProducts />

        <h3>Tất cả sản phẩm</h3>
        {loading && products.length === 0 && <LoadingSpinner message="Đang tải sản phẩm..." />}
        {error && <div className="card info-card"><p>{error}</p></div>}
        {!loading && products.length === 0 && !error && (
          <div className="card info-card">
            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        )}
        <div className="dashboard-results-grid">
          {products.map(product => (
            <ProductSummaryCard key={product.id} product={product} />
          ))}
        </div>
        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  );
};

export default Home;
