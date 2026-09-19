import * as Phaser from "phaser";
import { GAME_CONSTANTS } from "./config";

export class Cuoi extends Phaser.GameObjects.Container {
  private bodyCircle!: Phaser.GameObjects.Arc;
  private cheeks!: Phaser.GameObjects.Container;
  private face!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.createMascot();
    scene.add.existing(this);
  }

  private createMascot() {
    // Thân tròn kẹo bông màu trắng kem
    this.bodyCircle = this.scene.add.circle(0, 0, 28, 0xfffbf0);
    this.bodyCircle.setStrokeStyle(3, 0xdf8453);
    this.add(this.bodyCircle);

    // Má hồng
    this.cheeks = this.scene.add.container(0, 0);
    const leftCheek = this.scene.add.circle(-14, 4, 5, 0xff88a5, 0.6);
    const rightCheek = this.scene.add.circle(14, 4, 5, 0xff88a5, 0.6);
    this.cheeks.add([leftCheek, rightCheek]);
    this.add(this.cheeks);

    // Mắt và miệng Chú Cuội tươi cười
    this.face = this.scene.add.container(0, 0);
    const leftEye = this.scene.add.circle(-9, -2, 3, 0x3e2723);
    const rightEye = this.scene.add.circle(9, -2, 3, 0x3e2723);
    
    // Nụ cười
    const mouth = this.scene.add.arc(0, 3, 6, 0, 180, false, 0x000000, 0);
    mouth.setStrokeStyle(2, 0x3e2723);

    // Khăn rằn / dải băng đỏ trên đầu
    const headband = this.scene.add.rectangle(0, -18, 38, 8, 0xe53935);
    const knot = this.scene.add.circle(16, -18, 5, 0xd32f2f);

    this.face.add([leftEye, rightEye, mouth, headband, knot]);
    this.add(this.face);
  }

  public playClimbEffect() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 0.9,
      yoyo: true,
      duration: 100,
      ease: "Quad.easeOut",
    });
  }

  public playSlideEffect() {
    this.scene.tweens.add({
      targets: this,
      angle: { from: -10, to: 10 },
      yoyo: true,
      duration: 80,
      repeat: 3,
    });
  }
}
