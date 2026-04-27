"use client"

import { useReducedMotion } from "framer-motion"
import { CASSETTE, landingTokens } from "../lib/tokens"

type CassetteCardProps = {
  className?: string
}

// 1. Sub-componente genérico para os parafusos (reaproveitável 5 vezes)
const Screw = ({ className = "" }: { className?: string }) => (
  <div className={`ne-cassette-screw ${className}`}>{landingTokens.copy.landing.cassette.screwSymbol}</div>
)

// 2. Sub-componente para o adesivo central
// Recebe a prop reduceMotion para passar às rodas
const CassetteSticker = ({ reduceMotion }: { reduceMotion: boolean | null }) => (
  <div className="ne-cassette-sticker">
    <div className="ne-cassette-line ne-line-1" />
    <div className="ne-cassette-line ne-line-2" />

    <div className="ne-cassette-yellow-band">
      <div className="ne-cassette-roll">
        <div className={`ne-cassette-wheel ${reduceMotion ? "ne-paused" : ""}`} />
        <div className="ne-cassette-tape" />
        <div className={`ne-cassette-wheel ${reduceMotion ? "ne-paused" : ""}`} />
      </div>
      <p className="ne-cassette-num">{landingTokens.copy.landing.cassette.num}</p>
    </div>

    <div className="ne-cassette-orange-band">
      <p className="ne-cassette-time">{landingTokens.copy.landing.cassette.time}</p>
    </div>
  </div>
)

// 3. Sub-componente para a base inferior
const CassetteBottomBase = () => (
  <div className="ne-cassette-bottom-base">
    <div className="ne-cassette-bottom-shape">
      <div className="ne-cassette-c1" />
      <div className="ne-cassette-t1" />
      {/* Reutilizamos o Screw aqui com a classe de centro */}
      <Screw className="ne-screw-center" />
      <div className="ne-cassette-t2" />
      <div className="ne-cassette-c2" />
    </div>
  </div>
)

// Main Component
export function CassetteCard({ className = "" }: CassetteCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={`ne-cassette-wrapper ${className}`}>
      <div className="ne-cassette-card">
        {/* Renderização limpa e declarativa */}
        <Screw className="ne-screw-tl" />
        <Screw className="ne-screw-tr" />
        <Screw className="ne-screw-bl" />
        <Screw className="ne-screw-br" />

        <CassetteSticker reduceMotion={reduceMotion} />
        
        <CassetteBottomBase />
      </div>

      {/* Mantivemos os estilos isolados no componente pai para facilitar o copy-paste */}
      <style>{`
        .ne-cassette-wrapper {
          display: inline-block;
          transform: rotate(45deg);
          filter: ${CASSETTE.colors.wrapperDropShadow};
          position: relative;
          z-index: 0;
        }

        .ne-cassette-card {
          width: 300px;
          height: 200px;
          background: ${CASSETTE.colors.cardBg};
          border-radius: 8px;
          position: relative;
          box-sizing: border-box;
        }

        /* --- Parafusos --- */
        .ne-cassette-screw {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${CASSETTE.colors.screwFg};
          border: 1px solid ${CASSETTE.colors.screwBorder};
          background-color: ${CASSETTE.colors.screwBg};
          height: 12px;
          width: 12px;
          border-radius: 50%;
          font-size: 10px;
          line-height: 1;
          user-select: none;
        }
        .ne-screw-tl { top: 8px; left: 8px; }
        .ne-screw-tr { top: 8px; right: 8px; }
        .ne-screw-bl { bottom: 8px; left: 8px; }
        .ne-screw-br { bottom: 8px; right: 8px; }
        .ne-screw-center { bottom: 4px; left: 50%; transform: translateX(-50%); z-index: 10; }

        /* --- Adesivo Central --- */
        .ne-cassette-sticker {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 260px;
          height: 130px;
          background-color: ${CASSETTE.colors.stickerBg};
          clip-path: polygon(5% 0, 95% 0, 100% 10%, 100% 100%, 0 100%, 0 10%);
          border-radius: 5px;
          overflow: hidden;
        }

        .ne-cassette-line {
          position: absolute;
          width: 85%;
          height: 1px;
          background-color: ${CASSETTE.colors.lineBg};
          left: 7.5%;
        }
        .ne-line-1 { top: 16px; }
        .ne-line-2 { top: 32px; }

        /* --- Faixa Amarela --- */
        .ne-cassette-yellow-band {
          display: flex;
          align-items: center;
          width: 100%;
          height: 50px;
          background-color: ${CASSETTE.colors.yellowBandBg};
          margin-top: 45px;
          padding: 0 15px;
          box-sizing: border-box;
        }

        .ne-cassette-roll {
          flex: 1;
          height: 32px;
          border-radius: 16px;
          background-color: ${CASSETTE.colors.rollBg};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          position: relative;
        }

        .ne-cassette-tape {
          position: absolute;
          width: 60px;
          height: 24px;
          background-color: ${CASSETTE.colors.tapeBg};
          left: 50%;
          transform: translateX(-50%);
        }

        .ne-cassette-wheel {
          width: 24px;
          height: 24px;
          border: 2px dashed ${CASSETTE.colors.wheelBorder};
          box-shadow: 0 0 0 3px ${CASSETTE.colors.wheelShadow};
          border-radius: 50%;
          animation: 2s neCassetteRun infinite linear;
          z-index: 2;
        }
        .ne-paused {
          animation: none !important;
        }

        .ne-cassette-num {
          font-family: ui-monospace, monospace;
          font-weight: 700;
          font-size: 16px;
          color: ${CASSETTE.colors.numFg};
          margin: 0 0 0 16px;
        }

        /* --- Faixa Laranja --- */
        .ne-cassette-orange-band {
          display: flex;
          width: 100%;
          height: 24px;
          background-color: ${CASSETTE.colors.orangeBandBg};
          align-items: center;
          justify-content: center;
        }

        .ne-cassette-time {
          font-size: 10px;
          color: ${CASSETTE.colors.timeFg};
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: ui-monospace, monospace;
          margin: 0;
        }

        /* --- Base Inferior (Trapézio) --- */
        .ne-cassette-bottom-base {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 160px;
          height: 45px;
          filter: ${CASSETTE.colors.bottomDropShadow};
        }

        .ne-cassette-bottom-shape {
          width: 100%;
          height: 100%;
          background-color: ${CASSETTE.colors.bottomShapeBg};
          clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
          position: relative;
        }

        .ne-cassette-c1, .ne-cassette-c2 {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: ${CASSETTE.colors.chipBg};
          border-radius: 50%;
          bottom: 8px;
        }
        .ne-cassette-c1 { left: 24px; }
        .ne-cassette-c2 { right: 24px; }

        .ne-cassette-t1, .ne-cassette-t2 {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: ${CASSETTE.colors.chipBg};
          border-radius: 2px;
          top: 8px;
        }
        .ne-cassette-t1 { left: 40px; }
        .ne-cassette-t2 { right: 40px; }

        @keyframes neCassetteRun {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
