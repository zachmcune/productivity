/** Memory card matching game. */
(function () {
  const EMOJIS = ['🎯', '🚀', '🌟', '🎵', '🍕', '🎮', '🌈', '⚡'];
  let cards, flipped, matched, moves, seconds, timerInterval, lock;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    document.getElementById('mem-timer').textContent = '0:00';
    timerInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60), s = seconds % 60;
      document.getElementById('mem-timer').textContent = `${m}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  function newGame() {
    clearInterval(timerInterval);
    matched = 0; moves = 0; flipped = []; lock = false;
    document.getElementById('mem-moves').textContent = '0';
    document.getElementById('mem-pairs').textContent = '0 / 8';
    document.getElementById('mem-timer').textContent = '0:00';
    const msg = document.getElementById('mem-message');
    msg.textContent = 'Flip two cards to find matching pairs.';
    msg.classList.remove('win');

    cards = shuffle([...EMOJIS, ...EMOJIS]);
    const board = document.getElementById('mem-board');
    board.innerHTML = '';
    cards.forEach(emoji => {
      const card = document.createElement('button');
      card.className = 'game-card';
      card.dataset.emoji = emoji;
      card.innerHTML = '<span class="back">?</span>';
      card.addEventListener('click', () => flip(card));
      board.appendChild(card);
    });
    startTimer();
  }

  function flip(card) {
    if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      document.getElementById('mem-moves').textContent = moves;
      lock = true;
      const [a, b] = flipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        a.classList.add('matched'); b.classList.add('matched');
        matched++;
        document.getElementById('mem-pairs').textContent = `${matched} / 8`;
        flipped = []; lock = false;
        if (matched === 8) {
          clearInterval(timerInterval);
          const m = Math.floor(seconds / 60), s = seconds % 60;
          const msg = document.getElementById('mem-message');
          msg.textContent = `You won in ${moves} moves and ${m}:${String(s).padStart(2, '0')}! 🎉`;
          msg.classList.add('win');
        }
      } else {
        setTimeout(() => {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          a.innerHTML = '<span class="back">?</span>';
          b.innerHTML = '<span class="back">?</span>';
          flipped = []; lock = false;
        }, 800);
      }
    }
  }

  BrainBreak.register('memory', {
    init() {
      document.getElementById('mem-new').addEventListener('click', newGame);
    },
    onActivate: newGame,
    stop() { clearInterval(timerInterval); },
  });
})();
