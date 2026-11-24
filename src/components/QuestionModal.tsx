import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../types';
import { soundManager } from '../utils/audio';
import Bee from './Bee';
import { Check, X, ArrowRight, ShieldAlert, Heart, MessageSquareDot, HelpCircle } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  checkpointId: number;
  onSolveSuccess: () => void;
  onSolveFailure: () => void;
}

export default function QuestionModal({
  question,
  checkpointId,
  onSolveSuccess,
  onSolveFailure,
}: QuestionModalProps) {
  const [mode, setMode] = useState<'ASKING' | 'CORRECT' | 'WRONG' | 'REVEALED'>(
    'ASKING'
  );
  const [selectedAns, setSelectedAns] = useState<string | null>(null);

  // suggestions 다짐 서약 체크 트래킹
  const [agreedPromises, setAgreedPromises] = useState<Record<number, boolean>>({});

  const handleTogglePromise = (idx: number) => {
    soundManager.playClick();
    setAgreedPromises((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const activePromisesCount = question.suggestions
    ? question.suggestions.filter((_, idx) => agreedPromises[idx]).length
    : 0;

  const isAllAgreed = question.suggestions
    ? question.suggestions.every((_, idx) => agreedPromises[idx])
    : true;

  // Handle OX selection
  const handleOXAnswer = (answer: 'O' | 'X') => {
    setSelectedAns(answer);
    if (answer === question.correctAnswer) {
      soundManager.playCorrect();
      setMode('CORRECT');
    } else {
      soundManager.playWrong();
      setMode('WRONG');
      onSolveFailure(); // Trigger dizzy/re-animate state in parent map
    }
  };

  // Question 4 helper: Reveal cafeteria ideas
  const handleRevealSubjective = () => {
    soundManager.playClick();
    setMode('REVEALED');
  };

  // Question 4 final solve
  const handleFinishSubjective = () => {
    soundManager.playCorrect();
    onSolveSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-xl bg-white rounded-[40px] border-8 border-yellow-400 overflow-hidden shadow-2xl relative font-sans"
        >
          {/* Header Bar */}
          <div className="bg-yellow-400 py-4.5 px-6 text-slate-900 flex items-center justify-between border-b-4 border-slate-900">
            <span className="font-extrabold text-lg flex items-center gap-1.5">
              <span className="bg-white border-2 border-slate-905 text-slate-900 rounded-full px-3 py-0.5 text-xs font-black shadow-sm">
                과제 {checkpointId}
              </span>
              수수께끼 관문 돌파!
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs bg-white border-2 border-slate-900 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                윙윙이 에너지 가득
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* ASKING MODE */}
            {mode === 'ASKING' && (
              <div className="space-y-6">
                {/* Question bubble */}
                <div className="bg-sky-50 border-4 border-slate-800 rounded-3xl p-5 md:p-6 text-center relative">
                  <div className="absolute -top-3 left-6 bg-slate-900 text-white text-xs font-black px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <HelpCircle className="w-3.5 h-3.5 text-yellow-300" />
                     미션 질문
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-snug font-sans py-2">
                    {question.text}
                  </h2>
                </div>

                {/* Subtext info */}
                <div className="flex justify-center items-center gap-3">
                  <div className="w-16 h-16 shrink-0 bg-sky-50 p-1 border-2 border-dashed border-sky-200 rounded-full flex items-center justify-center">
                    <Bee expression="THINKING" isMoving={false} direction="right" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed bg-sky-50 rounded-xl p-2.5 max-w-md">
                    {question.type === 'OX' ? (
                      "친구들! O를 고를까요, X를 고를까요? 잘 생각해서 선택해 보세요!"
                    ) : (
                      "급식실에서 꿀벌들을 기후 변화로부터 지켜줄 다양한 실천 방안을 소리내어 발표해봐요!"
                    )}
                  </p>
                </div>

                {/* Answer Options */}
                {question.type === 'OX' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {/* BUTTON O */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOXAnswer('O')}
                      className="group flex flex-col items-center justify-center py-6 bg-emerald-50 hover:bg-emerald-100/90 border-4 border-emerald-450 hover:border-emerald-600 rounded-3xl text-emerald-700 font-extrabold cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span className="text-6xl md:text-7xl font-black font-display tracking-wide">O</span>
                      <span className="text-xs md:text-sm mt-3 text-emerald-800 bg-white border-2 border-emerald-300 px-3 py-1 rounded-full font-black group-hover:scale-105 transition-transform">
                        그렇다! 맞아요
                      </span>
                    </motion.button>

                    {/* BUTTON X */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOXAnswer('X')}
                      className="group flex flex-col items-center justify-center py-6 bg-red-50 hover:bg-red-100/90 border-4 border-red-300 hover:border-red-500 rounded-3xl text-red-600 font-extrabold cursor-pointer transition-all duration-150 shadow-md"
                    >
                      <span className="text-6xl md:text-7xl font-black font-display tracking-wide">X</span>
                      <span className="text-xs md:text-sm mt-3 text-red-800 bg-white border-2 border-red-300 px-3 py-1 rounded-full font-black group-hover:scale-105 transition-transform">
                        아니다! 틀려요
                      </span>
                    </motion.button>
                  </div>
                ) : (
                  // Subjective classroom interaction
                  <div className="space-y-4">
                    <div className="bg-sky-50 text-slate-800 border-4 border-dashed border-slate-300 rounded-2xl p-4 flex items-start gap-2 text-xs md:text-sm font-bold">
                      <MessageSquareDot className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <span>
                        급식실(식생활관) 꿀벌을 지키기 위한 수칙을 찾고 정답을 준비했다면 아래 버튼을 클릭하여 해답 예시를 확인해요!
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRevealSubjective}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-0 cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>💡 꿀벌 수호 실천 방법 확인하기!</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* CORRECT ANSWER POPUP */}
            {mode === 'CORRECT' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-emerald-100 border-4 border-emerald-450 text-emerald-700 rounded-full p-4 animate-bounce">
                    <Check className="w-12 h-12 stroke-[3.5]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-emerald-800">정답입니다! 완벽해요!! 🎉</h3>
                  <div className="bg-sky-50 border-4 border-dashed border-slate-300 rounded-2xl p-5 text-left shadow-inner">
                    <span className="font-extrabold text-xs text-yellow-600 uppercase tracking-widest block mb-1">
                      🔍 탐정 해설 단서:
                    </span>
                    <p className="text-sm md:text-base font-bold text-slate-800 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-3 bg-emerald-50 rounded-xl p-3.5 max-w-sm mx-auto border-2 border-emerald-100">
                  <div className="w-12 h-12 shrink-0">
                    <Bee expression="HAPPY" isMoving={true} direction="right" />
                  </div>
                  <span className="text-xs md:text-sm text-emerald-800 font-bold">
                    "최고예요! 덕분에 힘이 불끈 솟아나요! 다음 고개로 슝 가볼까요?"
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSolveSuccess}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-0 cursor-pointer flex items-center justify-center gap-2 shadow transition-all"
                >
                  <span>관문 통과! 전진하기</span>
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </motion.button>
              </div>
            )}

            {/* WRONG ANSWER POPUP ("DIE" / DEFEAT DETECTIVE RETRY STATE) */}
            {mode === 'WRONG' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-red-100 border-4 border-red-400 text-red-600 rounded-full p-4 animate-shake">
                    <X className="w-12 h-12 stroke-[3.5]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-red-700">틀렸어요! 으앗...!! 😭</h3>
                  <p className="text-sm md:text-base text-slate-700 font-bold leading-relaxed max-w-md mx-auto">
                    수수께끼가 너무 매서워 윙윙이 탐정님이 비틀거리다 쓰러져 버렸습니다!
                  </p>
                </div>

                {/* Dizzy bee visualization */}
                <div className="flex justify-center items-center gap-3 bg-red-50 rounded-xl p-4 max-w-sm mx-auto border-4 border-red-200">
                  <div className="w-16 h-16 shrink-0 bg-white border-2 border-slate-900 rounded-full p-1">
                    <Bee expression="DIZZY" isMoving={false} direction="left" />
                  </div>
                  <div className="text-left">
                    <span className="text-red-700 font-black text-xs block">🚨 탐정단 에너지 고갈!</span>
                    <span className="text-xs text-red-950 font-bold">
                      "으아아 머리가 핑그르르... 힘을 실어 부활시켜 줘!"
                    </span>
                  </div>
                </div>

                <div className="bg-sky-50 p-4 rounded-xl border-4 border-dashed border-slate-350 text-left text-xs md:text-sm text-slate-700 font-semibold leading-relaxed">
                  <span className="font-extrabold text-red-600">📖 다시 배우는 지식:</span> {question.explanation}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedAns(null);
                    setMode('ASKING');
                  }}
                  className="w-full py-4 bg-red-500 hover:bg-red-650 text-white font-black text-lg rounded-2xl border-b-8 border-red-700 active:translate-y-1 active:border-b-0 cursor-pointer flex items-center justify-center gap-2 shadow transition-all"
                >
                  <span>❤️ 하트로 기운 내어 부활하여 다시 풀기</span>
                </motion.button>
              </div>
            )}

            {/* SUBJECTIVE REVEAL DETAILS (Question 4 cafeteria practical action guide) */}
            {mode === 'REVEALED' && (
              <div className="space-y-6">
                <div className="bg-sky-50 border-4 border-slate-800 rounded-3xl p-5">
                  <h3 className="text-slate-900 font-black text-sm border-b-2 border-slate-200 pb-2 mb-3 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5 text-yellow-500 animate-bounce" />
                      생태 식생활관 꿀약속 4가지를 터치해 서약하세요!
                    </span>
                    <span className="text-xs bg-emerald-500 text-white border-2 border-slate-900 px-2.5 py-0.5 rounded-full font-black animate-pulse whitespace-nowrap">
                      {activePromisesCount} / 4개 서약
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {question.suggestions?.map((item, idx) => {
                      const isChecked = !!agreedPromises[idx];
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleTogglePromise(idx)}
                          className={`flex gap-3 items-center p-3.5 rounded-2xl border-4 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/90 border-emerald-500 shadow-md text-slate-905'
                              : 'bg-white border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <span className={`flex items-center justify-center border-2 border-slate-900 text-xs font-black rounded-xl w-7 h-7 shrink-0 transition-transform ${
                            isChecked ? 'bg-emerald-500 text-white scale-110 rotate-12' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {isChecked ? '✓' : idx + 1}
                          </span>
                          <div className="text-left flex-grow">
                            <p className={`text-xs md:text-sm font-black transition-all leading-snug ${isChecked ? 'text-emerald-950 font-black' : 'text-slate-650'}`}>
                              {item}
                            </p>
                          </div>
                          {isChecked && (
                            <span className="text-xl animate-bounce">🌱</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center items-center gap-3 bg-sky-50 rounded-xl p-3 border-2 border-slate-200">
                  <div className="w-12 h-12 shrink-0">
                    <Bee expression={isAllAgreed ? "HAPPY" : "THINKING"} isMoving={true} direction="right" />
                  </div>
                  <span className="text-xs text-slate-600 font-bold leading-normal">
                    {isAllAgreed 
                      ? "우와! 4가지 기후 꿀약속을 전부 다짐했어요! 아래 초록색 완료 버튼을 누르면 황금 꽃밭으로 기운차게 비행합니다!"
                      : "급식실 4대 약속 카드를 손가락으로 가볍게 톡톡 눌러서 다짐 서약을 4개 모두 정성껏 완료해 주세요!"
                    }
                  </span>
                </div>

                <motion.button
                  whileHover={isAllAgreed ? { scale: 1.02 } : {}}
                  whileTap={isAllAgreed ? { scale: 0.98 } : {}}
                  disabled={!isAllAgreed}
                  onClick={handleFinishSubjective}
                  className={`w-full py-4 text-white font-black text-lg rounded-2xl border-b-8 transition-all flex items-center justify-center gap-1.5 ${
                    isAllAgreed
                      ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 cursor-pointer shadow-md'
                      : 'bg-slate-300 border-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{isAllAgreed ? '🎉 기후 꿀약속 소중히 가슴에 품고 황금 꽃밭으로 출발!' : '🔒 4가지 약속 클릭 완료하기 (터치 터치!)'}</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
