// Firebase Configuration
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
        this.initGameState();
        this.selectNineLetterWord();
        this.generateLetters();
        this.startTimer();
        this.wordInput.focus();
        this.wordInput.disabled = false;
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
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.endGame();
            }
        }, 1000);
    }

    submitWord() {
        const word = this.wordInput.value.trim().toLowerCase();
        this.wordInput.value = '';

        if (!word || word.length < 3 || this.submittedWords.has(word)) {
            this.showMessage("Invalid word or already guessed!");
            return;
        }

        if (this.isValidWord(word)) {
            this.score += word.length;
            this.scoreElement.textContent = this.score;
            this.timeLeft += word.length;
            this.submittedWords.add(word);
            this.renderGuessedWord(word);
            this.showMessage("Good job!");
        } else {
            this.showMessage("Invalid word!");
        }
    }

    isValidWord(word) {
        return word.length > 2 && word.split('').every(letter => this.letters.includes(letter));
    }

    renderGuessedWord(word) {
        const wordElement = document.createElement('div');
        wordElement.textContent = word.toUpperCase();
        wordElement.className = 'guessed-word';
        this.guessedWordsContainer.appendChild(wordElement);
    }

    showMessage(message) {
        this.messageElement.textContent = message;
    }

    endGame() {
        this.showMessage(`Game over! The nine-letter word was ${this.nineLetterWord.toUpperCase()}`);
        this.playAgainButton.style.display = 'block';
        this.wordInput.disabled = true;
        this.updateHighScore();
        this.saveScore();
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
    }

    saveScore() {
        const newScore = {
            score: this.score,
            date: new Date().toISOString(),
        };
        this.personalLeaderboard.push(newScore);
        this.personalLeaderboard.sort((a, b) => b.score - a.score);
        this.personalLeaderboard = this.personalLeaderboard.slice(0, 10);
        localStorage.setItem('personalLeaderboard', JSON.stringify(this.personalLeaderboard));
        this.updatePersonalLeaderboard();
        this.updateDailyLeaderboard();
    }

    updatePersonalLeaderboard() {
        this.personalScoresList.innerHTML = '';
        this.personalLeaderboard.forEach(score => {
            const listItem = document.createElement('li');
            listItem.textContent = `${score.score} - ${new Date(score.date).toLocaleDateString()}`;
            this.personalScoresList.appendChild(listItem);
        });
    }

    updateDailyLeaderboard() {
        const scoresRef = db.ref('dailyLeaderboard');
        scoresRef.orderByChild('score').limitToLast(10).on('value', snapshot => {
            const scores = [];
            snapshot.forEach(childSnapshot => {
                scores.push(childSnapshot.val());
            });
            scores.reverse();
            this.dailyScoresList.innerHTML = '';
            scores.forEach(score => {
                const listItem = document.createElement('li');
                listItem.textContent = `${score.score} - ${new Date(score.date).toLocaleDateString()}`;
                this.dailyScoresList.appendChild(listItem);
            });
        });
    }
}

// Initialize game when document loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordGame();
});
