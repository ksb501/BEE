class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playBuzz() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      // Vibrato effect for bee wings
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.05);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Bright chime: two notes rising (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Sad buzz descending frequency (300 -> 120)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.45);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Synthesize cheering voices (Detuned crowd roaring / screaming "Yayyy!")
      // We will create 5 detuned sawtooth/triangle oscillators starting ~220Hz - 440Hz
      // with a slight vibrato and low-pass filter, sweeping upwards to mimic shouting voices.
      const cheerGains: GainNode[] = [];
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 1.2);
      filter.connect(this.ctx.destination);

      const voiceFrequencies = [250, 310, 390, 480, 520];
      voiceFrequencies.forEach((baseFreq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle';
        
        // Pitch envelope for "Wuuuuaaay!" shouting cheer
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.35);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + 1.8);

        // Amplitude envelope for cheering fade-in and slowly trailing off
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.04, now + 0.15); // quiet per voice so it is pleasant
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        osc.connect(gainNode);
        gainNode.connect(filter);
        cheerGains.push(gainNode);

        osc.start(now);
        osc.stop(now + 2.3);
      });

      // 2. Clapping sounds (short randomized burst of bandpass filtered noise)
      // Standard noise clapping algorithm
      const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Play 8-10 rapid clap nodes at randomized times
      for (let i = 0; i < 18; i++) {
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const clapFilter = this.ctx.createBiquadFilter();
        clapFilter.type = 'bandpass';
        clapFilter.frequency.setValueAtTime(1000 + Math.random() * 800, now);
        clapFilter.Q.setValueAtTime(3.0, now);

        const clapGain = this.ctx.createGain();
        const delay = Math.random() * 1.2; // distributed clapping over 1.2 seconds

        clapGain.gain.setValueAtTime(0, now + delay);
        clapGain.gain.linearRampToValueAtTime(0.06, now + delay + 0.01);
        clapGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        noiseNode.connect(clapFilter);
        clapFilter.connect(clapGain);
        clapGain.connect(this.ctx.destination);

        noiseNode.start(now + delay);
        noiseNode.stop(now + delay + 0.12);
      }

      // 3. Joyful fan-fare melody
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50]; // C4, E4, G4, C5, E5, C6
      const durations = [0.12, 0.12, 0.12, 0.18, 0.18, 0.85];
      const startTimes = [0.0, 0.12, 0.24, 0.36, 0.54, 0.72];

      startTimes.forEach((time, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(notes[idx], now + time);

        gain.gain.setValueAtTime(0.12, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + durations[idx]);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + durations[idx]);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}

export const soundManager = new SoundManager();
