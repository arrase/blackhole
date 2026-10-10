# Gargantua — Real-Time Relativistic Black Hole Simulation

[![Live Demo](https://img.shields.io/badge/Live%20Demo-arrase.github.io%2Fblackhole-0ea5e9?style=flat-square&logo=github)](https://arrase.github.io/blackhole/)
[![Tests](https://img.shields.io/badge/Tests-41%20passing-emerald?style=flat-square&logo=vitest)](https://github.com/arrase/blackhole)
[![Coverage](https://img.shields.io/badge/Coverage-96%25-success?style=flat-square)](https://github.com/arrase/blackhole)
[![WebGL 2.0](https://img.shields.io/badge/WebGL-2.0%20GLSL%203.00-orange?style=flat-square&logo=webgl)](https://www.khronos.org/registry/webgl/specs/latest/2.0/)
[![React](https://img.shields.io/badge/React-19.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

An interactive, scientifically grounded real-time relativistic simulation of a spinning supermassive black hole (**Kerr metric**) and its accretion disk, running directly in modern web browsers at 60+ FPS via **WebGL 2**, **GLSL 3.00 ES**, **React 19**, and **TypeScript**.

> 🌐 **Experience it Live:** [arrase.github.io/blackhole](https://arrase.github.io/blackhole/)

![Gargantua - Black Hole Simulation](screenshot.png)

---

## 🌌 Overview

**Gargantua** accurately simulates the visual appearance and astrophysical phenomena of a rotating supermassive black hole, inspired by general relativity and scientific visualizations such as Kip Thorne's work for Christopher Nolan's *Interstellar*.

Rather than relying on approximations or post-rendered footage, Gargantua numerically traces null geodesics backwards from an observer tetrad through curved spacetime in real time. It pairs a **Novikov-Thorne thin accretion disk model** with **Page-Thorne radiative flux**, **Eddington grey atmosphere limb darkening**, **relativistic Doppler beaming**, **magnetorotational turbulence (MRI)**, **AgX color science**, and **adaptive resolution scaling** for smooth 60 FPS performance across desktop and mobile devices.

---

## 🔬 Physics & Mathematical Modeling

### 1. Kerr Metric & Outgoing Kerr-Schild Geodesics
- **Metric Formulation:** Formulated in Cartesian **outgoing Kerr-Schild coordinates** $(X, Y, Z)$ where the line element is $g_{\mu\nu} = \eta_{\mu\nu} + f L_\mu L_\nu$, with null vector $L_\mu$ and scalar function $f = 2M r^3 / (r^4 + a^2 Z^2)$.
- **Singularity-Free Integration:** The outgoing Kerr-Schild form is regular across the past event horizon, maintaining covariant momentum components $O(1)$ in 32-bit floating point down to the event horizon.
- **Hamiltonian Ray Marching:** Backwards light paths are integrated via Hamilton's equations ($dx/d\lambda$, $dp/d\lambda$) using a 2nd-order **Heun (Runge-Kutta 2)** predictor-corrector numerical solver with adaptive step sizes.
- **Frame Dragging (Lense-Thirring Effect):** The black hole's spin parameter $a = J/M \in [0.00, 0.95]$ dynamically drags surrounding spacetime, warping the photon orbits and producing the characteristic asymmetric flattened **"D"-shaped Kerr shadow**.
- **Critical Horizons:**
  - Event horizon radius: $r_+ = M + \sqrt{M^2 - a^2}$
  - Prograde Innermost Stable Circular Orbit (**ISCO**): Calculated via the exact Bardeen-Press-Teukolsky formulation.

### 2. Novikov-Thorne Accretion Disk & Page-Thorne Flux
- **Thin Disk Geometry:** Modeled as a geometrically thin, optically thick Shakura-Sunyaev disk with scale height $H/r \sim 0.01 - 0.013$ and Gaussian vertical density profile.
- **Analytical Page-Thorne Radiative Flux:** Exact roots and logarithmic coefficients of the relativistic differential equation are evaluated per frame on the CPU and passed as uniforms to determine the local radial flux $F(r)$ and effective temperature $T_{\text{eff}}(r) \propto F(r)^{1/4}$.
- **Gas Kinematics & Plunging Region:**
  - Outside ISCO ($r \ge r_{\text{ISCO}}$): Exact prograde Keplerian circular orbit velocity $(u^t, 0, u^\phi)$.
  - Inside ISCO ($r < r_{\text{ISCO}}$): Smooth transition into a geodesic free-fall plunge preserving ISCO specific energy $E$ and angular momentum $L$, with continuous 4-velocity $(u^t, u^r, u^\phi)$.
- **Volumetric Radiative Transfer:** Light traverses the accretion disk slab with optical depth integration $\Delta I = I_0 e^{-\Delta\tau} + S (1 - e^{-\Delta\tau})$, resolving vertical density profiles and local absorption coefficients $\kappa \rho$.
- **Eddington Limb Darkening:** The source function $S$ uses an Eddington grey atmosphere model $T^4 = \frac{3}{4} T_{\text{eff}}^4 (\tau + 2/3)$, naturally rendering limb darkening and exposing hotter, deeper layers through turbulent density variations.

### 3. Relativistic Doppler Beaming & Blackbody Radiation
- **Invariant Beaming & Shift:** Relativistic Doppler shift and gravitational redshift are evaluated directly via $g = -1 / (p \cdot u)_{\text{emit}}$ from the static observer to the emitting plasma.
- **Unnormalized Planck Blackbody Fit:** Evaluates Planck's radiation law using an analytic Wyman-Sloan-Shirley fit in linear sRGB:
  $$B(T) = \frac{W}{\exp(C / T) - 1}$$
  Because $g^3 I_\nu(\nu / g, T) = I_\nu(\nu, g T)$, evaluating $B(g T)$ accounts for spectral frequency shifting and quartic bolometric amplification ($g^4$) in a single computational step.
- Approaching gas exhibits intense blueshift and luminous beaming, while receding gas dims and shifts into deep infrared reds.

### 4. Magnetorotational Turbulence (MRI) & Gas Advection
- **Procedural 3D Noise:** Packed into an uncompressed $16 \times 64 \times 64$ periodic 3D R8 texture generated via a deterministic Mulberry32 pseudo-random number generator.
- **Turbulent Cascade:** Evaluates 6 octaves of Fractional Brownian Motion (fBM) with Kolmogorov spectral scaling ($\delta \propto l^{1/3}$) advected in log-radius and azimuth.
- **Continuous Two-Layer Advection Flow Map:** Two phase-shifted flow layers are advected along the differential angular velocity profile $\Omega(r)$ and smoothly blended with re-seeding to eliminate seam artifacts and temporal looping.

### 5. Gravitational Lensing & Higher-Order Photon Rings
- Primary, secondary, and tertiary disk crossings ($n = 0, 1, 2$) are fully tracked.
- Light looping beneath and behind the black hole is lensed into Einstein rings and thin photon rings around the shadow rim, demagnified by the Lyapunov exponent factor $e^\pi \approx 23.14$ per half-orbit.

### 6. Cosmic Starfield & Galactic Dust Lane
- **Directional Cube-Map:** $256 \times 256$ cells per cube face with power-law stellar flux distribution $N(>F) \propto F^{-3/2}$ and stellar blackbody temperatures ranging from $2.5\text{ kK}$ to $25\text{ kK}$.
- **Analytic Point Spread Function (PSF):** Exact subpixel Gaussian PSF evaluated against screen-space ray derivatives ($dFdx, dFdy$) to conserve flux under extreme gravitational magnification without aliasing.
- **Gravitational Blue Shift:** Distant starlight blueshifts as it falls from infinity toward the observer ($g = -1/u_{Pt}$).
- **Galactic Extinction:** Procedurally generated fractal dust lane with multi-scale fBM clouds crossing behind the black hole.

---

## 🎨 Rendering Engine & Post-Processing

- **WebGL 2 & 16-Bit Floating Point Pipeline:** Rendered entirely in high dynamic range (HDR) into RGBA16F framebuffers via `EXT_color_buffer_float`.
- **Temporal Anti-Aliasing (TAA) & Motion Blur:**
  - 2D Halton sequence subpixel jittering (bases 2 and 3).
  - Hardware exponential history accumulation using native alpha blending (`gl.blendColor`).
  - Converts camera orbit or gas rotation into a cinematic $1/12\text{ s}$ shutter motion blur, while converging to a pristine, noise-free image when the view is stationary.
- **6-Level Bloom Pyramid:**
  - 13-tap energy-preserving downsampling filter (Jorge Jimenez, *Call of Duty: Advanced Warfare*).
  - 3x3 tent filter upsampling with additive blending simulating an optical flare Point Spread Function ($1/\theta^2$).
- **AgX Minimal Tone Mapping:**
  - State-of-the-art cinematic tone reproduction (Troy Sobotka / B. Wrensch polynomial fit).
  - Smoothly desaturates intense highlights toward pure white rather than clipping or distorting hue (avoiding the channel burnout common in ACES or Reinhard).
  - Fine-tuned chromatic saturation look for blackbody radiators.
- **Optics & Dither:**
  - Physical optical lens vignetting ($\cos^4 \theta$ angular falloff).
  - Interleaved Gradient Noise (IGN) dithering ($\pm 0.5\text{ LSB}$) eliminating 8-bit banding on dark celestial gradients.
- **Adaptive Dynamic Resolution Scaling (`AdaptiveScaler`):**
  - Actively maintains 60 FPS by dynamically adjusting the internal render scale between $0.35\times$ and $1.0\times$ in quantized steps.
  - Queries real GPU execution time via `EXT_disjoint_timer_query_webgl2` when available, falling back to requestAnimationFrame timestamps with exponential moving averages (EMA) and probe hysteresis.
- **WebGL Context Loss Recovery:** Handles `webglcontextlost` and `webglcontextrestored` events cleanly, seamlessly restoring the engine if the GPU driver resets.

---

## 🎮 Controls & Interface

### Camera Navigation
| Action | Mouse | Touchscreen |
|---|---|---|
| **Orbit / Rotate View** | Left-click + drag | Single-finger drag |
| **Zoom (In / Out)** | Mouse wheel | Two-finger pinch |

### Cinematic Presets (Bottom Bar)
- **Interstellar:** Iconic cinematic angle with slightly tilted orbital view.
- **Kerr Shadow:** Close equatorial view emphasizing frame-dragging asymmetry and the "D"-shaped horizon shadow.
- **Close Approach:** Tight orbit skimming the outer boundary of the event horizon.
- **Top-Down:** Overhead polar perspective revealing full disk spiral geometry and velocity shear.
- **Disk Plane:** Edge-on perspective through the accretion disk demonstrating extreme vertical light deflection.

### Live Simulation Panel (Top Right)
- **Kerr Spin ($a$):** Adjusts black hole rotation from $0.00$ to $0.95$. Higher spin contracts the horizon and draws the ISCO inward.
- **Intensity:** Accretion disk luminosity and exposure multiplier ($0.20 - 2.50$).
- **Disk Speed:** Gas orbital velocity flow rate multiplier ($0.00 - 6.00$).
- **Disk Temp:** Accretion rate and base blackbody temperature profile ($0.50 - 3.00$).
- **Glow:** Multi-scale optical bloom scattering ($0.00 - 2.00$).
- **Stars:** Cosmic starfield density and brightness ($0.00 - 2.00$).
- **Lens Zoom (FOV):** Camera field of view / focal length ($0.80 - 3.50$).
- **Accretion Disk:** Toggle visibility of the accretion disk on/off.
- **Auto Rotation:** Toggle smooth cinematic camera orbit.

### In-App Educational Guide ("What am I seeing?")
An interactive educational dialog explaining the underlying astrophysics of every visual element: the Kerr metric, the event horizon, the ISCO, gravitational lensing, and Doppler beaming.

---

## 🌐 Full Internationalization (i18n)

Gargantua includes comprehensive localization into **45 languages**, complete with automatic browser language detection, persistent storage, and bidirectional layout handling (**RTL** for Arabic, Hebrew, Persian, and Urdu; **LTR** for all others):

| Languages | | | | |
|---|---|---|---|---|
| 🇸🇦 Arabic (`ar` - RTL) | 🇧🇬 Bulgarian (`bg`) | 🇧🇩 Bengali (`bn`) | 🇪🇸 Catalan (`ca`) | 🇨🇿 Czech (`cs`) |
| 🇩🇰 Danish (`da`) | 🇩🇪 German (`de`) | 🇬🇷 Greek (`el`) | 🇬🇧 English (`en`) | 🇪🇸 Spanish (`es`) |
| 🇪🇪 Estonian (`et`) | 🇪🇸 Basque (`eu`) | 🇮🇷 Persian (`fa` - RTL) | 🇫🇮 Finnish (`fi`) | 🇵🇭 Filipino (`fil`) |
| 🇫🇷 French (`fr`) | 🇪🇸 Galician (`gl`) | 🇮🇱 Hebrew (`he` - RTL) | 🇮🇳 Hindi (`hi`) | 🇭🇷 Croatian (`hr`) |
| 🇭🇺 Hungarian (`hu`) | 🇮🇩 Indonesian (`id`) | 🇮🇹 Italian (`it`) | 🇯🇵 Japanese (`ja`) | 🇰🇷 Korean (`ko`) |
| 🇱🇹 Lithuanian (`lt`) | 🇱🇻 Latvian (`lv`) | 🇲🇾 Malay (`ms`) | 🇳🇱 Dutch (`nl`) | 🇳🇴 Norwegian (`no`) |
| 🇵🇱 Polish (`pl`) | 🇵🇹 Portuguese (`pt`) | 🇷🇴 Romanian (`ro`) | 🇷🇺 Russian (`ru`) | 🇸🇰 Slovak (`sk`) |
| 🇸🇮 Slovenian (`sl`) | 🇷🇸 Serbian (`sr`) | 🇸🇪 Swedish (`sv`) | 🇰🇪 Swahili (`sw`) | 🇹🇭 Thai (`th`) |
| 🇹🇷 Turkish (`tr`) | 🇺🇦 Ukrainian (`uk`) | 🇵🇰 Urdu (`ur` - RTL) | 🇻🇳 Vietnamese (`vi`) | 🇨🇳 Chinese (`zh`) |

---

## 📁 Project Architecture

```
blackhole/
├── src/
│   ├── App.tsx               # Main React interface, HUD, controls panel & presets
│   ├── BlackHole.tsx         # Canvas bridge, event handling & animation loop
│   ├── physics/              # Analytical relativistic physics & mathematical models
│   │   ├── kerr.ts           # Kerr metric, horizons, ISCO & camera tetrad calculations
│   │   ├── disk.ts           # Novikov-Thorne disk & Page-Thorne flux analytical solver
│   │   └── color.ts          # Linear sRGB Planck blackbody fits & luminance
│   ├── render/               # WebGL2 rendering infrastructure
│   │   ├── renderer.ts       # Main multi-pass HDR pipeline controller
│   │   ├── scaler.ts         # Real-time adaptive resolution scaler (60 FPS target)
│   │   ├── gpuTimer.ts       # EXT_disjoint_timer_query_webgl2 hardware profiler
│   │   ├── temporal.ts       # Temporal accumulation & motion blur heuristics
│   │   ├── halton.ts         # Halton low-discrepancy subpixel jittering sequence
│   │   ├── bloom.ts          # 6-level downsample/upsample bloom pyramid
│   │   ├── camera.ts         # Orthonormal camera frame & spherical coordinates
│   │   ├── gl.ts             # WebGL2 program, shader & framebuffer abstractions
│   │   ├── noiseTexture.ts   # 3D periodic noise texture generator (Mulberry32 PRNG)
│   │   └── types.ts          # Simulation settings & camera interfaces
│   ├── shaders/              # Modular GLSL 3.00 ES shader library
│   │   ├── kerr.ts           # Hamilton geodesic ray marching in Kerr-Schild coordinates
│   │   ├── disk.ts           # Volumetric radiative transfer, advection & opacity
│   │   ├── background.ts     # Analytic starfield PSF & fractal galactic dust band
│   │   ├── noise.ts          # 3D texture sampling & Kolmogorov fBM routines
│   │   ├── color.ts          # GLSL blackbody radiator & Doppler shift evaluator
│   │   ├── post.ts           # AgX tone mapping, bloom composite & IGN dithering
│   │   ├── raymarch.ts       # Core volumetric ray marching fragment shader
│   │   └── common.ts         # GLSL headers, hash functions & shared uniforms
│   └── i18n/                 # 45 complete language localizations & RTL manager
├── tests/                    # Vitest unit & integration test suite (96%+ coverage)
│   ├── kerr.test.ts          # Exact metric, horizon, ISCO & frame dragging tests
│   ├── disk.test.ts          # Page-Thorne flux, temperature & Keplerian orbits tests
│   ├── render.test.ts        # Halton jitter, noise, adaptive scaler & TAA tests
│   ├── shaders.test.ts       # GLSL compilation syntax and uniform validation
│   └── i18n.test.ts          # Completeness and RTL validation for all 45 locales
├── vite.config.ts            # Vite configuration with single-file HTML inlining
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser with **WebGL 2.0** support (Chrome, Firefox, Safari 15+, Edge).
- Node.js 20+ and npm (for local development and building).

### Installation & Local Development

```bash
# 1. Clone the repository
git clone https://github.com/arrase/blackhole.git
cd blackhole

# 2. Install dependencies
npm install

# 3. Start the local Vite development server
npm run dev
```

### Production Build

```bash
# Build standalone single-file production package
npm run build
```

The build uses `vite-plugin-singlefile` to bundle the entire application (HTML, CSS, JavaScript, and shaders) into a **single self-contained `dist/index.html` file** (~400 kB uncompressed, ~138 kB gzipped). It can be opened directly in any browser with zero web server requirements and works completely offline.

### Running Tests

```bash
# Run the complete test suite
npm run test

# Run tests with code coverage report
npm run test:coverage
```

---

## 📚 Scientific References & Further Reading

1. **Kerr, R. P. (1963):** *Gravitational Field of a Spinning Mass as an Example of Algebraically Special Metrics*. Phys. Rev. Lett. 11, 237.
2. **Bardeen, J. M., Press, W. H., & Teukolsky, S. A. (1972):** *Rotating Black Holes: Locally Nonrotating Frames, Energy Extraction, and Scalar Synchrotron Radiation*. The Astrophysical Journal, 178, 347–370.
3. **Novikov, I. D., & Thorne, K. S. (1973):** *Astrophysics of Black Holes*, in Black Holes (Les Astres Occlus), ed. C. DeWitt & B. S. DeWitt (New York: Gordon & Breach), 343–450.
4. **Page, D. N., & Thorne, K. S. (1974):** *Disk-Accretion onto a Black Hole. I. Accretion Spectrometry*. The Astrophysical Journal, 191, 499–506.
5. **James, O., von Tunzelmann, E., Franklin, P., & Thorne, K. S. (2015):** *Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar*. Classical and Quantum Gravity, 32(6), 065001.
6. **Wyman, C., Sloan, P.-P., & Shirley, P. (2013):** *Simple Analytic Approximations to the CIE XYZ Color Matching Functions*. Journal of Computer Graphics Techniques (JCGT), 2(2), 1–11.
7. **Jimenez, J. (2014):** *Next Generation Post-Processing in Call of Duty: Advanced Warfare*. SIGGRAPH 2014 Advances in Real-Time Rendering.
8. **Sobotka, T.:** *AgX Color Transform & Display Rendering Transform for High Dynamic Range Imagery*.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
