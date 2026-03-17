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
  const startTimeRef = useRef<number | null>(null);

  // useEffect para defenir a Canvas (onde é desenhado) e o seu tamanho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
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
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

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
  const handleClick = useCallback((e: MouseEvent): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Verificar se o clique foi dentro da área do canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Verificar se as coordenadas estão dentro do canvas
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return;
    }

    const now = performance.now();

    //cria N sparks (o N vem de sparkCount)
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
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
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);


  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      {children}
    </div>
  );
};

export default ClickSpark;
