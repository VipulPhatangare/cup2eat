import { useState } from 'react';
import { Star } from 'lucide-react';

// read-only stars
export function Stars({ value = 0, size = 18, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? 'fill-gold text-gold' : 'fill-transparent text-choco/25'}
        />
      ))}
    </span>
  );
}

// clickable star picker (keyboard friendly: arrow keys move between the radios)
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
  return (
    <div>
      <div className="inline-flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
            <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <Star
              className={`size-8 transition peer-focus-visible:outline-2 peer-focus-visible:outline-gold ${
                n <= (hover || value) ? 'fill-gold text-gold' : 'fill-transparent text-choco/30'
              }`}
            />
            <span className="sr-only">{n} stars</span>
          </label>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm text-choco/70">{labels[hover || value]}</p>
    </div>
  );
}
