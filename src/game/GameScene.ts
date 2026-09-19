import * as Phaser from "phaser";
import { GameConfig, GameEventPayloads, Gift } from "@/types/game";
import { Cuoi } from "./Cuoi";
import { GAME_CONSTANTS } from "./config";

export class GameScene extends Phaser.Scene {
  private configData!: GameConfig;
  private callbacks!: GameEventPayloads;

  private cuoi!: Cuoi;
  private kama: number = GAME_CONSTANTS.KAMA_INITIAL;
  private currentStep: number = 0;
  private currentStepFloat: number = 0;
  private targetStepFloat: number = 0;

  private isSliding: boolean = false;
  private slideTargetStep: number = 0;
  private isPausedForGift: boolean = false;
  private isVictory: boolean = false;

  private unopenedGifts: Map<number, Gift> = new Map();
  private giftObjects: Map<number, Phaser.GameObjects.Container> = new Map();

  // Đồ họa thế giới
  private ladderRungs: Phaser.GameObjects.Container[] = [];
  private moonContainer!: Phaser.GameObjects.Container;
  private starsContainer!: Phaser.GameObjects.Container;
  private cloudsContainer!: Phaser.GameObjects.Container;
  private groundContainer!: Phaser.GameObjects.Container;
  private skyGradient!: Phaser.GameObjects.Graphics;

