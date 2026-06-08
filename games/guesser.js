(function () {
  const BrainBreak = window.BrainBreak;

  const AK_DB = [
    { name: 'dog', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: true, isWild: false, canFly: false, livesInWater: false, hasFur: true, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'cat', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: true, isWild: false, canFly: false, livesInWater: false, hasFur: true, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'elephant', article: 'an', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: false, livesInWater: false, hasFur: false, isLarge: true, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'goldfish', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: true, isWild: false, canFly: false, livesInWater: true, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'eagle', article: 'an', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: true, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'penguin', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: false, livesInWater: true, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'dolphin', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: false, livesInWater: true, hasFur: false, isLarge: true, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'butterfly', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: true, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'horse', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: true, isLarge: true, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'snake', article: 'a', isAnimal: true, isFood: false, isPlant: false, isObject: false, isPet: false, isWild: true, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'banana', article: 'a', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: true, isVegetable: false, foundInKitchen: true, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'pizza', article: 'a', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: true, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'carrot', article: 'a', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: true, foundInKitchen: true, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'apple', article: 'an', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: true, isVegetable: false, foundInKitchen: true, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'chocolate', article: 'a', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: true, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'coffee', article: 'a', isAnimal: false, isFood: true, isPlant: false, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: true, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'laptop', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: true, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: true, isWearable: false, usedDaily: true },
    { name: 'chair', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'bicycle', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: true, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: true, isWearable: false, usedDaily: false },
    { name: 'car', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: true, isSmall: false, isElectronic: false, isVehicle: true, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: true, isWearable: false, usedDaily: true },
    { name: 'piano', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: true, isSmall: false, isElectronic: false, isVehicle: false, isMusical: true, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'guitar', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: true, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'phone', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: true, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: true, isWearable: false, usedDaily: true },
    { name: 'refrigerator', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: true, isSmall: false, isElectronic: true, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: true, foundOutdoors: false, madeOfMetal: true, isWearable: false, usedDaily: true },
    { name: 'book', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: false, isWearable: false, usedDaily: true },
    { name: 'watch', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: true, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: false, madeOfMetal: true, isWearable: true, usedDaily: true },
    { name: 'shoes', article: 'a', isAnimal: false, isFood: false, isPlant: false, isObject: true, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: true, usedDaily: true },
    { name: 'sunflower', article: 'a', isAnimal: false, isFood: false, isPlant: true, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'cactus', article: 'a', isAnimal: false, isFood: false, isPlant: true, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: false, isSmall: true, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
    { name: 'tree', article: 'a', isAnimal: false, isFood: false, isPlant: true, isObject: false, isPet: false, isWild: false, canFly: false, livesInWater: false, hasFur: false, isLarge: true, isSmall: false, isElectronic: false, isVehicle: false, isMusical: false, isFruit: false, isVegetable: false, foundInKitchen: false, foundOutdoors: true, madeOfMetal: false, isWearable: false, usedDaily: false },
  ];

  const AK_QUESTIONS = [
    { key: 'isAnimal', text: 'Is it an animal?' },
    { key: 'isFood', text: 'Is it something you can eat?' },
    { key: 'isPlant', text: 'Is it a plant?' },
    { key: 'isObject', text: 'Is it a man-made object?' },
    { key: 'isPet', text: 'Is it commonly kept as a pet?' },
    { key: 'isWild', text: 'Is it found in the wild?' },
    { key: 'canFly', text: 'Can it fly?' },
    { key: 'livesInWater', text: 'Does it live in water?' },
    { key: 'hasFur', text: 'Does it have fur or hair?' },
    { key: 'isLarge', text: 'Is it larger than a person?' },
    { key: 'isSmall', text: 'Is it smaller than your hand?' },
    { key: 'isElectronic', text: 'Is it electronic?' },
    { key: 'isVehicle', text: 'Is it a vehicle?' },
    { key: 'isMusical', text: 'Is it a musical instrument?' },
    { key: 'isFruit', text: 'Is it a fruit?' },
    { key: 'isVegetable', text: 'Is it a vegetable?' },
    { key: 'foundInKitchen', text: 'Would you find it in a kitchen?' },
    { key: 'foundOutdoors', text: 'Would you usually find it outdoors?' },
    { key: 'madeOfMetal', text: 'Is it mostly made of metal?' },
    { key: 'isWearable', text: 'Can you wear it?' },
    { key: 'usedDaily', text: 'Do most people use it every day?' },
  ];

  let akCandidates;
  let akAsked;
  let akQuestionNum;
  let akPhase;
  let akCurrentQ;
  let akGuessTarget;

  function qAddBubble(who, text) {
    const div = document.createElement('div');
    div.className = 'q-bubble ' + who;
    div.textContent = text;
    document.getElementById('q-log').appendChild(div);
    document.getElementById('q-log').scrollTop = document.getElementById('q-log').scrollHeight;
  }

  function qSetAnswersEnabled(on, guessMode) {
    document.querySelectorAll('.q-answer-btn').forEach(btn => {
      const a = btn.dataset.answer;
      if (!on) {
        btn.disabled = true;
        return;
      }
      if (guessMode) {
        btn.disabled = a !== 'yes' && a !== 'no';
      } else {
        btn.disabled = false;
      }
    });
  }

  function akFilter(candidates, key, answer) {
    if (answer === 'dontknow') return candidates;
    const want = answer === 'yes' || answer === 'probably';
    const filtered = candidates.filter(c => c[key] === want);
    if (answer === 'probably' || answer === 'probablynot') {
      return filtered.length ? filtered : candidates;
    }
    return filtered;
  }

  function akBestQuestion(candidates) {
    let best = null;
    let bestEntropy = -1;
    for (const q of AK_QUESTIONS) {
      if (akAsked.has(q.key)) continue;
      const yes = candidates.filter(c => c[q.key]).length;
      const no = candidates.length - yes;
      if (yes === 0 || no === 0) continue;
      const n = candidates.length;
      const p1 = yes / n;
      const p2 = no / n;
      const entropy = -(p1 * Math.log2(p1) + p2 * Math.log2(p2));
      if (entropy > bestEntropy) {
        bestEntropy = entropy;
        best = q;
      }
    }
    return best;
  }

  function akAskQuestion() {
    akCurrentQ = akBestQuestion(akCandidates);
    if (!akCurrentQ || akQuestionNum > 20) {
      akMakeGuess();
      return;
    }
    akPhase = 'question';
    qSetAnswersEnabled(true, false);
    qAddBubble('computer', akCurrentQ.text);
    document.getElementById('q-num').textContent = akQuestionNum;
    document.getElementById('q-status').textContent = `${akCandidates.length} possibilities…`;
  }

  function akMakeGuess() {
    if (akCandidates.length === 0) {
      akStumped();
      return;
    }
    akGuessTarget = akCandidates[0];
    akPhase = 'guess';
    akQuestionNum++;
    qSetAnswersEnabled(true, true);
    document.getElementById('q-num').textContent = Math.min(akQuestionNum, 20);
    document.getElementById('q-status').textContent = 'Making my guess…';
    qAddBubble('computer', `I think you're thinking of ${akGuessTarget.article} ${akGuessTarget.name}! Am I right?`);
  }

  function akStumped() {
    akPhase = 'stumped';
    qSetAnswersEnabled(false, false);
    document.getElementById('q-status').textContent = 'You stumped me!';
    document.getElementById('q-reveal-row').classList.add('visible');
    qAddBubble('computer', "I'm stumped! What were you thinking of? (It might be something outside my list.)");
  }

  function qNewRound() {
    akCandidates = [...AK_DB];
    akAsked = new Set();
    akQuestionNum = 1;
    akPhase = 'question';
    akCurrentQ = null;
    akGuessTarget = null;

    document.getElementById('q-log').innerHTML = '';
    document.getElementById('q-num').textContent = '1';
    document.getElementById('q-status').textContent = "Think of something — I'll try to guess it!";
    document.getElementById('q-reveal-row').classList.remove('visible');
    document.getElementById('q-reveal').value = '';

    qAddBubble('computer', "Think of a person, animal, or object. Keep it in your head — I'll ask yes/no questions and try to guess it, Akinator-style!");
    qSetAnswersEnabled(true, false);
    setTimeout(akAskQuestion, 600);
  }

  function akHandleAnswer(answer) {
    if (akPhase === 'guess') {
      qAddBubble('user', answer === 'yes' ? 'Yes!' : 'No.');
      if (answer === 'yes') {
        akPhase = 'won';
        qSetAnswersEnabled(false, false);
        document.getElementById('q-status').textContent = 'Got it!';
        const questions = akQuestionNum;
        let bubble = `I knew it! ${akGuessTarget.article} ${akGuessTarget.name}! 🎉`;
        if (window.GameScores) {
          GameScores.tryRecord('questions', questions, { lowerIsBetter: true }).then(isNew => {
            if (isNew) bubble += ` New best — ${questions} questions!`;
            qAddBubble('computer', bubble);
          });
        } else {
          qAddBubble('computer', bubble);
        }
      } else {
        akCandidates = akCandidates.filter(c => c.name !== akGuessTarget.name);
        akQuestionNum++;
        if (akQuestionNum > 20 || akCandidates.length === 0) {
          if (akCandidates.length === 0) akStumped();
          else {
            qAddBubble('computer', 'Wrong guess — let me try one more time!');
            akMakeGuess();
          }
        } else {
          qAddBubble('computer', 'Okay, let me keep narrowing it down…');
          akPhase = 'question';
          qSetAnswersEnabled(true, false);
          akAskQuestion();
        }
      }
      return;
    }

    if (akPhase !== 'question' || !akCurrentQ) return;

    const labels = { yes: 'Yes', no: 'No', dontknow: "Don't know", probably: 'Probably', probablynot: 'Probably not' };
    qAddBubble('user', labels[answer] || answer);

    akCandidates = akFilter(akCandidates, akCurrentQ.key, answer);
    akAsked.add(akCurrentQ.key);
    akQuestionNum++;

    if (akCandidates.length === 1) {
      akMakeGuess();
    } else if (akCandidates.length === 0) {
      akStumped();
    } else if (akQuestionNum > 20) {
      akMakeGuess();
    } else {
      akAskQuestion();
    }
  }

  BrainBreak.register('questions', {
    init() {
      document.querySelectorAll('.q-answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!btn.disabled) akHandleAnswer(btn.dataset.answer);
        });
      });

      document.getElementById('q-reveal-btn').addEventListener('click', () => {
        const name = document.getElementById('q-reveal').value.trim();
        if (!name) return;
        qAddBubble('user', 'I was thinking of ' + name + '.');
        const match = AK_DB.find(o => o.name === name.toLowerCase());
        if (match) {
          qAddBubble('computer', `Oh, ${match.article} ${match.name}! I'll remember that one for next time.`);
        } else {
          qAddBubble('computer', `${name} — tricky one! Play again and I'll try harder.`);
        }
        document.getElementById('q-reveal-row').classList.remove('visible');
      });

      document.getElementById('q-new').addEventListener('click', qNewRound);
    },
    onActivate: qNewRound,
    stop() {},
  });
})();
