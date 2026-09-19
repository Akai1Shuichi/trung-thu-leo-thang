// Trình tạo âm thanh & nhạc nền Web Audio API thuần túy cho Tết Trung Thu

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // AudioContext khởi tạo khi có tương tác đầu tiên
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Rung nhẹ trên điện thoại (Haptic feedback)
   */
  public vibrate(pattern: number | number[] = 15) {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Âm thanh gõ bước thang tre vui tai
   */
  public playTap(step: number = 0) {
    this.vibrate(12);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 340 + (step % 16) * 15;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh chuông ngân mở hộp quà Trung Thu
   */
  public playGift() {
    this.vibrate([30, 40, 50]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.45);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh trượt dốc khi cạn KAMA
   */
  public playSlide() {
    this.vibrate([60, 50, 80]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.32);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh hợp âm chiến thắng Cung Trăng
   */
  public playVictory() {
    this.vibrate([80, 50, 100, 50, 150]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.16 }, // C5
        { f: 659.25, d: 0.16 }, // E5
        { f: 783.99, d: 0.16 }, // G5
        { f: 1046.5, d: 0.6 },  // C6
      ];

      let startTime = this.ctx.currentTime;
      melody.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, startTime);

        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.d);

        startTime += note.d * 0.9;
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Nhạc nền dân ca Trung Thu nhẹ nhàng du dương (Acoustic Chime / Bells)
   */
  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;

    // Giai điệu ngũ cung Việt Nam âm vang rằm tháng Tám (C - D - E - G - A)
    const notes = [
      { f: 523.25, d: 0.3 }, // C5
      { f: 587.33, d: 0.3 }, // D5
      { f: 659.25, d: 0.3 }, // E5
      { f: 783.99, d: 0.5 }, // G5
      { f: 659.25, d: 0.3 }, // E5
      { f: 587.33, d: 0.3 }, // D5
      { f: 523.25, d: 0.6 }, // C5
      { f: 440.00, d: 0.3 }, // A4
      { f: 523.25, d: 0.5 }, // C5
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;

      const note = notes[noteIdx];
      noteIdx = (noteIdx + 1) % notes.length;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + note.d * 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + note.d * 1.5);
      } catch {
        // Ignored
      }

      this.bgmInterval = setTimeout(playNextNote, note.d * 1200);
    };

    playNextNote();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
