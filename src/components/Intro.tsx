import React, { useState } from 'react';
import { motion } from 'motion/react';
import Bee from './Bee';
import { Volume2, VolumeX, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface IntroProps {
  onStart: (teamName: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Intro({ onStart, isMuted, onToggleMute }: IntroProps) {
  const [teamName, setTeamName] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const handleStart = () => {
    soundManager.playClick();
    if (!teamName.trim()) {
      setShowWarning(true);
      return;
    }
    soundManager.playCorrect();
    onStart(teamName);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative blooming flower SVGs / Honeycombs in custom positions */}
      <div className="absolute top-10 left-10 text-4xl opacity-30 animate-pulse pointer-events-none">🌳</div>
      <div className="absolute bottom-16 right-16 text-4xl opacity-30 animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>🌸</div>
      <div className="absolute top-1/4 right-10 text-4xl opacity-20 pointer-events-none">🌳</div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white rounded-[40px] border-8 border-yellow-400 p-8 md:p-10 shadow-2xl relative z-10 text-center"
      >
        {/* Sound toggle at top right */}
        <div className="absolute top-4 right-4 z-20">
          <button
            id="sound-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
              soundManager.playClick();
            }}
            className="p-3 bg-sky-50 hover:bg-yellow-100 text-slate-800 border-2 border-slate-800 rounded-full transition-all duration-200 shadow-md flex items-center justify-center pointer-events-auto"
            title={isMuted ? "소리 켜기" : "소리 끄기"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 animate-pulse" />}
          </button>
        </div>

        {/* Header Ribbon / Title badge */}
        <div className="flex justify-center -mt-16 mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-yellow-400 text-slate-900 font-extrabold text-sm tracking-wide px-6 py-2.5 rounded-full border-4 border-slate-900 shadow-md uppercase inline-flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-slate-950 animate-bounce" />
            초등학교 3학년 영양식생활 교육
          </motion.div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-snug drop-shadow-sm mb-6">
          🐝 꿀벌 실종 사건의 전말
        </h1>

        {/* Middle illustration of Detective Bee */}
        <div className="my-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="w-32 h-32 md:w-36 md:h-36 shrink-0 bg-sky-50 rounded-full border-4 border-dashed border-sky-200 p-2 flex items-center justify-center">
            <Bee expression="THINKING" isMoving={false} direction="right" />
          </div>
          <div className="bg-sky-50 border-4 border-slate-800 text-slate-800 rounded-3xl p-4.5 text-left max-w-sm relative shadow-sm">
            <span className="hidden sm:block absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-8 border-transparent border-r-slate-800"></span>
            <p className="text-sm font-bold leading-relaxed text-slate-700">
              "친구들 안녕! 사라지는 우리 꿀벌을 구하기 위해 미로 속 수수께끼를 풀고 예쁜 꽃밭을 구하러 출발하자!"
            </p>
          </div>
        </div>

        {/* Context description block */}
        <div className="bg-emerald-50/50 border-4 border-dashed border-emerald-300 rounded-3xl p-4 text-emerald-900 text-sm mb-6 leading-relaxed text-left">
          <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            미로를 탈출하는 방법:
          </h3>
          <ul className="list-disc pl-5 space-y-1 font-semibold text-slate-705 text-xs md:text-sm">
            <li>미로 갈림길마다 나타나는 <span className="text-amber-600 font-extrabold">6가지 관문</span>을 돌파해요!</li>
            <li>정답을 맞추면 닫힌 미로 길이 열리고 앞으로 나아갈 수 있어요.</li>
            <li>틀리더라도 <span className="text-emerald-700 font-bold">하트 에너지</span>를 모아 다시 도전하면 되니 걱정 마세요!</li>
          </ul>
        </div>

        {/* Input box and Start Button */}
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-left text-xs md:text-sm font-black text-slate-700 mb-1.5 uppercase tracking-wider">
              🕵️‍♂️ 탐정단 명칭을 입력해주세요:
            </label>
            <input
              type="text"
              placeholder="예: 3학년 2반 1모둠 / 멋장이탐정들"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (showWarning) setShowWarning(false);
              }}
              className="w-full text-center px-4 py-3 border-4 border-slate-800 focus:border-yellow-400 bg-sky-50 rounded-2xl text-lg font-black text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
            />
            {showWarning && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 font-bold text-sm tracking-wide mt-1.5 flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                멋진 탐정단 이름을 적어주셔야 출발할 수 있어요!
              </motion.span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl rounded-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-0 cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all duration-150"
          >
            <span>🌻 미로 탐색 출발하기!</span>
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
}
