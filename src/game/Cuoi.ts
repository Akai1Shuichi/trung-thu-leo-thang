import * as Phaser from "phaser";

export class Cuoi extends Phaser.GameObjects.Container {
  private bodyOuter!: Phaser.GameObjects.Arc;
  private bodyInner!: Phaser.GameObjects.Arc;
  private glowAura!: Phaser.GameObjects.Arc;
  private face!: Phaser.GameObjects.Container;

  private eyeGroup!: Phaser.GameObjects.Container;
  private leftEye!: Phaser.GameObjects.Container;
  private rightEye!: Phaser.GameObjects.Container;
  private happyEyes!: Phaser.GameObjects.Container;

  private mouthNormal!: Phaser.GameObjects.Arc;
  private mouthStraight!: Phaser.GameObjects.Rectangle;
  private mouthPanic!: Phaser.GameObjects.Arc;
  private tongue!: Phaser.GameObjects.Ellipse;

  private cheeks!: Phaser.GameObjects.Container;
  private sweatDrops!: Phaser.GameObjects.Container;
  private sweatDrop1!: Phaser.GameObjects.Container;
  private sweatDrop2!: Phaser.GameObjects.Container;

  private eyebrows!: Phaser.GameObjects.Container;
  private eyebrowL!: Phaser.GameObjects.Rectangle;
  private eyebrowR!: Phaser.GameObjects.Rectangle;

  private ribbonTails!: Phaser.GameObjects.Container;

  private leftHand!: Phaser.GameObjects.Ellipse;
  private rightHand!: Phaser.GameObjects.Ellipse;
  private leftFoot!: Phaser.GameObjects.Ellipse;
  private rightFoot!: Phaser.GameObjects.Ellipse;

  private stepToggle: boolean = false;
  private currentMood: "normal" | "tired" | "panic" | "victory" = "normal";

  private blinkEvent!: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.createMascot();
    scene.add.existing(this);

