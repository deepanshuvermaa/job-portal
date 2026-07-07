import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface City {
  city: string;
  state: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search city...',
  className,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [cities, setCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchCities = useCallback(async (query: string) => {
    if (query.length < 1) {
      setCities([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/cities?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const results: City[] = (data.cities || data || []).slice(0, 10);
        setCities(results);
        setIsOpen(results.length > 0 || query.length > 0);
        setActiveIndex(-1);
      }
    } catch {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCities(val);
    }, 300);
  };

  const handleSelect = (city: City) => {
    const display = `${city.city}, ${city.state}`;
    setInputValue(display);
    onChange(city.city);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < cities.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : cities.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < cities.length) {
        handleSelect(cities[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (cities.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            'input-field pl-10',
            className
          )}
          autoComplete="off"
        />
      </div>

      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading && (
            <li className="px-4 py-3 text-sm text-gray-500">Searching...</li>
          )}
          {!loading && cities.length === 0 && inputValue.length > 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">No cities found</li>
          )}
          {!loading &&
            cities.map((city, index) => (
              <li
                key={`${city.city}-${city.state}-${index}`}
                onClick={() => handleSelect(city)}
                className={cn(
                  'px-4 py-3 text-sm cursor-pointer flex items-center gap-2 transition-colors',
                  index === activeIndex
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{city.city}</span>
                <span className="text-gray-400">{city.state}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutocomplete;
