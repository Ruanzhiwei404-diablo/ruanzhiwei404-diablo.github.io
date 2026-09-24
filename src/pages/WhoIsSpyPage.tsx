import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pickRandomPair, shuffle, type WordPair } from '../data/whoIsSpyWords';

type Role = 'civilian' | 'spy';
type Player = { id: number; role: Role; word: string; alive: boolean };
type Phase = 'setup' | 'deal' | 'describe' | 'vote' | 'result';
type Winner = 'civilian' | 'spy';

const GRAD = 'linear-gradient(135deg, #a855f7, #ec4899)';
const GRAD_SOFT = 'linear-gradient(90deg, #a855f7, transparent)';

function startGame(count: number, spies: number): { players: Player[]; pair: WordPair } {
  const pair = pickRandomPair();
  const ids = Array.from({ length: count }, (_, i) => i);
  const spyIds = new Set(shuffle(ids).slice(0, spies));
  const players: Player[] = ids.map((id) => ({
    id,
    role: spyIds.has(id) ? 'spy' : 'civilian',
    word: spyIds.has(id) ? pair.spy : pair.civilian,
    alive: true,
  }));
  return { players, pair };
}

export default function WhoIsSpyPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [playerCount, setPlayerCount] = useState(5);
  const [spyCount, setSpyCount] = useState(1);

  const [players, setPlayers] = useState<Player[]>([]);
  const [pair, setPair] = useState<WordPair | null>(null);
  const [round, setRound] = useState(1);

  // 发牌
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // 描述
  const [speakerPos, setSpeakerPos] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // 投票
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [voteCursor, setVoteCursor] = useState(0);
  const [tieRunoff, setTieRunoff] = useState<number[] | null>(null);
  const [voteTarget, setVoteTarget] = useState<number | null>(null);

  // 结算
  const [winner, setWinner] = useState<Winner | null>(null);

  const alivePlayers = players.filter((p) => p.alive);
  const speakerOrder = alivePlayers; // 按 id 顺序即为本轮发言顺序
  const currentSpeaker = speakerOrder[speakerPos];
  const voteOrder = alivePlayers;
  const currentVoter = voteOrder[voteCursor];

  // 重新开局（沿用当前设置）
  const beginGame = useCallback(() => {
    const { players: ps, pair: pr } = startGame(playerCount, spyCount);
    setPlayers(ps);
    setPair(pr);
    setRound(1);
    setRevealIndex(0);
    setRevealed(false);
    setSpeakerPos(0);
    setVotes({});
    setVoteCursor(0);
    setTieRunoff(null);
    setVoteTarget(null);
    setWinner(null);
    setPhase('deal');
  }, [playerCount, spyCount]);

  // 描述结束 / 进入投票
  const handleDescribeEnd = useCallback(() => {
    if (speakerPos + 1 >= speakerOrder.length) {
      setPhase('vote');
      setVotes({});
      setVoteCursor(0);
      setTieRunoff(null);
      setVoteTarget(null);
    } else {
      setSpeakerPos(speakerPos + 1);
    }
  }, [speakerPos, speakerOrder.length]);

  // 描述阶段 30s 倒计时
  useEffect(() => {
    if (phase !== 'describe') return;
    setTimeLeft(30);
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase, speakerPos, round]);

  // 倒计时归零 → 自动结束本轮发言 / 进入投票
  useEffect(() => {
    if (phase === 'describe' && timeLeft === 0) {
      handleDescribeEnd();
    }
  }, [timeLeft, phase, handleDescribeEnd]);

  // 投票结算：计票 → 淘汰最高票 / 平票加时
  const tally = useCallback(() => {
    const counts: Record<number, number> = {};
    Object.values(votes).forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts));
    const candidates = Object.keys(counts)
      .filter((k) => counts[+k] === max)
      .map(Number);

    if (candidates.length === 1) {
      eliminate(candidates[0]);
    } else {
      // 平票 → 仅对候选人间加时重投
      setTieRunoff(candidates);
      setVotes({});
      setVoteCursor(0);
      setVoteTarget(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes, players]);

  const eliminate = (targetId: number) => {
    const next = players.map((p) => (p.id === targetId ? { ...p, alive: false } : p));
    setPlayers(next);
    const spiesLeft = next.filter((p) => p.alive && p.role === 'spy').length;
    const civsLeft = next.filter((p) => p.alive && p.role === 'civilian').length;
    if (spiesLeft === 0) {
      setWinner('civilian');
      setPhase('result');
    } else if (spiesLeft >= civsLeft) {
      setWinner('spy');
      setPhase('result');
    } else {
      setRound((r) => r + 1);
      setPhase('describe');
      setSpeakerPos(0);
    }
  };

  // 投票完成 → 计票
  useEffect(() => {
    if (phase === 'vote' && voteCursor >= voteOrder.length && Object.keys(votes).length > 0) {
      tally();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteCursor, phase]);

  const confirmVote = () => {
    if (voteTarget === null || !currentVoter) return;
    const nextVotes = { ...votes, [currentVoter.id]: voteTarget };
    setVotes(nextVotes);
    setVoteTarget(null);
    setVoteCursor((c) => c + 1);
  };

  const maxSpy = Math.min(2, playerCount - 1);

  // ============ 渲染 ============
  return (
    <div className="max-w-[860px] mx-auto py-8 px-6 w-full">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
          <span>🕵️</span> 谁是卧底
        </h1>
        <p className="text-[13.5px] text-gray-500">
          多人推理派对游戏 · 平民找出卧底，卧底隐藏身份
        </p>
      </div>

      {/* 设置 */}
      {phase === 'setup' && (
        <div className="card p-7">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: GRAD_SOFT }}
          />
          <div className="text-center text-sm text-gray-400 mb-6">
            💡 3-10 人都能玩，推荐 5-8 人效果最好。大家轮流用同一台设备查看身份与投票。
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="text-sm font-semibold text-gray-300">👥 玩家人数</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const n = Math.max(3, playerCount - 1);
                  setPlayerCount(n);
                  setSpyCount((s) => Math.min(s, n - 1));
                }}
                className="w-9 h-9 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7]/40 text-lg font-bold text-[#d8b4fe]"
              >
                −
              </button>
              <span className="w-8 text-center text-xl font-bold text-text-bright">
                {playerCount}
              </span>
              <button
                onClick={() => setPlayerCount((n) => Math.min(10, n + 1))}
                className="w-9 h-9 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7]/40 text-lg font-bold text-[#d8b4fe]"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-7">
            <span className="text-sm font-semibold text-gray-300">🎭 卧底人数</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpyCount((s) => Math.max(1, s - 1))}
                disabled={spyCount <= 1}
                className="w-9 h-9 rounded-lg bg-[#ec4899]/20 hover:bg-[#ec4899]/40 text-lg font-bold text-[#fbcfe8] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-8 text-center text-xl font-bold text-text-bright">
                {spyCount}
              </span>
              <button
                onClick={() => setSpyCount((s) => Math.min(maxSpy, s + 1))}
                disabled={spyCount >= maxSpy}
                className="w-9 h-9 rounded-lg bg-[#ec4899]/20 hover:bg-[#ec4899]/40 text-lg font-bold text-[#fbcfe8] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={beginGame}
            className="w-full rounded-xl py-3.5 font-bold text-white text-base"
            style={{ background: GRAD }}
          >
            🎮 开始游戏
          </button>
        </div>
      )}

      {/* 发牌 */}
      {phase === 'deal' && (
        <div className="card p-7 text-center">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: GRAD_SOFT }}
          />
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-2">
            发牌阶段 · DEAL
          </div>
          <h2 className="text-lg font-bold text-text-bright mb-1">
            玩家 {revealIndex + 1} / {players.length}
          </h2>
          <p className="text-xs text-gray-500 mb-6">点击卡片查看你的身份，别让其他人看到！</p>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="mx-auto w-40 h-52 rounded-2xl border-2 border-dashed border-[rgba(168,85,247,0.5)] bg-[rgba(168,85,247,0.06)] flex flex-col items-center justify-center gap-2 hover:bg-[rgba(168,85,247,0.12)] transition-colors"
            >
              <span className="text-4xl">🎴</span>
              <span className="text-sm text-[#d8b4fe]">👆 点击翻开</span>
            </button>
          ) : (
            <div
              className="mx-auto w-40 rounded-2xl p-5 flex flex-col items-center gap-2"
              style={{
                background:
                  players[revealIndex].role === 'spy'
                    ? 'linear-gradient(160deg, rgba(236,72,153,0.18), rgba(219,39,119,0.10))'
                    : 'linear-gradient(160deg, rgba(34,211,238,0.16), rgba(168,85,247,0.10))',
                border:
                  players[revealIndex].role === 'spy'
                    ? '2px solid rgba(236,72,153,0.6)'
                    : '2px solid rgba(34,211,238,0.5)',
              }}
            >
              <div className="text-3xl font-extrabold text-text-bright">
                {players[revealIndex].word}
              </div>
              <div
                className="mt-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background:
                    players[revealIndex].role === 'spy'
                      ? 'rgba(236,72,153,0.25)'
                      : 'rgba(34,211,238,0.22)',
                  color: players[revealIndex].role === 'spy' ? '#fbcfe8' : '#a5f3fc',
                }}
              >
                {players[revealIndex].role === 'spy' ? '🕵️ 卧底' : '👤 平民'}
              </div>
            </div>
          )}

          <div className="mt-7">
            {revealIndex + 1 < players.length ? (
              <button
                onClick={() => {
                  setRevealed(false);
                  setRevealIndex((i) => i + 1);
                }}
                disabled={!revealed}
                className="rounded-xl px-6 py-3 font-bold text-white disabled:opacity-30"
                style={{ background: GRAD }}
              >
                下一位玩家 →
              </button>
            ) : (
              <button
                onClick={() => {
                  setRevealed(false);
                  setPhase('describe');
                  setSpeakerPos(0);
                }}
                disabled={!revealed}
                className="rounded-xl px-6 py-3 font-bold text-white disabled:opacity-30"
                style={{ background: GRAD }}
              >
                ✅ 全部就位，开始第 1 轮
              </button>
            )}
          </div>
        </div>
      )}

      {/* 描述 */}
      {phase === 'describe' && currentSpeaker && (
        <div className="card p-7 text-center">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: GRAD_SOFT }}
          />
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mb-1">
            <span className="px-2 py-0.5 rounded bg-[rgba(168,85,247,0.12)] text-[#d8b4fe] font-mono">
              第 {round} 轮
            </span>
            <span>
              剩余 {alivePlayers.length} 人 · 卧底 {alivePlayers.filter((p) => p.role === 'spy').length} 人
            </span>
          </div>
          <div className="text-5xl font-extrabold my-4" style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {timeLeft}
          </div>

          <div className="text-sm text-gray-400 mb-1">
            轮到 <span className="font-bold text-[#d8b4fe]">玩家 {currentSpeaker.id + 1}</span> 描述
          </div>
          <div className="text-xs text-gray-500 mb-4">不能说词里的字，也不能说同音字</div>

          <div className="mx-auto w-44 rounded-2xl p-5 mb-5 flex flex-col items-center gap-2"
            style={{
              background: 'linear-gradient(160deg, rgba(168,85,247,0.14), rgba(236,72,153,0.08))',
              border: '2px solid rgba(168,85,247,0.45)',
            }}
          >
            <div className="text-3xl font-extrabold text-text-bright">{currentSpeaker.word}</div>
            <div className="text-xs text-gray-400">这是你的词</div>
          </div>

          <button
            onClick={handleDescribeEnd}
            className="rounded-xl px-6 py-3 font-bold text-white"
            style={{ background: GRAD }}
          >
            ⏭️ 描述结束，进入投票
          </button>
        </div>
      )}

      {/* 投票 */}
      {phase === 'vote' && currentVoter && (
        <div className="card p-7 text-center">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: GRAD_SOFT }}
          />
          <div className="text-xs font-mono text-gray-500 tracking-widest mb-1">
            {tieRunoff ? '平票加时 · RUNOFF' : '投票阶段 · VOTE'}
          </div>
          <h2 className="text-lg font-bold text-text-bright mb-1">
            玩家 {currentVoter.id + 1}，请投票
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            {tieRunoff ? '平票！仅在以下玩家中重新投票：' : '选出你认为是卧底的人（不能投自己）'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {(tieRunoff ?? alivePlayers.map((p) => p.id))
              .filter((id) => id !== currentVoter.id)
              .map((id) => (
                <button
                  key={id}
                  onClick={() => setVoteTarget(id)}
                  className="rounded-xl py-3 font-bold transition-colors"
                  style={{
                    background: voteTarget === id ? GRAD : 'rgba(255,255,255,0.04)',
                    border: voteTarget === id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: voteTarget === id ? '#fff' : '#e2e8f0',
                  }}
                >
                  玩家 {id + 1}
                </button>
              ))}
          </div>

          <button
            onClick={confirmVote}
            disabled={voteTarget === null}
            className="rounded-xl px-6 py-3 font-bold text-white disabled:opacity-30"
            style={{ background: GRAD }}
          >
            ✅ 确认投票
            {voteCursor + 1 < voteOrder.length ? '（下一位）' : ''}
          </button>
        </div>
      )}

      {/* 结算 */}
      {phase === 'result' && pair && (
        <div className="card p-7 text-center">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: GRAD_SOFT }}
          />
          <div className="text-5xl mb-3">{winner === 'civilian' ? '🎉' : '🕵️'}</div>
          <h2
            className="text-2xl font-extrabold mb-1"
            style={{ color: winner === 'civilian' ? '#a5f3fc' : '#fbcfe8' }}
          >
            {winner === 'civilian' ? '平民获胜！' : '卧底获胜！'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {winner === 'civilian' ? '卧底被找出来了！' : '卧底成功隐藏到了最后！'}
          </p>

          <div className="rounded-xl border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.05)] p-5 mb-6 text-left">
            <div className="text-xs font-mono text-gray-500 tracking-widest mb-3 text-center">
              🔍 本局答案
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">平民词</div>
                <div className="text-2xl font-extrabold text-[#a5f3fc]">{pair.civilian}</div>
              </div>
              <div className="text-gray-600 text-xl">vs</div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">卧底词</div>
                <div className="text-2xl font-extrabold text-[#fbcfe8]">{pair.spy}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={beginGame}
              className="rounded-xl px-6 py-3 font-bold text-white"
              style={{ background: GRAD }}
            >
              🔄 再玩一局
            </button>
            <button
              onClick={() => setPhase('setup')}
              className="rounded-xl px-6 py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              ⚙️ 重新设置
            </button>
          </div>
        </div>
      )}

      {/* 返回 */}
      <div className="mt-6 text-center">
        <Link
          to="/game-center"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 返回游戏中心
        </Link>
      </div>
    </div>
  );
}
