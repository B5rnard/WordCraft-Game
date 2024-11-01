// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIRwazCpmXp5el5pcyrVjoYb962fZpc7Y",
    authDomain: "wordcraft-17de9.firebaseapp.com",
    databaseURL: "https://wordcraft-17de9-default-rtdb.firebaseio.com",
    projectId: "wordcraft-17de9",
    storageBucket: "wordcraft-17de9.appspot.com",
    messagingSenderId: "411593162986",
    appId: "1:411593162986:web:481c9e7f7bf85a58e9d793",
    measurementId: "G-8GQX7TV5NE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class WordGame {
    constructor() {
        this.initDOMElements();
        this.initGameState();
        this.addEventListeners();
        this.personalLeaderboard = JSON.parse(localStorage.getItem('personalLeaderboard')) || [];
        this.updatePersonalLeaderboard();
        this.updateDailyLeaderboard();
        this.startGame();
    }

    initDOMElements() {
        this.lettersElement = document.getElementById('letters');
        this.wordInput = document.getElementById('wordInput');
        this.submitButton = document.getElementById('submitButton');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.guessedWordsContainer = document.getElementById('guessedWords');
        this.messageElement = document.getElementById('message');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.highScoreElement = document.getElementById('highScore');
        this.personalScoresList = document.getElementById('personalScores');
        this.dailyScoresList = document.getElementById('dailyScores');
        this.gameContent = document.getElementById('gameContent');
    }

    initGameState() {
        this.letters = [];
        this.score = 0;
        this.timeLeft = 30;
        this.submittedWords = new Set();
        this.nineLetterWord = '';
        this.timerInterval = null;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.highScoreElement.textContent = this.highScore;

        this.nineLetterWords = [
            'aardvarks', 'abandoned', 'abilities', 'absurdity', 'academic', 'activate',
            'admirable', 'adventure', 'affection', 'algorithm', 'alligator', 'amazement',
            'ambitions', 'apartment', 'apologize', 'architect', 'assistant', 'attention',
            'available', 'backwards', 'beautiful', 'benchmark', 'blackjack', 'brilliant',
            'buildings', 'butterfly', 'calculate', 'candidate', 'celebrate', 'challenge',
            'chocolate', 'classroom', 'colleague', 'community', 'creature', 'crescendo',
            'dangerous', 'dedicated', 'delicious', 'diligence', 'direction', 'disappear',
            'education', 'effective', 'elephants', 'emotional', 'equipment', 'everybody',
            'fantastic', 'financial', 'fireplace', 'formation', 'framework', 'friendship',
            'gathering', 'gentleman', 'governors', 'happiness', 'historian', 'homeowner',
            'hospitals', 'ignorance', 'important', 'incentive', 'invisible', 'knowledge',
            'leadership', 'lifestyle', 'limestone', 'literally', 'mainframe', 'marketing',
            'medieval', 'migration', 'miserable', 'moonlight', 'mountains', 'necessary',
            'neighbors', 'nightmare', 'objective', 'organized', 'passenger', 'peaceful',
            'peninsula', 'perceived', 'pharmacy', 'political', 'pollution', 'portfolio',
            'powerless', 'practical', 'precision', 'president', 'principal', 'procedure',
            'processor', 'prominent', 'prototype', 'questions', 'reasoning', 'reception',
            'reduction', 'reference', 'relations', 'relevant', 'reliable', 'religious',
            'remainder', 'reporting', 'republics', 'resistant', 'resources', 'restaurant',
            'retreated', 'revelation', 'satisfied', 'scenarios', 'scientist', 'secondary',
            'selection', 'separate', 'situated', 'sometimes', 'specialty', 'spectrum',
            'structure', 'suffering', 'sunflower', 'surprised', 'syndrome', 'technical',
            'temporary', 'tolerance', 'tournament', 'translate', 'transport', 'treatment',
            'triangle', 'typically', 'uncertain', 'underline', 'undertake', 'universal',
            'vacation', 'variation', 'vegetable', 'violently', 'violation', 'visionary',
            'volunteer', 'wilderness', 'wonderful', 'workplace', 'workshops', 'worthless',
            'wrestling', 'yearbooks', 'yesterday', 'yourselves'
        ];
    }

    addEventListeners() {
        this.submitButton.addEventListener('click', () => this.submitWord());
        this.wordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.submitWord();
            }
        });
        this.playAgainButton.addEventListener('click', () => this.resetGame());
    
    }

    startGame() {
        this.selectNineLetterWord();
        this.generateLetters();
        this.startTimer();
        this.wordInput.focus();
        this.wordInput.disabled = false;
        this.highScoreElement.textContent = this.highScore;
        this.playAgainButton.style.display = 'none';
        this.messageElement.textContent = '';
        this.scoreElement.textContent = '0';
    }

    resetGame() {
        clearInterval(this.timerInterval);
        this.initGameState();
        this.wordInput.disabled = false;
        this.guessedWordsContainer.innerHTML = '';
        this.messageElement.textContent = '';
        this.timerElement.classList.remove('timer-warning', 'timer-critical');
        this.startGame();
    }

    selectNineLetterWord() {
        const randomIndex = Math.floor(Math.random() * this.nineLetterWords.length);
        this.nineLetterWord = this.nineLetterWords[randomIndex];
    }

    generateLetters() {
        this.letters = this.shuffleArray([...this.nineLetterWord]);
        this.renderLetters();
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    renderLetters() {
        this.lettersElement.innerHTML = '';
        this.letters.forEach(letter => {
            const letterTile = document.createElement('div');
            letterTile.textContent = letter.toUpperCase();
            letterTile.className = 'letter-tile';
            this.lettersElement.appendChild(letterTile);
        });
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = 30;
        this.timerElement.textContent = this.timeLeft;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 10 && this.timeLeft > 5) {
                this.timerElement.classList.add('timer-warning');
                this.timerElement.classList.remove('timer-critical');
            } else if (this.timeLeft <= 5) {
                this.timerElement.classList.add('timer-critical');
                this.timerElement.classList.remove('timer-warning');
            } else {
                this.timerElement.classList.remove('timer-warning', 'timer-critical');
            }

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    async submitWord() {
        const rawInput = this.wordInput.value.trim().toLowerCase();
        const word = this.sanitizeInput(rawInput);

        if (this.submittedWords.has(word)) {
            this.showMessage(`You've already submitted "${word.toUpperCase()}". Try a new word.`);
            this.wordInput.value = '';
            return;
        }

        if (!word) {
            this.showMessage('Please enter a word.');
            return;
        }

        if (word.length < 2) {
            this.showMessage('Words must be at least 2 letters long.');
            this.wordInput.value = '';
            return;
        }

        if (this.canFormWordFromLetters(word)) {
            const isValid = await this.validateWord(word);
            if (isValid) {
                const wordScore = this.getWordScore(word);
                this.score += wordScore;
                this.submittedWords.add(word);
                this.scoreElement.textContent = this.score;
                this.updateGuessedWords(word);
                this.wordInput.value = '';
                this.addTime(word.length);
            } else {
                this.showMessage(`"${word.toUpperCase()}" is not an acceptable word.`);
                this.wordInput.value = '';
            }
        } else {
            this.showMessage(`"${word.toUpperCase()}" cannot be formed from the given letters.`);
            this.wordInput.value = '';
        }
    }

    sanitizeInput(input) {
        return input.replace(/[^a-zA-Z]/g, '');
    }

    async validateWord(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    getWordScore(word) {
        return word.length > 2 ? word.length * (word.length - 2) : 1;
    }

    updateGuessedWords(word) {
        const wordElement = document.createElement('div');
        wordElement.className = 'guessed-word';
        wordElement.textContent = word.toUpperCase();
        this.guessedWordsContainer.prepend(wordElement);

        wordElement.classList.add('flash');
        setTimeout(() => wordElement.classList.remove('flash'), 500);
    }

    canFormWordFromLetters(word) {
        const lettersCount = this.letters.reduce((count, letter) => {
            const lowerLetter = letter.toLowerCase();
            count[lowerLetter] = (count[lowerLetter] || 0) + 1;
            return count;
        }, {});

        for (let char of word) {
            if (!lettersCount[char]) return false;
            lettersCount[char]--;
        }
        return true;
    }

    addTime(seconds) {
        this.timeLeft += seconds;
        this.timerElement.textContent = this.timeLeft;
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.wordInput.disabled = true;
        if (!this.submittedWords.has(this.nineLetterWord)) {
            this.showMessage(`The nine-letter word was "${this.nineLetterWord.toUpperCase()}".`);
        }
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.showMessage(`New High Score: ${this.highScore}!`);
        }
        this.updatePersonalLeaderboard();
        this.saveScoreToFirebase(this.score);
        this.updateDailyLeaderboard();
        this.highScoreElement.textContent = this.highScore;
        this.playAgainButton.style.display = 'block';
    }

    saveScoreToFirebase(score) {
        const today = new Date().toISOString().split('T')[0];
        const newScoreRef = db.ref(`scores/${today}`).push();
        newScoreRef.set({
            score: score,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    updatePersonalLeaderboard() {
        this.personalLeaderboard.push(this.score);
        this.personalLeaderboard.sort((a, b) => b - a);
        this.personalLeaderboard = this.personalLeaderboard.slice(0, 5);
        localStorage.setItem('personalLeaderboard', JSON.stringify(this.personalLeaderboard));
    
        this.personalScoresList.innerHTML = this.personalLeaderboard
            .map(score => `<li>${score}</li>`)
            .join('');
    }

    updateDailyLeaderboard() {
        const today = new Date().toISOString().split('T')[0];
        db.ref(`scores/${today}`)
            .orderByChild('score')
            .limitToLast(5)
            .on('value', (snapshot) => {
                const scores = [];
                snapshot.forEach((childSnapshot) => {
                    scores.push(childSnapshot.val().score);
                });
                scores.sort((a, b) => b - a);
                this.dailyScoresList.innerHTML = scores
                    .map(score => `<li>${score}</li>`)
                    .join('');
            });
    }

    showMessage(message) {
        this.messageElement.textContent = message;
    }
}

// Initialize game when document loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordGame();
});
