import { useRef, useCallback, useEffect, useState } from 'react';

interface KnobProps {
  value: number;       // 0-1
  onChange: (v: number) => void;
  label: string;
  sublabel?: string;
  size?: number;       // default 60
  color?: string;      // default '#f59e0b'
  min?: number;
  max?: number;
  step?: number;
  displayValue?: string; // custom display
}

export default function Knob({
  value, onChange, label, sublabel, size = 60, color = '#f59e0b',
  min = 0, max = 1, step = 0.01, displayValue,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const angle = -135 + value * 270; // -135° to +135°

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
  }, [value]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dy = startY.current - e.clientY;
      const sensitivity = 0.005;
      const newVal = Math.min(max, Math.max(min, startValue.current + dy * sensitivity));
      onChange(Math.round(newVal / step) * step);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, min, max, step, onChange]);

  // Wheel support
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    const newVal = Math.min(max, Math.max(min, value + delta));
    onChange(Math.round(newVal / step) * step);
  }, [value, min, max, step, onChange]);

  const pct = Math.round(value * 100);
  const display = displayValue ?? `${pct}%`;

  return (
    <div
      className="flex flex-col items-center gap-1.5 select-none cursor-pointer"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      {/* Knob body */}
      <div
        ref={knobRef}
        className="relative rounded-full flex items-center justify-center transition-shadow duration-150"
        style={{
          width: size, height: size,
          background: 'radial-gradient(circle at 40% 35%, #27272a, #18181b 80%)',
          border: '2px solid #27272a',
          boxShadow: dragging
            ? `0 0 16px ${color}40, inset 0 2px 4px #00000040`
            : `0 4px 8px #00000040, inset 0 2px 4px #00000020`,
        }}
      >
        {/* Indicator line */}
        <div
          className="absolute origin-bottom"
          style={{
            width: 2.5, height: size * 0.32,
            bottom: '50%', left: '50%',
            marginLeft: -1.25,
            borderRadius: 2,
            background: color,
            transform: `rotate(${angle}deg)`,
            transition: dragging ? 'none' : 'transform 0.12s ease-out',
          }}
        />
        {/* Center dot */}
        <div
          className="rounded-full"
          style={{ width: 6, height: 6, background: color, opacity: 0.6 }}
        />
        {/* Arc indicator */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(135deg)' }}
        >
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#27272a"
            strokeWidth="3"
            strokeDasharray={`${value * 197.9} 197.9`}
            strokeLinecap="round"
            style={{ stroke: color, opacity: 0.5, transition: dragging ? 'none' : 'stroke-dasharray 0.12s ease-out' }}
          />
        </svg>
      </div>

      {/* Label */}
      <span className="text-[10px] font-semibold text-zinc-400 tracking-wide text-center leading-tight">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] text-zinc-600 font-mono">{sublabel}</span>
      )}
      {/* Value */}
      <span className="text-[11px] font-mono font-bold text-white tabular-nums">
        {display}
      </span>
    </div>
  );
}
