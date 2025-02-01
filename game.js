const moneyValues = [
  { value: 1000, weight: 30 }, // 30% xuất hiện
  { value: 2000, weight: 25 }, // 25% xuất hiện
  { value: 5000, weight: 20 }, // 20% xuất hiện
  { value: 10000, weight: 15 }, // 15% xuất hiện
  { value: 20000, weight: 7 }, // 7% xuất hiện
  { value: 50000, weight: 3 }, // 3% xuất hiện (hiếm nhất)
];

function formatCurrency(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pickMoneyValue() {
  let totalWeight = moneyValues.reduce((sum, money) => sum + money.weight, 0);
  let random = Math.random() * totalWeight;

  for (let money of moneyValues) {
    random -= money.weight;
    if (random <= 0) return money.value;
  }
}

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('start_screen', 'assets/start_screen.png');
  }

  create() {
    this.add.image(300, 0, 'start_screen').setOrigin(0.1);

    this.cameras.main.setBackgroundColor('#CFBA88');

    let nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nhập tên của bạn...';
    nameInput.style.position = 'absolute';
    nameInput.style.top = '46.8%';
    nameInput.style.left = '43%';
    nameInput.style.fontSize = '20px';
    nameInput.style.border = 'none';
    nameInput.style.background = 'none';
    document.body.appendChild(nameInput);

    this.add
      .arc(700, 500, 60, 60, 0, Math.PI * 2, false, 0xff0000)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        let playerName = nameInput.value.trim();
        if (!playerName || playerName.length <= 0) {
          alert('Vui lòng nhập tên của bạn!');
          return;
        }

        localStorage.setItem('playerName', playerName);
        nameInput.remove();
        this.scene.start('GameScene');
      });
  }
}

class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    this.add.text(250, 50, 'Bảng Xếp Hạng', { fontSize: '32px', fill: '#fff' });

    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.sort((a, b) => b.score - a.score);

    let searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Tìm kiếm tên...';
    searchInput.style.position = 'absolute';
    searchInput.style.top = '10%';
    searchInput.style.left = '40%';
    searchInput.style.fontSize = '20px';
    searchInput.style.border = 'none';
    searchInput.style.background = 'none';
    document.body.appendChild(searchInput);

    let displayScores = (filteredScores) => {
      this.children.list.forEach(child => {
      if (child.type === 'Text' && child.y > 100) {
        child.destroy();
      }
      });

      filteredScores.forEach((score, index) => {
      this.add.text(
        250,
        100 + index * 30,
        `${score.name}: ${formatCurrency(score.score)} VND`,
        { fontSize: '24px', fill: '#fff' }
      );
      });
    };

    displayScores(scores);

    searchInput.addEventListener('input', () => {
      let searchTerm = searchInput.value.trim().toLowerCase();
      let filteredScores = scores.filter(score =>
      score.name.toLowerCase().includes(searchTerm)
      );
      displayScores(filteredScores);
    });

    this.events.on('shutdown', () => {
      searchInput.remove();
      this.children.list.forEach(child => {
        if (child.type === 'Text' && child.y > 100) {
          child.destroy();
        }
      });
    });
  }
}