  // Tùy chỉnh theo độ khó
  private kamaDrainRate: number = GAME_CONSTANTS.KAMA_DRAIN_PER_SEC;
  private kamaPerTap: number = GAME_CONSTANTS.KAMA_PER_TAP;
  private slideStepPenalty: number = 3.5;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { config: GameConfig; callbacks: GameEventPayloads }) {
    this.configData = data.config;
    this.callbacks = data.callbacks;

    // Thiết lập thông số theo độ khó
    const diff = data.config.difficulty || "normal";
    if (diff === "easy") {
      this.kamaDrainRate = 11;
      this.kamaPerTap = 10;
      this.slideStepPenalty = 2;
    } else if (diff === "hard") {
      this.kamaDrainRate = 23;
      this.kamaPerTap = 6.5;
      this.slideStepPenalty = 5;
    } else {
      this.kamaDrainRate = 16;
      this.kamaPerTap = 8;
      this.slideStepPenalty = 3.5;
    }

    // Khởi tạo danh sách quà chưa mở
    this.unopenedGifts.clear();
    this.giftObjects.clear();
    if (this.configData.gifts) {
      this.configData.gifts.forEach((g) => {
        this.unopenedGifts.set(g.step, g);
      });
    }

    this.currentStep = 0;
    this.currentStepFloat = 0;
    this.targetStepFloat = 0;
    this.kama = GAME_CONSTANTS.KAMA_INITIAL;
    this.isSliding = false;
    this.isPausedForGift = false;
    this.isVictory = false;
  }

  create() {
    const { width, height } = this.scale;
    const totalSteps = this.configData.steps;
    const stepHeight = GAME_CONSTANTS.STEP_HEIGHT;
    const worldHeight = totalSteps * stepHeight + height;

    // Cài đặt Camera và ranh giới thế giới
    this.cameras.main.setBounds(0, -worldHeight + height, width, worldHeight);
    this.cameras.main.setBackgroundColor(0x0a071b);

    // 1. Vẽ nền trời đa tầng (Sky gradient & background layers)
    this.createAtmosphere(width, worldHeight, height);

    // 2. Vẽ thang tre (Bamboo Ladder)
    this.createLadder(width, totalSteps, stepHeight);

    // 3. Đặt các hộp quà tại các bậc
    this.createGifts(width, stepHeight);

    // 4. Tạo Cung Trăng tại đỉnh thang
    this.createMoon(width, totalSteps, stepHeight);

    // 5. Tạo Chú Cuội
    const startY = 0; // Tọa độ mặt đất tại bậc 0
    this.cuoi = new Cuoi(this, width / 2, startY);

    // 6. Xử lý tương tác Tap / Click / Phím
    this.input.on("pointerdown", () => {
      this.handleTap();
    });

    this.input.keyboard?.on("keydown-SPACE", () => {
      this.handleTap();
    });
    this.input.keyboard?.on("keydown-UP", () => {
      this.handleTap();
    });

    // Thông báo trạng thái ban đầu cho React
    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStepChange?.(this.currentStep, totalSteps);
    this.callbacks.onStateChange?.("playing");
  }

  /**
   * Tạo môi trường không gian Trung Thu với 5 tầng cảnh vật
   */
  private createAtmosphere(width: number, worldHeight: number, screenHeight: number) {
    // Nền trời chuyển màu Parallax
    this.skyGradient = this.add.graphics();
    this.skyGradient.setScrollFactor(0); // Cố định theo màn hình để tạo hiệu ứng chuyển màu động
    this.updateSkyColor(0);

    // Ngàn sao lấp lánh (Tầng trời cao)
    this.starsContainer = this.add.container(0, 0);
    for (let i = 0; i < 90; i++) {
      const starX = Phaser.Math.Between(15, width - 15);
      const starY = Phaser.Math.Between(-worldHeight + screenHeight, -screenHeight * 0.4);
      const starSize = Phaser.Math.FloatBetween(1, 2.5);
      const starAlpha = Phaser.Math.FloatBetween(0.4, 0.9);
      const star = this.add.circle(starX, starY, starSize, 0xffffff, starAlpha);

      // Hiệu ứng nhấp nháy
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
      });

      this.starsContainer.add(star);
    }

    // Biển mây bồng bềnh (Tầng giữa)
    this.cloudsContainer = this.add.container(0, 0);
    for (let i = 0; i < 18; i++) {
      const cloudY = Phaser.Math.Between(-worldHeight * 0.75, -worldHeight * 0.25);
      const cloudX = Phaser.Math.Between(20, width - 20);
      const cloud = this.createCloud(cloudX, cloudY);
      this.cloudsContainer.add(cloud);
    }

    // Mặt đất & Làng quê (Tầng dưới cùng)
    this.groundContainer = this.add.container(0, 0);
    const ground = this.add.rectangle(width / 2, 70, width, 140, 0x1b2b1a);
    const grassLine = this.add.rectangle(width / 2, 2, width, 6, 0x4ade80);
    
    // Đèn lồng trang trí hai bên mặt đất
    const lanternLeft = this.createLantern(width / 2 - 85, -20);
    const lanternRight = this.createLantern(width / 2 + 85, -20);

    this.groundContainer.add([ground, grassLine, lanternLeft, lanternRight]);
  }

  private createCloud(x: number, y: number): Phaser.GameObjects.Container {
    const cloud = this.add.container(x, y);
    const c1 = this.add.circle(0, 0, 32, 0xffffff, 0.18);
    const c2 = this.add.circle(-22, 6, 22, 0xffffff, 0.15);
    const c3 = this.add.circle(22, 6, 24, 0xffffff, 0.15);
    cloud.add([c1, c2, c3]);

    // Trôi nhẹ
    this.tweens.add({
      targets: cloud,
      x: x + Phaser.Math.Between(-25, 25),
      duration: Phaser.Math.Between(4000, 7000),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return cloud;
  }

  private createLantern(x: number, y: number): Phaser.GameObjects.Container {
    const lantern = this.add.container(x, y);
    const rope = this.add.line(0, -12, 0, 0, 0, 10, 0xd97706);
    const body = this.add.rectangle(0, 0, 18, 22, 0xef4444);
    const rimTop = this.add.rectangle(0, -11, 16, 3, 0xf59e0b);
    const rimBottom = this.add.rectangle(0, 11, 16, 3, 0xf59e0b);
    const tassel = this.add.line(0, 16, 0, 0, 0, 8, 0xfbbf24);
    const light = this.add.circle(0, 0, 12, 0xfef08a, 0.35);

    lantern.add([light, rope, body, rimTop, rimBottom, tassel]);

    // Đung đưa trong gió
    this.tweens.add({
      targets: lantern,
      angle: { from: -5, to: 5 },
      duration: Phaser.Math.Between(1800, 2600),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return lantern;
  }

  /**
   * Tạo thang tre leo lên Cung Trăng
   */
  private createLadder(width: number, totalSteps: number, stepHeight: number) {
    const centerX = width / 2;
    const ladderWidth = 70;
    const leftPoleX = centerX - ladderWidth / 2;
    const rightPoleX = centerX + ladderWidth / 2;

    const totalHeight = totalSteps * stepHeight;

    // 2 Cọc thang tre dọc
    const leftPole = this.add.rectangle(leftPoleX, -totalHeight / 2, 7, totalHeight + 100, 0xa16207);
    leftPole.setStrokeStyle(1.5, 0x713f12);

    const rightPole = this.add.rectangle(rightPoleX, -totalHeight / 2, 7, totalHeight + 100, 0xa16207);
    rightPole.setStrokeStyle(1.5, 0x713f12);

    // Các bậc thang ngang (Rungs)
    for (let i = 0; i <= totalSteps; i++) {
      const rungY = -i * stepHeight;
      const rung = this.add.container(centerX, rungY);

      const bar = this.add.rectangle(0, 0, ladderWidth + 8, 7, 0xca8a04);
      bar.setStrokeStyle(1.5, 0x713f12);
      rung.add(bar);

      // Hiển thị số bậc mỗi 5 bậc hoặc bậc cuối
      if (i > 0 && (i % 5 === 0 || i === totalSteps)) {
        const stepText = this.add.text(ladderWidth / 2 + 16, 0, `${i}`, {
          fontSize: "10px",
          color: "#fef08a",
          fontStyle: "bold",
          fontFamily: "monospace",
        });
        stepText.setOrigin(0, 0.5);
        rung.add(stepText);

        // Treo đèn lồng nhỏ trang trí ở các mốc chục bậc (10, 20, 30...)
        if (i % 10 === 0 && i < totalSteps) {
          const miniLantern = this.createLantern(-ladderWidth / 2 - 14, 0);
          rung.add(miniLantern);
        }
      }

      this.ladderRungs.push(rung);
    }
  }

  /**
   * Đặt các hộp quà tại các bậc cấu hình
   */
  private createGifts(width: number, stepHeight: number) {
    const centerX = width / 2;

    this.unopenedGifts.forEach((gift, step) => {
      const giftY = -step * stepHeight;
      const giftContainer = this.add.container(centerX, giftY - 14);

      // Hộp quà đồ họa rực rỡ
      const box = this.add.rectangle(0, 0, 26, 26, 0xe11d48);
      box.setStrokeStyle(2, 0xfff1f2);

      // Ruy băng vàng
      const ribbonH = this.add.rectangle(0, 0, 26, 6, 0xfacc15);
      const ribbonV = this.add.rectangle(0, 0, 6, 26, 0xfacc15);

      // Nơ quà
      const bowLeft = this.add.circle(-4, -15, 5, 0xfacc15);
      const bowRight = this.add.circle(4, -15, 5, 0xfacc15);

      // Ánh sáng phát ra từ hộp quà
      const glow = this.add.circle(0, 0, 20, 0xfde047, 0.35);

      giftContainer.add([glow, box, ribbonH, ribbonV, bowLeft, bowRight]);

      // Hiệu ứng bồng bềnh nhấp nháy thu hút người chơi
      this.tweens.add({
        targets: giftContainer,
        y: giftY - 20,
        yoyo: true,
        duration: 900,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.giftObjects.set(step, giftContainer);
    });
  }

  /**
   * Tạo vầng Cung Trăng rực rỡ tại đỉnh thang
   */
  private createMoon(width: number, totalSteps: number, stepHeight: number) {
    const moonY = -totalSteps * stepHeight - 65;
    const centerX = width / 2;

    this.moonContainer = this.add.container(centerX, moonY);

    // Hào quang trăng rằm
    const outerAura = this.add.circle(0, 0, 95, 0xfef08a, 0.15);
    const innerAura = this.add.circle(0, 0, 75, 0xfef08a, 0.28);

    // Thân Mặt Trăng
    const moonBody = this.add.circle(0, 0, 58, 0xfffbeb);
    moonBody.setStrokeStyle(3, 0xfef08a);

    // Vết tích Cung Trăng / Hố trăng mờ nghệ thuật
    const crater1 = this.add.circle(-18, -12, 11, 0xfde68a, 0.6);
    const crater2 = this.add.circle(16, 18, 14, 0xfde68a, 0.5);
    const crater3 = this.add.circle(12, -22, 8, 0xfde68a, 0.5);

    // Cung điện ánh sáng nhỏ trên trăng
    const palaceRoof = this.add.triangle(0, 6, -16, 0, 16, 0, 0, -12, 0xe11d48);
    const palacePillars = this.add.rectangle(0, 12, 20, 12, 0xfef08a);

    // Dải mây lụa vắt ngang trăng
    const silkCloud = this.add.rectangle(0, 28, 120, 12, 0xffffff, 0.55);

    this.moonContainer.add([
      outerAura,
      innerAura,
      moonBody,
      crater1,
      crater2,
      crater3,
      palacePillars,
      palaceRoof,
      silkCloud,
    ]);

    // Hiệu ứng vầng trăng tỏa sáng
    this.tweens.add({
      targets: [outerAura, innerAura],
      scale: 1.08,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Xử lý thao tác Tap / Click leo thang
   */
  public handleTap() {
    if (this.isPausedForGift || this.isVictory || this.isSliding) {
      return;
    }

    // Tăng bậc mục tiêu
    this.targetStepFloat = Math.min(this.configData.steps, this.targetStepFloat + 1);

    // Hồi phục KAMA khi tap
    this.kama = Math.min(GAME_CONSTANTS.KAMA_MAX, this.kama + this.kamaPerTap);
    this.callbacks.onKamaChange?.(this.kama);

    // Animation Chú Cuội
    this.cuoi.playClimbEffect();

    // Hiệu ứng hạt ánh sáng bay ra từ chân Cuội
    this.spawnClimbSparkles(this.cuoi.x, this.cuoi.y + 20);
  }

  private spawnClimbSparkles(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const spark = this.add.circle(
        x + Phaser.Math.Between(-14, 14),
        y,
        Phaser.Math.FloatBetween(2, 3.5),
        0xfde047
      );
      this.tweens.add({
        targets: spark,
        y: y + Phaser.Math.Between(15, 30),
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }
  }

  /**
   * Tiếp tục leo sau khi mở quà (Được gọi từ React component)
   */
  public resumeAfterGift() {
    this.isPausedForGift = false;
    this.kama = Math.min(GAME_CONSTANTS.KAMA_MAX, this.kama + GAME_CONSTANTS.GIFT_KAMA_BONUS);
    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStateChange?.("playing");
  }

  /**
   * Chơi lại màn chơi (Reset to start)
   */
  public restartGame() {
    this.isPausedForGift = false;
    this.isVictory = false;
    this.isSliding = false;
    this.currentStep = 0;
    this.currentStepFloat = 0;
    this.targetStepFloat = 0;
    this.kama = GAME_CONSTANTS.KAMA_INITIAL;

    // Reset lại quà
    this.unopenedGifts.clear();
    this.configData.gifts.forEach((g) => {
      this.unopenedGifts.set(g.step, g);
      const giftObj = this.giftObjects.get(g.step);
      if (giftObj) {
        giftObj.setVisible(true);
        giftObj.setScale(1);
      }
    });

    this.cuoi.stopSlideEffect();
    this.cuoi.setPosition(this.scale.width / 2, 0);

    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStepChange?.(0, this.configData.steps);
    this.callbacks.onStateChange?.("playing");
  }

  update(time: number, delta: number) {
    if (this.isPausedForGift || this.isVictory) {
      return;
    }

    const dtSeconds = delta / 1000;

    // 1. Quản lý trạng thái Trượt tụt dốc (Sliding) khi hết KAMA
    if (this.isSliding) {
      this.targetStepFloat -= 5 * dtSeconds;
      this.currentStepFloat = this.targetStepFloat;

      if (this.currentStepFloat <= this.slideTargetStep || this.currentStepFloat <= 0) {
        // Kết thúc trượt, hồi lại KAMA để tiếp tục
        this.isSliding = false;
        this.currentStepFloat = Math.max(0, this.slideTargetStep);
        this.targetStepFloat = this.currentStepFloat;
        this.kama = GAME_CONSTANTS.KAMA_RECOVERY_ON_SLIDE;
        this.cuoi.stopSlideEffect();
        this.callbacks.onKamaChange?.(this.kama);
        this.callbacks.onStateChange?.("playing");
      }
    } else {
      // 2. Gameplay leo bậc bình thường: Tiêu hao KAMA liên tục
      if (this.kama > 0) {
        this.kama = Math.max(0, this.kama - this.kamaDrainRate * dtSeconds);
        this.callbacks.onKamaChange?.(this.kama);

        if (this.kama < 25) {
          this.cuoi.setMood("tired");
        }
      }

      // Khi KAMA tụt về 0: Kích hoạt trượt tụt dốc
      if (this.kama <= 0 && !this.isSliding && this.currentStepFloat > 0) {
        this.isSliding = true;
        this.slideTargetStep = Math.max(0, this.currentStepFloat - this.slideStepPenalty);
        this.cuoi.playSlideEffect();
        this.callbacks.onStateChange?.("sliding");
      }

      // Smooth lerp vị trí bậc
      this.currentStepFloat = Phaser.Math.Linear(
        this.currentStepFloat,
        this.targetStepFloat,
        0.18
      );
    }

    // 3. Cập nhật vị trí Chú Cuội theo số bậc
    const cuoiY = -this.currentStepFloat * GAME_CONSTANTS.STEP_HEIGHT;
    this.cuoi.y = cuoiY;

    // Cập nhật số bậc nguyên hiện tại
    const newStepInt = Math.floor(this.currentStepFloat);
    if (newStepInt !== this.currentStep) {
      this.currentStep = newStepInt;
      this.callbacks.onStepChange?.(this.currentStep, this.configData.steps);
    }

    // 4. Camera bám sát Chú Cuội
    this.cameras.main.scrollY = cuoiY - this.scale.height * 0.65;

    // 5. Cập nhật màu nền trời theo độ cao
    const progressPercent = Math.min(1, this.currentStepFloat / this.configData.steps);
    this.updateSkyColor(progressPercent);

    // 6. Kiểm tra va chạm / chạm mốc Quà tặng
    if (!this.isSliding && !this.isPausedForGift) {
      this.checkGiftCheckpoints();
    }

    // 7. Kiểm tra chạm đỉnh Cung Trăng (Chiến thắng)
    if (this.currentStepFloat >= this.configData.steps && !this.isVictory) {
      this.triggerVictory();
    }
  }

  private checkGiftCheckpoints() {
    for (const [step, gift] of this.unopenedGifts.entries()) {
      if (this.currentStepFloat >= step) {
        // Tạm dừng game để mở quà
        this.isPausedForGift = true;
        this.unopenedGifts.delete(step);

        // Hiệu ứng nổ quà
        const giftObj = this.giftObjects.get(step);
        if (giftObj) {
          this.tweens.add({
            targets: giftObj,
            scale: 1.5,
            alpha: 0,
            duration: 350,
            onComplete: () => giftObj.setVisible(false),
          });
        }

        this.callbacks.onStateChange?.("gift");
        this.callbacks.onGiftReached?.(gift);
        break;
      }
    }
  }

  private triggerVictory() {
    this.isVictory = true;
    this.cuoi.playVictoryAnimation();
    this.callbacks.onStateChange?.("victory");
    this.callbacks.onVictory?.(this.configData.finalMessage);
  }

  /**
   * Chuyển đổi màu sắc bầu trời mượt mà qua 5 tầng:
   * Làng quê (xanh tím) -> Mái ngói (tím đậm) -> Biển mây (xanh thẫm) -> Trời sao (đen huyền) -> Cung Trăng (vàng kim vũ trụ)
   */
  private updateSkyColor(progress: number) {
    this.skyGradient.clear();
    const { width, height } = this.scale;

    let topColor = 0x070417;
    let bottomColor = 0x1e1233;

    if (progress < 0.25) {
      // Tầng 1: Làng quê đêm hội
      topColor = 0x0f0c29;
      bottomColor = 0x24243e;
    } else if (progress < 0.5) {
      // Tầng 2: Mái ngói rêu phong & lồng đèn
      topColor = 0x140b28;
      bottomColor = 0x3d1742;
    } else if (progress < 0.75) {
      // Tầng 3: Biển mây & trời đêm
      topColor = 0x0b1026;
      bottomColor = 0x221338;
    } else {
      // Tầng 4 & 5: Cung Trăng rực rỡ
      topColor = 0x18140c;
      bottomColor = 0x3d2914;
    }

    this.skyGradient.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    this.skyGradient.fillRect(0, 0, width, height);
  }
}
