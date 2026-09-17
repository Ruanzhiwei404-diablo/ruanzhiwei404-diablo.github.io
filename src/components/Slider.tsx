import { useRef, useCallback, useState, useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  displayValue?: string;
  suffix?: string;
  warning?: boolean;
  description?: string;
}

export default function Slider({
  value, onChange, label, min = 0, max = 1, step = 0.01, color = '#f59e0b', displayValue,
  suffix, warning, description,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pct = ((value - min) / (max - min)) * 100;

  const updateFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + x * (max - min);
    const clamped = Math.round(raw / step) * step;
    onChange(Math.min(max, Math.max(min, clamped)));
  }, [min, max, step, onChange]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    updateFromClientX(e.clientX);
  }, [updateFromClientX]);

  // Attach/remove global listeners
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => updateFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, updateFromClientX]);

  const display = displayValue ?? `${Math.round(value)}`;
  const accent = warning ? '#ef4444' : color;

  return (
    <div className="flex flex-col gap-1 w-full select-none">
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-semibold tracking-wide ${warning ? 'text-red-400' : 'text-zinc-400'}`}>{label}</span>
        <span className="text-[11px] font-mono font-bold text-white tabular-nums">{display}{suffix}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-6 w-full cursor-pointer flex items-center group"
        onMouseDown={onMouseDown}
      >
        {/* Track background */}
        <div className="absolute h-1.5 w-full rounded-full bg-zinc-800" />
        {/* Track fill */}
        <div
          className="absolute h-1.5 rounded-full transition-colors"
          style={{ width: `${pct}%`, background: accent }}
        />
        {/* Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 transition-shadow duration-150"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: accent,
            borderColor: accent,
            boxShadow: dragging
              ? `0 0 12px ${accent}60`
              : `0 0 4px ${accent}30`,
          }}
        />
      </div>
      {description && (
        <span className={`text-[9px] leading-tight ${warning ? 'text-red-400/80' : 'text-zinc-600'}`}>{description}</span>
      )}
    </div>
  );
}
