/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, Checkpoint, GameStatus } from './types';
import { soundManager } from './utils/audio';

import Intro from './components/Intro';
import Outro from './components/Outro';
import GameMap from './components/GameMap';
import QuestionModal from './components/QuestionModal';

import {
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  RefreshCw,
  Search,
  BookOpen,
  ClipboardList,
  Flame,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';

// Questions database matching user's specifications exactly
// 꿀벌 수호를 위해 초등학교 3학년 영양교육용 6가지 맞춤 수수께끼 질문 데이터베이스입니다.
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "꿀벌은 독침을 가진 무서운 동물이라 보이는 즉시 잡아야 한다.",
    type: "OX",
    correctAnswer: "X",
    explanation: "꿀벌은 보이면 바로 잡거나 해쳐야 하는 해로운 곤충이 아니라, 식물의 열매를 맺게 돕는 소중한 '지구 지킴이'이자 '익충'이랍니다."
  },
  {
    id: 2,
    text: "꿀벌은 전 세계 100대 작물 중 31% 수분 활동에 관여한다.",
    type: "OX",
    correctAnswer: "X",
    explanation: "꿀벌은 전 세계 100대 작물 중 71% 수분 활동에 관여해요. 꿀벌이 사라지면 많은 과일과 채소들이 자라날 수 없답니다!"
  },
  {
    id: 3,
    text: "꿀벌이 사라지는 이유는 '지구온난화' 이다.",
    type: "OX",
    correctAnswer: "O",
    explanation: "지구온난화로 인한 이상 기후 때문에 꽃이 피는 시기가 어긋나 가루받이를 하기 힘들어지고 면역력이 떨어지는 등 꿀벌 생존이 어려워집니다."
  },
  {
    id: 4,
    text: "지구온난화의 가장 큰 원인은 공장과 자동차의 매연이다.",
    type: "OX",
    correctAnswer: "X",
    explanation: "UN 식량농업기구(FAO) 등에 따르면, 온실가스를 대량 내뿜는 대규모 '축산업'도 자동차 매연만큼 지구온난화의 매우 큰 주요 원인 중 하나입니다."
  },
  {
    id: 5,
    text: "고기를 한끼 안먹는 것만으로도 소나무 15그루를 심는 효과가 있다.",
    type: "OX",
    correctAnswer: "O",
    explanation: "고기(축산업) 대신 건강하고 신선한 채식을 단 한 끼 하는 것만으로도 온실가스 배출을 획기적으로 줄여, 소나무 15그루를 새로 심는 것과 똑같은 엄청난 온난화 방지 효과를 냅니다!"
  },
  {
    id: 6,
    text: "식생활관에서 꿀벌을 지키기 위한 4대 실천 방법을 확인하고 모두 지키기로 약속(서약)해 볼까요?",
    type: "SUBJECTIVE",
    correctAnswer: "ANY",
    explanation: "학교 식생활관(급식실)에서 아래 4가지 생태 꿀약속을 즐겁게 실천하면 온실가스를 줄이고 꿀벌이 살기 좋은 지구가 됩니다!",
    suggestions: [
      "💚 [지구사랑의 날] 매주 월요일은 고기없는날! 맛있는 채식을 하며 온실가스 배출을 줄이고 지구를 사랑하는 행동을 실천해요.",
      "🍽️ [수요일은다먹는날] 매주 수요일은 남김없이 다 먹도록 노력하는 날! 음식물 쓰레기를 줄여서 무서운 온실가스를 싹 퇴치해요.",
      "🚚 [로컬푸드의 날] 가까운 곳에서 온 먹거리를 이용하여 긴 수송 시간을 줄이고, 탄소 발생(매연)을 획기적으로 낮춘 상쾌한 밥상이에요.",
      "🌾 [친환경급식의날] 화학비료를 사용하지 않고 농약도 줄인 유기농 친환경 식재료로 꿀벌과 개구리가 함께 뛰노는 안전한 들판을 가꿔서 가져와요."
    ]
  },
];

// Definition of 6 Checkpoints with coordinates on the 100x100 Map
// 꿀벌이 머무는 지도 상의 6개 수색 구역입니다. 새 문항과 연계되어 위치 좌표 x, y가 점진적으로 연결됩니다.
const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    title: "1구간 (🍀 클로버 들판)",
    point: { x: 16, y: 37 },
    question: QUESTIONS[0],
  },
  {
    id: 2,
    title: "2구간 (🌹 장미 벌판)",
    point: { x: 33, y: 76 },
    question: QUESTIONS[1],
  },
  {
    id: 3,
    title: "3구간 (🌾 메밀꽃밭)",
    point: { x: 41, y: 24 },
    question: QUESTIONS[2],
  },
  {
    id: 4,
    title: "4구간 (🌻 해바라기 정원)",
    point: { x: 59, y: 76 },
    question: QUESTIONS[3],
  },
  {
    id: 5,
    title: "5구간 (🌸 벚꽃 동산)",
    point: { x: 76, y: 37 },
    question: QUESTIONS[4],
  },
  {
    id: 6,
    title: "6구간 (🌺 무궁화 꽃밭)",
    point: { x: 84, y: 76 },
    question: QUESTIONS[5],
  },
];

