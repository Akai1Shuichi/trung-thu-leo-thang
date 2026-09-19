import * as Phaser from "phaser";
import { GameConfig, GameEventPayloads, Gift } from "@/types/game";
import { DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { Cuoi } from "./Cuoi";
import { GAME_CONSTANTS } from "./config";

export class GameScene extends Phaser.Scene {
  private configData: GameConfig = DEFAULT_GAME_CONFIG;
  private callbacks: GameEventPayloads = {};

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

  // Đồ họa thế giới & Parallax Layers
  private skyGradient!: Phaser.GameObjects.Graphics;
  private shootingStarTimer: number = 0;

  // Tùy chỉnh theo độ khó
  private kamaDrainRate: number = GAME_CONSTANTS.KAMA_DRAIN_PER_SEC;
  private kamaPerTap: number = GAME_CONSTANTS.KAMA_PER_TAP;
  private slideStepPenalty: number = 3.5;
  private idleSlideSpeed: number = 0.9; // Bậc trượt xuống mỗi giây khi đứng yên
  private timeSinceLastTap: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data?: { config?: GameConfig; callbacks?: GameEventPayloads }) {
    this.configData = data?.config || DEFAULT_GAME_CONFIG;
    this.callbacks = data?.callbacks || {};

    const diff = this.configData.difficulty || "normal";
    if (diff === "easy") {
      this.kamaDrainRate = 11;
      this.kamaPerTap = 10;
      this.slideStepPenalty = 2;
      this.idleSlideSpeed = 0.6;
    } else if (diff === "hard") {
      this.kamaDrainRate = 23;
      this.kamaPerTap = 6.5;
      this.slideStepPenalty = 5;
      this.idleSlideSpeed = 1.35;
    } else {
      this.kamaDrainRate = 16;
      this.kamaPerTap = 8;
      this.slideStepPenalty = 3.5;
      this.idleSlideSpeed = 0.9;
    }

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
    this.timeSinceLastTap = 0;
    this.kama = GAME_CONSTANTS.KAMA_INITIAL;
    this.isSliding = false;
    this.isPausedForGift = false;
    this.isVictory = false;
  }

  create() {
    const { width, height } = this.scale;
    const totalSteps = this.configData.steps;
    const stepHeight = GAME_CONSTANTS.STEP_HEIGHT;
    const extraTopHeadroom = 450; // Cho phép camera cuộn hẳn lên trên Cung Trăng
    const worldHeight = totalSteps * stepHeight + height + extraTopHeadroom;

    this.cameras.main.setBounds(0, -totalSteps * stepHeight - extraTopHeadroom, width, worldHeight);
    this.cameras.main.setBackgroundColor(0x0a071b);

    // 1. Vẽ bầu trời Parallax
    this.skyGradient = this.add.graphics();
    this.skyGradient.setScrollFactor(0);
    this.updateSkyColor(0);

    // 2. Xây dựng 5 tầng nghệ thuật Trung Thu theo chiều cao thế giới
    this.buildStage1Village(width, height);
    this.buildStage2Rooftops(width, totalSteps, stepHeight);
    this.buildStage3Clouds(width, totalSteps, stepHeight);
    this.buildStage4StarrySky(width, totalSteps, stepHeight, height);
    this.buildStage5MoonKingdom(width, totalSteps, stepHeight);

    // 3. Xây dựng thang tre và mốc quà
    this.createLadder(width, totalSteps, stepHeight);
    this.createGifts(width, stepHeight);

    // 4. Khởi tạo Chú Cuội
    this.cuoi = new Cuoi(this, width / 2, 0);

    // 5. Lắng nghe tương tác Tap / Click / Phím
    this.input.on("pointerdown", () => this.handleTap());
    this.input.keyboard?.on("keydown-SPACE", () => this.handleTap());
    this.input.keyboard?.on("keydown-UP", () => this.handleTap());

    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStepChange?.(this.currentStep, totalSteps);
    this.callbacks.onStateChange?.("playing");
  }

  /**
   * TẦNG 1: Làng Quê Đêm Hội Rước Đèn (Mặt đất - Bậc 0 -> 20%)
   */
  private buildStage1Village(width: number, height: number) {
    const groundContainer = this.add.container(0, 0);

    // Đồi cỏ xanh ban đêm
    const hill = this.add.ellipse(width / 2, 80, width * 1.3, 160, 0x142818);
    const grass = this.add.rectangle(width / 2, 10, width, 25, 0x1e3a24);
    const flower1 = this.add.circle(60, 0, 4, 0xfacc15);
    const flower2 = this.add.circle(width - 70, 2, 4, 0xf472b6);

    // Bụi tre ngà làng quê hai bên
    const bambooLeft = this.createBambooCluster(35, -40);
    const bambooRight = this.createBambooCluster(width - 35, -40);

    // Đèn ông sao 5 cánh truyền thống cắm trên mặt đất
    const starLantern = this.createStarLantern(width / 2 - 80, -35);
    const carpLantern = this.createCarpLantern(width / 2 + 80, -35);

    groundContainer.add([hill, grass, flower1, flower2, bambooLeft, bambooRight, starLantern, carpLantern]);
  }

  private createBambooCluster(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    for (let i = -1; i <= 1; i++) {
      const stalk = this.add.rectangle(i * 12, 0, 5, 80, 0x22c55e);
      stalk.setStrokeStyle(1, 0x15803d);
      const leaf = this.add.ellipse(i * 12 + 6, -30, 18, 5, 0x4ade80);
      leaf.setAngle(i * 20);
      c.add([stalk, leaf]);
    }
    return c;
  }

  private createStarLantern(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const pole = this.add.line(0, 25, 0, 0, 0, 50, 0xd97706);
    pole.setLineWidth(2);

    // Đèn ông sao 5 cánh màu đỏ trong suốt
    const starGlow = this.add.circle(0, 0, 22, 0xfde047, 0.4);
    const starCenter = this.add.circle(0, 0, 8, 0xfef08a);
    const starRing = this.add.circle(0, 0, 18, 0x000000, 0);
    starRing.setStrokeStyle(2, 0xef4444);

    const points = [
      this.add.triangle(0, -18, -6, 0, 6, 0, 0, -10, 0xef4444),
      this.add.triangle(18, -4, 0, -6, 0, 6, 10, 0, 0xef4444),
      this.add.triangle(11, 15, -4, 0, 4, 0, 6, 8, 0xef4444),
      this.add.triangle(-11, 15, -4, 0, 4, 0, -6, 8, 0xef4444),
      this.add.triangle(-18, -4, 0, -6, 0, 6, -10, 0, 0xef4444),
    ];

    c.add([pole, starGlow, starRing, ...points, starCenter]);

    // Nhấp nháy nhẹ
    this.tweens.add({
      targets: starGlow,
      alpha: 0.15,
      scale: 1.15,
      yoyo: true,
      duration: 800,
      repeat: -1,
    });

    return c;
  }

  private createCarpLantern(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const pole = this.add.line(0, 25, 0, 0, 0, 50, 0xd97706);
    pole.setLineWidth(2);

    // Đèn cá chép đỏ
    const fishBody = this.add.ellipse(0, 0, 28, 18, 0xf97316);
    fishBody.setStrokeStyle(2, 0xfde047);
    const fishTail = this.add.triangle(16, 0, 0, -8, 0, 8, 12, 0, 0xef4444);
    const fishEye = this.add.circle(-8, -3, 3, 0xffffff);
    const pupil = this.add.circle(-8, -3, 1.5, 0x000000);

    c.add([pole, fishBody, fishTail, fishEye, pupil]);
    return c;
  }

  /**
   * TẦNG 2: Mái Ngói Phố Cổ & Phố Đèn Lồng (20% -> 45%)
   */
  private buildStage2Rooftops(width: number, totalSteps: number, stepHeight: number) {
    const startY = -totalSteps * stepHeight * 0.22;
    const endY = -totalSteps * stepHeight * 0.44;

    for (let y = startY; y >= endY; y -= 240) {
      // Mái ngói cong phong cách cổ truyền bên trái
      const roofLeft = this.add.container(0, y);
      const roofBodyL = this.add.polygon(0, 0, [0, 0, 110, 25, 115, 38, 0, 42], 0x854d0e);
      roofBodyL.setStrokeStyle(2, 0x451a03);
      const ridgeL = this.add.curve(110, 25, new Phaser.Curves.Spline([110, 25, 120, 18, 125, 10]));
      const lanternL = this.createLantern(105, 52);
      roofLeft.add([roofBodyL, lanternL]);

      // Mái ngói cong bên phải
      const roofRight = this.add.container(width, y - 100);
      const roofBodyR = this.add.polygon(0, 0, [0, 0, -110, 25, -115, 38, 0, 42], 0x854d0e);
      roofBodyR.setStrokeStyle(2, 0x451a03);
      const lanternR = this.createLantern(-105, 52);
      roofRight.add([roofBodyR, lanternR]);
    }
  }

  /**
   * TẦNG 3: Biển Mây Ngũ Sắc Bồng Bềnh (45% -> 70%)
   */
  private buildStage3Clouds(width: number, totalSteps: number, stepHeight: number) {
    const startY = -totalSteps * stepHeight * 0.45;
    const endY = -totalSteps * stepHeight * 0.70;

    for (let y = startY; y >= endY; y -= 90) {
      const cloudX = Phaser.Math.Between(30, width - 30);
      const cloud = this.createFluffyCloud(cloudX, y);

      // Hiệu ứng mây trôi ngang
      this.tweens.add({
        targets: cloud,
        x: cloudX + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(4500, 7500),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private createFluffyCloud(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const main = this.add.circle(0, 0, 36, 0xfffbeb, 0.22);
    const left = this.add.circle(-26, 8, 26, 0xfef08a, 0.18);
    const right = this.add.circle(26, 8, 28, 0xffedd5, 0.18);
    const rim = this.add.ellipse(0, 16, 75, 14, 0xffffff, 0.15);

    c.add([main, left, right, rim]);
    return c;
  }

  /**
   * TẦNG 4: Bầu Trời Sao & Dải Ngân Hà (70% -> 85%)
   */
  private buildStage4StarrySky(width: number, totalSteps: number, stepHeight: number, screenHeight: number) {
    const startY = -totalSteps * stepHeight * 0.70;
    const endY = -totalSteps * stepHeight * 0.88;

    // Ngàn sao đêm rằm
    for (let i = 0; i < 85; i++) {
      const starX = Phaser.Math.Between(15, width - 15);
      const starY = Phaser.Math.Between(endY, startY);
      const star = this.add.circle(
        starX,
        starY,
        Phaser.Math.FloatBetween(1, 2.8),
        0xfef08a,
        Phaser.Math.FloatBetween(0.4, 0.95)
      );

      this.tweens.add({
        targets: star,
        alpha: 0.15,
        duration: Phaser.Math.Between(900, 2200),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1200),
      });
    }

    // Bụi thiên hà tím hồng nhạt (Nebula)
    for (let y = startY; y >= endY; y -= 180) {
      const nebula = this.add.ellipse(
        Phaser.Math.Between(80, width - 80),
        y,
        180,
        70,
        0xa855f7,
        0.08
      );
      nebula.setAngle(Phaser.Math.Between(-25, 25));
    }
  }

  /**
   * TẦNG 5: Cung Trăng Nguy Nga, Cây Đa Cổ Thụ & Thỏ Ngọc (85% -> 100%)
   */
  private buildStage5MoonKingdom(width: number, totalSteps: number, stepHeight: number) {
    const topLadderY = -totalSteps * stepHeight;
    const moonY = topLadderY - 150;
    const centerX = width / 2;

    const container = this.add.container(centerX, moonY);

    // 1. Quầng hào quang vàng rực to lớn
    const auraOuter = this.add.circle(0, 0, 160, 0xfde047, 0.15);
    const auraMid = this.add.circle(0, 0, 120, 0xfef08a, 0.25);

    // 2. Thân Mặt Trăng tròn vàng ấm rực rỡ
    const moonBody = this.add.circle(0, 0, 90, 0xfffbeb);
    moonBody.setStrokeStyle(4, 0xfef08a);

    // 3. Vết tích trăng mờ
    const crater1 = this.add.circle(-30, -22, 16, 0xfde68a, 0.55);
    const crater2 = this.add.circle(28, 28, 20, 0xfde68a, 0.45);
    const crater3 = this.add.circle(22, -36, 12, 0xfde68a, 0.45);

    // 4. Cây Đa sum suê cổ kính bên Cung Trăng (Gốc cây đa Chú Cuội)
    const banyan = this.createBanyanTree(-36, 6);

    // 5. Cung điện Quảng Hàn Cung
    const palace = this.createMoonPalace(26, -20);

    // 6. Thỏ Ngọc (Moon Rabbit) trắng muốt giã ngọc bên cạnh
    const rabbit = this.createMoonRabbit(22, 38);

    // 7. Biển mây bồng bềnh làm bệ đỡ ngay đỉnh thang để Cuội bước lên
    const cloud1 = this.add.circle(-45, 80, 40, 0xffffff, 0.6);
    const cloud2 = this.add.circle(45, 80, 40, 0xffffff, 0.6);
    const cloudCenter = this.add.ellipse(0, 88, 170, 36, 0xffffff, 0.8);

    // Bảng chào mừng Cung Trăng
    const banner = this.add.container(0, -102);
    const bannerBg = this.add.rectangle(0, 0, 130, 26, 0xef4444, 0.95);
    bannerBg.setStrokeStyle(2, 0xfde047);
    const bannerText = this.add.text(0, 0, "CUNG TRĂNG 🌕", {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#ffffff",
      fontFamily: "sans-serif",
    });
    bannerText.setOrigin(0.5);
    banner.add([bannerBg, bannerText]);

    container.add([
      auraOuter,
      auraMid,
      moonBody,
      crater1,
      crater2,
      crater3,
      banyan,
      palace,
      rabbit,
      cloud1,
      cloud2,
      cloudCenter,
      banner,
    ]);

    // Hiệu ứng thở hào quang
    this.tweens.add({
      targets: [auraOuter, auraMid],
      scale: 1.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createBanyanTree(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    // Gốc cây nâu
    const trunk = this.add.rectangle(0, 16, 12, 36, 0x78350f);
    trunk.setStrokeStyle(1.5, 0x451a03);

    // Tán lá tròn sum suê màu vàng cam ánh trăng
    const f1 = this.add.circle(0, -6, 22, 0xd97706, 0.85);
    const f2 = this.add.circle(-14, -2, 16, 0xf59e0b, 0.85);
    const f3 = this.add.circle(14, -4, 16, 0xb45309, 0.85);
    const fTop = this.add.circle(0, -18, 14, 0xfbbf24, 0.9);

    c.add([trunk, f1, f2, f3, fTop]);
    return c;
  }

  private createMoonPalace(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const roof1 = this.add.triangle(0, 0, -18, 0, 18, 0, 0, -14, 0xe11d48);
    const base = this.add.rectangle(0, 8, 24, 16, 0xfef08a);
    base.setStrokeStyle(1.5, 0xd97706);
    const roof2 = this.add.triangle(0, -12, -14, 0, 14, 0, 0, -10, 0xb91c1c);

    c.add([base, roof1, roof2]);
    return c;
  }

  private createMoonRabbit(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const body = this.add.circle(0, 0, 8, 0xffffff);
    body.setStrokeStyle(1, 0xf3f4f6);
    const head = this.add.circle(-5, -6, 5, 0xffffff);
    const earL = this.add.ellipse(-7, -14, 3, 9, 0xffffff);
    const earR = this.add.ellipse(-4, -14, 3, 9, 0xffe4e6);
    const eye = this.add.circle(-6, -7, 1.2, 0xf43f5e);

    c.add([body, head, earL, earR, eye]);

    // Thỏ Ngọc nhấp nhô vui vẻ
    this.tweens.add({
      targets: c,
      y: y - 4,
      yoyo: true,
      duration: 600,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return c;
  }

  private createLantern(x: number, y: number): Phaser.GameObjects.Container {
    const lantern = this.add.container(x, y);
    const rope = this.add.line(0, -10, 0, 0, 0, 10, 0xd97706);
    const body = this.add.rectangle(0, 0, 18, 22, 0xef4444);
    const rimTop = this.add.rectangle(0, -11, 16, 3, 0xf59e0b);
    const rimBottom = this.add.rectangle(0, 11, 16, 3, 0xf59e0b);
    const light = this.add.circle(0, 0, 12, 0xfef08a, 0.35);

    lantern.add([light, rope, body, rimTop, rimBottom]);

    this.tweens.add({
      targets: lantern,
      angle: { from: -6, to: 6 },
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
    const ladderWidth = 72;
    const leftPoleX = centerX - ladderWidth / 2;
    const rightPoleX = centerX + ladderWidth / 2;
    const totalHeight = totalSteps * stepHeight;

    const leftPole = this.add.rectangle(leftPoleX, -totalHeight / 2, 8, totalHeight + 120, 0xa16207);
    leftPole.setStrokeStyle(1.5, 0x713f12);
    const rightPole = this.add.rectangle(rightPoleX, -totalHeight / 2, 8, totalHeight + 120, 0xa16207);
    rightPole.setStrokeStyle(1.5, 0x713f12);

    for (let i = 0; i <= totalSteps; i++) {
      const rungY = -i * stepHeight;
      const rung = this.add.container(centerX, rungY);

      const bar = this.add.rectangle(0, 0, ladderWidth + 8, 8, 0xca8a04);
      bar.setStrokeStyle(1.5, 0x713f12);
      rung.add(bar);

      if (i > 0 && (i % 5 === 0 || i === totalSteps)) {
        const stepText = this.add.text(ladderWidth / 2 + 16, 0, `${i}`, {
          fontSize: "11px",
          color: "#fef08a",
          fontStyle: "bold",
          fontFamily: "monospace",
        });
        stepText.setOrigin(0, 0.5);
        rung.add(stepText);

        if (i % 10 === 0 && i < totalSteps) {
          const miniLantern = this.createLantern(-ladderWidth / 2 - 14, 0);
          rung.add(miniLantern);
        }
      }
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

      const box = this.add.rectangle(0, 0, 26, 26, 0xe11d48);
      box.setStrokeStyle(2, 0xfff1f2);
      const ribbonH = this.add.rectangle(0, 0, 26, 6, 0xfacc15);
      const ribbonV = this.add.rectangle(0, 0, 6, 26, 0xfacc15);
      const bowLeft = this.add.circle(-4, -15, 5, 0xfacc15);
      const bowRight = this.add.circle(4, -15, 5, 0xfacc15);
      const glow = this.add.circle(0, 0, 22, 0xfde047, 0.4);

      giftContainer.add([glow, box, ribbonH, ribbonV, bowLeft, bowRight]);

      this.tweens.add({
        targets: giftContainer,
        y: giftY - 20,
        yoyo: true,
        duration: 850,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.giftObjects.set(step, giftContainer);
    });
  }

  public handleTap() {
    if (this.isPausedForGift || this.isVictory || this.isSliding) {
      return;
    }

    this.timeSinceLastTap = 0;
    this.targetStepFloat = Math.min(this.configData.steps, this.targetStepFloat + 1);
    this.kama = Math.min(GAME_CONSTANTS.KAMA_MAX, this.kama + this.kamaPerTap);
    this.callbacks.onKamaChange?.(this.kama);

    this.cuoi.playClimbEffect();
    this.spawnClimbSparkles(this.cuoi.x, this.cuoi.y + 20);
    if (this.targetStepFloat >= this.configData.steps && !this.isVictory) {
      this.currentStepFloat = this.configData.steps;
      this.triggerVictory();
    }
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

  private spawnShootingStar() {
    const { width } = this.scale;
    const startX = Phaser.Math.Between(width * 0.2, width);
    const startY = this.cameras.main.scrollY + Phaser.Math.Between(50, 200);

    const star = this.add.line(startX, startY, 0, 0, -35, 20, 0xffffff, 0.9);
    star.setLineWidth(2);

    this.tweens.add({
      targets: star,
      x: startX - 120,
      y: startY + 80,
      alpha: 0,
      duration: 650,
      ease: "Quad.easeIn",
      onComplete: () => star.destroy(),
    });
  }

  public resumeAfterGift() {
    this.isPausedForGift = false;
    this.timeSinceLastTap = 0;
    this.kama = Math.min(GAME_CONSTANTS.KAMA_MAX, this.kama + GAME_CONSTANTS.GIFT_KAMA_BONUS);
    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStateChange?.("playing");
  }

  public restartGame() {
    this.isPausedForGift = false;
    this.isVictory = false;
    this.isSliding = false;
    this.currentStep = 0;
    this.currentStepFloat = 0;
    this.targetStepFloat = 0;
    this.timeSinceLastTap = 0;
    this.kama = GAME_CONSTANTS.KAMA_INITIAL;

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

    // Sao băng thỉnh thoảng xuất hiện ở các tầng trên
    this.shootingStarTimer += delta;
    if (this.shootingStarTimer > 5000 && this.currentStepFloat > this.configData.steps * 0.4) {
      this.shootingStarTimer = 0;
      this.spawnShootingStar();
    }

    if (this.isSliding) {
      this.targetStepFloat -= 5 * dtSeconds;
      this.currentStepFloat = this.targetStepFloat;

      if (this.currentStepFloat <= this.slideTargetStep || this.currentStepFloat <= 0) {
        this.isSliding = false;
        this.currentStepFloat = Math.max(0, this.slideTargetStep);
        this.targetStepFloat = this.currentStepFloat;
        this.kama = GAME_CONSTANTS.KAMA_RECOVERY_ON_SLIDE;
        this.cuoi.stopSlideEffect();
        this.callbacks.onKamaChange?.(this.kama);
        this.callbacks.onStateChange?.("playing");
      }
    } else {
      if (this.kama > 0) {
        this.kama = Math.max(0, this.kama - this.kamaDrainRate * dtSeconds);
        this.callbacks.onKamaChange?.(this.kama);

        if (this.kama < 25) {
          this.cuoi.setMood("tired");
        }
      }

      if (this.kama <= 0 && !this.isSliding && this.currentStepFloat > 0) {
        this.isSliding = true;
        this.slideTargetStep = Math.max(0, this.currentStepFloat - this.slideStepPenalty);
        this.cuoi.playSlideEffect();
        this.callbacks.onStateChange?.("sliding");
      }

      // Đứng yên không tap (quá 0.35s): Cuội tự động trượt xuống từ từ
      this.timeSinceLastTap += dtSeconds;
      if (this.timeSinceLastTap > 0.35 && this.targetStepFloat > 0 && !this.isSliding) {
        // Tốc độ trượt tăng nhẹ nếu KAMA thấp (Cuội mệt mỏi)
        const tiredMultiplier = this.kama < 25 ? 1.4 : this.kama < 50 ? 1.2 : 1.0;
        const drift = this.idleSlideSpeed * tiredMultiplier * dtSeconds;
        this.targetStepFloat = Math.max(0, this.targetStepFloat - drift);
      }

      // Nội suy mượt mà nhưng snap khi khoảng cách rất nhỏ (tránh tiệm cận số thực kẹt ở 79.999...)
      if (Math.abs(this.targetStepFloat - this.currentStepFloat) < 0.04) {
        this.currentStepFloat = this.targetStepFloat;
      } else {
        this.currentStepFloat = Phaser.Math.Linear(
          this.currentStepFloat,
          this.targetStepFloat,
          0.22
        );
      }
    }

    // Nếu gần chạm đỉnh Cung Trăng thì snap lên đúng bậc cuối
    if (this.currentStepFloat >= this.configData.steps - 0.05) {
      this.currentStepFloat = this.configData.steps;
    }

    const cuoiY = -this.currentStepFloat * GAME_CONSTANTS.STEP_HEIGHT;
    this.cuoi.y = cuoiY;

    // Cập nhật bậc nguyên hiện tại (dùng Math.round để hiển thị chính xác bậc)
    const newStepInt = Math.min(this.configData.steps, Math.round(this.currentStepFloat));
    if (newStepInt !== this.currentStep) {
      this.currentStep = newStepInt;
      this.callbacks.onStepChange?.(this.currentStep, this.configData.steps);
    }

    // Khi gần lên tới đỉnh thang, camera nâng tầm nhìn lên để Cung Trăng hiển thị trọn vẹn ở nửa trên
    const summitRatio = Math.max(0, Math.min(1, (this.currentStepFloat - (this.configData.steps - 6)) / 6));
    const cameraOffsetY = Phaser.Math.Linear(this.scale.height * 0.62, this.scale.height * 0.72, summitRatio);
    this.cameras.main.scrollY = cuoiY - cameraOffsetY;

    const progressPercent = Math.min(1, this.currentStepFloat / this.configData.steps);
    this.updateSkyColor(progressPercent);

    if (!this.isSliding && !this.isPausedForGift) {
      this.checkGiftCheckpoints();
    }

    if (this.currentStepFloat >= this.configData.steps && !this.isVictory) {
      this.triggerVictory();
    }
  }

  private checkGiftCheckpoints() {
    for (const [step, gift] of this.unopenedGifts.entries()) {
      if (this.currentStepFloat >= step) {
        this.isPausedForGift = true;
        this.unopenedGifts.delete(step);

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
    this.currentStep = this.configData.steps;
    this.currentStepFloat = this.configData.steps;
    this.callbacks.onStepChange?.(this.configData.steps, this.configData.steps);
    this.cuoi.playVictoryAnimation();
    this.callbacks.onStateChange?.("victory");

    // Bắn chùm pháo hoa rực rỡ quanh Cung Trăng trong game
    this.spawnVictoryFireworks();

    // Chờ 2.2 giây để người chơi nhìn thấy trọn vẹn Cung Trăng và Cuội nhảy múa trước khi mở popup chúc mừng
    this.time.delayedCall(2200, () => {
      this.callbacks.onVictory?.(this.configData.finalMessage);
    });
  }

  private spawnVictoryFireworks() {
    const { width } = this.scale;
    const topLadderY = -this.configData.steps * GAME_CONSTANTS.STEP_HEIGHT;
    const colors = [0xfacc15, 0xf87171, 0x4ade80, 0x60a5fa, 0xffffff];

    for (let f = 0; f < 5; f++) {
      this.time.delayedCall(f * 350, () => {
        const fireworkX = width / 2 + Phaser.Math.Between(-110, 110);
        const fireworkY = topLadderY - 140 + Phaser.Math.Between(-90, 30);
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const speed = Phaser.Math.Between(45, 100);
          const color = Phaser.Utils.Array.GetRandom(colors);
          const spark = this.add.circle(fireworkX, fireworkY, 3.5, color);

          this.tweens.add({
            targets: spark,
            x: fireworkX + Math.cos(angle) * speed,
            y: fireworkY + Math.sin(angle) * speed,
            alpha: 0,
            scale: 0.1,
            duration: 850,
            ease: "Quad.easeOut",
            onComplete: () => spark.destroy(),
          });
        }
      });
    }
  }

  private updateSkyColor(progress: number) {
    this.skyGradient.clear();
    const { width, height } = this.scale;

    let topColor = 0x070417;
    let bottomColor = 0x1e1233;

    if (progress < 0.22) {
      // Tầng 1: Làng quê đêm hội (xanh đen đậm)
      topColor = 0x090d1f;
      bottomColor = 0x1b2838;
    } else if (progress < 0.45) {
      // Tầng 2: Mái ngói rêu phong & lồng đèn (tím than ấm)
      topColor = 0x160c2b;
      bottomColor = 0x3d1742;
    } else if (progress < 0.70) {
      // Tầng 3: Biển mây & trời đêm (xanh thẫm huyền bí)
      topColor = 0x09142b;
      bottomColor = 0x221338;
    } else if (progress < 0.88) {
      // Tầng 4: Bầu trời sao (đen huyền bí)
      topColor = 0x060613;
      bottomColor = 0x1a122e;
    } else {
      // Tầng 5: Cung Trăng rực rỡ (vàng hổ phách trăng rằm)
      topColor = 0x191409;
      bottomColor = 0x3a2810;
    }

    this.skyGradient.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    this.skyGradient.fillRect(0, 0, width, height);
  }
}
