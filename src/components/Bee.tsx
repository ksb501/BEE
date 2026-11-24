import React from 'react';
import { motion } from 'motion/react';

interface BeeProps {
  expression?: 'HAPPY' | 'BUZZING' | 'DIZZY' | 'THINKING';
  isMoving?: boolean;
  direction?: 'left' | 'right';
  className?: string;
}

export default function Bee({
  expression = 'BUZZING',
  isMoving = false,
  direction = 'right',
  className = '',
}: BeeProps) {
  // Determine wing flap speed based on movement
  const wingSpeed = isMoving ? '0.08s' : '0.2s';
  const tiltAngle = direction === 'left' ? -10 : 10;
  const scaleX = direction === 'left' ? -1 : 1;

  // Eyes based on expression
  const renderEyes = () => {
    switch (expression) {
      case 'HAPPY':
        // Happy curved eyes ^ ^
        return (
          <>
            {/* Left Eye */}
            <path
              d="M 28 32 C 28 28, 36 28, 36 32"
              stroke="#271C19"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye */}
            <path
              d="M 48 32 C 48 28, 56 28, 56 32"
              stroke="#271C19"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case 'DIZZY':
        // Dizzy spiral or X eyes
        return (
          <>
            {/* Left Eye X */}
            <path d="M 28 28 L 36 36 M 36 28 L 28 36" stroke="#271C19" strokeWidth="4" strokeLinecap="round" />
            {/* Right Eye X */}
            <path d="M 48 28 L 56 36 M 56 28 L 48 36" stroke="#271C19" strokeWidth="4" strokeLinecap="round" />
          </>
        );
      case 'THINKING':
        // Curious wide eyes looking upwards
        return (
          <>
            {/* Left Eye */}
            <circle cx="32" cy="32" r="6" fill="#271C19" />
            <circle cx="34" cy="30" r="2.5" fill="white" />
            {/* Right Eye */}
            <circle cx="52" cy="32" r="6" fill="#271C19" />
            <circle cx="54" cy="30" r="2.5" fill="white" />
            {/* Thinking eyebrow */}
            <path d="M 28 22 Q 32 20 36 23" stroke="#271C19" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 48 23 Q 52 20 56 22" stroke="#271C19" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'BUZZING':
      default:
        // Wide cute eyes with sparkle
        return (
          <>
            {/* Left Eye */}
            <circle cx="32" cy="34" r="7" fill="#271C19" />
            <circle cx="30" cy="31" r="3" fill="white" />
            <circle cx="34" cy="36" r="1.5" fill="white" />
            {/* Right Eye */}
            <circle cx="52" cy="34" r="7" fill="#271C19" />
            <circle cx="50" cy="31" r="3" fill="white" />
            <circle cx="54" cy="36" r="1.5" fill="white" />
          </>
        );
    }
  };

  // Mouth based on expression
  const renderMouth = () => {
    switch (expression) {
      case 'HAPPY':
        return (
          // Big happy open mouth
          <path d="M 36 44 Q 42 54 48 44 Z" fill="#E86262" stroke="#271C19" strokeWidth="3" />
        );
      case 'DIZZY':
        return (
          // Squiggly mouth
          <path d="M 36 45 Q 40 41 42 45 T 48 45" fill="none" stroke="#271C19" strokeWidth="3" strokeLinecap="round" />
        );
      case 'THINKING':
        return (
          // Flat neutral mouth
          <line x1="38" y1="44" x2="46" y2="44" stroke="#271C19" strokeWidth="3.5" strokeLinecap="round" />
        );
      case 'BUZZING':
      default:
        return (
          // Small cute smile
          <path d="M 38 44 Q 42 48 46 44" fill="none" stroke="#271C19" strokeWidth="3.5" strokeLinecap="round" />
        );
    }
  };

  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      {/* Inject custom CSS for custom fluttering wings & hover bounce */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flap-left {
          0% { transform: rotate(20deg) scale(1); }
          50% { transform: rotate(-25deg) scaleY(0.8) scaleX(0.95); }
          100% { transform: rotate(20deg) scale(1); }
        }
        @keyframes flap-right {
          0% { transform: rotate(-20deg) scale(1); }
          50% { transform: rotate(25deg) scaleY(0.8) scaleX(0.95); }
          100% { transform: rotate(-20deg) scale(1); }
        }
        @keyframes bee-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        .flap-wing-left-main {
          animation: flap-left ${wingSpeed} infinite ease-in-out;
          transform-origin: 38px 15px;
        }
        .flap-wing-right-main {
          animation: flap-right ${wingSpeed} infinite ease-in-out;
          transform-origin: 54px 14px;
        }
        .bee-floating {
          animation: bee-float 1.8s infinite ease-in-out;
        }
      `}} />

      <motion.div
        className="bee-floating w-full h-full flex items-center justify-center"
        style={{ overflow: 'visible' }}
        animate={{
          rotate: tiltAngle,
          scaleX: scaleX,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <svg
          viewBox="-25 -30 150 150"
          width="100%"
          height="100%"
          className="drop-shadow-lg"
          style={{ overflow: 'visible' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for gradients/patterns */}
          <defs>
            {/* Body Bumble Stripe Pattern */}
            <linearGradient id="bee-body" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" /> {/* amber-400 */}
              <stop offset="25%" stopColor="#D97706" /> {/* amber-600 */}
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            {/* Wing Soft Pearlescent Gradient */}
            <linearGradient id="bee-wing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#E0F2FE" stopOpacity="0.75" /> {/* sky-100 */}
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.5" /> {/* yellow-200 */}
            </linearGradient>
          </defs>

          {/* BACKGROUND SHADOW */}
          <ellipse cx="50" cy="88" rx="20" ry="4" fill="#000000" fillOpacity="0.15" />

          {/* STINGER (Bee's little bum stinger) */}
          <path
            d="M 12 55 Q 5 60 10 65 L 18 58 Z"
            fill="#1E293B"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* LEGS */}
          <g stroke="#271C19" strokeWidth="4.5" strokeLinecap="round" fill="none">
            {/* Back Legs */}
            <path d="M 32 68 C 30 74, 25 74, 22 72" />
            <path d="M 44 68 C 44 75, 40 76, 36 74" />
            <path d="M 56 68 C 58 74, 52 76, 48 74" />
          </g>

          {/* MAIN BEE BODY (CHUBBY OVAL) */}
          <rect
            x="20"
            y="26"
            width="56"
            height="44"
            rx="22"
            fill="url(#bee-body)"
            stroke="#271C19"
            strokeWidth="4.5"
          />

          {/* CHUBBY STRIPES */}
          <g stroke="#271C19" strokeWidth="5" strokeLinecap="round" fill="none">
            {/* Stripe 1 (back) */}
            <path d="M 34 26 C 34 32, 34 64, 34 70" />
            {/* Stripe 2 (middle) */}
            <path d="M 46 26 C 46 32, 46 64, 46 70" />
            {/* Stripe 3 (front neck) */}
            <path d="M 58 27 C 58 33, 58 63, 58 69" />
          </g>

          {/* FACE DETAILS */}
          {/* Blush cheeks */}
          <ellipse cx="25" cy="42" rx="4.5" ry="3.5" fill="#FDA4AF" /> {/* rose-300 */}
          <ellipse cx="58" cy="42" rx="4.5" ry="3.5" fill="#FDA4AF" />

          {renderEyes()}
          {renderMouth()}

          {/* ANTENNAE */}
          <g stroke="#271C19" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 46 26 Q 52 14 58 15" />
            <path d="M 54 26 Q 64 16 68 20" />
          </g>
          {/* Antenna Knobs */}
          <circle cx="58" cy="15" r="4.5" fill="#271C19" />
          <circle cx="68" cy="20" r="4.5" fill="#271C19" />

          {/* DETECTIVE HAT (Super theme-aware!) */}
          <g id="detective-hat">
            {/* Hat Brim */}
            <path
              d="M 34 24 C 36 21, 62 21, 66 23"
              stroke="#271C19"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hat Base / Crown */}
            <path
              d="M 40 23 L 42 12 Q 52 10 58 13 L 60 23 Z"
              fill="#78350F" // Brown detective hat
              stroke="#271C19"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Hat ribbon */}
            <path
              d="M 40.8 21 L 41.5 17 Q 50.8 15.5 56.5 17.8 L 57.2 22"
              fill="#FEF08A" // Yellow stripe on hat
              stroke="#271C19"
              strokeWidth="1.5"
            />
          </g>

          {/* SINGLE WINGS (Clean and cute single wings setup) */}
          {/* Back Wing */}
          <ellipse
            cx="38"
            cy="11"
            rx="11"
            ry="22"
            fill="url(#bee-wing)"
            stroke="#271C19"
            strokeWidth="3.5"
            className="flap-wing-left-main"
          />

          {/* Front Wing */}
          <ellipse
            cx="54"
            cy="10"
            rx="13"
            ry="25"
            fill="url(#bee-wing)"
            stroke="#271C19"
            strokeWidth="4"
            className="flap-wing-right-main"
          />
        </svg>
      </motion.div>
    </div>
  );
}