export default function App() {
  const [status, setStatus] = useState<GameStatus>('INTRO');
  const [teamName, setTeamName] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Checkpoint indexes:
  // 0 = Start Entrance
  // 1 = Reached Checkpoint 1, solved
  // 2 = Reached Checkpoint 2, solved
  // 3 = Reached Checkpoint 3, solved
  // 4 = Reached Checkpoint 4 (cafeteria solved)
  // 5 = At the Golden Queen Flower (finish)
  const [currentCheckpoint, setCurrentCheckpoint] = useState<number>(0);

  // States to coordinate active travel & modal trigger
  const [isBeeTravelling, setIsBeeTravelling] = useState<boolean>(false);
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);

  // Track which checkpoint segments are fully answered/solved (helps in sidebar coloring)
  const [solvedStages, setSolvedStages] = useState<Record<number, boolean>>({});

  // Background audio helper toggler
  const handleToggleMute = () => {
    const nextStatus = soundManager.toggleMute();
    setIsMuted(nextStatus);
  };

  // Init start
  const handleStartGame = (name: string) => {
    setTeamName(name);
    setCurrentCheckpoint(0);
    setSolvedStages({});
    setIsBeeTravelling(false);
    setActiveModalQuestion(null);
    setStatus('PLAYING');
  };

  // Flying triggers per segment
  const handleTriggerNextStage = () => {
    if (isBeeTravelling || activeModalQuestion) return;
    soundManager.playClick();
    // Move to next checkpoint index
    const nextCPTarget = currentCheckpoint + 1;
    setCurrentCheckpoint(nextCPTarget);
  };

  // Callback once bee lands on checkpoint id 1, 2, 3 or 4
  const handleReachCheckpointNode = (checkpointId: number) => {
    const targetCheckpointObj = CHECKPOINTS.find((c) => c.id === checkpointId);
    if (targetCheckpointObj) {
      setActiveModalQuestion(targetCheckpointObj.question);
    }
  };

  // Play success spin and clear modal popup action
  const handleSolveQuestionSuccess = () => {
    if (!activeModalQuestion) return;
    const solvedId = activeModalQuestion.id;
    
    setSolvedStages((prev) => ({ ...prev, [solvedId]: true }));
    setActiveModalQuestion(null);
  };

  // Play error feedback and set active dizzy state
  const handleSolveQuestionFailure = () => {
    // Dizzy triggers automatically inside child Bee / Modal
  };

  // Callback when bee finally lands on Goal Node (Point index 5)
  const handleReachGoalNode = () => {
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 700);
  };

  const restartToMainMenu = () => {
    setStatus('INTRO');
    setCurrentCheckpoint(0);
    setSolvedStages({});
    setIsBeeTravelling(false);
    setActiveModalQuestion(null);
  };

  return (
    <div className="w-full min-h-screen bg-sky-50 flex flex-col overflow-x-hidden antialiased select-none font-sans">
      {/* Intro Overlay Screen */}
      {status === 'INTRO' && (
        <Intro
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Outro Celebration Screen */}
      {status === 'SUCCESS' && (
        <Outro
          teamName={teamName}
          onRestart={restartToMainMenu}
        />
      )}

      {/* Main Playing Interface */}
      {status === 'PLAYING' && (
        <div className="flex-grow flex flex-col min-h-screen">
          {/* Main Top Header Banner */}
          <header className="bg-white border-b-8 border-slate-900 py-4 px-6 sticky top-0 z-30 shadow-md">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 py-1 bg-yellow-400 text-slate-900 border-4 border-slate-900 rounded-xl font-black shadow-sm animate-bounce">
                  🐝 Detective
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-1.5 leading-none">
                    꿀벌 실종 사건의 전말 🔍
                  </h1>
                  <span className="text-xs font-bold text-slate-500">
                    생태 모험 미로: 초등학교 3학년 영양식생활 교육
                  </span>
                </div>
              </div>

              {/* Classroom Team / Status badging details */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-1.5 bg-sky-50 text-slate-800 border-4 border-slate-900 rounded-full font-black text-sm shadow-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900 animate-ping" />
                  수사 탐정단: <strong className="text-emerald-800 text-base font-black">{teamName}</strong>
                </div>

                {/* Sound control toggle */}
                <button
                  onClick={handleToggleMute}
                  className="p-2.5 bg-white hover:bg-slate-50 text-slate-800 border-4 border-slate-900 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer text-xs font-black gap-1"
                  title="음소거 교체"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />}
                  <span>{isMuted ? "소리 켜기" : "소리 끄기"}</span>
                </button>

                {/* Quick Reset for next student group */}
                <button
                  onClick={() => {
                    if (window.confirm('처음 화면으로 돌아갈까요? 진행상황이 초기화됩니다.')) {
                      restartToMainMenu();
                    }
                  }}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border-4 border-slate-900 transition-all font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  리셋
                </button>
              </div>
            </div>
          </header>

          {/* Core Content Body (Bento Map & Sidebar) */}
          <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LARGE BOARD: The Interactive Garden Maze Map Container (cols 1-3) */}
            <section className="lg:col-span-3 bg-white rounded-[40px] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col h-[65vh] lg:h-[75vh] min-h-[480px]">
              
              {/* Map Title Guard */}
              <div className="bg-yellow-400 text-slate-900 font-extrabold px-6 py-3.5 flex items-center justify-between border-b-4 border-slate-900">
                <span className="flex items-center gap-1.5 text-sm md:text-base font-black">
                  <Search className="w-4.5 h-4.5 text-slate-900 animate-pulse" />
                  실시간 사건 현장 미로 지도 🗺️
                </span>
                <span className="text-xs bg-white border-2 border-slate-900 px-3 py-1 rounded-full text-slate-800 font-black">
                  현재 위치: {currentCheckpoint === 0 ? '출발 지점' : currentCheckpoint === 7 ? '최종 목적지' : `${currentCheckpoint}단계 완료`}
                </span>
              </div>

              {/* Game Map component */}
              <div className="flex-grow min-h-0 relative">
                <GameMap
                  currentCheckpoint={currentCheckpoint}
                  checkpoints={CHECKPOINTS}
                  solvedStages={solvedStages}
                  isBeeTravelling={isBeeTravelling}
                  setIsBeeTravelling={setIsBeeTravelling}
                  onReachCheckpoint={handleReachCheckpointNode}
                  onReachGoal={handleReachGoalNode}
                />
              </div>
            </section>

            {/* SIDEBOARD PANEL: Investigation Control & Learning Log (col 4) */}
            <section className="lg:col-span-1 flex flex-col gap-5">
              
              {/* Box 1: Core Action Control Panel */}
              <div className="bg-white rounded-[32px] border-8 border-slate-900 p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="font-black text-xs md:text-sm text-slate-650 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-yellow-600" />
                     수사 지휘 제어반
                  </h3>

                  {/* Context Sensitive Button */}
                  <div className="space-y-4">
                    {/* Bee is moving - Lock */}
                    {isBeeTravelling && (
                      <div className="bg-sky-50 border-4 border-slate-900 text-slate-900 rounded-2xl p-4 text-center font-black text-xs md:text-sm flex flex-col items-center justify-center gap-2 animate-pulse">
                        <span className="text-2xl">🐝✈️</span>
                        <span>"윙윙이 탐정님이 부지런히 날아가고 있습니다! 잠시만 기다려주세요!"</span>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1 border-2 border-slate-900">
                          <div className="bg-yellow-400 h-full w-2/3 rounded-full animate-[progress_1s_infinite_linear]" />
                        </div>
                      </div>
                    )}

                    {/* Waiting at starting node */}
                    {!isBeeTravelling && currentCheckpoint === 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 leading-relaxed font-bold">
                          탐정단 친구들! 사건 단서를 수집하기 위해 첫 번째 벌판(수분 작물 구역)을 향해 윙윙이 탐정을 출동시켜 주세요!
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleTriggerNextStage}
                          className="w-full py-4.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-lg rounded-2xl border-b-8 border-yellow-700 active:translate-y-1 active:border-b-0 cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Zap className="w-5 h-5 text-slate-900 animate-bounce" />
                          <span>1단계 출동하기! 🚀</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Checkpoint Solved Node Waiting for Next Node Trigger */}
                    {!isBeeTravelling && currentCheckpoint > 0 && currentCheckpoint < 6 && solvedStages[currentCheckpoint] && (
                      <div className="space-y-2">
                        <div className="bg-sky-50 border-4 border-dashed border-slate-300 rounded-2xl p-3 text-xs text-slate-705 font-bold leading-normal">
                          🎉 {currentCheckpoint}단계를 무사히 해결했어요! 다음 힌트 수수께끼로 가볼까요?
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleTriggerNextStage}
                          className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-black text-base rounded-2xl border-b-8 border-yellow-700 active:translate-y-1 active:border-b-0 shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>{currentCheckpoint + 1}단계 관문 출발! 🚀</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Checkpoint Solved completely, ready to go to the Flower King */}
                    {!isBeeTravelling && currentCheckpoint === 6 && solvedStages[6] && (
                      <div className="space-y-2">
                        <div className="bg-yellow-50 border-4 border-dashed border-yellow-400 rounded-2xl p-3 text-xs text-slate-700 font-bold leading-normal animate-pulse">
                          🌟 모든 수수께끼를 통과했어요! 꿀벌들이 기다리는 최종 목적지 꽃밭으로 힘차게 날아갑니다!
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleTriggerNextStage}
                          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base rounded-2xl border-b-8 border-emerald-700 active:translate-y-1 active:border-b-0 shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trophy className="w-5 h-5 text-yellow-300 animate-spin" />
                          <span>최종 목적지로 전진! 🌸</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Currently answering question (User must solve inside modal popup) */}
                    {!isBeeTravelling && currentCheckpoint > 0 && !solvedStages[currentCheckpoint] && (
                      <div className="bg-red-50 border-4 border-red-300 text-red-955 rounded-2xl p-4 text-center font-bold text-xs leading-relaxed space-y-2 animate-bounce">
                        <div className="text-xl">⚠️</div>
                        <p>
                          <strong>{currentCheckpoint}구간 수수께끼 게이트가 나타났습니다!</strong>
                          <br /> 문제를 맞춰야만 미로 벽을 무너뜨려 계속 앞으로 나아갈 수 있어요!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 2: Detective Briefing Board */}
              <div className="flex-grow bg-white rounded-[32px] border-8 border-slate-900 p-5 flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="font-black text-xs md:text-sm text-slate-650 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-yellow-600" />
                     수사 일지 & 핵심 지식
                  </h3>

                  {/* Stage Tracking Blocks */}
                  <div className="space-y-3">
                    {QUESTIONS.map((q) => {
                      const isComplete = solvedStages[q.id];
                      const isCurrent = currentCheckpoint === q.id && !isComplete;

                      return (
                        <div
                          key={q.id}
                          className={`border-4 rounded-2xl p-3 transition-colors ${
                            isComplete
                              ? 'bg-emerald-50/50 border-emerald-400 text-slate-800'
                              : isCurrent
                              ? 'bg-yellow-50 border-yellow-400 text-slate-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              단서 {q.id}구간
                            </span>
                            {isComplete ? (
                              <span className="text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full border border-slate-900 shadow-sm">
                                수사 완료
                              </span>
                            ) : isCurrent ? (
                              <span className="text-[9px] bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded-full border border-slate-900 animate-pulse">
                                단서 추적 중
                              </span>
                            ) : (
                              <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-300">
                                대기 중
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-black font-sans leading-tight text-slate-800">
                            {q.id === 1 && "꿀벌은 무서운 동물 또는 해충?"}
                            {q.id === 2 && "꿀벌의 수분 기여력 수준"}
                            {q.id === 3 && "꿀벌 집단 실종의 주 원인"}
                            {q.id === 4 && "지구온난화의 뜻밖의 배후 세력"}
                            {q.id === 5 && "고기 한 끼와 소나무의 관련 원리"}
                            {q.id === 6 && "식생활관(급식실) 실천 꿀약속"}
                          </p>
                          
                          {isComplete && (
                            <p className="text-[10px] text-slate-600 font-bold mt-1.5 bg-white/80 border-2 border-slate-100 rounded-lg p-1.5 leading-snug">
                              🎯 해설: {q.id === 1 ? '지구 지킴이, 이로운 익충!' : q.id === 2 ? '세계 100대 작물 중 무려 71% 수분 활동!' : q.id === 3 ? '기후위기 지구온난화 위협 때문!' : q.id === 4 ? '공장 매연보다 기후 주범은 대형 축산업!' : q.id === 5 ? '고기를 단 한 끼 줄이면 소나무 15그루 가량의 기후 보호!' : '남김없이 다 먹기, 친환경 산물 사랑하기!'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom learning motivation text */}
                <div className="mt-4 bg-sky-50 p-2.5 rounded-xl border-2 border-slate-200 text-center text-[10px] md:text-xs font-black text-slate-700 leading-snug">
                  🐝 꿀벌을 아는 것이 우리 지구를 지키는 위대한 기후 지식의 첫걸음입니다!
                </div>
              </div>
            </section>
          </main>
        </div>
      )}

      {/* POPUP REUSABLE QUESTION COMPONENT */}
      <AnimatePresence>
        {activeModalQuestion && !isBeeTravelling && (
          <div key={activeModalQuestion.id}>
            <QuestionModal
              question={activeModalQuestion}
              checkpointId={activeModalQuestion.id}
              onSolveSuccess={handleSolveQuestionSuccess}
              onSolveFailure={handleSolveQuestionFailure}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
