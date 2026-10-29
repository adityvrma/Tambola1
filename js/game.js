const STORAGE_KEY = 'DIWALI_TAMBOLA_DATA_V1';
const ADMIN_CREDENTIALS = { id: 'admin', pass: 'diwali123' };

const syncChannel = ('BroadcastChannel' in window)
  ? new BroadcastChannel('diwali_tambola_sync')
  : null;

// Fun Desi Diwali + Classic Tambola Callout Lingo (1 to 90)
const TAMBOLA_LINGO = {
  1: "Ekka Shagun Ka! 🪔",
  2: "Kaala Dhan / One Little Duck 🦆",
  3: "Teen Tigada Kaam Bigada ✨",
  4: "Chaar Yaar Milke Khelo 🎆",
  5: "Shagun Ke Paanch 🖐️",
  6: "Chhakka! Super Sixer 🏏",
  7: "Lucky Seven - Saat Phere 🌟",
  8: "Big Fat Lady (Number 8) 🍬",
  9: "Navratri Ke Nau Din 🙏",
  10: "ek aur zero - Dus Numbri 🎉",
  11: "Gyarah - Doosri Diwali Ki Gyarah 🪔",
  13: "Unlucky for Some, Lucky for You! 🍀",
  16: "Sweet Sixteen ✨",
  21: "Shagun ka Ikkis Rupaiya 💰",
  22: "Two Little Ducks (22) 🦆🦆",
  25: "Silver Jubilee Celebration 🪙",
  33: "All the Threes - Dirty Knees 🔥",
  44: "Chor-Chor / All the Fours! 🚨",
  50: "Half Century! पचास का तड़का 🏏",
  55: "Pachpan Ki Umar, Bachpan Ka Dil 💛",
  66: "Chhakke Pe Chhakka (66) 🚀",
  69: "Ulta Pulta (69) 😂",
  77: "Two Hockey Sticks (77) 🏑",
  88: "Two Fat Ladies (88) 💃",
  89: "All But One (Ab Bus 90 Baki!) ⚡",
  90: "Top of the House - Sabse Bada 90! 🏆"
};

function getNumberLingo(num) {
  if (!num) return "Diwali Tambola Live!";
  if (TAMBOLA_LINGO[num]) return TAMBOLA_LINGO[num];
  if (num < 10) return `Single Digit Shagun #${num} 🪔`;
  if (num % 10 === 0) return `Round Figure Dhamaka ${num}! 🎆`;
  return `Lucky Diwali Number ${num} ✨`;
}

function getDefaultPrizes() {
  return {
    earlyFive: { key: 'earlyFive', name: 'Early Five', sub: 'FIRST 5 NUMBERS', icon: '🎆', status: 'open', winner: null },
    topLine: { key: 'topLine', name: 'Top Line', sub: 'UPAR KI DIYA LINE', icon: '🪔', status: 'open', winner: null },
    middleLine: { key: 'middleLine', name: 'Middle Line', sub: 'BEECH KI MITHAI', icon: '🍬', status: 'open', winner: null },
    bottomLine: { key: 'bottomLine', name: 'Bottom Line', sub: 'NEECHE KA LADDOO', icon: '🟠', status: 'open', winner: null },
    fourCorners: { key: 'fourCorners', name: 'Four Corners', sub: 'RANGOLI CORNERS', icon: '✨', status: 'open', winner: null },
    fullHouse: { key: 'fullHouse', name: 'Full House', sub: 'FULL THALI', icon: '🏆', status: 'open', winner: null }
  };
}

function getTimeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getGameState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initialState = {
      round: 1,
      status: 'active',
      popupDismissedForRound: 0,
      calledNumbers: [],
      lastCalled: null,
      prizes: getDefaultPrizes(),
      players: {},
      lastReaction: null,
      activity: [
        { text: 'Round 1 started by Host.', time: getTimeStr() }
      ],
      pastRounds: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  return JSON.parse(raw);
}

function saveGameState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (syncChannel) {
    syncChannel.postMessage({ type: 'STATE_UPDATED' });
  }
}

function addActivity(state, message) {
  state.activity.unshift({
    text: message,
    time: getTimeStr()
  });
  if (state.activity.length > 80) {
    state.activity.pop();
  }
}

