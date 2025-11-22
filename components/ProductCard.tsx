import React from 'react';
import { StarRating } from './StarRating';
import { StockStatus } from './StockStatus';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold?: number;
  image: string;
  // ...existing props...
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  rating,
  reviewCount,
  stock,
  lowStockThreshold = 5,
  image,
  // ...existing props...
}) => {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      
      <div className="product-info">
        <h3>{name}</h3>
        <p className="price">${price}</p>
        
        {/* Star Ratings & Review Badge */}
        <div className="rating-section">
          <StarRating rating={rating} size="small" interactive={false} />
          <span className="review-count">({reviewCount} reviews)</span>
        </div>
        
        {/* Stock Status */}
        <StockStatus stock={stock} threshold={lowStockThreshold} />
        
        {/* ...existing code... */}
      </div>
    </div>
  );
};