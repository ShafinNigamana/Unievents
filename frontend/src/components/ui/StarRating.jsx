import { useState } from "react";
import { Star } from "lucide-react";

/**
 * StarRating Component
 * 
 * @param {number} rating - Current rating value
 * @param {number} totalStars - Number of stars to show (default 5)
 * @param {boolean} readonly - If true, star selection is disabled
 * @param {function} onChange - Callback for rating change (receives new value)
 * @param {number} size - Icon size (default 20)
 * @param {string} className - Optional container styles
 */
export default function StarRating({
  rating = 0,
  totalStars = 5,
  readonly = true,
  onChange,
  size = 20,
  className = "",
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            className={`transition-all ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
            } ${isFilled ? "text-amber-400" : "text-slate-600"}`}
            onClick={() => !readonly && onChange && onChange(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          >
            <Star
              size={size}
              fill={isFilled ? "currentColor" : "transparent"}
              className={`${isFilled ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