    this.blinkEvent = this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 4000),
      callback: this.playBlink,
      callbackScope: this,
      loop: true,
    });
  }

  private createMascot() {
    // Glow aura
    this.glowAura = this.scene.add.circle(0, 0, 42, 0xffd700, 0.15);
    this.glowAura.setVisible(false);
    this.add(this.glowAura);

    // Soft shadow below body
    const shadow = this.scene.add.ellipse(0, 36, 40, 10, 0x000000, 0.15);
    this.add(shadow);

    // Thân tròn Chibi/Kawaii
    // Double outline
    this.bodyOuter = this.scene.add.circle(0, 0, 32, 0xfff8ef);
    this.bodyOuter.setStrokeStyle(4, 0xd07c45);
    this.bodyInner = this.scene.add.circle(0, 0, 30.5);
    this.bodyInner.setStrokeStyle(2, 0xf0c88a);
    this.add([this.bodyOuter, this.bodyInner]);

    // Bụng mềm (highlight)
    const bellyHighlight = this.scene.add.ellipse(0, 10, 24, 16, 0xffffff, 0.4);
    this.add(bellyHighlight);

    // Chân
    this.leftFoot = this.scene.add.ellipse(-14, 30, 12, 8, 0xfff8ef);
    this.leftFoot.setStrokeStyle(2, 0xd07c45);
    const leftStrap1 = this.scene.add.rectangle(-14, 28, 12, 1.5, 0x2a1c15);
    const leftStrap2 = this.scene.add.rectangle(-12, 30, 1.5, 8, 0x2a1c15);
    
    this.rightFoot = this.scene.add.ellipse(14, 30, 12, 8, 0xfff8ef);
    this.rightFoot.setStrokeStyle(2, 0xd07c45);
    const rightStrap1 = this.scene.add.rectangle(14, 28, 12, 1.5, 0x2a1c15);
    const rightStrap2 = this.scene.add.rectangle(16, 30, 1.5, 8, 0x2a1c15);
    
    this.add([this.leftFoot, leftStrap1, leftStrap2, this.rightFoot, rightStrap1, rightStrap2]);

    // Tay bám thang (chubby)
    this.leftHand = this.scene.add.ellipse(-28, 6, 12, 10, 0xfff8ef);
    this.leftHand.setStrokeStyle(2, 0xd07c45);
    const lhF1 = this.scene.add.circle(-32, 4, 1.5, 0xd07c45);
    const lhF2 = this.scene.add.circle(-33, 7, 1.5, 0xd07c45);

    this.rightHand = this.scene.add.ellipse(28, -2, 12, 10, 0xfff8ef);
    this.rightHand.setStrokeStyle(2, 0xd07c45);
    const rhF1 = this.scene.add.circle(32, -4, 1.5, 0xd07c45);
    const rhF2 = this.scene.add.circle(33, -1, 1.5, 0xd07c45);

    this.add([this.leftHand, lhF1, lhF2, this.rightHand, rhF1, rhF2]);

    // Má hồng kẹo bông
    this.cheeks = this.scene.add.container(0, 0);
    const leftCheek = this.scene.add.ellipse(-18, 8, 10, 6, 0xff99b3, 0.6);
    const rightCheek = this.scene.add.ellipse(18, 8, 10, 6, 0xff99b3, 0.6);
    this.cheeks.add([leftCheek, rightCheek]);
    this.add(this.cheeks);

    // Pulse tween cho má hồng
    this.scene.tweens.add({
      targets: this.cheeks,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Khuôn mặt
    this.face = this.scene.add.container(0, 0);
    
    // Mắt Chibi
    this.eyeGroup = this.scene.add.container(0, 0);
    this.leftEye = this.scene.add.container(-12, -2);
    const leftSclera = this.scene.add.ellipse(0, 0, 10, 12, 0xffffff);
    const leftIris = this.scene.add.circle(0, 0, 4, 0x2a1c15);
    const leftCatch1 = this.scene.add.circle(-1.5, -2, 1.5, 0xffffff);
    const leftCatch2 = this.scene.add.circle(1, 1.5, 0.8, 0xffffff);
    this.leftEye.add([leftSclera, leftIris, leftCatch1, leftCatch2]);

    this.rightEye = this.scene.add.container(12, -2);
    const rightSclera = this.scene.add.ellipse(0, 0, 10, 12, 0xffffff);
    const rightIris = this.scene.add.circle(0, 0, 4, 0x2a1c15);
    const rightCatch1 = this.scene.add.circle(-1.5, -2, 1.5, 0xffffff);
    const rightCatch2 = this.scene.add.circle(1, 1.5, 0.8, 0xffffff);
    this.rightEye.add([rightSclera, rightIris, rightCatch1, rightCatch2]);

    this.eyeGroup.add([this.leftEye, this.rightEye]);

    // Mắt ăn mừng (híp lại)
    this.happyEyes = this.scene.add.container(0, 0);
    const hLeft = this.scene.add.arc(-12, -2, 5, 180, 360, false, 0, 0);
    hLeft.setStrokeStyle(3, 0x2a1c15);
    const hRight = this.scene.add.arc(12, -2, 5, 180, 360, false, 0, 0);
    hRight.setStrokeStyle(3, 0x2a1c15);
    this.happyEyes.add([hLeft, hRight]);
    this.happyEyes.setVisible(false);

    // Lông mày
    this.eyebrows = this.scene.add.container(0, 0);
    this.eyebrowL = this.scene.add.rectangle(-12, -12, 6, 2, 0x2a1c15);
    this.eyebrowR = this.scene.add.rectangle(12, -12, 6, 2, 0x2a1c15);
    this.eyebrows.add([this.eyebrowL, this.eyebrowR]);
    this.eyebrows.setVisible(false);

    // Miệng
    this.tongue = this.scene.add.ellipse(0, 9, 6, 4, 0xff8da1);
    this.mouthNormal = this.scene.add.arc(0, 6, 6, 0, 180, false, 0, 0);
    this.mouthNormal.setStrokeStyle(2.5, 0x2a1c15);
    this.mouthStraight = this.scene.add.rectangle(0, 8, 8, 2, 0x2a1c15);
    this.mouthStraight.setVisible(false);
    this.mouthPanic = this.scene.add.arc(0, 8, 5, 0, 360, false, 0x2a1c15);
    this.mouthPanic.setVisible(false);

    // Khăn rằn đỏ
    const headband = this.scene.add.arc(0, -5, 24, 210, 330, false, 0, 0);
    headband.setStrokeStyle(8, 0xe53935);
    
    // Pattern khăn
    const stripe1 = this.scene.add.rectangle(-10, -26, 3, 8, 0xffffff, 0.8).setAngle(25);
    const stripe2 = this.scene.add.rectangle(0, -28, 3, 8, 0xffffff, 0.8).setAngle(15);
    const stripe3 = this.scene.add.rectangle(10, -26, 3, 8, 0xffffff, 0.8).setAngle(5);

    // Nút thắt
    const knot1 = this.scene.add.circle(20, -18, 5, 0xb71c1c);
    const knot2 = this.scene.add.circle(22, -16, 5, 0xd32f2f);
    
    // Đuôi khăn đung đưa
    this.ribbonTails = this.scene.add.container(22, -16);
    const tail1 = this.scene.add.triangle(4, 8, 0, 0, 6, 16, -2, 14, 0xb71c1c);
    const tail2 = this.scene.add.triangle(8, 4, 0, 0, 10, 12, 14, 4, 0xd32f2f);
    this.ribbonTails.add([tail1, tail2]);

    this.scene.tweens.add({
      targets: this.ribbonTails,
      angle: { from: -8, to: 8 },
      yoyo: true,
      duration: 1500,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Mồ hôi
    this.sweatDrops = this.scene.add.container(0, 0);
    this.sweatDrop1 = this.createSweatDrop(24, -10);
    this.sweatDrop2 = this.createSweatDrop(-24, 0);
    this.sweatDrop2.setScale(0.7);
    this.sweatDrops.add([this.sweatDrop1, this.sweatDrop2]);
    this.sweatDrops.setVisible(false);

    // Mồ hôi chảy
    this.scene.tweens.add({
      targets: [this.sweatDrop1, this.sweatDrop2],
      y: "+=3",
      yoyo: true,
      duration: 800,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.face.add([
      this.eyeGroup,
      this.happyEyes,
      this.eyebrows,
      this.tongue,
      this.mouthNormal,
      this.mouthStraight,
      this.mouthPanic,
      headband,
      stripe1,
      stripe2,
      stripe3,
      this.ribbonTails,
      knot1,
      knot2,
      this.sweatDrops
    ]);
    this.add(this.face);
  }

  private createSweatDrop(x: number, y: number): Phaser.GameObjects.Container {
    const dropContainer = this.scene.add.container(x, y);
    const drop = this.scene.add.ellipse(0, 0, 8, 10, 0x60a5fa, 0.8);
    const dropTip = this.scene.add.triangle(0, -6, -4, 2, 4, 2, 0, -4, 0x60a5fa, 0.8);
    const highlight = this.scene.add.ellipse(-1, -1, 3, 5, 0xffffff, 0.6).setAngle(-15);
    dropContainer.add([drop, dropTip, highlight]);
    return dropContainer;
  }

  private playBlink() {
    if (this.currentMood === "panic" || this.currentMood === "victory") return;
    
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleY: 0.1,
      duration: 120,
      yoyo: true,
      ease: "Quad.easeInOut"
    });
  }

  public playClimbEffect() {
    this.stepToggle = !this.stepToggle;

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

    // Squash & stretch thân tròn
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 0.88,
      yoyo: true,
      duration: 90,
      ease: "Quad.easeOut",
    });

    // Flash glow aura
    this.glowAura.setVisible(true);
    this.glowAura.alpha = 0.3;
    this.scene.tweens.add({
      targets: this.glowAura,
      alpha: 0.15,
      duration: 300,
      ease: "Sine.easeOut"
    });

    // Dust particle
    const dust = this.scene.add.circle(this.stepToggle ? -14 : 14, 34, 4, 0xffffff, 0.6);
    this.scene.add.existing(dust);
    this.scene.tweens.add({
      targets: dust,
      y: "+=5",
      scale: 0,
      alpha: 0,
      duration: 400,
      onComplete: () => dust.destroy()
    });

    if (this.currentMood !== "panic") {
      this.setMood("normal");
    }
  }

  public setMood(mood: "normal" | "tired" | "panic" | "victory") {
    this.currentMood = mood;
    this.resetFace();

    if (mood === "panic") {
      this.sweatDrops.setVisible(true);
      this.sweatDrop2.setVisible(true);
      this.mouthPanic.setVisible(true);
      this.tongue.setVisible(false);
      this.eyeGroup.setScale(1.3);
      
      this.eyebrows.setVisible(true);
      this.eyebrowL.setAngle(-20);
      this.eyebrowR.setAngle(20);
      this.eyebrowL.y = -16;
      this.eyebrowR.y = -16;
      
    } else if (mood === "tired") {
      this.sweatDrops.setVisible(true);
      this.sweatDrop2.setVisible(false);
      this.mouthStraight.setVisible(true);
      this.tongue.setVisible(false);
      this.leftEye.scaleY = 0.5;
      this.rightEye.scaleY = 0.5;

      this.eyebrows.setVisible(true);
      this.eyebrowL.setAngle(15);
      this.eyebrowR.setAngle(-15);
      this.eyebrowL.y = -12;
      this.eyebrowR.y = -12;

    } else if (mood === "victory") {
      this.mouthNormal.setVisible(true);
      this.mouthNormal.scale = 1.3;
      this.tongue.setVisible(true);
      this.tongue.scale = 1.3;
      
      this.eyeGroup.setVisible(false);
      this.happyEyes.setVisible(true);
      
      this.leftHand.setPosition(-28, -20);
      this.rightHand.setPosition(28, -20);
      this.leftHand.setAngle(45);
      this.rightHand.setAngle(-45);

    } else {
      // Normal
      this.mouthNormal.setVisible(true);
      this.tongue.setVisible(true);
    }
  }

  private resetFace() {
    this.sweatDrops.setVisible(false);
    this.mouthNormal.setVisible(false);
    this.mouthNormal.scale = 1;
    this.mouthStraight.setVisible(false);
    this.mouthPanic.setVisible(false);
    this.tongue.setVisible(false);
    this.tongue.scale = 1;
    this.eyeGroup.setVisible(true);
    this.eyeGroup.setScale(1);
    this.leftEye.scaleY = 1;
    this.rightEye.scaleY = 1;
    this.happyEyes.setVisible(false);
    this.eyebrows.setVisible(false);
    this.leftHand.setAngle(0);
    this.rightHand.setAngle(0);
  }

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

    // Sparkle particles
    this.scene.time.addEvent({
      delay: 200,
      repeat: 10,
      callback: () => {
        if (!this.scene) return;
        const star = this.scene.add.circle(
          this.x + Phaser.Math.Between(-40, 40),
          this.y + Phaser.Math.Between(-40, 0),
          Phaser.Math.Between(2, 5),
          0xffd700
        );
        this.scene.tweens.add({
          targets: star,
          y: "-=20",
          alpha: 0,
          scale: 0,
          duration: 800,
          onComplete: () => star.destroy()
        });
      }
    });
  }
  
  destroy(fromScene?: boolean) {
    if (this.blinkEvent) {
      this.blinkEvent.destroy();
    }
    super.destroy(fromScene);
  }
}
