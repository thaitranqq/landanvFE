import React from 'react';
import { useProducts } from '../hooks/useProducts';
import '../App.css';

const FilterSidebar = () => {
  const { filters, setFilters, setSearchQuery } = useProducts();

  const handleConcernChange = (concern: string) => {
    const newConcerns = filters.concerns.includes(concern)
      ? filters.concerns.filter(c => c !== concern)
      : [...filters.concerns, concern];
    setFilters({ concerns: newConcerns });
  };

  const handleSkinTypeChange = (skinType: string | null) => {
    setFilters({ skinType });
  };

  const handleResetFilters = () => {
    setFilters({ concerns: [], skinType: null });
    setSearchQuery(''); // Also clear search query when resetting filters
  };

  return (
    <aside className="filter-sidebar card">
      <div className="filter-header">
        <h4><i className="fas fa-filter"></i> Bộ lọc sản phẩm</h4>
        <button onClick={handleResetFilters} className="btn-reset-filters">
          Đặt lại
        </button>
      </div>

      <div className="filter-section">
        <h5>Mối quan tâm</h5>
        <div className="checkbox-group-vertical">
          {['Mụn', 'Lão hóa', 'Thâm nám', 'Lỗ chân lông to', 'Da không đều màu'].map(concern => (
            <label key={concern} className={`checkbox-label-filter ${filters.concerns.includes(concern) ? 'selected' : ''}`}>
              <input 
                type="checkbox" 
                checked={filters.concerns.includes(concern)}
                onChange={() => handleConcernChange(concern)}
              />
              {concern}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h5>Loại da phù hợp</h5>
        <div className="radio-group-vertical">
            <label className={`radio-label-filter ${!filters.skinType ? 'selected' : ''}`}>
                <input type="radio" name="skinType" onChange={() => handleSkinTypeChange(null)} checked={!filters.skinType} />
                Tất cả
            </label>
          {['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE'].map(type => (
            <label key={type} className={`radio-label-filter ${filters.skinType === type ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="skinType" 
                value={type} 
                checked={filters.skinType === type}
                onChange={() => handleSkinTypeChange(type)}
              />
              {type === 'OILY' ? 'Da dầu' : type === 'DRY' ? 'Da khô' : type === 'COMBINATION' ? 'Da hỗn hợp' : type === 'NORMAL' ? 'Da thường' : 'Da nhạy cảm'}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
