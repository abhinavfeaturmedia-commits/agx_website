import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  align?: 'left' | 'right';
}

interface DropdownCoords {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  openUpwards: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<DropdownCoords>({
    left: 0,
    width: 220,
    openUpwards: false
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // If the trigger element has scrolled outside the visible viewport, dismiss dropdown
    if (rect.bottom < -20 || rect.top > window.innerHeight + 20) {
      setIsOpen(false);
      return;
    }

    const dropdownMaxHeight = 270;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

    const dropdownWidth = Math.max(rect.width, 220);
    let left = align === 'right' ? rect.right - dropdownWidth : rect.left;

    // Viewport edge collision guards
    if (left + dropdownWidth > window.innerWidth - 12) {
      left = window.innerWidth - dropdownWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setCoords({
      top: openUpwards ? undefined : rect.bottom + 6,
      bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
      left,
      width: dropdownWidth,
      openUpwards
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={e => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100/90 border ${
          isOpen ? 'border-black bg-white shadow-xs ring-2 ring-black/5' : 'border-gray-200'
        } text-xs font-semibold text-gray-900 flex items-center justify-between gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder || 'Select option'}</span>
          {selectedOption?.badge && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${
                selectedOption.badgeColor || 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-black' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu mounted via Portal directly into document.body */}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{
                  opacity: 0,
                  y: coords.openUpwards ? 8 : -8,
                  scale: 0.98
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: coords.openUpwards ? 8 : -8,
                  scale: 0.98
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: coords.top !== undefined ? `${coords.top}px` : undefined,
                  bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  zIndex: 99999
                }}
                className={`bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] p-1.5 max-h-64 overflow-y-auto space-y-0.5 select-none ${dropdownClassName}`}
                onClick={e => e.stopPropagation()}
              >
                {normalizedOptions.map(opt => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white font-bold shadow-xs'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                          <span className="truncate">{opt.label}</span>
                          {opt.badge && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${
                                isSelected
                                  ? 'bg-white/20 text-white border-white/30'
                                  : opt.badgeColor || 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <span
                            className={`text-[10px] font-normal truncate mt-0.5 ${
                              isSelected ? 'text-gray-300' : 'text-gray-400'
                            }`}
                          >
                            {opt.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-[#CCFF00] shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
