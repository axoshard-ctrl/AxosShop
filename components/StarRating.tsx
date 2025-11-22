import React from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'medium',
  interactive = false,
  onRate,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1;
      const isFilled = starRating <= (hoverRating || rating);
      
      return (
        <span
          key={i}
          className={`star ${size} ${isFilled ? 'filled' : 'empty'}`}
          onMouseEnter={() => interactive && setHoverRating(starRating)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate?.(starRating)}
        >
          ★
        </span>
      );
    });
  };

  return (
    <div className="star-rating">
      {renderStars()}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </div>
  );
};
