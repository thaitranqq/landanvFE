import React from 'react';
import { useAdmin } from '../context/AdminContext';
import '../App.css';

const AdminDashboard = () => {
  const { userTrends, searchStats, riskyProducts, loading } = useAdmin();

  if (loading) {
    return <div>Loading admin data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="greeting">
        <h2>Tổng quan hệ thống</h2>
        <p>Dữ liệu và xu hướng trên toàn bộ nền tảng LADANV.</p>
      </div>

      <div className="admin-widgets-grid">
        {/* User Trends by Skin Type Widget */}
        <div className="card admin-widget">
          <h4><i className="fas fa-users"></i> Người dùng theo loại da</h4>
          <ul className="widget-list">
            {Object.entries(userTrends.bySkinType).map(([type, count]) => (
              <li key={type}><span>{type}</span> <strong>{count}</strong></li>
            ))}
          </ul>
        </div>

        {/* Top Searched Keywords Widget */}
        <div className="card admin-widget">
          <h4><i className="fas fa-search"></i> Từ khóa tìm kiếm hàng đầu</h4>
          <ul className="widget-list">
            {Object.entries(searchStats.keywordSearches).map(([keyword, count]) => (
              <li key={keyword}><span>{keyword}</span> <strong>{count}</strong></li>
            ))}
          </ul>
        </div>

        {/* Popular Products Widget */}
        <div className="card admin-widget full-span">
          <h4><i className="fas fa-fire"></i> Sản phẩm phổ biến nhất</h4>
          <ul className="widget-list">
            {Object.entries(userTrends.popularProducts).map(([name, count]) => (
              <li key={name}><span>{name}</span> <strong>{count} lượt xem</strong></li>
            ))}
          </ul>
        </div>

        {/* Risky Products Widget */}
        <div className="card admin-widget full-span">
          <h4><i className="fas fa-exclamation-triangle"></i> Sản phẩm rủi ro cao</h4>
          {riskyProducts.length > 0 ? (
            <ul className="widget-list">
              {riskyProducts.map(product => (
                <li key={product.id}><span>{product.name}</span> <strong>Điểm rủi ro: {product.riskScore}</strong></li>
              ))}
            </ul>
          ) : (
            <p>Không có sản phẩm nào được báo cáo có rủi ro cao.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
