import { useEffect, useRef, useState, useCallback } from 'react';
import { KEYBOARD_MAP, midiToFreq } from '../audio/types';

interface UseKeyboardOptions {
  onNoteOn: (freq: number, note: number) => void;
  onNoteOff: (note: number) => void;
  baseOctave?: number;
}

export function useKeyboard({ onNoteOn, onNoteOff, baseOctave = 4 }: UseKeyboardOptions) {
  const [octave, setOctave] = useState(baseOctave);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const heldRef = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();

    if (key === 'z') { setOctave(o => Math.max(1, o - 1)); return; }
    if (key === 'x') { setOctave(o => Math.min(7, o + 1)); return; }

    const offset = KEYBOARD_MAP[key];
    if (offset === undefined) return;

    const noteId = `${octave}-${key}`;
    if (heldRef.current.has(noteId)) return;
    heldRef.current.add(noteId);

    const midi = (octave + 1) * 12 + offset;
    onNoteOn(midiToFreq(midi), midi);
    setActiveNotes(prev => new Set(prev).add(key));
  }, [octave, onNoteOn]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const offset = KEYBOARD_MAP[key];
    if (offset === undefined) return;

    const noteId = `${octave}-${key}`;
    heldRef.current.delete(noteId);

    const midi = (octave + 1) * 12 + offset;
    onNoteOff(midi);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [octave, onNoteOff]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { octave, activeNotes };
}
