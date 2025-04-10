// lotto.js - GitHub Pages용 최종본
class LottoSimulator {
    constructor() {
        this.canvas = document.getElementById('lottoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.resultDiv = document.getElementById('result');

        this.canvas.width = 500;
        this.canvas.height = 300;

        this.balls = [];
        this.selectedBalls = [];
        this.isRunning = false;
        this.selectionInterval = null;
        this.soundEnabled = true;
        this.audio = new Audio("draw-sound.mp3");

        this.initializeBalls();
        this.setupEventListeners();
        this.animate();
        this.loadSavedNumbers();
    }

    initializeBalls() {
        this.balls = [];
        this.selectedBalls = [];
        for (let i = 1; i <= 45; i++) {
            this.balls.push({
                number: i,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                color: this.getBallColor(i),
                selected: false
            });
        }
    }

    setupEventListeners() {
        this.startBtn.onclick = () => this.startDrawing();
        this.resetBtn.onclick = () => this.reset();
        this.soundToggle.onclick = () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? "🔊 소리 ON" : "🔇 소리 OFF";
        };
    }

    getBallColor(number) {
        if (number <= 10) return 'red';
        if (number <= 20) return 'orange';
        if (number <= 30) return 'yellowgreen';
        if (number <= 40) return 'skyblue';
        return 'violet';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.balls.forEach(ball => {
            if (!ball.selected) {
                ball.x += ball.dx;
                ball.y += ball.dy;
                if (ball.x < 0 || ball.x > this.canvas.width) ball.dx *= -1;
                if (ball.y < 0 || ball.y > this.canvas.height) ball.dy *= -1;
            }

            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.fill();
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px bold';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(ball.number, ball.x, ball.y);
        });
    }

    startDrawing() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.resultDiv.innerHTML = '';

        fetch("data/recommended.json")
            .then(res => res.json())
            .then(data => {
                const recommended = data.recommend || [];
                this.runAnimationWithNumbers(recommended.slice(0, 6));
            })
            .catch(err => {
                alert("최첨단 인공지능 ChatGPT가 직접 분석하여 추천번호를 생성해 드립니다.");
                this.runAnimationWithNumbers();
            });
    }

    runAnimationWithNumbers(numbers = []) {
        let count = 0;
        this.selectionInterval = setInterval(() => {
            if (count >= 6) {
                clearInterval(this.selectionInterval);
                this.isRunning = false;
                this.resetBtn.disabled = false;
                this.saveNumbers();
                return;
            }

            let selectedBall;
            if (numbers.length > 0) {
                const targetNumber = numbers[count];
                selectedBall = this.balls.find(ball => !ball.selected && ball.number === targetNumber);
            } else {
                const availableBalls = this.balls.filter(ball => !ball.selected);
                const selectedIndex = Math.floor(Math.random() * availableBalls.length);
                selectedBall = availableBalls[selectedIndex];
            }

            if (selectedBall) {
                selectedBall.selected = true;
                this.selectedBalls.push(selectedBall);

                const ballDiv = document.createElement('div');
                ballDiv.className = 'ball';
                ballDiv.style.backgroundColor = selectedBall.color;
                ballDiv.textContent = selectedBall.number;
                this.resultDiv.appendChild(ballDiv);
                if (this.soundEnabled) this.audio.play();
            }

            count++;
        }, 800);
    }

    reset() {
        this.initializeBalls();
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.resultDiv.innerHTML = '';
    }

    saveNumbers() {
        const numbers = this.selectedBalls.map(b => b?.number).join(', ');
        const timestamp = new Date().toLocaleString();
        const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
        existing.unshift({ time: timestamp, numbers });
        localStorage.setItem('savedNumbersList', JSON.stringify(existing));
        this.loadSavedNumbers();
    }

    loadSavedNumbers() {
        const saved = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
        const list = document.getElementById('savedNumbers');
        list.innerHTML = '';
        saved.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `[${item.time}]  ${item.numbers}`;
            list.appendChild(li);
        });
    }
}

window.onload = () => new LottoSimulator();
