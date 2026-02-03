
import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full h-[60px] bg-white border rounded-[18px] shadow-sm transition-all flex items-center px-6 cursor-pointer
          ${isOpen ? 'border-[#701280]' : 'border-gray-200'} 
          hover:border-[#701280]
        `}
      >
        <div className="flex items-center w-full pointer-events-none select-none">
          <label className="text-[15px] font-normal text-[#707070] whitespace-nowrap mr-2">
            {label}:
          </label>
          <div className="flex-1 overflow-hidden">
            <span className={`text-[15px] font-normal truncate ${value ? 'text-[#000000]' : 'text-[#707070]/30'}`}>
              {value || 'Seleziona...'}
            </span>
          </div>
          <div className={`ml-2 text-[#707070] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L0.803849 0.5L11.1962 0.5L6 8Z" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[18px] shadow-xl py-2 max-h-[250px] overflow-y-auto custom-scrollbar animate-fade-in">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`
                px-6 py-3 text-[15px] font-normal cursor-pointer transition-colors
                ${value === opt ? 'bg-purple-50 text-[#701280] font-medium' : 'text-[#000000] hover:bg-gray-50'}
              `}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
