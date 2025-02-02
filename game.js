const moneyValues = [
  { value: 5000, weight: 50 }, // 50% xuất hiện
  { value: 10000, weight: 30 }, // 30% xuất hiện
  { value: 20000, weight: 15 }, // 15% xuất hiện
  { value: 50000, weight: 5 }, // 5% xuất hiện (hiếm nhất)
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

  preload() {
    this.load.image('leader_boarđ', 'assets/leader_board_screen.png');
  }

  create() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'leader_boarđ')
      .setScale(0.8)
      .setOrigin(0.5);

    this.add.text(this.scale.width / 2 - 110, 0, 'Bảng xếp hạng', {
      fontSize: '32px',
      fill: '#fafbe0',
      fontStyle: 'bold',
      padding: { x: 0, y: 145 },
    });

    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.sort((a, b) => b.score - a.score);

    let searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Tìm kiếm tên...';
    searchInput.style.position = 'absolute';
    searchInput.style.top = '31%';
    searchInput.style.left = '39%';
    searchInput.style.fontSize = '20px';
    searchInput.style.border = 'none';
    searchInput.style.width = '300px';
    searchInput.style.background = 'none';
    document.body.appendChild(searchInput);

    let displayScores = (filteredScores) => {
      this.children.list.forEach((child) => {
        if (
          child.type === 'Text' &&
          (child.name.startsWith('score') || child.name.startsWith('player'))
        ) {
          child.destroy();
        }
      });

      // Temp don't know why this fixed overlap when remove text
      for (let i = 0; i < this.children.list.length; i++) {
        const child = this.children.list[i];
        if (
          child.type === 'Text' &&
          (child.name.startsWith('score') || child.name.startsWith('player'))
        ) {
          child.destroy();
        }
      }

      filteredScores.forEach((score, index) => {
        this.add
          .text(this.scale.width / 2 - 210, 300 + index * 45, `${score.name}`, {
            fontSize: '24px',
            fill: '#231C1E',
            fontStyle: 'bold',
            padding: { x: 0, y: 0 },
            align: 'left',
          })
          .setName(`player${index}`);

        this.add
          .text(
            this.scale.width / 2 + 120,
            300 + index * 45,
            `${formatCurrency(score.score)}`,
            {
              fontSize: '24px',
              fill: '#231C1E',
              fontStyle: 'bold',
              align: 'right',
            }
          )
          .setName(`score${index}`);
      });
    };

    displayScores(scores);

    searchInput.addEventListener('input', () => {
      let searchTerm = searchInput.value.trim().toLowerCase();
      let filteredScores = scores.filter((score) =>
        score.name.toLowerCase().includes(searchTerm)
      );
      displayScores(filteredScores);
    });

    this.events.on('shutdown', () => {
      searchInput.remove();
      this.children.list.forEach((child) => {
        if (
          child.type === 'Text' &&
          (child.name.startsWith('score') || child.name.startsWith('player'))
        ) {
          child.destroy();
        }
      });
    });

    this.add
      .text(this.scale.width / 2 - 170, this.scale.height / 2 + 300, ' ', {
        fontSize: '24px',
        fill: '#ff0000',
        padding: { x: 160, y: 20 },
      })
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.scene.start('StartScene');
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
      .setScale(0.8)
      .setOrigin(0.5);

    let playerName = localStorage.getItem('playerName');
    let playerScore = localStorage.getItem('playerScore');

    this.add.text(
      this.scale.width / 2 - 180,
      this.scale.height / 2 - 50,
      `Chúc mừng ${playerName} nhận được`,
      {
        fontSize: '24px',
        fill: '#6C070E',
        align: 'center',
      }
    );

    this.add.text(
      this.scale.width / 2 - 180,
      this.scale.height / 2,
      `${formatCurrency(playerScore)} VND`,
      {
        fontSize: '24px',
        fill: '#6C070E',
        padding: { x: 100, y: 0 },
        align: 'center',
        fontStyle: 'bold',
      }
    );

    this.add.text(
      this.scale.width / 2 - 190,
      this.scale.height / 2,
      `AN KHANG - THỊNH VƯỢNG\nVẠN SỰ NHƯ Ý`,
      {
        fontSize: '30px',
        fill: '#6C070E',
        padding: { x: 0, y: 50 },
        align: 'center',
        fontStyle: 'bold',
      }
    );

    this.add.text(
      this.scale.width / 2 - 45,
      this.scale.height / 2 - 300,
      `2025`,
      {
        fontSize: '48px',
        fill: '#D4CCC3',
        padding: { x: 0, y: 0 },
        align: 'center',
        fontStyle: 'bold',
      }
    );

    this.add.text(
      this.scale.width / 2 - 120,
      this.scale.height / 2 - 205,
      `Xuân Ất Tỵ - 2025`,
      {
        fontSize: '24px',
        fill: '#D4CCC3',
        padding: { x: 0, y: 0 },
        align: 'center',
        fontStyle: 'bold',
      }
    );

    // Continue button
    this.add
      .text(this.scale.width / 2 - 220, this.scale.height / 2 + 250, ' ', {
        fontSize: '24px',
        fill: '#ff0000',
        padding: { x: 90, y: 20 },
      })
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.saveScore();
        this.scene.start('GameScene');
      });

    // Show leaderboard button
    this.add
      .text(this.scale.width / 2 + 20, this.scale.height / 2 + 250, ' ', {
        fontSize: '24px',
        fill: '#ff0000',
        padding: { x: 90, y: 20 },
      })
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.saveScore();
        this.scene.start('LeaderboardScene');
      });
  }

  saveScore() {
    let playerName = localStorage.getItem('playerName');
    let playerScore = localStorage.getItem('playerScore');
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    scores.push({ name: playerName, score: playerScore });
    localStorage.setItem('leaderboard', JSON.stringify(scores));
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
    this.load.image('chill_1', 'assets/chill_1.png');
    this.load.image('cup', 'assets/cup.png');
  }

  create() {
    this.add
      .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Add cup go to leader board
    this.add
      .image(this.scale.width / 2 + 400, this.scale.height / 2 - 375, 'cup')
      .setOrigin(0, 0)
      .setScale(0.15);

    this.add
      .text(this.scale.width / 2 + 409, this.scale.height / 2 - 370, ' ', {
        fontSize: '24px',
        fill: '#ff0000',
        padding: { x: 23, y: 18 },
      })
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.scene.start('LeaderboardScene');
      });

    // Add logo kv dev
    this.add
      .image(this.scale.width / 2 - 40, this.scale.height / 2 - 80, 'logo_dev')
      .setOrigin(0, 0)
      .setScale(0.1);

    // Add chill 1
    this.add
      .image(80, this.scale.height / 2 - 15, 'chill_1')
      .setOrigin(0)
      .setScale(0.4);

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
    let badChance = this.getBadEnvelopeChance();
    let isGood = Phaser.Math.Between(0, 100) > badChance;
    let speed = this.getEnvelopeSpeed();

    let spawnX = Phaser.Math.Between(330, 1050);
    let envelope = this.envelopes.create(
      spawnX,
      0,
      isGood ? 'good_envelope' : 'bad_envelope'
    );
    envelope.setScale(isGood ? 0.15 : 0.2);
    envelope.setVelocityY(speed);
    envelope.isGood = isGood;

    // Nếu tổng tiền >= 50k, đôi khi sẽ rơi 2-3 bao lì xì
    if (this.totalMoney >= 50000 && Phaser.Math.Between(0, 100) > 60) {
      let extraCount = Phaser.Math.Between(1, 2); // Rơi thêm 1 hoặc 2 bao lì xì
      let hasBadEnvelope = false;

      for (let i = 0; i < extraCount; i++) {
        let extraIsGood = Phaser.Math.Between(0, 100) > badChance;

        // Đảm bảo ít nhất một bao lì xì xấu nếu có nhiều bao lì xì rơi cùng lúc
        if (i === extraCount - 1 && !hasBadEnvelope) {
          extraIsGood = false; // Ép một cái phải là dép
        }

        if (!extraIsGood) {
          hasBadEnvelope = true; // Đánh dấu đã có dép xuất hiện
        }

        let extraEnvelope = this.envelopes.create(
          Phaser.Math.Between(330, 1050),
          0,
          extraIsGood ? 'good_envelope' : 'bad_envelope'
        );
        extraEnvelope.setScale(extraIsGood ? 0.15 : 0.2);
        extraEnvelope.setVelocityY(speed + Phaser.Math.Between(50, 100));
        extraEnvelope.isGood = extraIsGood;
      }
    }
  }

  // Xử lý khi bắt được bao lì xì
  collectEnvelope(player, envelope) {
    if (envelope.isGood) {
      let amount = pickMoneyValue(); // Random giá trị tiền

      if (this.totalMoney + amount > 100000) {
        amount = 100000 - this.totalMoney;
      }

      if (amount > 0) {
        // Chỉ hiển thị nếu số tiền > 0
        this.totalMoney += amount;
        this.showMoneyEffect(`Húp\n${amount.toLocaleString()}đ :v`, '#057500');
      }
    } else {
      let penalty = pickMoneyValue(); // Random số tiền bị mất
      this.totalMoney -= penalty;
      if (this.totalMoney < 0) this.totalMoney = 0;
      this.showMoneyEffect(
        `Rơi mất\n${penalty.toLocaleString()}đ :(`,
        '#ff0000'
      );
    }

    this.moneyText.setText(
      'Tổng tiền: ' + this.totalMoney.toLocaleString() + ' VND'
    );
    envelope.destroy();
  }

  // Hiển thị hiệu ứng số tiền khi bắt được lì xì
  showMoneyEffect(text, color) {
    let moneyPopup = this.add.text(
      this.player.x + 10,
      this.player.y - 110,
      text,
      {
        fontSize: '18px',
        fill: color,
        fontWeight: 'bold',
      }
    );

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

  getEnvelopeSpeed() {
    if (this.totalMoney < 40000) return 300;
    if (this.totalMoney < 70000) return 450;
    if (this.totalMoney < 90000) return 600;
    return 750; // Khi gần 100,000 VND, tốc độ nhanh nhất
  }

  getBadEnvelopeChance() {
    if (this.totalMoney < 40000) return 40;
    if (this.totalMoney < 70000) return 55;
    if (this.totalMoney < 90000) return 65;
    return 80; // Khi gần 100,000 VND, dép xuất hiện nhiều hơn
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: 'arcade' },
  scene: [StartScene, GameScene, LeaderboardScene , ResultScene],
};

const game = new Phaser.Game(config);
