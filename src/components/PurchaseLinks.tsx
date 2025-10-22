import React from 'react';
import type { PurchaseLink } from '../data/products';
import '../App.css';

interface PurchaseLinksProps {
  links: PurchaseLink[];
}

const PurchaseLinks: React.FC<PurchaseLinksProps> = ({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

  const getRetailerIcon = (retailer: string) => {
    const name = (retailer || '').toLowerCase();
    switch (name) {
      case 'shopee':
        return 'https://img.icons8.com/color/48/shopee.png';
      case 'lazada':
        return 'https://img.icons8.com/color/48/lazada.png';
      case 'tiki':
        return 'https://img.icons8.com/color/48/tiki.png';
      case 'guardian':
        return 'https://img.icons8.com/color/48/walmart.png'; // Placeholder
      default:
        return 'fas fa-store';
    }
  };

  return (
    <div className="purchase-links-section">
      <h4>Mua ngay tại</h4>
      <div className="purchase-links-grid">
        {links.map(link => (
          <a key={link.retailerName || link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-purchase">
            <img src={getRetailerIcon(link.retailerName || '')} alt={link.retailerName || 'Cửa hàng'} />
            <span>Mua trên {link.retailerName || 'Cửa hàng'}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PurchaseLinks;
