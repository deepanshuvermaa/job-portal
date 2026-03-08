import React from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  onChange,
  readonly = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isFilled = value <= Math.round(rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            disabled={readonly}
            className={`${sizeClasses[size]} ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            } ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
