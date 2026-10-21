/**
 * DeepAtmos: Subtle & Lively Cosmic Background Engine
 * 
 * Elegant, non-distracting deep space aesthetic with:
 * - Subtle multi-spectral twinkling starfield with gentle cursor parallax
 * - Soft volumetric nebula gas clouds
 * - Elegant 3D Exoplanet with atmospheric Rayleigh scattering limb
 * - Realistic transit simulation with subtle spectral dispersion beams
 * - Web Audio procedural cosmic synthesizer
 */

class LivelyCosmosBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.stars = [];
    this.nebulaClouds = [];
    this.numStars = 240;
    this.time = 0;
    this.speed = 0.75;
    this.isTransitActive = true;
    this.soundEnabled = false;
    this.isSubtleMode = true; // Subtle mode default

    // Exoplanet configuration
    this.planetPreset = 'wasp-39b';
    this.planetConfig = {
      name: 'WASP-39b',
      colorCore: '#9a4c18',
      colorAtmosphere: '#00e5ff',
      atmosphereGlow: 'rgba(0, 229, 255, 0.22)',
      radius: 34,
      cloudBands: true
    };

    // Orbit & Transit parameters
    this.orbitAngle = 0.5;
    this.starRadius = 65;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.initScene();
    this.initAudio();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate subtle stars
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 1.2 + 0.2,
        size: Math.random() * 1.4 + 0.4,
        color: this.randomStarColor(),
        alpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Soft, subtle nebula clouds
    this.nebulaClouds = [
      { x: this.width * 0.2, y: this.height * 0.3, r: 520, color: 'rgba(8, 22, 55, 0.16)' },
      { x: this.width * 0.8, y: this.height * 0.6, r: 560, color: 'rgba(45, 12, 50, 0.12)' },
      { x: this.width * 0.5, y: this.height * 0.85, r: 440, color: 'rgba(4, 38, 55, 0.14)' }
    ];
  }

  randomStarColor() {
    const colors = ['#ffffff', '#e2f3ff', '#c8e8ff', '#fffde7', '#fff3e0', '#80d8ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX - this.width / 2) * 0.03;
      this.mouse.targetY = (e.clientY - this.height / 2) * 0.03;
    });
  }

  setPlanetPreset(presetId) {
    this.planetPreset = presetId;
    if (presetId === 'wasp-39b') {
      this.planetConfig = {
        name: 'WASP-39b',
        colorCore: '#9a4c18',
        colorAtmosphere: '#00e5ff',
        atmosphereGlow: 'rgba(0, 229, 255, 0.25)',
        radius: 36,
        cloudBands: true
      };
    } else if (presetId === 'wasp-96b') {
      this.planetConfig = {
        name: 'WASP-96b',
        colorCore: '#334155',
        colorAtmosphere: '#38bdf8',
        atmosphereGlow: 'rgba(56, 189, 248, 0.22)',
        radius: 38,
        cloudBands: true
      };
    } else if (presetId === 'k2-18b') {
      this.planetConfig = {
        name: 'K2-18b',
        colorCore: '#0369a1',
        colorAtmosphere: '#2dd4bf',
        atmosphereGlow: 'rgba(45, 212, 191, 0.26)',
        radius: 28,
        cloudBands: false
      };
    } else if (presetId === 'lhs-475b') {
      this.planetConfig = {
        name: 'LHS 475b',
        colorCore: '#713f12',
        colorAtmosphere: '#f43f5e',
        atmosphereGlow: 'rgba(244, 63, 94, 0.18)',
        radius: 22,
        cloudBands: false
      };
    } else if (presetId === 'trappist-1e') {
      this.planetConfig = {
        name: 'TRAPPIST-1e',
        colorCore: '#0f766e',
        colorAtmosphere: '#10b981',
        atmosphereGlow: 'rgba(16, 185, 129, 0.32)',
        radius: 21,
        cloudBands: true
      };
    } else {
      this.planetConfig = {
        name: 'Target Planet',
        colorCore: '#4f46e5',
        colorAtmosphere: '#a855f7',
        atmosphereGlow: 'rgba(168, 85, 247, 0.24)',
        radius: 32,
        cloudBands: true
      };
    }
  }

  toggleTransit() {
    this.isTransitActive = !this.isTransitActive;
    return this.isTransitActive;
  }

  toggleSubtleMode() {
    this.isSubtleMode = !this.isSubtleMode;
    return this.isSubtleMode;
  }

  // Web Audio Procedural Ambiance
  initAudio() {
    this.audioCtx = null;
  }

  toggleSound() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      this.droneOsc = this.audioCtx.createOscillator();
      this.droneGain = this.audioCtx.createGain();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55, this.audioCtx.currentTime);

      this.droneFilter = this.audioCtx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(110, this.audioCtx.currentTime);

      this.droneGain.gain.setValueAtTime(0.035, this.audioCtx.currentTime);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.audioCtx.destination);
      this.droneOsc.start();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
      this.soundEnabled = true;
    } else if (this.soundEnabled) {
      this.audioCtx.suspend();
      this.soundEnabled = false;
    } else {
      this.audioCtx.resume();
      this.soundEnabled = true;
    }
    return this.soundEnabled;
  }

  playTransitChime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  animate() {
    this.time += 0.014 * this.speed;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    if (this.isTransitActive) {
      const prevAngle = this.orbitAngle;
      this.orbitAngle = (this.orbitAngle + 0.0035 * this.speed) % (Math.PI * 2);

      if (prevAngle < Math.PI && this.orbitAngle >= Math.PI) {
        this.playTransitChime();
      }
    }

    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;

    // 1. Deep space background gradient
    const bgGrad = ctx.createRadialGradient(
      this.width * 0.65 + this.mouse.x * 2, this.height * 0.35 + this.mouse.y * 2, 80,
      this.width * 0.5, this.height * 0.5, this.width * 0.85
    );
    bgGrad.addColorStop(0, '#091024');
    bgGrad.addColorStop(0.5, '#040714');
    bgGrad.addColorStop(1, '#020308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Soft Nebula
    this.renderNebulae(ctx);

    // 3. Subtle Twinkling Stars
    this.renderStars(ctx);

    // 4. Subtle Host Star & Orbiting Exoplanet
    this.renderSolarSystem(ctx);
  }

  renderNebulae(ctx) {
    for (const cloud of this.nebulaClouds) {
      const cx = cloud.x + this.mouse.x * 0.2;
      const cy = cloud.y + this.mouse.y * 0.2;
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, cloud.r);
      grad.addColorStop(0, cloud.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, cloud.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderStars(ctx) {
    ctx.save();
    for (const s of this.stars) {
      const px = (s.x + this.mouse.x * s.z + this.width) % this.width;
      const py = (s.y + this.mouse.y * s.z + this.height) % this.height;

      const twinkle = Math.sin(this.time * s.twinkleSpeed * 60 + s.twinklePhase);
      const alpha = Math.max(0.1, Math.min(0.85, s.alpha + twinkle * 0.25));

      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, s.size * s.z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderSolarSystem(ctx) {
    // Elegant, non-obtrusive placement in top-right background
    const starCenterX = this.width * 0.82 + this.mouse.x * 0.5;
    const starCenterY = this.height * 0.25 + this.mouse.y * 0.5;

    const semiMajor = Math.min(this.width * 0.2, 260);
    const semiMinor = 48;

    const planetX = starCenterX + Math.cos(this.orbitAngle) * semiMajor;
    const planetY = starCenterY + Math.sin(this.orbitAngle) * semiMinor;
    const isTransitingFront = Math.sin(this.orbitAngle) > 0;

    if (!isTransitingFront) {
      this.drawExoplanet(ctx, planetX, planetY, starCenterX, starCenterY);
      this.drawHostStar(ctx, starCenterX, starCenterY);
    } else {
      this.drawHostStar(ctx, starCenterX, starCenterY);
      this.drawExoplanet(ctx, planetX, planetY, starCenterX, starCenterY);
    }
  }

  drawHostStar(ctx, cx, cy) {
    ctx.save();
    const R = this.starRadius;
    const pulse = 1.0 + Math.sin(this.time * 1.5) * 0.02;

    // Subtle star corona glow
    const corona = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.2 * pulse);
    corona.addColorStop(0, 'rgba(255, 235, 180, 0.5)');
    corona.addColorStop(0.3, 'rgba(255, 170, 50, 0.18)');
    corona.addColorStop(0.7, 'rgba(255, 90, 0, 0.05)');
    corona.addColorStop(1, 'transparent');

    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 2.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Star Disk
    const starDisk = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
    starDisk.addColorStop(0, '#ffffff');
    starDisk.addColorStop(0.3, '#fff4cc');
    starDisk.addColorStop(0.7, '#ffbe3b');
    starDisk.addColorStop(1, '#f97316');

    ctx.fillStyle = starDisk;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Limb darkening
    const limb = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R);
    limb.addColorStop(0, 'transparent');
    limb.addColorStop(1, 'rgba(160, 30, 0, 0.45)');
    ctx.fillStyle = limb;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawExoplanet(ctx, px, py, starX, starY) {
    ctx.save();
    const R = this.planetConfig.radius;
    const angleToStar = Math.atan2(starY - py, starX - px);

    // Subtle atmospheric Rayleigh scattering rim
    const atmosGrad = ctx.createRadialGradient(px, py, R * 0.9, px, py, R * 1.3);
    atmosGrad.addColorStop(0, this.planetConfig.atmosphereGlow);
    atmosGrad.addColorStop(0.5, this.planetConfig.atmosphereGlow);
    atmosGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = atmosGrad;
    ctx.beginPath();
    ctx.arc(px, py, R * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Subtle transit dispersion beams when passing host star
    const distToStar = Math.hypot(px - starX, py - starY);
    const isOverlappingStar = distToStar < (this.starRadius + R);

    if (isOverlappingStar && Math.sin(this.orbitAngle) > 0) {
      this.drawSubtleTransitBeams(ctx, px, py, R);
    }

    // Planet Body
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, R, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = this.planetConfig.colorCore;
    ctx.fillRect(px - R, py - R, R * 2, R * 2);

    if (this.planetConfig.cloudBands) {
      const numBands = 6;
      for (let b = 0; b < numBands; b++) {
        const yPos = py - R + (b * (R * 2 / numBands));
        const bandHeight = (R * 2 / numBands) * 0.7;
        ctx.fillStyle = b % 2 === 0 ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(px - R, yPos, R * 2, bandHeight);
      }
    }

    // Terminator shadow
    const shadowGrad = ctx.createLinearGradient(
      px - Math.cos(angleToStar) * R, py - Math.sin(angleToStar) * R,
      px + Math.cos(angleToStar) * R, py + Math.sin(angleToStar) * R
    );
    shadowGrad.addColorStop(0, 'rgba(3, 5, 12, 0.95)');
    shadowGrad.addColorStop(0.5, 'rgba(5, 8, 18, 0.7)');
    shadowGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(px - R, py - R, R * 2, R * 2);

    ctx.restore();

    // Atmospheric limb stroke
    ctx.strokeStyle = this.planetConfig.colorAtmosphere;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(px, py, R, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawSubtleTransitBeams(ctx, px, py, R) {
    ctx.save();
    const beamAngle = Math.atan2(py - this.height * 0.25, px - this.width * 0.82);
    const beamLen = 65;

    const colors = ['#00e5ff', '#00ff88', '#ffea00', '#ff007f'];
    for (let i = 0; i < colors.length; i++) {
      const offsetAngle = beamAngle + (i - 1.5) * 0.16;
      const x1 = px + Math.cos(offsetAngle) * R;
      const y1 = py + Math.sin(offsetAngle) * R;
      const x2 = x1 + Math.cos(offsetAngle) * beamLen;
      const y2 = y1 + Math.sin(offsetAngle) * beamLen;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, colors[i]);
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.LivelyCosmosBackground = LivelyCosmosBackground;
}