class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  preload() {
    this.load.image('game_over', 'assets/game_over.png');
  }

  create() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'game_over')
      .setScale(0.75)
      .setOrigin(0.5);

    let playerName = localStorage.getItem('playerName');
    let playerScore = localStorage.getItem('playerScore');

    this.add.text(
      550,
      650,
      `${playerName} nhận được: ${formatCurrency(playerScore)} VND`,
      {
        fontSize: '24px',
        fill: '#fff',
      }
    );

    this.add
      .text(300, 450, 'Lưu điểm', {
        fontSize: '24px',
        fill: '#ff0000',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .on('pointerdown', () => {
        let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        scores.push({ name: playerName, score: playerScore });
        localStorage.setItem('leaderboard', JSON.stringify(scores));
        this.scene.start('LeaderboardScene');
      });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.spritesheet('player', 'assets/player2.png', {
      frameWidth: 691.7,
      frameHeight: 570,
      endFrame: 16,
    });
    this.load.image('good_envelope', 'assets/good_envelope.png');
    this.load.image('bad_envelope', 'assets/dep.png');
    this.load.image('label_bg', 'assets/label_bg.png');
    this.load.image('logo_dev', 'assets/logo_dev.png');
    this.load.image('chat', 'assets/chat.png');
  }

  create() {
    this.add
      .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);
    
    // Add logo kv dev
    this.add
      .image((this.scale.width / 2) - 40, (this.scale.height / 2) - 80, 'logo_dev')
      .setOrigin(0, 0)
      .setScale(0.1);

    // Nhân vật người chơi
    this.player = this.physics.add
      .sprite(400, 550, 'player')
      .setFrame(8)
      .setScale(0.2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'player', frame: 8 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 16 }),
      frameRate: 20,
      repeat: -1,
    });

    // Nhóm bao lì xì
    this.envelopes = this.physics.add.group();
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnvelope,
      callbackScope: this,
      loop: true,
    });

    // Điều khiển nhân vật
    this.cursors = this.input.keyboard.createCursorKeys();

    // Điểm và thời gian
    this.totalMoney = 0;
    this.moneyText = this.add.text(20, 20, 'Tổng tiền: 0 VND', {
      fontSize: '18px',
      fill: '#D80000', // Chữ đỏ
      padding: { x: 35, y: 10 },
    });

    // Add background image for the money text
    this.add
      .image(this.moneyText.x - 25, this.moneyText.y - 30, 'label_bg')
      .setOrigin(0, 0)
      .setScale(0.5);

    this.moneyText.setDepth(1); // Ensure text is above the background

    this.timeLeft = 30;
    this.timerText = this.add.text(650, 20, 'Thời gian: 30s', {
      fontSize: '20px',
      fill: '#D80000', // Chữ đỏ
      padding: { x: 15, y: 10 },
    });

    // Add background image for the timer text
    this.add
      .image(this.timerText.x - 70, this.timerText.y - 30, 'label_bg')
      .setOrigin(0, 0)
      .setScale(0.5);

    this.timerText.setDepth(1); // Ensure text is above the background

    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Va chạm giữa người chơi và bao lì xì
    this.physics.add.overlap(
      this.player,
      this.envelopes,
      this.collectEnvelope,
      (player, envelope) => {
        // Adjust the overlap sensitivity by checking the distance
        let distance = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          envelope.x,
          envelope.y
        );
        return distance < 68; // Only trigger overlap if distance is less than 50 pixels
      },
      this
    );
  }

  update() {
    if (this.cursors.left.isDown && this.player.x > 350) {
      this.player.setVelocityX(-300);
      this.player.anims.play('left', true);
    } else if (
      this.cursors.right.isDown &&
      this.player.x < this.scale.width - 300
    ) {
      this.player.setVelocityX(300);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }
  }

  // Tạo bao lì xì (có thể là tốt hoặc xấu)
  spawnEnvelope() {
    let isGood = Phaser.Math.Between(0, 1) === 0; // 50% bao lì xì tốt, 50% bao lì xì xấu
    let envelope = this.envelopes.create(
      Phaser.Math.Between(330, 1050),
      0,
      isGood ? 'good_envelope' : 'bad_envelope'
    );
    envelope.setScale(isGood ? 0.15 : 0.2);
    envelope.setVelocityY(200);
    envelope.isGood = isGood;
  }

  // Xử lý khi bắt được bao lì xì
  collectEnvelope(player, envelope) {
    if (envelope.isGood) {
      let amount = pickMoneyValue(); // Random giá trị tiền
      this.totalMoney += amount;
      this.showMoneyEffect(`Mình xin\n${amount.toLocaleString()}đ :v`, '#057500');
    } else {
      let penalty = pickMoneyValue(); // Random số tiền bị mất
      this.totalMoney -= penalty;
      if (this.totalMoney < 0) this.totalMoney = 0;
      this.showMoneyEffect(`Rơi mất\n${penalty.toLocaleString()}đ :(`, '#ff0000');
    }

    this.moneyText.setText(
      'Tổng tiền: ' + this.totalMoney.toLocaleString() + ' VND'
    );
    envelope.destroy();
  }

  // Hiển thị hiệu ứng số tiền khi bắt được lì xì
  showMoneyEffect(text, color) {
    let moneyPopup = this.add.text(this.player.x + 10, this.player.y - 110, text, {
      fontSize: '18px',
      fill: color,
      fontWeight: 'bold',
    });

    let chatBuble = this.add
      .image(this.player.x + 60, this.player.y - 80, 'chat')
      .setScale(0.4);
    
    moneyPopup.setDepth(1);

    this.time.delayedCall(1000, () => {
      moneyPopup.destroy();
      chatBuble.destroy();
    });
  }

  // Cập nhật thời gian
  updateTimer() {
    this.timeLeft--;
    this.timerText.setText('Thời gian: ' + this.timeLeft + 's');

    if (this.timeLeft <= 0) {
      localStorage.setItem('playerScore', this.totalMoney);
      this.scene.start('ResultScene');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: 'arcade' },
  scene: [StartScene, GameScene, LeaderboardScene, ResultScene],
};

const game = new Phaser.Game(config);
