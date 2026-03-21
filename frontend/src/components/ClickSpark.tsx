/**
 * @description
 * Implementa um efeito visual de partículas (sparks) que reage ao clique do utilizador
 * utilizando a API de Canvas 2D para alta performance.
 */

import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Caracteristicas do Spark
 * 
 * @prop sparkColor? - string
 * @prop sparkSize? - number
 * @prop sparkRadius? - number
 * @prop sparkCount? - number
 * @prop duration? - number
 * @prop easing? - 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
 * @prop extraScale? - number
 * @prop children? - React.ReactNode
 */
interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: React.ReactNode;
}

/**
 * Posições do Spark
 * 
 * @prop x - number
 * @prop y - number
 * @prop angle - number
 * @prop startTime - number
 */
interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

interface Wave {
  x: number;
  y: number;
  startTime: number;
}

/**
 * Componete para fornecer uma animação do estilo Spark, ao clicar
 * @param param0 - caracteristicas do spark
 */
const ClickSpark: React.FC<ClickSparkProps> = ({
  /* Carcteristicas do Spark */
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 10,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 });
  const themeRef = useRef({
    bg: "rgba(0,0,0,0)",
    fg: "rgba(0,0,0,0.12)",
    fgSoft: "rgba(0,0,0,0.06)",
    highlight: "rgba(255,255,255,0.12)",
    shadow: "rgba(0,0,0,0.10)",
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      viewportRef.current = { width, height, dpr };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeTheme = () => {
      const body = document.body;
      if (!body) return;
      const styles = window.getComputedStyle(body);
      const bgRgb = parseRgb(styles.backgroundColor) ?? { r: 255, g: 255, b: 255 };
      const fgRgb = parseRgb(styles.color) ?? { r: 0, g: 0, b: 0 };

      const bgLum = relativeLuminance(bgRgb);
      const isDark = bgLum < 0.35;

      themeRef.current = {
        bg: `rgba(${bgRgb.r},${bgRgb.g},${bgRgb.b},1)`,
        fg: `rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},0.12)`,
        fgSoft: `rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},0.06)`,
        highlight: isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.10)",
        shadow: isDark ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.12)",
      };
    };

    computeTheme();
    const observer = new MutationObserver(computeTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  // defenição de animiações
  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  /**
   * Inicializa o loop de renderização do Canvas. 
   * Atualiza a cor, tamanho, etc do spark, para garantir que o contexto do Canvas está atualizado
   */
  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;


    /**
     * Render Loop
     * Função para desenhar o spark e removelo de sparksRef
     * @param timestamp - Tempo de execução fornecido pelo requestAnimationFrame
     */
    const draw = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const { width, height } = viewportRef.current;
      ctx?.clearRect(0, 0, width, height);

      const waveDuration = Math.max(420, duration);
      wavesRef.current = wavesRef.current.filter((wave: Wave) => {
        const elapsed = timestamp - wave.startTime;
        if (elapsed >= waveDuration) return false;

        const progress = Math.min(1, elapsed / waveDuration);
        const eased = easeFunc(progress);
        const radius = 14 + eased * 96;

        const baseOpacity = 0.22 * (1 - eased);
        const { fgSoft, highlight, shadow } = themeRef.current;

        ctx.save();
        ctx.globalAlpha = baseOpacity;

        const grad = ctx.createRadialGradient(wave.x, wave.y, radius * 0.2, wave.x, wave.y, radius);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(0.6, "rgba(0,0,0,0)");
        grad.addColorStop(1, fgSoft);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = highlight;
        ctx.beginPath();
        ctx.arc(wave.x - 1.2, wave.y - 1.2, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = shadow;
        ctx.beginPath();
        ctx.arc(wave.x + 1.2, wave.y + 1.2, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        return true;
      });

      // Filtra e desenha as faíscas ativas
      sparksRef.current = sparksRef.current.filter((spark: Spark) => {
        const elapsed = timestamp - spark.startTime;

        if (elapsed >= duration) {
          return false; // Remove a faísca se exceder a duração definida
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true; // Mantém a faísca viva no array
      });

      // Agenda o próximo frame, criando o loop infinito
      animationId = requestAnimationFrame(draw);
    };

    // Inicia o primeiro frame
    animationId = requestAnimationFrame(draw);

    // Cleanup: cancela a animação se o componente for desmontado
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);


  /**
   * salva e valida a posição do click
   * cria instancias de spark e salva-as no sparksRef
   */
  const handleClick = useCallback((e: PointerEvent): void => {
    const target = e.target instanceof Element ? e.target : null
    const isReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (!isReduced && isBackgroundTarget(target)) {
      const now = performance.now();
      wavesRef.current.push({ x: e.clientX, y: e.clientY, startTime: now });
      wavesRef.current = wavesRef.current.slice(-8);
    }

    const now = performance.now();

    //cria N sparks (o N vem de sparkCount)
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x: e.clientX,
      y: e.clientY,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));

    //adiciona os sparks ao sparksRef para serem renderizados
    sparksRef.current.push(...newSparks);
  }, [sparkCount]);

  /**
   * Adição do eventListener ao DOM para escutar o click do rato
   */
  useEffect(() => {
    const options: AddEventListenerOptions = { capture: true, passive: true }
    window.addEventListener('pointerdown', handleClick, options);
    return () => {
      window.removeEventListener('pointerdown', handleClick, options);
    };
  }, [handleClick]);


  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      {children}
    </>
  );
};

export default ClickSpark;

function isBackgroundTarget(target: Element | null): boolean {
  if (!target) return true

  const interactive =
    "a,button,input,textarea,select,summary,label,[role='button'],[role='link'],[role='menuitem'],[data-no-bg-wave]"
  if (target.closest(interactive)) return false

  if (target.closest("[data-slot='sidebar']")) return false
  if (target.closest("[data-slot='dropdown-menu-content']")) return false
  if (target.closest("[data-slot='popover-content']")) return false
  if (target.closest("[data-slot='sheet-content']")) return false
  if (target.closest("[data-slot='dialog-content']")) return false
  if (target.closest("[data-slot='brutal-interactive-card']")) return false

  return true
}

function parseRgb(value: string): { r: number; g: number; b: number } | null {
  const match = value.match(/rgba?\(\s*(\d+)\s*[,\s]+(\d+)\s*[,\s]+(\d+)/i)
  if (!match) return null
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const r = toLinear(rgb.r)
  const g = toLinear(rgb.g)
  const b = toLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
