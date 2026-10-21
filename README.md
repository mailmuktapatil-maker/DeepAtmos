# DeepAtmos: Rapid Exoplanet Atmospheric Characterization Platform

**Department of Artificial Intelligence & Data Science**  
**SIES Graduate School of Technology (Autonomous), Nerul, Navi Mumbai**  
**TE Mini Project Presentation (SH - 2026)**  

### Team Members
- **Parth Nare** (Roll No: `124A8072`)
- **Mukta Patil** (Roll No: `124A8076`)
- **Swayam Patil** (Roll No: `124A8081`)
- **Manthan Shetty** (Roll No: `124A8103`)

---

## 🌌 Overview

**DeepAtmos** is a real-time, browser-native 1D Convolutional Neural Network (1D-CNN) framework engineered to solve the **18.4-hour computational bottleneck** of traditional Bayesian atmospheric retrievals (*PyMultiNest*, *UltraNest*, *petitRADTRANS*). 

With the massive influx of spectroscopic observations from the **James Webb Space Telescope (JWST)** and the upcoming **ESA Ariel Mission** (surveying 1,000+ planets), traditional line-by-line radiative transfer simulations cannot scale. DeepAtmos characterises exoplanet atmospheres in **under 40 milliseconds** (~1,570,000× speedup) with calibrated molecular detection across 14 chemical species and empirical astrobiological life viability scoring.

---

## 🚀 Key Functional Modules

1. **🧪 Interactive Spectral Studio**:
   - Ingests real calibrated JWST and HST spectrophotometric data (WASP-39b, WASP-96b, K2-18b, HD 209458b, LHS 475b, TRAPPIST-1e).
   - High-performance Canvas spectrometer with zoom, pan, error bars, crosshairs (µm and ppm), and model fits.
   - Filterable molecular absorption bands.
   - Custom CSV / TXT spectrum ingestion.

2. **🧬 Expanded 14-Molecule Neural Detection**:
   - **Volatile & Bulk Species**: $H_2O, CO_2, CH_4, SO_2, CO, NH_3, Na, K$
   - **Astrobiological Biosignatures & Prebiotics**:
     - **DMS (Dimethyl Sulfide)**: Marine phytoplankton biomarker candidate (K2-18 b).
     - **$O_3$ (Ozone)**: Oxygenic photosynthesis & UV protection.
     - **$O_2$ (Molecular Oxygen)**: Direct photosynthesis marker.
     - **$N_2O$ (Nitrous Oxide)**: Microbial denitrification biomarker.
     - **HCN (Hydrogen Cyanide)**: Prebiotic ribonucleotide synthesis precursor.
     - **$PH_3$ (Phosphine)**: Reducing anaerobic biosignature candidate.

3. **🌍 Astrobiological Life Viability Index (BVI %)**:
   - Evaluates planetary habitability based on empirical astrobiological metrics (NASA Astrobiology / PHI / ESI):
     - **Thermal Habitability Score**: Gaussian window around liquid water ($288\text{ K}$ optimal).
     - **Solvent Factor**: $H_2O$ detection confidence and abundance.
     - **Chemical Disequilibrium**: Co-existence of reducing and oxidizing biosignature pairs ($CH_4 + CO_2/O_3, DMS, N_2O$).
     - **Atmospheric Pressure & Shielding**: Surface cloud deck buffer ($0.1\text{ to }5\text{ bar}$).
     - **Planetary Mass & Surface Gravity**: Disentangles gas giant envelopes from habitable terrestrial and Hycean surfaces.

4. **🎛️ Real-Time Noise & Domain-Shift Stress Tester**:
   - Interactive sliders for Gaussian noise (1.0x to 3.5x), correlated 1/f detector baseline drift, and unocculted stellar spot slopes.
   - Demonstrates 1D-CNN dilated convolution noise invariance in real time.

5. **🧠 Explainable AI (XAI) Saliency Explorer**:
   - Channel-by-channel neural gradient attribution tracing which spectroscopic wavelengths dictated detection.

6. **⚡ Classical Bayesian vs 1D-CNN Benchmark Suite**:
   - Comprehensive performance metrics comparing runtime, carbon footprint, memory, and F1 scores.

7. **📚 Literature Review Database**:
   - 16 peer-reviewed papers (2018–2026) with explicit research gaps and "Why DeepAtmos is Better".

---

## 🛠️ How to Run Locally

### Option A: Direct Browser Launch
Simply double-click or open `index.html` in any modern web browser (Edge, Chrome, Firefox). DeepAtmos runs 100% client-side with zero dependencies!

### Option B: Built-in PowerShell Local Server
Run the included PowerShell server:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Open **[http://localhost:8080/](http://localhost:8080/)** in your browser.

---

## 📁 File Structure

```text
deepatmos-exoplanet-ai/
│
├── index.html                   # Main scientific web application & UI
├── app.js                       # Application controller & UI binding
├── deepatmos-model.js           # 1D-CNN neural engine & Habitability scoring
├── real-spectral-data.js        # Real JWST/HST calibrated spectra (6 planets)
├── spectral-chart.js            # Interactive Canvas spectrometer
├── live-background.js           # Subtle & lively cosmic background engine
├── literature-review-data.js    # 16-paper research database & gap catalog
├── styles.css                   # Dark sci-fi astrophysical design system
├── server.ps1                   # Lightweight local HTTP server (port 8080)
├── deepatmos-complete-source.zip# Complete single-click downloadable zip
└── README.md                    # Project documentation
```
