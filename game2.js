class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("player", "assets/player.png");
        this.load.image("good_envelope", "assets/good_envelope.png");
        this.load.image("bad_envelope", "assets/bad_envelope.png");
    }

    create() {
        this.add
        .image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

        // Nhân vật người chơi
        this.player = this.physics.add.sprite(400, 550, "player").setScale(0.5);
        this.player.setCollideWorldBounds(true);

        // Nhóm bao lì xì
        this.envelopes = this.physics.add.group();
        this.time.addEvent({ delay: 1000, callback: this.spawnEnvelope, callbackScope: this, loop: true });

        // Điều khiển nhân vật
        this.cursors = this.input.keyboard.createCursorKeys();

        // Điểm và thời gian
        this.totalMoney = 0;
        this.moneyText = this.add.text(20, 20, "Tổng tiền: 0 VND", { fontSize: "24px", fill: "#fff" });

        this.timeLeft = 30;
        this.timerText = this.add.text(650, 20, "Thời gian: 30s", { fontSize: "24px", fill: "#fff" });
        this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });

        // Va chạm giữa người chơi và bao lì xì
        this.physics.add.overlap(this.player, this.envelopes, this.collectEnvelope, null, this);
    }

    update() {
        if (this.cursors.left.isDown) this.player.setVelocityX(-300);
        else if (this.cursors.right.isDown) this.player.setVelocityX(300);
        else this.player.setVelocityX(0);
    }

    // Tạo bao lì xì (có thể là tốt hoặc xấu)
    spawnEnvelope() {
        let isGood = Phaser.Math.Between(0, 1) === 0; // 50% bao lì xì tốt, 50% bao lì xì xấu
        let envelope = this.envelopes.create(Phaser.Math.Between(50, 750), 0, isGood ? "good_envelope" : "bad_envelope");
        envelope.setScale(0.5);
        envelope.setVelocityY(200);
        envelope.isGood = isGood;
    }

    // Xử lý khi bắt được bao lì xì
    collectEnvelope(player, envelope) {
        if (envelope.isGood) {
            let amount = Phaser.Math.RND.pick([1000, 2000, 5000, 10000, 20000, 50000]); // Random giá trị tiền
            this.totalMoney += amount;
            this.showMoneyEffect(`+${amount.toLocaleString()} VND`, "#00ff00");
        } else {
            let penalty = Phaser.Math.RND.pick([1000, 2000, 5000]); // Random số tiền bị mất
            this.totalMoney -= penalty;
            this.showMoneyEffect(`-${penalty.toLocaleString()} VND`, "#ff0000");
        }

        this.moneyText.setText("Tổng tiền: " + this.totalMoney.toLocaleString() + " VND");
        envelope.destroy();
    }

    // Hiển thị hiệu ứng số tiền khi bắt được lì xì
    showMoneyEffect(text, color) {
        let moneyPopup = this.add.text(this.player.x, this.player.y - 50, text, {
            fontSize: "20px",
            fill: color,
            fontWeight: "bold"
        });
        this.time.delayedCall(1000, () => moneyPopup.destroy());
    }

    // Cập nhật thời gian
    updateTimer() {
        this.timeLeft--;
        this.timerText.setText("Thời gian: " + this.timeLeft + "s");

        if (this.timeLeft <= 0) {
            localStorage.setItem("playerScore", this.totalMoney);
            this.scene.start("ResultScene");
        }
    }
}
