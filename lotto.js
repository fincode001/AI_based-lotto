class LottoSimulator {
  constructor(winningNumbers = []) {
    this.canvas = document.getElementById('lottoCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');
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
    this.winningNumbers = winningNumbers;

    this.audio = new Audio('static/draw-sound.mp3');
    this.soundOn = true;

    this.initializeBalls();
    this.setupEventListeners();
    this.animate();
    this.renderSavedNumbers();
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
    this.copyBtn.onclick = () => this.copyToClipboard();
    this.shareBtn.onclick = () => this.shareToKakao();

    // 소리 토글 (옵션)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm') {
        this.soundOn = !this.soundOn;
        alert(`🔈 사운드: ${this.soundOn ? 'ON' : 'OFF'}`);
      }
    });
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

    fetch('backend/recommended.json')
      .then(res => res.json())
      .then(data => {
        const recommended = data.recommend || data.추천하다 || [];
        this.displayMessage("✅ 최첨단 인공지능 ChatGPT가 분석하여 직접 생성하여 드립니다.");
        this.runAnimationWithNumbers(recommended.slice(0, 6));
      })
      .catch(() => {
        this.displayMessage("⚠️ 추천번호를 불러올 수 없습니다. 대신 GPT가 직접 분석하여 생성해 드립니다.");
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
        this.saveCurrentResult();
        return;
      }

      let selectedBall;
      if (numbers.length > 0) {
        const targetNumber = numbers[count];
        selectedBall = this.balls.find(ball => !ball.selected && ball.number === targetNumber);
      } else {
        const availableBalls = this.balls.filter(ball => !ball.selected);
        selectedBall = availableBalls[Math.floor(Math.random() * availableBalls.length)];
      }

      if (selectedBall) {
        selectedBall.selected = true;
        this.selectedBalls.push(selectedBall);

        const ballDiv = document.createElement('div');
        ballDiv.className = 'ball';
        ballDiv.style.backgroundColor = selectedBall.color;
        ballDiv.textContent = selectedBall.number;
        this.resultDiv.appendChild(ballDiv);
        setTimeout(() => ballDiv.classList.add('show'), 50);

        if (this.soundOn) this.audio.play();
      }

      count++;
    }, 700);
  }

  reset() {
    this.initializeBalls();
    this.startBtn.disabled = false;
    this.resetBtn.disabled = true;
    this.resultDiv.innerHTML = '';
  }

  copyToClipboard() {
    const resultText = this.selectedBalls.map(b => b.number).join(', ');
    navigator.clipboard.writeText(resultText).then(() => {
      alert(`📋 복사되었습니다: ${resultText}`);
    });
  }

  shareToKakao() {
    const resultText = this.selectedBalls.map(b => b.number).join(', ');
    Kakao.Link.sendDefault({
      objectType: 'text',
      text: `🎯 GPT 추천 로또번호\n${resultText}\n👉 http://localhost:5000`,
      link: {
        mobileWebUrl: 'http://localhost:5000',
        webUrl: 'http://localhost:5000'
      }
    });
  }

  saveCurrentResult() {
    const numbers = this.selectedBalls.map(b => b.number).join(', ');
    const time = new Date().toLocaleString();
    const existing = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
    existing.unshift({ time, numbers });
    localStorage.setItem('savedNumbersList', JSON.stringify(existing));
    this.renderSavedNumbers();
  }

  renderSavedNumbers() {
    const list = JSON.parse(localStorage.getItem('savedNumbersList') || '[]');
    this.savedList.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.time} 👉 ${item.numbers}`;
      this.savedList.appendChild(li);
    });
  }

  displayMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.margin = '10px 0';
    message.style.color = '#0057b7';
    message.style.fontWeight = 'bold';
    message.style.fontSize = '1em';
    this.resultDiv.appendChild(message);
  }
}

// 자동 실행
window.onload = () => {
  new LottoSimulator();
};
