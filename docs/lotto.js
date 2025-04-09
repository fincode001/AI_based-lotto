class LottoSimulator {
  constructor(winningNumbers = []) {
    this.canvas = document.getElementById('lottoCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.shareBtn = document.getElementById('shareBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.resultDiv = document.getElementById('result');
    this.drawSound = document.getElementById('drawSound');

    this.canvas.width = 500;
    this.canvas.height = 300;

    this.balls = [];
    this.selectedBalls = [];
    this.isRunning = false;
    this.selectionInterval = null;
    this.soundOn = true;

    this.recommended = [5, 12, 19, 27, 34, 41]; // fallback 추천 번호

    this.initializeBalls();
    this.setupEventListeners();
    this.animate();

    setTimeout(() => {
      const intro = document.getElementById('introScreen');
      if (intro) intro.style.display = 'none';
    }, 2000);

    this.displaySavedNumbers();
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
    this.copyBtn.onclick = () => this.copyNumbers();
    this.shareBtn.onclick = () => this.shareNumbers();
    this.soundToggleBtn.onclick = () => {
      this.soundOn = !this.soundOn;
      this.soundToggleBtn.textContent = this.soundOn ? '🔊 소리 끄기' : '🔇 소리 켜기';
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
    this.selectedBalls = [];

    const numbers = this.recommended.slice(0, 6);
    let count = 0;

    this.selectionInterval = setInterval(() => {
      if (count >= 6) {
        clearInterval(this.selectionInterval);
        this.isRunning = false;
        this.resetBtn.disabled = false;
        this.saveToHistory(numbers);
        return;
      }

      const num = numbers[count];
      const selectedBall = this.balls.find(b => b.number === num && !b.selected);
      if (selectedBall) {
        selectedBall.selected = true;
        this.selectedBalls.push(selectedBall);
        if (this.soundOn) this.drawSound.play();

        const ballDiv = document.createElement('div');
        ballDiv.className = 'ball';
        ballDiv.style.backgroundColor = selectedBall.color;
        ballDiv.textContent = selectedBall.number;
        this.resultDiv.appendChild(ballDiv);
      }
      count++;
    }, 800);
  }

  saveToHistory(numbers) {
    const timestamp = new Date().toLocaleString();
    const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
    existing.unshift({ time: timestamp, numbers: numbers.join(', ') });
    localStorage.setItem('savedNumbersList', JSON.stringify(existing));
    this.displaySavedNumbers();
  }

  displaySavedNumbers() {
    const list = document.getElementById('savedNumbers');
    list.innerHTML = '';
    const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
    existing.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `[${entry.time}]  ${entry.numbers}`;
      list.appendChild(li);
    });
  }

  reset() {
    this.initializeBalls();
    this.resultDiv.innerHTML = '';
    this.startBtn.disabled = false;
    this.resetBtn.disabled = true;
  }

  copyNumbers() {
    const numbers = this.selectedBalls.map(b => b.number).join(', ');
    if (numbers) {
      navigator.clipboard.writeText(numbers);
      alert(`클립보드에 복사됨: ${numbers}`);
    }
  }

  shareNumbers() {
    const numbers = this.selectedBalls.map(b => b.number).join(', ');
    const url = 'https://fincode001.github.io/AI_based-lotto/';
    const shareText = `🎯 추천번호: ${numbers}\n📱 바로가기: ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'AI 로또 추천번호', text: shareText, url });
    } else {
      alert('공유를 지원하지 않는 환경입니다.');
    }
  }
}

window.onload = () => {
  new LottoSimulator();
};
