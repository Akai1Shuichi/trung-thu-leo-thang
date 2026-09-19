import * as Phaser from "phaser";

export class Cuoi extends Phaser.GameObjects.Container {
  private bodyCircle!: Phaser.GameObjects.Arc;
  private cheeks!: Phaser.GameObjects.Container;
  private face!: Phaser.GameObjects.Container;
  private leftEye!: Phaser.GameObjects.Arc;
  private rightEye!: Phaser.GameObjects.Arc;
  private mouth!: Phaser.GameObjects.Arc;
  private sweatDrop!: Phaser.GameObjects.Container;

  private leftHand!: Phaser.GameObjects.Arc;
  private rightHand!: Phaser.GameObjects.Arc;
  private leftFoot!: Phaser.GameObjects.Arc;
  private rightFoot!: Phaser.GameObjects.Arc;

  private stepToggle: boolean = false;
  private currentMood: "normal" | "tired" | "panic" | "victory" = "normal";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.createMascot();
    scene.add.existing(this);
  }

  private createMascot() {
    // Chân
    this.leftFoot = this.scene.add.circle(-12, 28, 7, 0xffeedd);
    this.leftFoot.setStrokeStyle(2, 0xd07c45);
    this.rightFoot = this.scene.add.circle(12, 28, 7, 0xffeedd);
    this.rightFoot.setStrokeStyle(2, 0xd07c45);
    this.add([this.leftFoot, this.rightFoot]);

    // Thân tròn kẹo bông màu trắng ngà kem mềm
    this.bodyCircle = this.scene.add.circle(0, 0, 30, 0xfffcf2);
    this.bodyCircle.setStrokeStyle(3.5, 0xdf8453);
    this.add(this.bodyCircle);

    // Bụng mềm có hoa văn ánh trăng mờ
    const belly = this.scene.add.circle(0, 8, 18, 0xfff4d6, 0.6);
    this.add(belly);

    // Tay bám thang
    this.leftHand = this.scene.add.circle(-26, 6, 8, 0xffeedd);
    this.leftHand.setStrokeStyle(2.5, 0xd07c45);
    this.rightHand = this.scene.add.circle(26, -2, 8, 0xffeedd);
    this.rightHand.setStrokeStyle(2.5, 0xd07c45);
    this.add([this.leftHand, this.rightHand]);

    // Má hồng kẹo bông
    this.cheeks = this.scene.add.container(0, 0);
    const leftCheek = this.scene.add.circle(-15, 6, 6, 0xff94ad, 0.7);
    const rightCheek = this.scene.add.circle(15, 6, 6, 0xff94ad, 0.7);
    this.cheeks.add([leftCheek, rightCheek]);
    this.add(this.cheeks);

    // Khuôn mặt
    this.face = this.scene.add.container(0, 0);
    this.leftEye = this.scene.add.circle(-10, -2, 3.5, 0x2e1c14);
    this.rightEye = this.scene.add.circle(10, -2, 3.5, 0x2e1c14);

    // Ánh mắt lấp lánh (catchlights)
    const leftGlint = this.scene.add.circle(-11, -3.5, 1.2, 0xffffff);
    const rightGlint = this.scene.add.circle(9, -3.5, 1.2, 0xffffff);

    // Nụ cười
    this.mouth = this.scene.add.arc(0, 4, 7, 0, 180, false, 0x000000, 0);
    this.mouth.setStrokeStyle(2.5, 0x2e1c14);

    // Khăn rằn / băng đỏ truyền thống trên trán
    const headband = this.scene.add.rectangle(0, -20, 42, 9, 0xe53935);
    const headbandStripe = this.scene.add.rectangle(0, -20, 42, 2.5, 0xffffff, 0.8);
    const knot = this.scene.add.circle(18, -20, 6, 0xd32f2f);
    const ribbonTail = this.scene.add.triangle(24, -18, 0, 0, 8, -6, 12, 6, 0xb71c1c);

    // Giọt mồ hôi lo lắng (hiển thị khi mệt/hết KAMA)
    this.sweatDrop = this.scene.add.container(22, -10);
    const drop = this.scene.add.circle(0, 0, 4, 0x60a5fa, 0.9);
    const dropTip = this.scene.add.triangle(0, -5, -3, 3, 3, 3, 0, -4, 0x60a5fa);
    this.sweatDrop.add([drop, dropTip]);
    this.sweatDrop.setVisible(false);

    this.face.add([
      this.leftEye,
      this.rightEye,
      leftGlint,
      rightGlint,
      this.mouth,
      headband,
      headbandStripe,
      knot,
      ribbonTail,
      this.sweatDrop,
    ]);
    this.add(this.face);
  }

  /**
   * Animation mỗi khi người chơi chạm/tap để leo thang
   */
  public playClimbEffect() {
    this.stepToggle = !this.stepToggle;

    // Đổi tay chân luân phiên bám bậc thang
    if (this.stepToggle) {
      this.leftHand.y = -4;
      this.rightHand.y = 8;
      this.leftFoot.y = 24;
      this.rightFoot.y = 30;
    } else {
      this.leftHand.y = 8;
      this.rightHand.y = -4;
      this.leftFoot.y = 30;
      this.rightFoot.y = 24;
    }

    // Squash & stretch thân tròn kẹo bông
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 0.88,
      yoyo: true,
      duration: 90,
      ease: "Quad.easeOut",
    });

    if (this.currentMood !== "panic") {
      this.setMood("normal");
    }
  }

  /**
   * Thay đổi trạng thái biểu cảm của Chú Cuội
   */
  public setMood(mood: "normal" | "tired" | "panic" | "victory") {
    this.currentMood = mood;

    if (mood === "panic") {
      this.sweatDrop.setVisible(true);
      this.mouth.setAngle(180); // Miệng mếu
      this.leftEye.setScale(1.3, 0.7);
      this.rightEye.setScale(1.3, 0.7);
    } else if (mood === "tired") {
      this.sweatDrop.setVisible(true);
      this.mouth.setAngle(0);
      this.leftEye.setScale(1, 0.7);
      this.rightEye.setScale(1, 0.7);
    } else if (mood === "victory") {
      this.sweatDrop.setVisible(false);
      this.mouth.setAngle(0);
      this.leftEye.setScale(1, 1);
      this.rightEye.setScale(1, 1);
      // Hai tay giơ lên ăn mừng
      this.leftHand.setPosition(-24, -18);
      this.rightHand.setPosition(24, -18);
    } else {
      // Normal
      this.sweatDrop.setVisible(false);
      this.mouth.setAngle(0);
      this.leftEye.setScale(1, 1);
      this.rightEye.setScale(1, 1);
    }
  }

  /**
   * Hiệu ứng hoảng loạn xoay lắc khi bị trượt thang
   */
  public playSlideEffect() {
    this.setMood("panic");
    this.scene.tweens.add({
      targets: this,
      angle: { from: -14, to: 14 },
      yoyo: true,
      duration: 75,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public stopSlideEffect() {
    this.scene.tweens.killTweensOf(this);
    this.angle = 0;
    this.setMood("normal");
  }

  /**
   * Hiệu ứng ăn mừng vẫy tay nhảy múa khi đến đích
   */
  public playVictoryAnimation() {
    this.setMood("victory");
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      y: "-=25",
      yoyo: true,
      duration: 400,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
