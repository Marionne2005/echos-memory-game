import { useState, useEffect, useRef } from 'react';
import bgBoard from './assets/bg-board.jpg';
import bgTiles from './assets/bg-tiles.jpg';
import './App.css';

const THEMES = {
  animaux: { label: 'Animaux', icon: '🐾', items: ['🦁', '🐰', '🦊', '🐢', '🐼', '🦉', '🐸', '🦋', '🐳', '🦒'] },
  nature: { label: 'Nature', icon: '🍃', items: ['🌿', '🌸', '🍁', '🌵', '🍄', '🌻', '🪨', '🌊', '☀️', '⛰️'] },
  espace: { label: 'Espace', icon: '🚀', items: ['🪐', '🌙', '⭐', '☄️', '🛰️', '🌌', '🔭', '👨‍🚀', '🌠', '🛸'] },
};

const LEVELS = {
  debutant: { label: 'Débutant', pairs: 6, columns: 3 },
  avance: { label: 'Avancé', pairs: 10, columns: 4 },
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(themeKey, levelKey) {
  const theme = THEMES[themeKey];
  const level = LEVELS[levelKey];
  const chosen = theme.items.slice(0, level.pairs);
  const deck = shuffle([...chosen, ...chosen]).map((symbol, index) => ({
    id: `${index}-${symbol}`,
    symbol,
    isMatched: false,
  }));
  return deck;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s.toString().padStart(2, '0')} s`;
}

function SetupScreen({ onStart }) {
  const [level, setLevel] = useState('debutant');
  const [theme, setTheme] = useState('nature');

  return (
    <div className="screen setup-screen">
      <header className="brand">
        <h1>Échos</h1>
        <p className="tagline">Un jeu de mémoire pour s'exercer à son rythme</p>
      </header>

      <section className="setup-section">
        <p className="setup-label">Niveau</p>
        <div className="level-options">
          {Object.entries(LEVELS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={`level-option ${level === key ? 'is-selected' : ''}`}
              onClick={() => setLevel(key)}
            >
              <span className="level-name">{value.label}</span>
              <span className="level-meta">{value.pairs} paires</span>
            </button>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <p className="setup-label">Thème</p>
        <div className="theme-select-wrap">
          <select
            className="theme-select"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {Object.entries(THEMES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.icon} {value.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <button type="button" className="primary-button" onClick={() => onStart(level, theme)}>
        Commencer
      </button>
    </div>
  );
}

function GameScreen({ level, theme, onFinish }) {
  const levelInfo = LEVELS[level];
  const [deck, setDeck] = useState(() => buildDeck(theme, level));
  const [flipped, setFlipped] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [mismatchIds, setMismatchIds] = useState([]);
  const [feedback, setFeedback] = useState('Trouvez les paires.');
  const [seconds, setSeconds] = useState(0);
  const lockRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const totalPairs = levelInfo.pairs;
    if (matchedIds.length === totalPairs * 2) {
      const timeout = setTimeout(() => onFinish({ moves, seconds }), 600);
      return () => clearTimeout(timeout);
    }
  }, [matchedIds, levelInfo.pairs, moves, seconds, onFinish]);

  function handleCardClick(card) {
    if (lockRef.current) return;
    if (flipped.includes(card.id) || matchedIds.includes(card.id)) return;

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);
    setMismatchIds([]);

    if (nextFlipped.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const first = deck.find((c) => c.id === firstId);
      const second = deck.find((c) => c.id === secondId);

      if (first.symbol === second.symbol) {
        setFeedback('Belle paire !');
        setTimeout(() => {
          setMatchedIds((prev) => [...prev, firstId, secondId]);
          setFlipped([]);
          lockRef.current = false;
        }, 500);
      } else {
        setFeedback('Pas de paire cette fois. Prenez votre temps.');
        setMismatchIds([firstId, secondId]);
        setTimeout(() => {
          setFlipped([]);
          setMismatchIds([]);
          lockRef.current = false;
        }, 900);
      }
    }
  }

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <p className="game-title">Échos — niveau {levelInfo.label.toLowerCase()}</p>
        <div className="game-stats">
          <span>Coups : {moves}</span>
          <span>Paires : {matchedIds.length / 2} / {levelInfo.pairs}</span>
        </div>
      </div>

      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${levelInfo.columns}, 1fr)` }}
      >
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);
          const isMismatch = mismatchIds.includes(card.id);
          return (
            <button
              type="button"
              key={card.id}
              className={`card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''} ${isMismatch ? 'is-mismatch' : ''}`}
              onClick={() => handleCardClick(card)}
              aria-label={isFlipped ? card.symbol : 'Carte cachée'}
            >
              <span className="card-face card-back">
                <span className="card-back-icon">{THEMES[theme].icon}</span>
              </span>
              <span className="card-face card-front">{card.symbol}</span>
            </button>
          );
        })}
      </div>

      <p className={`feedback ${mismatchIds.length ? 'is-error' : ''}`}>{feedback}</p>
    </div>
  );
}

function ResultScreen({ moves, seconds, onRestart }) {
  return (
    <div className="screen result-screen">
      <p className="result-heading">Bien joué.</p>
      <p className="result-sub">Vous avez terminé en {moves} coups.</p>

      <div className="result-stats">
        <div className="result-stat">
          <p className="result-stat-label">Coups</p>
          <p className="result-stat-value">{moves}</p>
        </div>
        <div className="result-stat">
          <p className="result-stat-label">Temps</p>
          <p className="result-stat-value">{formatTime(seconds)}</p>
        </div>
      </div>

      <button type="button" className="primary-button" onClick={onRestart}>
        Recommencer
      </button>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState('setup');
  const [config, setConfig] = useState({ level: 'debutant', theme: 'nature' });
  const [result, setResult] = useState({ moves: 0, seconds: 0 });

  function handleStart(level, theme) {
    setConfig({ level, theme });
    setStage('game');
  }

  function handleFinish({ moves, seconds }) {
    setResult({ moves, seconds });
    setStage('result');
  }

  function handleRestart() {
    setStage('setup');
  }

  return (
    <div
      className="app-shell"
      style={{ backgroundImage: `url(${stage === 'setup' ? bgBoard : bgTiles})` }}
    >
      <div className="app-overlay" />
      {stage === 'setup' && <SetupScreen onStart={handleStart} />}
      {stage === 'game' && (
        <GameScreen level={config.level} theme={config.theme} onFinish={handleFinish} />
      )}
      {stage === 'result' && (
        <ResultScreen moves={result.moves} seconds={result.seconds} onRestart={handleRestart} />
      )}
    </div>
  );
}