// Broadcast Live Emoji Reaction across all open tabs
function sendLiveReaction(emoji, senderName) {
  const state = getGameState();
  const reactionObj = {
    id: Date.now() + Math.random(),
    emoji: emoji,
    sender: senderName || 'Guest'
  };
  state.lastReaction = reactionObj;
  addActivity(state, `${reactionObj.sender} reacted ${emoji}`);
  saveGameState(state);
  if (syncChannel) {
    syncChannel.postMessage({ type: 'LIVE_REACTION', data: reactionObj });
  }
  spawnFloatingEmoji(emoji, senderName);
}

function spawnFloatingEmoji(emoji, senderName) {
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.style.left = Math.floor(15 + Math.random() * 70) + 'vw';
  el.innerHTML = `${emoji} <span style="font-size:0.75rem; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:99px; color:#ffd15c;">${senderName || ''}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function launchCelebrationConfetti() {
  const emojis = ['🎆', '🪔', '✨', '🏆', '🍬', '🎉'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      spawnFloatingEmoji(emojis[i % emojis.length], '');
    }, i * 90);
  }
}

// Genuine 3x9 Tambola Ticket Generator
function generateTambolaTicket() {
  const colRanges = [
    [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
    [50, 59], [60, 69], [70, 79], [80, 90]
  ];

  let grid = Array.from({ length: 3 }, () => Array(9).fill(0));
  let valid = false;

  while (!valid) {
    grid = Array.from({ length: 3 }, () => Array(9).fill(0));
    for (let r = 0; r < 3; r++) {
      let cols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      cols.sort(() => Math.random() - 0.5);
      for (let i = 0; i < 5; i++) {
        grid[r][cols[i]] = 1;
      }
    }
    valid = true;
    for (let c = 0; c < 9; c++) {
      const colSum = grid[0][c] + grid[1][c] + grid[2][c];
      if (colSum === 0) {
        valid = false;
        break;
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    const count = grid[0][c] + grid[1][c] + grid[2][c];
    const [min, max] = colRanges[c];
    const pool = [];
    for (let n = min; n <= max; n++) pool.push(n);
    pool.sort(() => Math.random() - 0.5);
    const chosen = pool.slice(0, count).sort((a, b) => a - b);

    let idx = 0;
    for (let r = 0; r < 3; r++) {
      if (grid[r][c] === 1) {
        grid[r][c] = chosen[idx++];
      }
    }
  }

  return grid;
}

function archiveRoundIfNeeded(state, reasonText) {
  const alreadySavedIdx = state.pastRounds.findIndex(r => r.round === state.round);
  const snapshot = {
    round: state.round,
    endedAt: getTimeStr(),
    reason: reasonText,
    calledNumbers: [...state.calledNumbers],
    prizes: JSON.parse(JSON.stringify(state.prizes)),
    playerSummary: Object.values(state.players).map(p => ({
      name: p.name,
      markedCount: p.marked.length,
      bogeys: p.bogeys
    }))
  };

  if (alreadySavedIdx >= 0) {
    state.pastRounds[alreadySavedIdx] = snapshot;
  } else {
    state.pastRounds.unshift(snapshot);
  }
}

function areAllPrizesClaimed(state) {
  return Object.values(state.prizes).every(p => p.status === 'claimed');
}

function verifyPrizeClaim(ticket, markedNumbers, calledNumbers, prizeKey) {
  const calledSet = new Set(calledNumbers);
  const markedSet = new Set(markedNumbers);
  const isValidMark = (num) => num > 0 && markedSet.has(num) && calledSet.has(num);

  const rowNums = (r) => ticket[r].filter(n => n > 0);
  const allTicketNums = [...rowNums(0), ...rowNums(1), ...rowNums(2)];

  if (prizeKey === 'earlyFive') {
    return allTicketNums.filter(isValidMark).length >= 5;
  }
  if (prizeKey === 'topLine') {
    return rowNums(0).every(isValidMark);
  }
  if (prizeKey === 'middleLine') {
    return rowNums(1).every(isValidMark);
  }
  if (prizeKey === 'bottomLine') {
    return rowNums(2).every(isValidMark);
  }
  if (prizeKey === 'fourCorners') {
    const top = rowNums(0);
    const bottom = rowNums(2);
    const corners = [top[0], top[top.length - 1], bottom[0], bottom[bottom.length - 1]];
    return corners.every(isValidMark);
  }
  if (prizeKey === 'fullHouse') {
    return allTicketNums.every(isValidMark);
  }
  return false;
}

function speakText(text, soundEnabled) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}