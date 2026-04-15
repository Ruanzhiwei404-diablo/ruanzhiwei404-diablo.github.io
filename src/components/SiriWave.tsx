/**
 * Siri-style voice orb — SVG 流体动画
 * 模拟 Siri 的色彩流动花瓣效果
 */
import { useRef, useEffect } from 'react';
import './SiriWave.css';

interface Blob {
  id: number;
  hue: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
  rotSpeed: number;
  movePhase: number;
  moveSpeed: number;
  moveRadius: number;
}

export default function SiriWave() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const blobs: Blob[] = [
      { id: 0, hue: 350, cx: 0, cy: 0, rx: 28, ry: 18, rotation: 0, rotSpeed: 0.35, movePhase: 0, moveSpeed: 0.7, moveRadius: 6 },
      { id: 1, hue: 25, cx: 0, cy: 0, rx: 24, ry: 20, rotation: 72, rotSpeed: -0.28, movePhase: 1.3, moveSpeed: 0.55, moveRadius: 7 },
      { id: 2, hue: 150, cx: 0, cy: 0, rx: 26, ry: 16, rotation: 144, rotSpeed: 0.32, movePhase: 2.6, moveSpeed: 0.65, moveRadius: 5 },
      { id: 3, hue: 210, cx: 0, cy: 0, rx: 22, ry: 19, rotation: 216, rotSpeed: -0.38, movePhase: 3.9, moveSpeed: 0.5, moveRadius: 8 },
      { id: 4, hue: 275, cx: 0, cy: 0, rx: 25, ry: 17, rotation: 288, rotSpeed: 0.3, movePhase: 5.2, moveSpeed: 0.6, moveRadius: 6 },
      { id: 5, hue: 45, cx: 0, cy: 0, rx: 20, ry: 15, rotation: 36, rotSpeed: -0.25, movePhase: 4.0, moveSpeed: 0.72, moveRadius: 5 },
    ];

    let time = 0;
    let raf: number;

    function animate() {
      time += 0.012;
      const paths = svg.querySelectorAll('.siri-blob');

      blobs.forEach((blob, i) => {
        const path = paths[i] as SVGPathElement;
        if (!path) return;

        const rot = blob.rotation + time * blob.rotSpeed * 30;
        const offsetX = Math.sin(time * blob.moveSpeed + blob.movePhase) * blob.moveRadius;
        const offsetY = Math.cos(time * blob.moveSpeed * 0.8 + blob.movePhase) * blob.moveRadius;
        const breathe = 1 + Math.sin(time * 1.2 + blob.id * 0.5) * 0.08;

        const rx = blob.rx * breathe;
        const ry = blob.ry * breathe;
        const rad = (rot * Math.PI) / 180;

        // 绘制椭圆路径
        const steps = 60;
        let d = '';
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * Math.PI * 2;
          const wave = Math.sin(t * 2 + time * 1.5 + blob.id) * 3;
          const wave2 = Math.cos(t * 3 + time * 1.2 + blob.id * 2) * 2;
          const px = Math.cos(t) * (rx + wave) + offsetX;
          const py = Math.sin(t) * (ry + wave2) + offsetY;
          // 旋转
          const fx = px * Math.cos(rad) - py * Math.sin(rad);
          const fy = px * Math.sin(rad) + py * Math.cos(rad);
          d += `${s === 0 ? 'M' : 'L'} ${fx.toFixed(1)},${fy.toFixed(1)} `;
        }
        d += 'Z';
        path.setAttribute('d', d);

        // 动态颜色微调
        const hShift = Math.sin(time * 0.4 + blob.id) * 15;
        const hue = blob.hue + hShift;
        const opacity = 0.55 + Math.sin(time * 0.8 + blob.id * 1.2) * 0.15;
        path.style.fill = `hsla(${hue}, 78%, 55%, ${opacity.toFixed(2)})`;
        path.style.stroke = `hsla(${hue}, 85%, 65%, ${(opacity + 0.1).toFixed(2)})`;
      });

      raf = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: '220px', height: '140px' }}>
      {/* 左侧波形条 */}
      <div className="absolute left-1 flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={`left-${i}`}
            className="absolute siri-wave-bar"
            style={{
              width: '4px',
              height: '14px',
              transform: `translateX(${i * 8}px)`,
              animationDelay: `${i * 0.12}s`,
              borderRadius: '999px',
            }}
          />
        ))}
      </div>

      {/* 右侧波形条 */}
      <div className="absolute right-1 flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute siri-wave-bar"
            style={{
              width: '4px',
              height: '14px',
              transform: `translateX(${-i * 8}px)`,
              animationDelay: `${i * 0.12}s`,
              borderRadius: '999px',
            }}
          />
        ))}
      </div>

      {/* 围绕球体的圆形扩散光环 */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={`ring-${i}`}
          className="absolute siri-glow-ring"
          style={{
            width: 56 + i * 18,
            height: 56 + i * 18,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.4}s`,
            opacity: 0,
          }}
        />
      ))}

      {/* SVG 球体 */}
      <div className="relative z-10 siri-orb-wrap">
        {/* 外发光 */}
        <div className="siri-outer-glow-css" />

        <svg
          ref={svgRef}
          viewBox="-45 -45 90 90"
          width="90"
          height="90"
          className="siri-svg"
        >
          <defs>
            <clipPath id="orbClip">
              <circle cx="0" cy="0" r="35" />
            </clipPath>
            <radialGradient id="sphereShading" cx="40%" cy="35%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="50%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </radialGradient>
            <radialGradient id="highlight" cx="38%" cy="32%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <g clipPath="url(#orbClip)">
            {/* 背景球体 */}
            <circle cx="0" cy="0" r="36" fill="#0d0820" />

            {/* 流动色块 */}
            {[0, 1, 2, 3, 4, 5].map(id => (
              <path key={id} className="siri-blob" fill="transparent" strokeWidth="0.8" />
            ))}

            {/* 球面光影 */}
            <circle cx="0" cy="0" r="36" fill="url(#sphereShading)" />
          </g>

          {/* 球体边框 */}
          <circle cx="0" cy="0" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="siri-border" />

          {/* 高光 */}
          <circle cx="0" cy="0" r="35" fill="url(#highlight)" />
        </svg>
      </div>
    </div>
  );
}
