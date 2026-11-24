import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import Bee from './Bee';
import { soundManager } from '../utils/audio';

interface OutroProps {
  teamName: string;
  onRestart: () => void;
}

// Celebration Fireworks popping particle effect component
const FireworksExplosion = ({ x, y, color }: { x: number; y: number; color: string; key?: any }) => {
  const particles = Array.from({ length: 14 });
  return (
    <div className="absolute pointer-events-none z-0" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      {particles.map((_, i) => {
        const angle = (i * 360) / 14;
        const distance = 50 + Math.random() * 50;
        const radian = (angle * Math.PI) / 180;
        const targetX = Math.cos(radian) * distance;
        const targetY = Math.sin(radian) * distance;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full shadow-inner border border-white/20"
            style={{ 
              backgroundColor: color,
              width: i % 2 === 0 ? '8px' : '5px',
              height: i % 2 === 0 ? '8px' : '5px',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{ 
              x: targetX, 
              y: targetY, 
              opacity: 0, 
              scale: [1, 1.4, 0.2] 
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        );
      })}
      {/* Central burst glow */}
      <motion.div
        className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 bg-white"
        style={{ filter: 'blur(3px)' }}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export default function Outro({ teamName, onRestart }: OutroProps) {
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    // Play celebratory victory fanfare! Includes customized cheering crowd shouts.
    const timer = setTimeout(() => {
      soundManager.playSuccess();
    }, 150);

    // Core continuous firework bursting engine
    const triggerFirework = () => {
      const colors = [
        '#facc15', // yellow
        '#f87171', // light red
        '#34d399', // emerald
        '#60a5fa', // sky blue
        '#f472b6', // pink
        '#c084fc', // purple
        '#fb923c', // orange
        '#ff4e88'  // deep pink
      ];
      const newFirework = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80, // percentage bounded of viewport boundaries
        y: 10 + Math.random() * 65, // percentage bounded of viewport boundaries
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setFireworks(prev => [...prev.slice(-9), newFirework]);
    };

    // Staggered starter bursting
    triggerFirework();
    const t1 = setTimeout(triggerFirework, 200);
    const t2 = setTimeout(triggerFirework, 500);
    const t3 = setTimeout(triggerFirework, 800);

    const interval = setInterval(triggerFirework, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Stars/Confetti CSS effects & animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotated-sparkle {
          animation: rotate-slow 15s infinite linear;
        }
      `}} />

      {/* Render Dynamic Live Celebration Fireworks */}
      <AnimatePresence>
        {fireworks.map(fw => (
          <FireworksExplosion key={fw.id} x={fw.x} y={fw.y} color={fw.color} />
        ))}
      </AnimatePresence>

      {/* Decorative background visual sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 text-4xl opacity-35 animate-bounce">🌳</div>
        <div className="absolute top-1/4 right-10 text-4xl opacity-35 animate-pulse">🌸</div>
        <div className="absolute bottom-10 left-1/3 text-4xl opacity-35 animate-bounce">🌳</div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="w-full max-w-2xl bg-white border-8 border-yellow-400 rounded-[40px] p-8 md:p-10 shadow-2xl relative z-10 text-center text-slate-850"
      >
        {/* Shiny background ribbon */}
        <div className="absolute -top-10 left-12 right-12 flex justify-center">
          <div className="bg-yellow-400 text-slate-900 border-4 border-slate-900 font-black px-10 py-3.5 rounded-full shadow-lg flex items-center gap-2">
            <Award className="w-6 h-6 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-base md:text-lg tracking-wide">꿀벌 실종 사건 수사 종결!</span>
          </div>
        </div>

        {/* Certificate body */}
        <div className="border-4 border-dashed border-emerald-300 rounded-[32px] p-6 md:p-8 bg-sky-50/50 shadow-inner mt-6">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 relative z-10">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute inset-0 rotated-sparkle text-yellow-500 w-full h-full opacity-60">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  {/* Decorative sun rays for award */}
                  <polygon points="50,15 54,35 73,20 63,40 85,45 65,52 75,72 55,60 50,85 45,60 25,72 35,52 15,45 37,40 27,20 46,35" />
                </svg>
              </div>
              <div className="absolute inset-2 flex items-center justify-center shadow-inner rounded-full bg-white border-2 border-slate-900 p-2">
                <Bee expression="HAPPY" isMoving={true} direction="right" className="w-20 h-20" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            🏆 꿀벌 구조 보안관 임명장
          </h1>

          <div className="text-lg font-black text-emerald-800 mb-6 bg-white border-2 border-slate-900/10 py-1.5 px-6 rounded-2xl inline-block shadow-sm">
            소속 탐정단: <span className="text-emerald-950 underline underline-offset-4 decoration-emerald-800 font-black text-xl">{teamName}</span>
          </div>

          <p className="text-xs md:text-sm leading-relaxed font-bold text-slate-700 max-w-md mx-auto mb-6 text-left border-y border-slate-200 py-4">
            위 탐정단은 꿀벌 실종 사건을 완벽하게 해결하고, 꿀벌들이 기후위기와 지구온난화로부터 안전하게 살 수 있도록 미로 속 유용한 생태 지식을 습득하였습니다. 이에 기후행동 실천을 약속하고 <strong>지구를 구한 자랑스러운 꿀벌 수호 영웅</strong>으로 임명합니다!
          </p>

          {/* Learnings recap */}
          <div className="text-left space-y-3 max-w-lg mx-auto bg-white border-4 border-slate-900/10 rounded-2xl p-5 shadow-sm mb-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wide text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              사건 해결로 배운 약속:
            </h3>
            <div className="text-xs md:text-sm space-y-2.5 font-bold text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>[약속 1]</strong> 꿀벌은 무서운 해충이 아니라, 우리 식생태계를 풍요롭게 돕는 <strong>아주 이롭고 고마운 익충</strong>임을 기억해요!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>[약속 2]</strong> 전 세계 <strong>100대 작물 중 71%</strong>가 꿀벌의 도움으로 풍성한 열매를 맺음을 이해해요!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>[약속 3]</strong> 지구온난화 기후위기로 인한 <strong>기상이변</strong>이 꿀벌 실종의 주요 원인임을 기억해요!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>[약속 4]</strong> 기후 온난화를 낮추기 위해 온실가스를 많이 뿜어내는 <strong>대규모 축산업 극복</strong>에 관심을 가져요!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>[약속 5]</strong> 지구 건강을 위해 <strong>고기를 한 끼 줄이면 소나무 15그루를 새로 심는 놀라운 혜택</strong>이 있음을 기억해요!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <span><strong>[약속 6]</strong> <strong>건강하고 푸른 지구를 만드는 식생활 수호 4대 꿀약속</strong>을 일상에서 실천해요!</span>
                  <div className="mt-2 pl-3 border-l-4 border-emerald-400 space-y-2 text-xs text-slate-700 font-bold leading-relaxed">
                    <div>🍀 <strong>지구사랑의 날:</strong> 매주 월요일은 고기없는날! 맛있는 채식 체험으로 온실가스를 줄이고 소나무들을 보호해요.</div>
                    <div>🍽️ <strong>수요일은다먹는날:</strong> 매주 수요일은 남김없이 다 먹는 날! 음식물 쓰레기를 없애 기후 위기를 싹 예방해요.</div>
                    <div>🚚 <strong>로컬푸드의 날:</strong> 우리 지역의 신선하고 가까운 먹거리를 먹어 수송 시간에 발생하는 온실가스(매연)를 뚝 떨어뜨려요.</div>
                    <div>🌾 <strong>친환경급식의 날:</strong> 화학비료를 쓰지 않고 친환경적으로 정성스레 길러진 식재료를 사용해 땅과 꿀벌 생태계를 건강하게 지켜요.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons to restart */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 relative z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-0 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            처음부터 다시 하기 (새 탐정단)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
