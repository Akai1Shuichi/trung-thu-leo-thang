import * as Phaser from "phaser";

type Mood = "normal" | "tired" | "panic" | "victory";

/** A small, hand-drawn Cuội that has a distinct front and climbing-back pose. */
export class Cuoi extends Phaser.GameObjects.Container {
  private glowAura!: Phaser.GameObjects.Arc;
  private frontView!: Phaser.GameObjects.Container;
  private backView!: Phaser.GameObjects.Container;
  private face!: Phaser.GameObjects.Container;
  private leftEye!: Phaser.GameObjects.Container;
  private rightEye!: Phaser.GameObjects.Container;
  private happyEyes!: Phaser.GameObjects.Container;
  private mouth!: Phaser.GameObjects.Arc;
  private tiredMouth!: Phaser.GameObjects.Rectangle;
  private sweat!: Phaser.GameObjects.Container;
  private leftHand!: Phaser.GameObjects.Ellipse;
  private rightHand!: Phaser.GameObjects.Ellipse;
  private leftFoot!: Phaser.GameObjects.Ellipse;
  private rightFoot!: Phaser.GameObjects.Ellipse;
  private scarfTails!: Phaser.GameObjects.Container;
  private currentMood: Mood = "normal";
  private isClimbing = false;
  private stepToggle = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.createMascot();
    scene.add.existing(this);
    scene.time.addEvent({ delay: Phaser.Math.Between(2800, 4200), callback: this.playBlink, callbackScope: this, loop: true });
  }

  private createMascot() {
    this.glowAura = this.scene.add.circle(0, 0, 46, 0xf6cb67, 0.12);
    this.add(this.glowAura);
    this.frontView = this.scene.add.container(0, 0);
    this.backView = this.scene.add.container(0, 0);
    this.createFrontView();
    this.createBackView();
    this.add([this.backView, this.frontView]);
    this.setClimbingPose(false);
  }

  private createFrontView() {
    const shadow = this.scene.add.ellipse(0, 37, 44, 9, 0x02010a, 0.35);
    const tunic = this.scene.add.rectangle(0, 10, 47, 42, 0x745033);
    tunic.setStrokeStyle(2, 0x3c2415);
    const tunicLight = this.scene.add.rectangle(-6, 8, 22, 33, 0x956944, 0.58);
    const belt = this.scene.add.rectangle(0, 18, 43, 5, 0x3f281b);
    const beltKnot = this.scene.add.circle(0, 18, 4, 0xd9a95b);
    const neck = this.scene.add.rectangle(0, -12, 12, 12, 0xd7a17e);
    const head = this.scene.add.circle(0, -25, 25, 0xe2ae89);
    head.setStrokeStyle(2.5, 0x4b2d20);
    const hair = this.scene.add.arc(0, -30, 23, 195, 345, false, 0, 0);
    hair.setStrokeStyle(7, 0x24170f);
    const earL = this.scene.add.circle(-25, -24, 5, 0xd49b78);
    const earR = this.scene.add.circle(25, -24, 5, 0xd49b78);
    const cheekL = this.scene.add.ellipse(-16, -18, 8, 4, 0xd88170, 0.45);
    const cheekR = this.scene.add.ellipse(16, -18, 8, 4, 0xd88170, 0.45);
    this.leftHand = this.scene.add.ellipse(-28, 8, 13, 11, 0xe2ae89);
    this.rightHand = this.scene.add.ellipse(28, 8, 13, 11, 0xe2ae89);
    this.leftFoot = this.scene.add.ellipse(-14, 33, 18, 9, 0x2e211c);
    this.rightFoot = this.scene.add.ellipse(14, 33, 18, 9, 0x2e211c);
    this.face = this.scene.add.container(0, 0);
    this.leftEye = this.createEye(-10, -26);
    this.rightEye = this.createEye(10, -26);
    this.happyEyes = this.scene.add.container(0, 0);
    const happyLeft = this.scene.add.arc(-10, -26, 4, 180, 360, false, 0, 0);
    const happyRight = this.scene.add.arc(10, -26, 4, 180, 360, false, 0, 0);
    happyLeft.setStrokeStyle(2.5, 0x2a1a13);
    happyRight.setStrokeStyle(2.5, 0x2a1a13);
    this.happyEyes.add([happyLeft, happyRight]).setVisible(false);
    this.mouth = this.scene.add.arc(0, -14, 6, 0, 180, false, 0, 0);
    this.mouth.setStrokeStyle(2.3, 0x2a1a13);
    this.tiredMouth = this.scene.add.rectangle(0, -14, 10, 2, 0x2a1a13).setVisible(false);
    this.face.add([this.leftEye, this.rightEye, this.happyEyes, this.mouth, this.tiredMouth]);
    const scarf = this.createRedHeadScarf();
    this.sweat = this.scene.add.container(0, 0).setVisible(false);
    this.sweat.add(this.createSweatDrop(28, -30));
    this.frontView.add([shadow, this.leftFoot, this.rightFoot, tunic, tunicLight, belt, beltKnot, neck, earL, earR, head, hair, cheekL, cheekR, this.leftHand, this.rightHand, this.face, scarf, this.sweat]);
  }

  private createBackView() {
    const shadow = this.scene.add.ellipse(0, 37, 44, 9, 0x02010a, 0.35);
    const tunic = this.scene.add.rectangle(0, 9, 49, 43, 0x68442d);
    tunic.setStrokeStyle(2, 0x3c2415);
    const seam = this.scene.add.line(0, -10, 0, 0, 0, 28, 0x3e281c, 0.7);
    seam.setLineWidth(1.5);
    const belt = this.scene.add.rectangle(0, 18, 45, 5, 0x3f281b);
    const neck = this.scene.add.rectangle(0, -12, 12, 12, 0xd7a17e);
    const head = this.scene.add.circle(0, -25, 25, 0xd7a17e);
    head.setStrokeStyle(2.5, 0x4b2d20);
    const hair = this.scene.add.arc(0, -31, 23, 195, 345, false, 0, 0);
    hair.setStrokeStyle(7, 0x24170f);
    const leftArm = this.scene.add.rectangle(-27, 2, 11, 31, 0x745033).setAngle(-25);
    const rightArm = this.scene.add.rectangle(27, -3, 11, 31, 0x745033).setAngle(25);
    const leftHand = this.scene.add.ellipse(-35, -13, 12, 10, 0xe2ae89);
    const rightHand = this.scene.add.ellipse(35, -18, 12, 10, 0xe2ae89);
    const leftFoot = this.scene.add.ellipse(-14, 33, 18, 9, 0x2e211c);
    const rightFoot = this.scene.add.ellipse(14, 33, 18, 9, 0x2e211c);
    const scarf = this.createRedHeadScarf();
    this.backView.add([shadow, leftFoot, rightFoot, tunic, seam, belt, neck, head, hair, leftArm, rightArm, leftHand, rightHand, scarf]);
  }

  private createEye(x: number, y: number) {
    const eye = this.scene.add.container(x, y);
    eye.add([this.scene.add.ellipse(0, 0, 8, 10, 0x2a1a13), this.scene.add.circle(-1.5, -2, 1.4, 0xffffff)]);
    return eye;
  }

  private createRedHeadScarf() {
    const scarf = this.scene.add.arc(0, -28, 27, 195, 345, false, 0, 0);
    scarf.setStrokeStyle(8, 0xc83d42);
    const stripeOne = this.scene.add.line(-12, -48, -3, 0, 3, 8, 0xffd6c7, 0.8);
    stripeOne.setLineWidth(1.5);
    const stripeTwo = this.scene.add.line(0, -50, -3, 0, 3, 8, 0xffd6c7, 0.8);
    stripeTwo.setLineWidth(1.5);
    const tails = this.scene.add.container(24, -34);
    tails.add([this.scene.add.triangle(5, 10, 0, 0, 9, 21, -2, 17, 0x8f252d), this.scene.add.triangle(10, 6, 0, 0, 14, 12, 18, 3, 0xc83d42)]);
    this.scene.tweens.add({ targets: tails, angle: { from: -7, to: 7 }, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    return this.scene.add.container(0, 0, [scarf, stripeOne, stripeTwo, tails]);
  }

  private createSweatDrop(x: number, y: number) {
    const drop = this.scene.add.container(x, y);
    drop.add([this.scene.add.ellipse(0, 0, 7, 10, 0x6fc2dc, 0.9), this.scene.add.triangle(0, -6, -3.5, 1, 3.5, 1, 0, -5, 0x6fc2dc, 0.9)]);
    return drop;
  }

  private setClimbingPose(isClimbing: boolean) {
    this.isClimbing = isClimbing;
    this.frontView.setVisible(!isClimbing);
    this.backView.setVisible(isClimbing);
  }

  private playBlink() {
    if (this.isClimbing || this.currentMood === "victory") return;
    this.scene.tweens.add({ targets: [this.leftEye, this.rightEye], scaleY: 0.15, duration: 90, yoyo: true });
  }

  public playClimbEffect() {
    this.setClimbingPose(true);
    this.stepToggle = !this.stepToggle;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, scaleX: 1.08, scaleY: 0.91, yoyo: true, duration: 90, ease: "Quad.easeOut" });
    this.glowAura.alpha = 0.25;
    this.scene.tweens.add({ targets: this.glowAura, alpha: 0.1, duration: 300 });
  }

  public setMood(mood: Mood) {
    this.currentMood = mood;
    if (this.isClimbing && mood !== "victory") return;
    this.sweat.setVisible(mood === "tired" || mood === "panic");
    this.mouth.setVisible(mood !== "tired" && mood !== "panic");
    this.tiredMouth.setVisible(mood === "tired" || mood === "panic");
    this.leftEye.setVisible(mood !== "victory");
    this.rightEye.setVisible(mood !== "victory");
    this.happyEyes.setVisible(mood === "victory");
  }

  public playSlideEffect() { this.setMood("panic"); this.scene.tweens.add({ targets: this, angle: { from: -14, to: 14 }, yoyo: true, duration: 75, repeat: -1 }); }
  public stopSlideEffect() { this.scene.tweens.killTweensOf(this); this.angle = 0; this.setMood("normal"); }
  public resetToWaitingPose() { this.scene.tweens.killTweensOf(this); this.angle = 0; this.setClimbingPose(false); this.setMood("normal"); }
  public playVictoryAnimation() { this.setClimbingPose(false); this.setMood("victory"); this.scene.tweens.killTweensOf(this); this.scene.tweens.add({ targets: this, y: "-=25", yoyo: true, duration: 400, repeat: -1, ease: "Sine.easeInOut" }); }
}
