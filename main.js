/* ==========================================================================
   3D WEBGLE ENGINE & INTERACTIVE LOGIC (Three.js + GSAP + Audio Synthesizer)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. STATE & AUDIO ENGINE
  const state = {
    audioEnabled: true,
    currentTheme: 'cyan',
    activeShape: 'cyber-poly',
    name: 'Sanskar Shinde',
    role: 'Full-Stack Software Engineer & Creative Developer',
    bio: 'Software Engineering student at D. Y. Patil Institute of Technology, Pimpri, Pune. Building high-performance web applications and 3D graphics.'
  };

  // Web Audio API Synthesizer (Zero external audio file dependencies!)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playSynthSound(freq = 440, type = 'sine', duration = 0.15, gainVal = 0.05) {
    if (!state.audioEnabled) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
  }

  // Hover & Click Audio Feedback
  document.querySelectorAll('a, button, .project-card, .skill-chip').forEach(el => {
    el.addEventListener('mouseenter', () => playSynthSound(600, 'sine', 0.08, 0.02));
    el.addEventListener('click', () => playSynthSound(900, 'triangle', 0.15, 0.05));
  });

  const audioBtn = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  audioBtn.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    if (state.audioEnabled) {
      audioIcon.setAttribute('data-lucide', 'volume-2');
      playSynthSound(523, 'sine', 0.2, 0.06);
    } else {
      audioIcon.setAttribute('data-lucide', 'volume-x');
    }
    lucide.createIcons();
  });

  // 2. THREE.JS 3D SCENE & WEBGLE SETUP
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070913, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting System
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00f2fe, 3, 20);
  pointLight1.position.set(4, 4, 4);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xa855f7, 2, 20);
  pointLight2.position.set(-4, -4, 2);
  scene.add(pointLight2);

  // Group for main floating 3D objects
  const mainObjectGroup = new THREE.Group();
  scene.add(mainObjectGroup);

  // Create Primary Central 3D Mesh
  let mainMesh, wireframeMesh;
  const materials = {
    cyan: { color: 0x00f2fe, wire: 0x4facfe },
    purple: { color: 0xa855f7, wire: 0xec4899 },
    emerald: { color: 0x10b981, wire: 0x06b6d4 },
    amber: { color: 0xf59e0b, wire: 0xef4444 },
    rose: { color: 0xf43f5e, wire: 0x8b5cf6 }
  };

  function buildMainShape(shapeType = 'cyber-poly', colorKey = 'cyan') {
    // Clear previous meshes
    while (mainObjectGroup.children.length > 0) {
      const child = mainObjectGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      mainObjectGroup.remove(child);
    }

    let geometry;
    switch (shapeType) {
      case 'kinetic-spheres':
        geometry = new THREE.IcosahedronGeometry(2, 1);
        break;
      case 'crystal-mesh':
        geometry = new THREE.OctahedronGeometry(2.2, 0);
        break;
      case 'particle-field':
        geometry = new THREE.TorusGeometry(2, 0.7, 16, 100);
        break;
      case 'cyber-poly':
      default:
        geometry = new THREE.TorusKnotGeometry(1.6, 0.45, 128, 32);
        break;
    }

    const themeColors = materials[colorKey] || materials.cyan;

    // Solid Glass-like Material
    const material = new THREE.MeshPhysicalMaterial({
      color: themeColors.color,
      metalness: 0.2,
      roughness: 0.2,
      transmission: 0.6,
      opacity: 0.85,
      transparent: true,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false
    });

    mainMesh = new THREE.Mesh(geometry, material);
    mainObjectGroup.add(mainMesh);

    // Glowing Wireframe Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: themeColors.wire,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    wireframeMesh = new THREE.Mesh(geometry, wireMat);
    wireframeMesh.scale.setScalar(1.02);
    mainObjectGroup.add(wireframeMesh);

    // Update lights color
    pointLight1.color.setHex(themeColors.color);
    pointLight2.color.setHex(themeColors.wire);
  }

  buildMainShape('cyber-poly', 'cyan');

  // Background Quantum Particle Stars
  const particleCount = 700;
  const particlesGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 40;
    particlePositions[i + 1] = (Math.random() - 0.5) * 40;
    particlePositions[i + 2] = (Math.random() - 0.5) * 40;
    particleScales[i / 3] = Math.random();
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particlesGeo, particleMat);
  scene.add(particleSystem);

  // Secondary Floating Geometric Props around scene
  const floatingPropsGroup = new THREE.Group();
  const propGeos = [
    new THREE.TetrahedronGeometry(0.5),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.OctahedronGeometry(0.5)
  ];

  for (let i = 0; i < 15; i++) {
    const geo = propGeos[Math.floor(Math.random() * propGeos.length)];
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.8,
      transparent: true,
      opacity: 0.35
    });
    const prop = new THREE.Mesh(geo, mat);
    prop.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15
    );
    prop.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    prop.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.02,
      rotSpeedY: (Math.random() - 0.5) * 0.02
    };
    floatingPropsGroup.add(prop);
  }
  scene.add(floatingPropsGroup);

  // 3. MOUSE INTERACTION & CURSOR TRAILING EFFECT
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const cursor = { x: -100, y: -100, ringX: -100, ringY: -100 };

  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

    cursor.x = e.clientX;
    cursor.y = e.clientY;

    // Inner dot moves instantly with mouse
    if (cursorDot) {
      cursorDot.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
    }
  });

  // 4. HIGH-PERFORMANCE SCROLL ANIMATIONS & INTERSECTION OBSERVER
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  revealElements.forEach(el => revealObserver.observe(el));

  // Dynamic Scroll Progress State
  let scrollYTarget = window.scrollY;
  let scrollYCurrent = window.scrollY;

  window.addEventListener('scroll', () => {
    scrollYTarget = window.scrollY;

    // Active Nav Link Scroll Highlight
    let current = '';
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 180;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  });

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  // 5. ANIMATION LOOP (Clock tick & Smooth Scroll Morphing)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Mouse & Cursor Trailing Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    cursor.ringX += (cursor.x - cursor.ringX) * 0.07;
    cursor.ringY += (cursor.y - cursor.ringY) * 0.07;

    if (cursorRing) {
      cursorRing.style.transform = `translate(${cursor.ringX}px, ${cursor.ringY}px)`;
    }

    // Smooth Scroll Lerp
    scrollYCurrent += (scrollYTarget - scrollYCurrent) * 0.08;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = scrollYCurrent / maxScroll;

    // Dynamic 3D Camera & Scene Morphing on Scroll
    if (mainObjectGroup) {
      mainObjectGroup.rotation.y = elapsedTime * 0.35 + scrollProgress * Math.PI * 4 + mouse.x * 0.5;
      mainObjectGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2 + scrollProgress * Math.PI * 2 + mouse.y * 0.5;
      mainObjectGroup.rotation.z = Math.cos(scrollProgress * Math.PI * 3) * 0.3;

      // X, Y, Z coordinates shift dynamically based on scroll ratio
      const posX = Math.sin(scrollProgress * Math.PI * 2.5) * 2.8;
      const posY = -scrollProgress * 1.2 + Math.cos(scrollProgress * Math.PI * 2) * 0.4;
      const posZ = Math.cos(scrollProgress * Math.PI * 2) * 1.5;

      mainObjectGroup.position.set(posX, posY, posZ);
      const scaleVal = 1 + Math.sin(scrollProgress * Math.PI * 3) * 0.25;
      mainObjectGroup.scale.set(scaleVal, scaleVal, scaleVal);
    }

    // Rotate floating props & quantum particle stars on scroll
    floatingPropsGroup.rotation.y = scrollProgress * Math.PI * 1.5;
    particleSystem.rotation.y = elapsedTime * 0.03 + scrollProgress * Math.PI * 2;
    particleSystem.position.y = -scrollProgress * 4;

    // Parallax light movement
    pointLight1.position.x = Math.sin(elapsedTime * 0.8 + scrollProgress * 5) * 6;
    pointLight2.position.y = Math.cos(elapsedTime * 0.6 + scrollProgress * 5) * 6;

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });



  // 7. PROJECT DETAILS MODAL
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentBody = document.getElementById('modal-content-body');

  const projectDetailsMap = {
    1: {
      title: "Nexus AI 3D Analytics Platform",
      category: "WebGL / 3D Volumetric Analytics",
      description: "An enterprise-grade real-time analytics platform featuring interactive 3D volumetric data graphs, GPU-accelerated particle flow maps, and predictive machine learning models.",
      tech: ["Three.js", "React.js", "TypeScript", "WebSockets", "Node.js", "Python / PyTorch"],
      highlights: [
        "Rendered 50,000+ data nodes simultaneously at 60 FPS using custom WebGL shaders.",
        "Integrated WebSockets stream for sub-50ms live metric updates.",
        "Created custom 3D orbit camera controls with context-sensitive tooltips."
      ]
    },
    2: {
      title: "Spatial Canvas Studio",
      category: "Spatial Computing / WebGL Builder",
      description: "A browser-native 3D scene editing environment allowing designers and developers to visually compose 3D models, configure PBR materials, add lighting rigs, and export production GLTF models.",
      tech: ["WebGL", "GLSL Shaders", "Node.js", "Vite", "WebAssembly"],
      highlights: [
        "Procedural node graph system for shader creation without writing raw code.",
        "Drag and drop 3D asset importer supporting OBJ, FBX, and GLTF format parsing.",
        "Lightweight 120KB client-side execution bundle built with Vite."
      ]
    },
    3: {
      title: "Quantum Cloud Protocol",
      category: "Full-Stack SaaS / DevOps Platform",
      description: "A high-performance cloud container orchestrator featuring live network topology maps, automated autoscaling, and cryptographic security logging.",
      tech: ["Next.js", "Go (Golang)", "Docker", "PostgreSQL", "Redis", "AWS"],
      highlights: [
        "Engineered Go microservice architecture handling 10,000+ requests per second.",
        "Automated SSL certificate provisioning and container health checks.",
        "Implemented real-time latency heatmap using D3.js and Canvas."
      ]
    }
  };

  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-project');
      const project = projectDetailsMap[pId];
      if (!project) return;

      modalContentBody.innerHTML = `
        <span class="card-badge" style="color: var(--primary-accent); margin-bottom: 0.5rem; display: block;">${project.category}</span>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem;">${project.title}</h2>
        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">${project.description}</p>
        
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Key Features & Architecture:</h4>
        <ul style="color: var(--text-muted); padding-left: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          ${project.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.75rem;">
          ${project.tech.map(t => `<span class="skill-chip">${t}</span>`).join('')}
        </div>

        <div style="display: flex; gap: 1rem;">
          <a href="https://github.com" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            <span>Launch Live Demo</span>
            <i data-lucide="external-link"></i>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener" class="btn btn-glass btn-sm">
            <span>View Source Code</span>
            <i data-lucide="github"></i>
          </a>
        </div>
      `;

      lucide.createIcons();
      projectModal.classList.add('open');
      playSynthSound(850, 'sine', 0.2, 0.05);
    });
  });

  modalCloseBtn.addEventListener('click', () => {
    projectModal.classList.remove('open');
  });

  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) projectModal.classList.remove('open');
  });

  // 8. CONTACT FORM SIMULATION
  const contactForm = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status-msg');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-form');
    btn.disabled = true;
    btn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<span>Send Message</span><i data-lucide="send"></i>`;
      lucide.createIcons();

      statusMsg.className = 'status-message success';
      statusMsg.innerText = 'Thank you! Your message has been received successfully. I will get back to you soon.';
      contactForm.reset();
      playSynthSound(1000, 'sine', 0.3, 0.07);

      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 6000);
    }, 1200);
  });

  // 9. MOBILE MENU TOGGLE
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  mobileBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    playSynthSound(750, 'sine', 0.1, 0.04);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
});
