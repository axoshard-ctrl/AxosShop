import React from 'react';
import './StockStatus.css';

interface StockStatusProps {
  stock: number;
  threshold?: number;
  showCountdown?: boolean;
}

export const StockStatus: React.FC<StockStatusProps> = ({
  stock,
  threshold = 5,
  showCountdown = true,
}) => {
  const getStatusClass = () => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= threshold) return 'low-stock';
    return 'in-stock';
  };

  const getStatusText = () => {
    if (stock === 0) return 'Out of stock';
    if (stock <= threshold && showCountdown) return `Only ${stock} left!`;
    if (stock <= threshold) return 'Low stock';
    return 'In stock';
  };

  return (
    <div className={`stock-status ${getStatusClass()}`}>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};
