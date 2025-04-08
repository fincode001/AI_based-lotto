class LottoSimulator {
    constructor() {
        this.canvas = document.getElementById('lottoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.resultDiv = document.getElementById('result');
        this.savedList = document.getElementById('savedNumbers');

        this.canvas.width = 500;
        this.canvas.height = 300;

        this.balls = [];
        this.selectedBalls = [];
        this.isRunning = false;
        this.selectionInterval = null;

        this.drawSound = new Audio('static/sounds/draw-sound.mp3'); // 🔊 효과음 경로

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
        this.saveBtn.onclick = () => this.saveNumbers();
        this.copyBtn.onclick = () => this.copyNumbers();
        this.shareBtn.onclick = () => this.shareKakao();
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

        fetch('/recommend')
            .then(res => res.json())
            .then(data => {
                const numbers = data.recommend || [];
                this.runAnimationWithNumbers(numbers.slice(0, 6));
            })
            .catch(err => {
                alert('추천번호를 가져오지 못했습니다.');
                this.runAnimationWithNumbers(); // 랜덤
            });
    }

    runAnimationWithNumbers(numbers = []) {
        let count = 0;
        this.selectionInterval = setInterval(() => {
            if (count >= 6) {
                clearInterval(this.selectionInterval);
                this.isRunning = false;
                this.resetBtn.disabled = false;
                return;
            }

            let selectedBall;
            if (numbers.length > 0) {
                const target = numbers[count];
                selectedBall = this.balls.find(b => !b.selected && b.number === target);
            } else {
                const candidates = this.balls.filter(b => !b.selected);
                selectedBall = candidates[Math.floor(Math.random() * candidates.length)];
            }

            if (selectedBall) {
                selectedBall.selected = true;
                this.selectedBalls.push(selectedBall);
                this.playDrawSound(); // 🔊 효과음
                this.showResult();
                count++;
            }
        }, 600);
    }

    playDrawSound() {
        this.drawSound.currentTime = 0;
        this.drawSound.play().catch(() => {}); // 자동 재생 차단 대응
    }

    showResult() {
        const sorted = this.selectedBalls.map(b => b.number).sort((a, b) => a - b);
        this.resultDiv.innerHTML = `추천 번호: ${sorted.join(', ')}`;
    }

    reset() {
        this.initializeBalls();
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.resultDiv.innerHTML = '';
    }

    saveNumbers() {
        if (this.selectedBalls.length !== 6) return alert('먼저 추천을 실행해주세요.');
        const numbers = this.selectedBalls.map(b => b.number).sort((a, b) => a - b).join(', ');
        const time = new Date().toLocaleString();
        const item = `${time} - ${numbers}`;

        const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
        existing.push(item);
        localStorage.setItem('savedNumbersList', JSON.stringify(existing));

        this.addToHistory(item);
        alert('저장되었습니다!');
    }

    addToHistory(text) {
        const li = document.createElement('li');
        li.textContent = text;
        this.savedList.appendChild(li);
    }

    loadSavedNumbers() {
        const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
        existing.forEach(item => this.addToHistory(item));
    }

    copyNumbers() {
        const text = Array.from(this.savedList.children).map(li => li.textContent).join('\n');
        if (!text) return alert('복사할 추천번호가 없습니다.');
        navigator.clipboard.writeText(text).then(() => {
            alert('복사되었습니다! 이제 붙여넣기 하세요.');
        });
    }

    shareKakao() {
        const text = Array.from(this.savedList.children).map(li => li.textContent).join('\n');
        if (!text) return alert('공유할 추천번호가 없습니다.');
        Kakao.Link.sendDefault({
            objectType: 'text',
            text: `AI 추천 로또번호!\n${text}\n👉 http://당신의-사이트-주소`,
            link: {
                mobileWebUrl: 'http://당신의-사이트-주소',
                webUrl: 'http://당신의-사이트-주소'
            }
        });
    }
}

window.onload = () => {
    new LottoSimulator();
};
