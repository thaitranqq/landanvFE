import React from 'react';
import type { RegulatoryLabel } from '../data/products';
import '../App.css';

interface RegulatoryLabelsDisplayProps {
  labels: RegulatoryLabel[];
}

const RegulatoryLabelsDisplay: React.FC<RegulatoryLabelsDisplayProps> = ({ labels }) => {
  if (!labels || labels.length === 0) {
    return null;
  }

  const getLabelClass = (level: string | undefined) => {
    switch ((level || '').toLowerCase()) {
      case 'high': return 'label-warning';
      case 'medium': return 'label-claim';
      case 'low': return 'label-certification';
      default: return '';
    }
  };

  const getLabelIcon = (level: string | undefined) => {
    switch ((level || '').toLowerCase()) {
      case 'high': return 'fas fa-exclamation-circle';
      case 'medium': return 'fas fa-info-circle';
      case 'low': return 'fas fa-check-circle';
      default: return 'fas fa-tag';
    }
  };

  return (
    <div className="regulatory-labels-section card">
      <h4><i className="fas fa-balance-scale"></i> Chứng nhận & Quy định</h4>
      <div className="labels-grid">
        {labels.map(label => (
          <div key={label.id} className={`regulatory-label ${getLabelClass(label.level)}`} title={label.description}>
            <i className={getLabelIcon(label.level)}></i>
            <span>{label.code || label.region || label.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegulatoryLabelsDisplay;
