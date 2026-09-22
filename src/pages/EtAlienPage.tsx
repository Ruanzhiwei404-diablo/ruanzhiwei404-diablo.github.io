import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EtAlienEngine, DEFAULT_ET_ALIEN_PARAMS } from '../audio/etAlienEngine';
import type { EtAlienParams } from '../audio/etAlienEngine';
import {
  EMOTION_CONFIG,
  ET_PRESETS,
  ET_KEYS,
  ET_NOTE_FREQUENCIES,
  RANDOM_PRESET_KEYS,
  getCharFrequency,
  segmentText,
} from '../audio/etAlienData';
import type { EtPreset, EmotionKey, TextSegment } from '../audio/etAlienData';
import Slider from '../components/Slider';
import { useRecorder } from '../hooks/useRecorder';

// because 主题配色：紫粉主渐变 + 青色点缀
const PRIMARY = '#a855f7';
const ACCENT = PRIMARY;
const ACCENT2 = '#ec4899';
const CYAN = '#22d3ee';

type HistoryEntry = { time: string; text: string };

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function envLabel(v: number): string {
  if (v <= 100) return 'Short';
  if (v <= 1000) return 'Medium';
  return 'Long';
}

// === 小组件 ===

/** ET 外星人 Logo：紫粉渐变圆角方块 + 深空剪影 + 青色发光眼睛与天线 */
function AlienLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="et-alien-logo-bg" x1="4" y1="10" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="0.55" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="et-alien-logo-eye" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>
      {/* 天线（伸出方块顶部） */}
      <path d="M32 12 L32 6.5" stroke={CYAN} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="5" r="4.5" fill={CYAN} opacity="0.25" />
      <circle cx="32" cy="5" r="2.4" fill={CYAN} />
      {/* 渐变底板 */}
      <rect x="3" y="9" width="58" height="53" rx="16" fill="url(#et-alien-logo-bg)" />
      {/* 外星人头部剪影 */}
      <path
        d="M32 15.5 C22.5 15.5 16.2 22.8 16.8 31.2 C17.4 39.6 24.6 49.4 32 51.5 C39.4 49.4 46.6 39.6 47.2 31.2 C47.8 22.8 41.5 15.5 32 15.5 Z"
        fill="#0d0d20"
      />
      {/* 发光大眼睛 */}
      <path d="M21.5 30.8 Q26.5 25.2 30.2 30.4 Q26.8 35.6 21.5 30.8 Z" fill="url(#et-alien-logo-eye)" />
      <path d="M42.5 30.8 Q37.5 25.2 33.8 30.4 Q37.2 35.6 42.5 30.8 Z" fill="url(#et-alien-logo-eye)" />
    </svg>
  );
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(168,85,247,0.22)] bg-[#0d0d20]/80 backdrop-blur-[10px] p-5 ${className}`}
      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-2 mb-4 text-[11px] font-mono uppercase tracking-[2px]" style={{ color: CYAN }}>
        <span className="text-[9px]" style={{ color: PRIMARY }}>◆</span>
        {title}
      </div>
      {children}
    </div>
  );
}

type BtnVariant = 'default' | 'warning' | 'danger';

const BTN_STYLE: Record<BtnVariant, { border: string; color: string; bg: string }> = {
  default: { border: PRIMARY, color: '#c4b5fd', bg: 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(236,72,153,0.22))' },
  warning: { border: '#ffa502', color: '#ffa502', bg: 'linear-gradient(135deg, rgba(255,165,2,0.2), rgba(255,165,2,0.1))' },
  danger: { border: '#ff4757', color: '#ff4757', bg: 'linear-gradient(135deg, rgba(255,71,87,0.2), rgba(255,71,87,0.1))' },
};

function Btn({
  children, onClick, variant = 'default', disabled, className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  className?: string;
}) {
  const s = BTN_STYLE[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[1px] transition-all duration-200 border hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none ${className}`}
      style={{
        borderColor: s.border,
        color: s.color,
        background: s.bg,
        boxShadow: `0 0 0 rgba(0,0,0,0)`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 18px ${s.border}55`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </button>
  );
}

function EmotionTag({ emotion, scale = false }: { emotion: EmotionKey; scale?: boolean }) {
  const c = EMOTION_CONFIG[emotion];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all duration-300"
      style={{
        background: `${c.color}33`,
        color: c.color,
        border: `1px solid ${c.color}66`,
        transform: scale ? 'scale(1.05)' : undefined,
        boxShadow: scale ? `0 0 10px ${c.color}` : undefined,
      }}
    >
      <span>{c.icon}</span>
      {c.name}
    </span>
  );
}

// === 主页面 ===

export default function EtAlienPage() {
  const engineRef = useRef<EtAlienEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const paramsRef = useRef<EtAlienParams>({ ...DEFAULT_ET_ALIEN_PARAMS });
  const tokenRef = useRef(0);
  const playingRef = useRef(false);
  const recordSecRef = useRef(0);
  const recordTimerRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [params, setParams] = useState<EtAlienParams>({ ...DEFAULT_ET_ALIEN_PARAMS });
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), text: '系统就绪...' },
  ]);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // 文案转语音
  const [text, setText] = useState('');
  const [playSpeed, setPlaySpeed] = useState(300);
  const [emotionEnabled, setEmotionEnabled] = useState(false);
  const [isPlayingText, setIsPlayingText] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeChar, setActiveChar] = useState(-1);
  const [activeSeg, setActiveSeg] = useState(-1);

  // 引擎实例
  useEffect(() => {
    const engine = new EtAlienEngine();
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const addHistory = useCallback((entry: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setHistory(prev => [{ time, text: entry }, ...prev].slice(0, 20));
  }, []);

  const ensureStarted = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return false;
    if (!engine.isRunning()) await engine.init();
    setStarted(true);
    return true;
  }, []);

  const startAudio = useCallback(async () => {
    await ensureStarted();
    addHistory('音频引擎已启动');
  }, [ensureStarted, addHistory]);

  // --- 参数 ---
  const updateParam = useCallback(<K extends keyof EtAlienParams>(key: K, value: EtAlienParams[K]) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setParams({ [key]: value } as Partial<EtAlienParams>);
    paramsRef.current = { ...paramsRef.current, [key]: value };
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- 发声 ---
  const playTone = useCallback(async () => {
    if (!(await ensureStarted())) return;
    engineRef.current?.playSound();
    addHistory(`播放测试音: ${paramsRef.current.baseFreq}Hz`);
  }, [ensureStarted, addHistory]);

  const playPreset = useCallback(async (preset: EtPreset) => {
    if (!(await ensureStarted())) return;
    const engine = engineRef.current;
    if (!engine) return;
    engine.setParams({ harmonics: preset.harmonics, vibrato: preset.vibrato });
    paramsRef.current = { ...paramsRef.current, harmonics: preset.harmonics, vibrato: preset.vibrato };
    setParams(prev => ({ ...prev, harmonics: preset.harmonics, vibrato: preset.vibrato }));

    let delay = 0;
    preset.pattern.forEach(mult => {
      setTimeout(() => engine.playSound(preset.freq * mult, 0.4), delay);
      delay += 400;
    });
    addHistory(`播放预设: ${preset.label}`);
  }, [ensureStarted, addHistory]);

  const playRandomPhrase = useCallback(async () => {
    const key = RANDOM_PRESET_KEYS[Math.floor(Math.random() * RANDOM_PRESET_KEYS.length)];
    const preset = ET_PRESETS.find(p => p.key === key);
    if (preset) await playPreset(preset);
    addHistory('生成随机短语');
  }, [playPreset, addHistory]);

  const pressKey = useCallback(async (freq: number, key: string) => {
    if (!(await ensureStarted())) return;
    engineRef.current?.playSound(freq, 0.3);
    setPressedKey(key);
  }, [ensureStarted]);

  const releaseKey = useCallback(() => {
    engineRef.current?.stopAll();
    setPressedKey(null);
  }, []);

  // --- 录制 ---
  const getStream = useCallback(() => engineRef.current?.getRecordStream() ?? null, []);
  const recorder = useRecorder(getStream);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current !== null) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    recordSecRef.current = 0;
    setRecordSeconds(0);
    recorder.stop();
  }, [recorder]);

  const startRecording = useCallback(async () => {
    if (!(await ensureStarted())) return;
    recorder.start();
    recordSecRef.current = 0;
    setRecordSeconds(0);
    addHistory('开始录制...');
    if (recordTimerRef.current !== null) clearInterval(recordTimerRef.current);
    recordTimerRef.current = window.setInterval(() => {
      recordSecRef.current += 1;
      setRecordSeconds(recordSecRef.current);
      if (recordSecRef.current >= 30) stopRecording(); // 最长 30 秒
    }, 1000);
  }, [ensureStarted, recorder, addHistory, stopRecording]);

  // 录完自动下载（与原作一致）
  useEffect(() => {
    if (recorder.audioUrl) {
      recorder.download();
      addHistory('录音已保存');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.audioUrl]);

  // --- 文案转语音 ---
  const chars = useMemo(() => text.split(''), [text]);
  const segments = useMemo<TextSegment[]>(
    () => (emotionEnabled && text.trim() ? segmentText(text) : []),
    [text, emotionEnabled],
  );
  const estDuration = ((chars.length * playSpeed) / 1000).toFixed(1);

  const dominant = useMemo<{ emotion: EmotionKey; count: number } | null>(() => {
    if (segments.length === 0) return null;
    const counts: Partial<Record<EmotionKey, number>> = {};
    segments.forEach(s => { counts[s.emotion] = (counts[s.emotion] ?? 0) + 1; });
    let best: EmotionKey = 'neutral';
    let max = 0;
    (Object.entries(counts) as [EmotionKey, number][]).forEach(([k, v]) => {
      if (v > max) { max = v; best = k; }
    });
    return { emotion: best, count: max };
  }, [segments]);

  const stopTextPlayback = useCallback(() => {
    tokenRef.current += 1;
    playingRef.current = false;
    setIsPlayingText(false);
    setProgress(0);
    setActiveChar(-1);
    setActiveSeg(-1);
    engineRef.current?.stopAll();
  }, []);

  const playText = useCallback(async () => {
    const t = text.trim();
    if (!t) return;
    if (playingRef.current) { stopTextPlayback(); return; }
    const engine = engineRef.current;
    if (!(await ensureStarted()) || !engine) return;

    const token = ++tokenRef.current;
    playingRef.current = true;
    setIsPlayingText(true);
    setProgress(0);

    const segs: TextSegment[] = emotionEnabled
      ? segmentText(t)
      : [{ text: t, emotion: 'neutral', config: EMOTION_CONFIG.neutral, charCount: t.length }];

    const original = { ...paramsRef.current };
    addHistory(`开始播放文案: "${t.substring(0, 20)}${t.length > 20 ? '...' : ''}"${emotionEnabled ? ' (情感匹配开启)' : ''}`);

    let globalIndex = 0;
    for (let si = 0; si < segs.length; si++) {
      if (tokenRef.current !== token) break;
      const seg = segs[si];

      if (emotionEnabled) {
        engine.setParams(seg.config.params);
        paramsRef.current = { ...paramsRef.current, ...seg.config.params };
        setParams(prev => ({ ...prev, ...seg.config.params }));
        setActiveSeg(si);
        addHistory(`段落 ${si + 1}: ${seg.config.name} - "${seg.text.substring(0, 15)}${seg.text.length > 15 ? '...' : ''}"`);
      }

      const segChars = seg.text.split('');
      for (let ci = 0; ci < segChars.length; ci++) {
        if (tokenRef.current !== token) break;
        const ch = segChars[ci];
        const baseFreq = emotionEnabled ? seg.config.params.baseFreq : paramsRef.current.baseFreq;
        const freq = getCharFrequency(ch, baseFreq);

        setProgress(((globalIndex + 1) / t.length) * 100);
        setActiveChar(globalIndex);

        if (freq > 0) {
          engine.playSound(freq, (playSpeed / 1000) * 0.6, false);
          await sleep(playSpeed);
        } else {
          await sleep(playSpeed * 1.5); // 标点停顿
        }
        globalIndex++;
      }

      if (emotionEnabled && si < segs.length - 1) await sleep(300);
    }

    if (tokenRef.current === token) {
      engine.setParams(original);
      paramsRef.current = original;
      setParams(original);
      addHistory('文案播放结束');
    }
    stopTextPlayback();
  }, [text, emotionEnabled, playSpeed, ensureStarted, stopTextPlayback, addHistory]);

  // --- 键盘快捷键 ---
  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      const tag = (el as HTMLElement | null)?.tagName ?? '';
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isTyping(e.target)) return;
      const key = e.key.toLowerCase();

      if (ET_NOTE_FREQUENCIES[key] !== undefined) {
        void pressKey(ET_NOTE_FREQUENCIES[key], key);
      } else if (key === ' ') {
        e.preventDefault();
        void playTone();
      } else if (key === 'r') {
        if (recorder.isRecording) stopRecording();
        else void startRecording();
      } else if (key >= '1' && key <= '8') {
        const idx = parseInt(key, 10) - 1;
        if (ET_PRESETS[idx]) void playPreset(ET_PRESETS[idx]);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (ET_NOTE_FREQUENCIES[key] !== undefined) releaseKey();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [pressKey, releaseKey, playTone, playPreset, recorder.isRecording, startRecording, stopRecording]);

  // 组件卸载时清理定时器
  useEffect(() => () => {
    if (recordTimerRef.current !== null) clearInterval(recordTimerRef.current);
  }, []);

  // --- 波形可视化 + 频谱条 ---
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const analyser = engineRef.current?.getAnalyser();
    if (!canvas || !analyser) return;
    const c2d = canvas.getContext('2d');
    if (!c2d) return;

    const timeData = new Uint8Array(analyser.frequencyBinCount);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      analyser.getByteTimeDomainData(timeData);
      c2d.fillStyle = 'rgba(3, 3, 17, 0.3)';
      c2d.fillRect(0, 0, w, h);
      c2d.lineWidth = 2;
      const strokeGrad = c2d.createLinearGradient(0, 0, w, 0);
      strokeGrad.addColorStop(0, '#a855f7');
      strokeGrad.addColorStop(0.5, '#ec4899');
      strokeGrad.addColorStop(1, '#22d3ee');
      c2d.strokeStyle = strokeGrad;
      c2d.beginPath();
      const sliceWidth = w / timeData.length;
      let x = 0;
      for (let i = 0; i < timeData.length; i++) {
        const y = (timeData[i] / 128.0) * (h / 2);
        if (i === 0) c2d.moveTo(x, y); else c2d.lineTo(x, y);
        x += sliceWidth;
      }
      c2d.lineTo(w, h / 2);
      c2d.stroke();

      const grad = c2d.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.1)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0.3)');
      c2d.fillStyle = grad;
      c2d.fill();

      // 频谱条
      analyser.getByteFrequencyData(freqData);
      const bars = barsRef.current;
      const step = Math.max(1, Math.floor(freqData.length / bars.length));
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        if (!bar) continue;
        bar.style.height = `${Math.max(5, (freqData[i * step] / 255) * 70)}px`;
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [started]);

  return (
    <div className="relative w-full">
      <style>{`
        @keyframes etBgMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-6%, 4%) scale(1.15); }
        }
        @keyframes etBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>

      {/* 背景氛围层 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -inset-1/4"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.12), transparent 45%),' +
              'radial-gradient(circle at 80% 60%, rgba(236,72,153,0.10), transparent 45%),' +
              'radial-gradient(circle at 55% 85%, rgba(34,211,238,0.06), transparent 40%)',
            animation: 'etBgMove 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-5 py-7">
        {/* 头部 */}
        <header className="text-center pb-6 mb-6 border-b border-[rgba(168,85,247,0.25)]">
          <div className="flex items-center justify-center gap-4">
            <AlienLogo size={56} />
            <div className="text-left">
              <h1
                className="text-[26px] md:text-[32px] font-extrabold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 55%, #f97316 110%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                外星语言声音模拟器
              </h1>
              <p className="mt-1 text-[11px] font-mono tracking-[3px]" style={{ color: CYAN }}>
                ALIEN LANGUAGE SYNTHESIZER v1.0
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ===== 左：声音合成器 ===== */}
          <Panel title="声音合成器">
            <div className="flex items-center gap-2 mb-4 text-[11px]">
              <span
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: started ? ACCENT : '#374151',
                  boxShadow: started ? `0 0 8px ${ACCENT}` : 'none',
                }}
              />
              <span className={started ? 'text-[#9ca3af]' : 'text-gray-600'}>
                {started ? '引擎运行中' : '引擎未启动'}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <Slider
                label="主频率 (Base Freq)"
                value={params.baseFreq}
                min={50} max={800} step={1}
                color={ACCENT} suffix=" Hz"
                displayValue={String(params.baseFreq)}
                onChange={v => updateParam('baseFreq', v)}
              />
              <Slider
                label="谐波数量 (Harmonics)"
                value={params.harmonics}
                min={1} max={5} step={1}
                color={ACCENT} suffix=" 路"
                displayValue={String(params.harmonics)}
                onChange={v => updateParam('harmonics', v)}
              />
              <Slider
                label="共鸣度 (Resonance)"
                value={Math.round(params.resonance * 100)}
                min={0} max={100} step={1}
                color={ACCENT} suffix="%"
                displayValue={String(Math.round(params.resonance * 100))}
                onChange={v => updateParam('resonance', v / 100)}
              />
              <Slider
                label="颤音速率 (Vibrato)"
                value={params.vibrato}
                min={0} max={20} step={1}
                color={ACCENT} suffix=" Hz"
                displayValue={String(params.vibrato)}
                onChange={v => updateParam('vibrato', v)}
              />
              <Slider
                label="包络 (Envelope)"
                value={params.envelope}
                min={10} max={2000} step={10}
                color={ACCENT} suffix=" ms"
                displayValue={`${envLabel(params.envelope)} · ${params.envelope}`}
                onChange={v => updateParam('envelope', v)}
              />
            </div>

            <div className="mt-5 flex items-end justify-between gap-[3px] h-[72px] px-1 rounded-lg bg-black/30 border border-[rgba(168,85,247,0.14)]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  ref={el => { barsRef.current[i] = el; }}
                  className="flex-1 rounded-sm transition-[height] duration-75"
                  style={{
                    height: 5,
                    background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT2})`,
                    boxShadow: `0 0 6px ${ACCENT}55`,
                  }}
                />
              ))}
            </div>
          </Panel>

          {/* ===== 中：可视化 + 演奏 ===== */}
          <Panel title="波形可视化">
            <div className="relative h-[200px] rounded-xl bg-black/50 border border-[rgba(168,85,247,0.16)] overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 text-[10px] font-mono" style={{ color: ACCENT }}>
                Osc: {params.harmonics} | Freq: {params.baseFreq}Hz | Res: {Math.round(params.resonance * 100)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Btn onClick={() => void playTone()}>▶ 播放测试音</Btn>
              <Btn variant="warning" onClick={() => void playRandomPhrase()}>🎲 随机短语</Btn>
              {!recorder.isRecording ? (
                <Btn onClick={() => void startRecording()}>⏺ 录制</Btn>
              ) : (
                <Btn variant="danger" onClick={stopRecording}>⏹ 停止</Btn>
              )}
            </div>

            {recorder.isRecording && (
              <div className="flex items-center gap-2 mt-3 text-[12px]" style={{ color: '#ff4757' }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#ff4757', animation: 'etBlink 1s infinite' }}
                />
                录制中... {recordSeconds}s / 30s
              </div>
            )}

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-[2px]" style={{ color: ACCENT }}>
                <span className="text-[9px]">◆</span>
                实时演奏 (键盘快捷键)
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ET_KEYS.map(k => {
                  const active = pressedKey === k.key;
                  return (
                    <button
                      key={k.key}
                      onMouseDown={() => void pressKey(k.freq, k.key)}
                      onMouseUp={releaseKey}
                      onMouseLeave={() => { if (pressedKey === k.key) releaseKey(); }}
                      className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer"
                      style={{
                        borderColor: active ? ACCENT : 'rgba(168,85,247,0.3)',
                        background: active
                          ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`
                          : 'rgba(168,85,247,0.07)',
                        color: active ? '#ffffff' : '#e2e8f0',
                        boxShadow: active ? `0 0 14px ${ACCENT}66` : 'none',
                        transform: active ? 'translateY(1px)' : undefined,
                      }}
                    >
                      <span className="text-[11px] font-semibold">{k.note}</span>
                      <span className="text-[10px] font-mono opacity-70">{k.key.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* ===== 右：预设 + 文案转语音 ===== */}
          <Panel title="预设短语">
            <div className="grid grid-cols-4 gap-2">
              {ET_PRESETS.map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => void playPreset(p)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.07)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  style={{ boxShadow: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 14px ${ACCENT}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  title={`快捷键 ${i + 1}`}
                >
                  <span className="text-lg leading-none">{p.icon}</span>
                  <span className="text-[11px] text-[#9ca3af]">{p.label}</span>
                </button>
              ))}
            </div>

            {/* 历史记录 */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase tracking-[2px]" style={{ color: ACCENT }}>
                <span className="text-[9px]">◆</span>
                历史记录
              </div>
              <div className="max-h-[150px] overflow-y-auto text-[12px] text-[#9ca3af] rounded-lg bg-black/25 border border-[rgba(168,85,247,0.1)] p-2">
                {history.map((h, i) => (
                  <div key={`${h.time}-${i}`} className="px-1.5 py-1 border-b border-[rgba(168,85,247,0.1)] last:border-0">
                    <span className="text-[10px] font-mono mr-1.5" style={{ color: ACCENT }}>[{h.time}]</span>
                    {h.text}
                  </div>
                ))}
              </div>
            </div>

            {/* 文案转语音 */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-[2px]" style={{ color: ACCENT }}>
                <span className="text-[9px]">◆</span>
                📝 文案转语音
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="输入中文或英文，每个字符会映射到独特的音高组合...&#10;例如：你好世界 / Hello World"
                className="w-full h-24 rounded-xl bg-[#1a1a30] border border-[rgba(168,85,247,0.3)] p-3 text-[13px] text-[#e2e8f0] placeholder:text-[#6b7280] outline-none resize-none focus:border-[#a855f7] transition-colors"
              />

              <div className="flex justify-between text-[11px] text-[#9ca3af] mt-2">
                <span>字符数: <span style={{ color: ACCENT }}>{chars.length}</span></span>
                <span>预计时长: <span style={{ color: ACCENT }}>{estDuration}</span>s</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {!isPlayingText ? (
                  <Btn onClick={() => void playText()} disabled={!text.trim()}>▶ 播放文案</Btn>
                ) : (
                  <Btn variant="danger" onClick={stopTextPlayback}>⏹ 停止</Btn>
                )}
                <div className="flex items-center gap-2 ml-auto text-[11px] text-[#9ca3af]">
                  <span>速度:</span>
                  <input
                    type="range"
                    min={100} max={1000} step={10}
                    value={playSpeed}
                    onChange={e => setPlaySpeed(parseInt(e.target.value, 10))}
                    className="w-24 accent-[#a855f7]"
                  />
                  <span className="font-mono" style={{ color: ACCENT }}>{playSpeed}ms</span>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-3 text-[12px] text-[#9ca3af] cursor-pointer">
                <input
                  type="checkbox"
                  checked={emotionEnabled}
                  onChange={e => setEmotionEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#a855f7]"
                />
                启用情感匹配
                {dominant && (
                  <span className="ml-1">
                    <EmotionTag emotion={dominant.emotion} />
                    {segments.length > 1 && <span className="ml-1 text-[11px]">({segments.length}段)</span>}
                  </span>
                )}
              </label>

              <div className="mt-3 h-1.5 rounded-full bg-[rgba(168,85,247,0.14)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-100"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
                  }}
                />
              </div>

              {/* 情感分段 */}
              {emotionEnabled && segments.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] text-[#9ca3af] mb-1.5">情感分段:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {segments.map((s, i) => (
                      <div
                        key={i}
                        className="inline-block px-3 py-1.5 rounded-md text-[12px] transition-all duration-300"
                        style={{
                          background: activeSeg === i
                            ? `linear-gradient(135deg, ${ACCENT}4d, ${ACCENT2}4d)`
                            : 'rgba(168,85,247,0.1)',
                          border: `1px solid ${activeSeg === i ? ACCENT : 'rgba(168,85,247,0.22)'}`,
                          transform: activeSeg === i ? 'scale(1.02)' : undefined,
                        }}
                      >
                        <span className="mr-1.5">
                          <EmotionTag emotion={s.emotion} scale={activeSeg === i} />
                        </span>
                        <span className="text-[#e2e8f0]">
                          {s.text.substring(0, 15)}{s.text.length > 15 ? '...' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 音素映射 */}
              <div className="mt-3 flex flex-wrap gap-1 max-h-[170px] overflow-y-auto">
                {chars.length === 0 ? (
                  <span className="text-[11px] text-[#6b7280]">输入文字后显示音素映射...</span>
                ) : (
                  chars.map((ch, i) => {
                    // 静态映射不带情感偏移（情感缩放只在播放时逐字生效）
                    const freq = getCharFrequency(ch);
                    const isPause = freq === 0;
                    const active = activeChar === i;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center min-w-[34px] px-1.5 py-1 rounded-md border transition-all duration-150"
                        style={{
                          opacity: isPause ? 0.4 : 1,
                          borderColor: active ? ACCENT : 'rgba(168,85,247,0.16)',
                          background: active ? `${ACCENT}26` : 'rgba(168,85,247,0.05)',
                          boxShadow: active ? `0 0 10px ${ACCENT}66` : 'none',
                        }}
                      >
                        <span className="text-[13px] text-[#e2e8f0]">{ch === ' ' ? '␣' : ch}</span>
                        <span
                          className="text-[9px] font-mono"
                          style={{ color: active ? ACCENT : '#6b7280' }}
                        >
                          {isPause ? '—' : `${freq}Hz`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Panel>
        </div>

        {/* ===== 底部信息 ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="rounded-2xl border border-[rgba(168,85,247,0.16)] bg-[#0d0d20]/60 p-5">
            <h3 className="text-[14px] font-bold mb-2" style={{ color: ACCENT }}>🎵 设计理念</h3>
            <p className="text-[12px] leading-relaxed text-[#9ca3af]">
              <strong className="text-[#e2e8f0]">灵感来源：</strong>
              基于安迪·威尔《挽救计划》中洛基的多声调语言设计。硅基生物通过体内多个气囊同时振动产生和弦，音高变化表达情感，节奏密度传递紧急程度。
            </p>
            <p className="text-[12px] text-[#9ca3af] mt-2"><strong className="text-[#e2e8f0]">核心功能：</strong></p>
            <ul className="ml-3.5 mt-1 text-[11px] leading-relaxed text-[#9ca3af] list-disc">
              <li><strong className="text-[#e2e8f0]">音素映射：</strong>每个字符映射到独特频率。中文字符基于 Unicode 码点(150-885Hz)，英文字母 A-Z(220-932Hz)，数字 0-9，标点符号控制停顿。</li>
              <li><strong className="text-[#e2e8f0]">情感匹配：</strong>自动分析文案情感(问候/疑问/警告/喜悦/悲伤/愤怒)，实时调整音色参数。以 264Hz 中性基频为基准按比例缩放。</li>
              <li><strong className="text-[#e2e8f0]">多振荡器合成：</strong>基频+谐波+颤音+滤波器，模拟多气囊共振效果。</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[rgba(168,85,247,0.16)] bg-[#0d0d20]/60 p-5">
            <h3 className="text-[14px] font-bold mb-2" style={{ color: ACCENT }}>⌨️ 快捷键</h3>
            <ul className="text-[12px] leading-relaxed text-[#9ca3af] space-y-1.5">
              <li><span className="inline-block px-2 py-0.5 rounded bg-[rgba(168,85,247,0.16)] font-mono text-[11px] mr-2" style={{ color: ACCENT }}>A-K</span>播放音阶</li>
              <li><span className="inline-block px-2 py-0.5 rounded bg-[rgba(168,85,247,0.16)] font-mono text-[11px] mr-2" style={{ color: ACCENT }}>Space</span>播放测试音</li>
              <li><span className="inline-block px-2 py-0.5 rounded bg-[rgba(168,85,247,0.16)] font-mono text-[11px] mr-2" style={{ color: ACCENT }}>R</span>开始/停止录制</li>
              <li><span className="inline-block px-2 py-0.5 rounded bg-[rgba(168,85,247,0.16)] font-mono text-[11px] mr-2" style={{ color: ACCENT }}>1-8</span>触发预设短语</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[rgba(168,85,247,0.16)] bg-[#0d0d20]/60 p-5">
            <h3 className="text-[14px] font-bold mb-2" style={{ color: ACCENT }}>🔧 技术说明</h3>
            <p className="text-[12px] leading-relaxed text-[#9ca3af]">
              使用 Web Audio API 实现多振荡器合成。支持实时参数调节、波形可视化、录制与回放功能。所有处理在本地完成，无需服务器。
            </p>
            <p className="text-[11px] leading-relaxed text-[#6b7280] mt-3">
              本页移植自开源项目 Yellow-pages-game 的 alien-language-synth，接入 because Voice Lab 的 ET 外星人模块。
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/audio/voice-lab"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← 返回 Voice lab 语言实验室
          </Link>
        </div>
      </div>

      {/* 启动遮罩 */}
      {!started && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#030311]/92 backdrop-blur-md">
          <AlienLogo size={88} />
          <h2
            className="text-[24px] font-extrabold mt-1"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 55%, #f97316 110%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            外星语言声音模拟器
          </h2>
          <p className="text-[13px] text-gray-400 -mt-2">多振荡器外星语音合成 · 音素映射 · 情感匹配</p>
          <button
            onClick={() => void startAudio()}
            className="mt-2 px-10 py-4 rounded-xl text-[15px] font-bold tracking-[2px] text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              boxShadow: '0 8px 28px rgba(124, 58, 237, 0.45)',
            }}
          >
            🛸 启动系统
          </button>
        </div>
      )}
    </div>
  );
}
