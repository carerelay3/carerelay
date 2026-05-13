"use client";

import React from 'react';
import {
  type CircleType,
  circleTypes,
  getCircleTypeDescription,
  getCircleTypeLabel,
} from '@/lib/circles/circleTypes';

interface ModeSelectorProps {
  selectedType: CircleType;
  onSelect: (type: CircleType) => void;
}

export function ModeSelector({ selectedType, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {circleTypes.map((mode) => {
        const isSelected = selectedType === mode;
        
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onSelect(mode)}
            className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
              isSelected 
                ? 'border-[var(--sage)] bg-[var(--sage-soft)] shadow-sm' 
                : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--sage)]'
            }`}
          >
            <span className="font-bold" style={{ color: 'var(--text)' }}>{getCircleTypeLabel(mode)}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{getCircleTypeDescription(mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
