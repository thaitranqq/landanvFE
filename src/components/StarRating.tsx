import React from 'react';
import '../App.css';

interface StarRatingProps {
  rating: number;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, disabled = false, onRatingChange }) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;

    const handleClick = () => {
      if (!disabled && onRatingChange) {
        onRatingChange(starValue);
      }
    };

    return (
      <span
        key={starValue}
        className={`star ${isFilled ? 'filled' : ''}`}
        onClick={handleClick}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        ★
      </span>
    );
  });

  return <div className={`star-rating ${disabled ? 'disabled' : ''}`}>{stars}</div>;
};

export default StarRating;
