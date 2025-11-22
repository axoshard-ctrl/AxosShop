import React from 'react';
import { StarRating } from './StarRating';

interface ReviewPhoto {
  url: string;
  alt: string;
}

interface ProductReviewProps {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  photos?: ReviewPhoto[];
  date: Date;
  helpful?: number;
}

export const ProductReview: React.FC<ProductReviewProps> = ({
  id,
  author,
  rating,
  title,
  content,
  photos = [],
  date,
  helpful = 0,
}) => {
  return (
    <div className="product-review">
      <div className="review-header">
        <div className="reviewer-info">
          <strong>{author}</strong>
          <span className="review-date">
            {date.toLocaleDateString()}
          </span>
        </div>
        <StarRating rating={rating} size="small" interactive={false} />
      </div>

      <h4 className="review-title">{title}</h4>
      <p className="review-content">{content}</p>

      {/* User-generated photos */}
      {photos.length > 0 && (
        <div className="review-photos">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo.url}
              alt={photo.alt}
              className="review-photo"
            />
          ))}
        </div>
      )}

      <div className="review-actions">
        <button className="helpful-btn">👍 Helpful ({helpful})</button>
      </div>
    </div>
  );
};
