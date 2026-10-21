/**
 * DeepAtmos: Interactive Scientific Spectral Visualizer
 * High-performance Canvas renderer supporting error bars, molecular band highlights,
 * neural saliency overlays, and real-time interactive crosshairs.
 */

class DeepAtmosSpectralVisualizer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = options;

    this.spectrum = [];
    this.modelFit = null;
    this.saliencyMap = null;
    this.activeBands = { 'CO2': true, 'H2O': true, 'CH4': true, 'SO2': true, 'CO': true };
    this.showSaliency = false;
    this.showErrorBars = true;
    this.showModelFit = true;

    // View bounds
    this.xMin = 0.4;
    this.xMax = 5.6;
    this.yMin = 2.0;
    this.yMax = 2.5;

    // Hover state
    this.mousePos = null;
    this.hoverPoint = null;

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  setData(spectrumPoints, inferenceResult = null) {
    this.spectrum = spectrumPoints || [];
    this.inferenceResult = inferenceResult;

    if (this.spectrum.length > 0) {
      // Auto-fit axes
      const xVals = this.spectrum.map(p => p[0]);
      const yVals = this.spectrum.map(p => p[1]);
      const minX = Math.min(...xVals);
      const maxX = Math.max(...xVals);
      const minY = Math.min(...yVals);
      const maxY = Math.max(...yVals);
      const xSpan = maxX - minX || 1.0;
      const ySpan = maxY - minY || 0.05;

      this.xMin = Math.max(0.2, minX - xSpan * 0.08);
      this.xMax = maxX + xSpan * 0.08;
      this.yMin = Math.max(0.0, minY - ySpan * 0.15);
      this.yMax = maxY + ySpan * 0.18;
    }

    if (inferenceResult) {
      this.saliencyMap = inferenceResult.saliencyMap;
      this.binWavelengths = inferenceResult.binWavelengths;
      this.generateSmoothedModelFit(inferenceResult);
    }

    this.render();
  }

  generateSmoothedModelFit(inferenceResult) {
    // Generate high-resolution smoothed curve matching the 128-bin neural prediction
    const grid = inferenceResult.preprocessed.resampledGrid;
    const wl = inferenceResult.binWavelengths;
    this.modelFit = [];
    for (let i = 0; i < wl.length; i++) {
      this.modelFit.push([wl[i], grid[i]]);
    }
  }

  bindEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.findHoverPoint();
      this.render();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mousePos = null;
      this.hoverPoint = null;
      this.render();
    });
  }

  findHoverPoint() {
    if (!this.mousePos || this.spectrum.length === 0) {
      this.hoverPoint = null;
      return;
    }

    const { padding } = this.getLayout();
    let closest = null;
    let minDistance = 25; // pixel threshold

    for (const pt of this.spectrum) {
      const px = this.dataToPixelX(pt[0], padding);
      const py = this.dataToPixelY(pt[1], padding);
      const dist = Math.hypot(px - this.mousePos.x, py - this.mousePos.y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = { point: pt, px, py };
      }
    }
    this.hoverPoint = closest;
  }

  getLayout() {
    return {
      padding: { top: 40, right: 30, bottom: 50, left: 75 },
      plotWidth: this.width - 105,
      plotHeight: this.height - 90
    };
  }

  dataToPixelX(val, padding) {
    return padding.left + ((val - this.xMin) / (this.xMax - this.xMin)) * (this.width - padding.left - padding.right);
  }

  dataToPixelY(val, padding) {
    return this.height - padding.bottom - ((val - this.yMin) / (this.yMax - this.yMin)) * (this.height - padding.top - padding.bottom);
  }

  pixelToDataX(px, padding) {
    return this.xMin + ((px - padding.left) / (this.width - padding.left - padding.right)) * (this.xMax - this.xMin);
  }

  pixelToDataY(py, padding) {
    return this.yMin + ((this.height - padding.bottom - py) / (this.height - padding.top - padding.bottom)) * (this.yMax - this.yMin);
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const { padding } = this.getLayout();

    // 1. Clear background
    ctx.clearRect(0, 0, this.width, this.height);

    // Dark sleek background
    ctx.fillStyle = '#070b19';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw grid and axes
    this.drawGrid(ctx, padding);

    // 3. Draw Molecular Band Highlights
    this.drawMolecularBands(ctx, padding);

    // 4. Draw Saliency / Attention Heatmap if enabled
    if (this.showSaliency && this.saliencyMap && this.binWavelengths) {
      this.drawSaliencyHeatmap(ctx, padding);
    }

    // 5. Draw Model Fit Line
    if (this.showModelFit && this.modelFit && this.modelFit.length > 0) {
      this.drawModelLine(ctx, padding);
    }

    // 6. Draw Observational Data Points & Error Bars
    this.drawDataPoints(ctx, padding);

    // 7. Draw Crosshair & Tooltip
    this.drawCrosshairAndTooltip(ctx, padding);
  }

  drawGrid(ctx, padding) {
    const plotRight = this.width - padding.right;
    const plotBottom = this.height - padding.bottom;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8e9bb0';
    ctx.font = '11px "Space Grotesk", system-ui, sans-serif';

    // X Axis Ticks (Wavelength)
    const xStep = (this.xMax - this.xMin) > 3 ? 0.5 : 0.2;
    const firstXTick = Math.ceil(this.xMin / xStep) * xStep;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = firstXTick; x <= this.xMax; x += xStep) {
      const px = this.dataToPixelX(x, padding);
      ctx.beginPath();
      ctx.moveTo(px, padding.top);
      ctx.lineTo(px, plotBottom);
      ctx.stroke();

      ctx.fillText(x.toFixed(1) + ' µm', px, plotBottom + 8);
    }

    // Y Axis Ticks (Transit Depth)
    const ySpan = this.yMax - this.yMin;
    const yStep = ySpan > 0.4 ? 0.1 : ySpan > 0.1 ? 0.02 : 0.005;
    const firstYTick = Math.ceil(this.yMin / yStep) * yStep;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = firstYTick; y <= this.yMax; y += yStep) {
      const py = this.dataToPixelY(y, padding);
      ctx.beginPath();
      ctx.moveTo(padding.left, py);
      ctx.lineTo(plotRight, py);
      ctx.stroke();

      // Show both % and ppm
      const ppm = Math.round(y * 10000);
      ctx.fillText(`${y.toFixed(3)}% (${ppm} ppm)`, padding.left - 10, py);
    }

    // Axis Border Box
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding.left, padding.top, plotRight - padding.left, plotBottom - padding.top);

    // Axis Labels
    ctx.fillStyle = '#00e5ff';
    ctx.font = '600 12px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Observed Wavelength λ (microns, µm) [JWST / HST]', (padding.left + plotRight) / 2, this.height - 12);

    ctx.save();
    ctx.translate(18, (padding.top + plotBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Transit Depth (Rp / R★)² [% & ppm]', 0, 0);
    ctx.restore();
  }

  drawMolecularBands(ctx, padding) {
    if (!window.MOLECULE_SPECTRAL_FINGERPRINTS) return;
    const plotBottom = this.height - padding.bottom;
    const plotHeight = plotBottom - padding.top;

    ctx.save();
    for (const [molKey, molData] of Object.entries(window.MOLECULE_SPECTRAL_FINGERPRINTS)) {
      if (!this.activeBands[molKey]) continue;

      for (const band of molData.primaryBands) {
        const leftW = band.center - band.width;
        const rightW = band.center + band.width;

        if (rightW < this.xMin || leftW > this.xMax) continue;

        const px1 = Math.max(padding.left, this.dataToPixelX(leftW, padding));
        const px2 = Math.min(this.width - padding.right, this.dataToPixelX(rightW, padding));
        const w = px2 - px1;

        if (w <= 0) continue;

        // Gradient vertical band
        const grad = ctx.createLinearGradient(0, padding.top, 0, plotBottom);
        grad.addColorStop(0, `${molData.color}22`);
        grad.addColorStop(0.8, `${molData.color}0a`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(px1, padding.top, w, plotHeight);

        // Top band label
        const centerPx = this.dataToPixelX(band.center, padding);
        if (centerPx >= padding.left && centerPx <= this.width - padding.right) {
          ctx.fillStyle = molData.color;
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(molData.formula, centerPx, padding.top - 6);
        }
      }
    }
    ctx.restore();
  }

  drawSaliencyHeatmap(ctx, padding) {
    const plotBottom = this.height - padding.bottom;
    const binW = (this.width - padding.left - padding.right) / this.gridChannels;

    ctx.save();
    for (let i = 0; i < this.gridChannels; i++) {
      const w = this.binWavelengths[i];
      if (w < this.xMin || w > this.xMax) continue;

      const px = this.dataToPixelX(w, padding);
      const sal = this.saliencyMap[i];

      if (sal > 0.05) {
        ctx.fillStyle = `rgba(255, 0, 127, ${sal * 0.35})`;
        ctx.fillRect(px - binW / 2, padding.top, binW + 1, plotBottom - padding.top);
      }
    }
    ctx.restore();
  }

  drawModelLine(ctx, padding) {
    ctx.save();
    ctx.beginPath();
    let started = false;

    for (const pt of this.modelFit) {
      const px = this.dataToPixelX(pt[0], padding);
      const py = this.dataToPixelY(pt[1], padding);

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
  }

  drawDataPoints(ctx, padding) {
    ctx.save();
    for (const pt of this.spectrum) {
      const w = pt[0];
      const depth = pt[1];
      const err = pt[2] || 0.015;

      const px = this.dataToPixelX(w, padding);
      const py = this.dataToPixelY(depth, padding);

      if (px < padding.left || px > this.width - padding.right) continue;

      // Draw Error Bar
      if (this.showErrorBars && err > 0) {
        const topPy = this.dataToPixelY(depth + err, padding);
        const botPy = this.dataToPixelY(depth - err, padding);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, topPy);
        ctx.lineTo(px, botPy);
        // Error bar caps
        ctx.moveTo(px - 3, topPy);
        ctx.lineTo(px + 3, topPy);
        ctx.moveTo(px - 3, botPy);
        ctx.lineTo(px + 3, botPy);
        ctx.stroke();
      }

      // Draw circle point
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#001a33';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCrosshairAndTooltip(ctx, padding) {
    if (!this.mousePos) return;

    const plotRight = this.width - padding.right;
    const plotBottom = this.height - padding.bottom;
    const mx = this.mousePos.x;
    const my = this.mousePos.y;

    if (mx < padding.left || mx > plotRight || my < padding.top || my > plotBottom) return;

    // Crosshair lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, padding.top);
    ctx.lineTo(mx, plotBottom);
    ctx.moveTo(padding.left, my);
    ctx.lineTo(plotRight, my);
    ctx.stroke();
    ctx.restore();

    // Data readout
    const curW = this.pixelToDataX(mx, padding);
    const curD = this.pixelToDataY(my, padding);

    // If hovering on specific point
    let tooltipTitle = `Cursor: ${curW.toFixed(3)} µm`;
    let tooltipVal = `Depth: ${curD.toFixed(3)}% (${Math.round(curD * 10000)} ppm)`;
    let tooltipExtra = '';

    if (this.hoverPoint) {
      const pt = this.hoverPoint.point;
      tooltipTitle = `Observed Bin: ${pt[0].toFixed(3)} µm`;
      tooltipVal = `Transit Depth: ${pt[1].toFixed(3)}% (${Math.round(pt[1] * 10000)} ppm)`;
      tooltipExtra = `Uncertainty: ±${(pt[2] * 10000).toFixed(0)} ppm`;

      // Highlight target point
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.hoverPoint.px, this.hoverPoint.py, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // Render tooltip box
    ctx.save();
    const boxW = 190;
    const boxH = tooltipExtra ? 62 : 46;
    let boxX = mx + 12;
    let boxY = my - boxH - 12;
    if (boxX + boxW > plotRight) boxX = mx - boxW - 12;
    if (boxY < padding.top) boxY = my + 12;

    ctx.fillStyle = 'rgba(10, 16, 32, 0.92)';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect?.(boxX, boxY, boxW, boxH, 6) || ctx.rect(boxX, boxY, boxW, boxH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(tooltipTitle, boxX + 10, boxY + 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(tooltipVal, boxX + 10, boxY + 32);

    if (tooltipExtra) {
      ctx.fillStyle = '#ffd600';
      ctx.fillText(tooltipExtra, boxX + 10, boxY + 48);
    }
    ctx.restore();
  }

  toggleBand(molecule) {
    this.activeBands[molecule] = !this.activeBands[molecule];
    this.render();
    return this.activeBands[molecule];
  }

  toggleSaliency() {
    this.showSaliency = !this.showSaliency;
    this.render();
    return this.showSaliency;
  }

  toggleErrorBars() {
    this.showErrorBars = !this.showErrorBars;
    this.render();
    return this.showErrorBars;
  }
}

if (typeof window !== 'undefined') {
  window.DeepAtmosSpectralVisualizer = DeepAtmosSpectralVisualizer;
}
