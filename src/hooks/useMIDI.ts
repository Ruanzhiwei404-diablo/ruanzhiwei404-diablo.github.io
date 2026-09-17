import { useEffect, useRef, useState, useCallback } from 'react';
import { midiToFreq } from '../audio/types';

interface UseMIDIOptions {
  onNoteOn: (freq: number, note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
}

export function useMIDI({ onNoteOn, onNoteOff }: UseMIDIOptions) {
  const [midiReady, setMidiReady] = useState(false);
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const accessRef = useRef<MIDIAccess | null>(null);
  const cbRef = useRef({ onNoteOn, onNoteOff });
  cbRef.current = { onNoteOn, onNoteOff };

  const handleMessage = useCallback((e: MIDIMessageEvent) => {
    if (!e.data) return;
    const [status, note, velocity] = e.data;
    const command = status & 0xf0;
    const channel = status & 0x0f;

    if (command === 0x90 && velocity > 0) {
      setActiveChannel(channel);
      cbRef.current.onNoteOn(midiToFreq(note), note, velocity / 127);
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      cbRef.current.onNoteOff(note);
    }
  }, []);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    let cancelled = false;
    navigator.requestMIDIAccess({ sysex: false }).then((access) => {
      if (cancelled) return;
      accessRef.current = access;
      setMidiReady(true);

      const inputs = Array.from(access.inputs.values());
      setMidiDevices(inputs.map(i => i.name ?? ''));
      inputs.forEach(input => {
        input.onmidimessage = handleMessage;
      });

      access.onstatechange = () => {
        const freshInputs = Array.from(access.inputs.values());
        setMidiDevices(freshInputs.map(i => i.name ?? ''));
        freshInputs.forEach(input => {
          input.onmidimessage = handleMessage;
        });
      };
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (accessRef.current) {
        accessRef.current.onstatechange = null;
        Array.from(accessRef.current.inputs.values()).forEach(i => {
          i.onmidimessage = null;
        });
      }
    };
  }, [handleMessage]);

  return { midiReady, midiDevices, activeChannel };
}
