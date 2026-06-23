// --- Three.js & GSAP Setup for Premium SaaS Human Bust Hero ---

// Global Variables
let scene, camera, renderer;
let robotGroup, eyeGroup, particleGroup, glassCardGroup, orbGroup; // robotGroup represents the Human Recruiter Bust centerpiece
let leftEyeball, rightEyeball;
let leftUpperLid, leftLowerLid, rightUpperLid, rightLowerLid;
let limePointLight, indigoPointLight;

let lastTime = Date.now();

// Mouse Tracking Variables
let mouseX = 0;
let mouseY = 0;
let targetHeadRotX = 0;
let targetHeadRotY = 0;
let targetEyeRotX = 0;
let targetEyeRotY = 0;

// Sizing
let width = 600;
let height = 650;
let initialCameraZ = 7.6; // Position camera closer to make the model larger and a true visual centerpiece

// Initialize the 3D Scene
function init() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container element not found.');
    return;
  }

  // Handle absolute layout size delay using offsets with viewport fallback
  width = container.clientWidth || container.offsetWidth || window.innerWidth * 0.45;
  height = container.clientHeight || container.offsetHeight || 650;

  // 1. Create Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xffffff, 0.045);

  // 2. Create Camera
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, initialCameraZ);

  // 3. Create Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for retina performance
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  
  // Clear any previous canvas before appending to avoid duplication
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. Create Groups (Mapping human bust to 'robotGroup' to satisfy naming requirements)
  robotGroup = new THREE.Group();
  eyeGroup = new THREE.Group();
  particleGroup = new THREE.Group();
  glassCardGroup = new THREE.Group();
  orbGroup = new THREE.Group();

  scene.add(robotGroup);
  robotGroup.add(eyeGroup);
  scene.add(particleGroup);
  scene.add(glassCardGroup);
  scene.add(orbGroup);

  // 5. Build Scene Elements
  setupLights();
  buildRobotHead();
  buildFloatingObjects();
  buildBackgroundParticles();
  buildLightTrails();

  // 6. Start Animations
  startBlinkLoop();
  animate();

  // 7. Event Listeners
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onWindowScroll);
  setupHTMLCardInteractions();

  

  // Force layout alignment sync after browser finishes processing DOM
  setTimeout(onWindowResize, 100);
}

// --- LIGHTS SETUP ---
function setupLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  // Key light (Warm White)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(6, 6, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill light (Indigo Blue - #5869FC)
  const fillLight = new THREE.DirectionalLight(0x5869FC, 1.6);
  fillLight.position.set(-6, -2, 4);
  scene.add(fillLight);

  // Rim light (Lime Green - #B3FC6A)
  const rimLight = new THREE.DirectionalLight(0xB3FC6A, 2.0);
  rimLight.position.set(3, 4, -6);
  scene.add(rimLight);

  // Orbiting glow lights inside the orbGroup
  limePointLight = new THREE.PointLight(0xB3FC6A, 2.5, 10);
  indigoPointLight = new THREE.PointLight(0x5869FC, 3.0, 10);
  
  orbGroup.add(limePointLight);
  orbGroup.add(indigoPointLight);

  const orbGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const limeOrbMat = new THREE.MeshBasicMaterial({ color: 0xB3FC6A, transparent: true, opacity: 0.8 });
  const indigoOrbMat = new THREE.MeshBasicMaterial({ color: 0x5869FC, transparent: true, opacity: 0.8 });
  
  limePointLight.add(new THREE.Mesh(orbGeo, limeOrbMat));
  indigoPointLight.add(new THREE.Mesh(orbGeo, indigoOrbMat));
}

// --- PROCEDURAL HUMAN BUST CENTERPIECE ---
function buildRobotHead() {
  // Premium Materials (Glossy white plastic casing + dark metal joints + glowing neon rings)
  const whiteGlossyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  const darkMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0x141416,
    roughness: 0.35,
    metalness: 0.85,
    clearcoat: 0.2
  });

  const glowingGreenMat = new THREE.MeshBasicMaterial({
    color: 0xB3FC6A
  });

  const darkSeamMat = new THREE.MeshBasicMaterial({
    color: 0x0f0f12
  });

  // --- 1. HEAD MAIN SHELL & FACE ---
  // Cranium (Sleek robot helmet head casing)
  const craniumGeo = new THREE.SphereGeometry(1.58, 64, 64);
  const cranium = new THREE.Mesh(craniumGeo, whiteGlossyMat);
  cranium.scale.set(1.0, 1.04, 1.0);
  cranium.position.set(0, 0.4, 0);
  cranium.castShadow = true;
  cranium.receiveShadow = true;
  robotGroup.add(cranium);

  // Recessed Face area (sleek white face mask)
  const faceGeo = new THREE.SphereGeometry(1.5, 64, 64);
  const face = new THREE.Mesh(faceGeo, whiteGlossyMat);
  face.scale.set(0.96, 0.98, 0.98);
  face.position.set(0, 0.36, 0.08);
  face.castShadow = true;
  robotGroup.add(face);

  // Soft cheeks & chin for cute organic shapes
  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), whiteGlossyMat);
  cheekL.position.set(-0.42, 0.08, 1.34);
  cheekL.scale.set(1.0, 1.0, 0.6);
  robotGroup.add(cheekL);

  const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), whiteGlossyMat);
  cheekR.position.set(0.42, 0.08, 1.34);
  cheekR.scale.set(1.0, 1.0, 0.6);
  robotGroup.add(cheekR);

  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), whiteGlossyMat);
  chin.position.set(0, -0.22, 1.36);
  chin.scale.set(1.0, 0.8, 0.8);
  robotGroup.add(chin);

  // --- 2. BLACK PANEL SEAMS (Curved grooves mapping to reference image) ---
  // Seam 1: Vertical crown wrapping
  const seam1 = new THREE.Mesh(new THREE.TorusGeometry(1.595, 0.012, 8, 64), darkSeamMat);
  seam1.rotation.y = Math.PI / 2;
  seam1.position.set(0, 0.4, 0);
  robotGroup.add(seam1);

  // Seam 2: Forehead curve seam
  const seamForehead = new THREE.Mesh(new THREE.TorusGeometry(1.595, 0.012, 8, 64, Math.PI), darkSeamMat);
  seamForehead.rotation.x = Math.PI / 10;
  seamForehead.position.set(0, 0.4, 0);
  robotGroup.add(seamForehead);

  // Seam 3: Back skull crown seam
  const seamBack = new THREE.Mesh(new THREE.TorusGeometry(1.595, 0.012, 8, 64, Math.PI), darkSeamMat);
  seamBack.rotation.x = -Math.PI / 3.5;
  seamBack.position.set(0, 0.4, 0);
  robotGroup.add(seamBack);

  // Seam 4: Longitudinal center seam
  const seamCenter = new THREE.Mesh(new THREE.TorusGeometry(1.595, 0.012, 8, 64, Math.PI), darkSeamMat);
  seamCenter.rotation.set(Math.PI / 5, Math.PI / 2, 0);
  seamCenter.position.set(0, 0.4, 0);
  robotGroup.add(seamCenter);

  // --- 3. CYBERNETIC EARPIECES ---
  // Left Ear
  const earL = new THREE.Group();
  earL.position.set(-1.6, 0.46, 0);
  earL.rotation.z = Math.PI / 2;
  robotGroup.add(earL);

  const earLWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 32), whiteGlossyMat);
  earLWhite.castShadow = true;
  earL.add(earLWhite);

  const earLDark = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32), darkMetalMat);
  earLDark.position.y = 0.02;
  earL.add(earLDark);

  const earLGlow = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 32), glowingGreenMat);
  earLGlow.position.y = 0.1;
  earLGlow.rotation.x = Math.PI / 2;
  earL.add(earLGlow);

  const earLWhiteCore = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 32), whiteGlossyMat);
  earLWhiteCore.position.y = 0.03;
  earL.add(earLWhiteCore);

  // Right Ear
  const earR = new THREE.Group();
  earR.position.set(1.6, 0.46, 0);
  earR.rotation.z = -Math.PI / 2;
  robotGroup.add(earR);

  const earRWhite = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 32), whiteGlossyMat);
  earRWhite.castShadow = true;
  earR.add(earRWhite);

  const earRDark = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32), darkMetalMat);
  earRDark.position.y = 0.02;
  earR.add(earRDark);

  const earRGlow = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 32), glowingGreenMat);
  earRGlow.position.y = 0.1;
  earRGlow.rotation.x = Math.PI / 2;
  earR.add(earRGlow);

  const earRWhiteCore = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 32), whiteGlossyMat);
  earRWhiteCore.position.y = 0.03;
  earR.add(earRWhiteCore);

  // --- 4. CUTE FACE DETAILS ---
  // Tiny button nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), whiteGlossyMat);
  nose.position.set(0, 0.08, 1.49);
  robotGroup.add(nose);

  // Smiling mouth line (U-shape curve)
  const mouthArc = Math.PI / 1.4;
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 8, 24, mouthArc), darkMetalMat);
  mouth.position.set(0, -0.06, 1.47);
  mouth.rotation.set(0, 0, Math.PI + (Math.PI - mouthArc) / 2);
  robotGroup.add(mouth);

  // --- 5. BIG EXPRESSIVE GLASS EYES & TRACKING ---
  const eyeRadius = 0.29; // Large, friendly eyeballs
  const eyeballGeo = new THREE.SphereGeometry(eyeRadius, 32, 32);
  const eyeballMat = new THREE.MeshPhysicalMaterial({
    color: 0xfafafa,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1.0
  });

  const irisGeo = new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, 0.6);
  const irisMat = new THREE.MeshPhysicalMaterial({
    color: 0x3d4b58,        // Slate grey-blue iris
    roughness: 0.1,
    metalness: 0.2
  });

  const pupilGeo = new THREE.SphereGeometry(0.095, 32, 16, 0, Math.PI * 2, 0, 0.45);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Cornea glass overlay for rich specular highlights
  const corneaGeo = new THREE.SphereGeometry(eyeRadius + 0.008, 32, 32);
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.1,
    transparent: true
  });

  // Left Eye Setup
  const leftEyeCenter = new THREE.Vector3(-0.44, 0.38, 1.25);
  leftEyeball = new THREE.Group();
  leftEyeball.position.copy(leftEyeCenter);
  eyeGroup.add(leftEyeball);

  leftEyeball.add(new THREE.Mesh(eyeballGeo, eyeballMat));
  
  const leftIris = new THREE.Mesh(irisGeo, irisMat);
  leftIris.position.set(0, 0, 0.15);
  leftIris.rotation.x = Math.PI / 2;
  leftEyeball.add(leftIris);

  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(0, 0, 0.25);
  leftPupil.rotation.x = Math.PI / 2;
  leftEyeball.add(leftPupil);

  const leftCornea = new THREE.Mesh(corneaGeo, corneaMat);
  leftEyeball.add(leftCornea);

  // Right Eye Setup
  const rightEyeCenter = new THREE.Vector3(0.44, 0.38, 1.25);
  rightEyeball = new THREE.Group();
  rightEyeball.position.copy(rightEyeCenter);
  eyeGroup.add(rightEyeball);

  rightEyeball.add(new THREE.Mesh(eyeballGeo, eyeballMat));

  const rightIris = new THREE.Mesh(irisGeo, irisMat);
  rightIris.position.set(0, 0, 0.15);
  rightIris.rotation.x = Math.PI / 2;
  rightEyeball.add(rightIris);

  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0, 0, 0.25);
  rightPupil.rotation.x = Math.PI / 2;
  rightEyeball.add(rightPupil);

  const rightCornea = new THREE.Mesh(corneaGeo, corneaMat);
  rightEyeball.add(rightCornea);

  // Eye socket borders (eyelids rims) to frame eyeballs organically
  const eyeBorderGeo = new THREE.TorusGeometry(0.32, 0.024, 8, 32);
  
  const leftEyeBorder = new THREE.Mesh(eyeBorderGeo, whiteGlossyMat);
  leftEyeBorder.position.set(-0.44, 0.38, 1.35);
  leftEyeBorder.rotation.set(0, 0.08, 0);
  robotGroup.add(leftEyeBorder);

  const rightEyeBorder = new THREE.Mesh(eyeBorderGeo, whiteGlossyMat);
  rightEyeBorder.position.set(0.44, 0.38, 1.35);
  rightEyeBorder.rotation.set(0, -0.08, 0);
  robotGroup.add(rightEyeBorder);

  // Eyelids (sliding hemispherical caps parented to cranium)
  const lidRadius = eyeRadius + 0.015;
  const upperLidGeo = new THREE.SphereGeometry(lidRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const lowerLidGeo = new THREE.SphereGeometry(lidRadius, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);

  // Left Eye Eyelids
  const leftLids = new THREE.Group();
  leftLids.position.copy(leftEyeCenter);
  leftLids.rotation.set(0, 0.08, 0);
  robotGroup.add(leftLids);

  leftUpperLid = new THREE.Mesh(upperLidGeo, whiteGlossyMat);
  leftUpperLid.rotation.x = -1.4; // Open state
  leftLids.add(leftUpperLid);

  leftLowerLid = new THREE.Mesh(lowerLidGeo, whiteGlossyMat);
  leftLowerLid.rotation.x = 1.4; // Open state
  leftLids.add(leftLowerLid);

  // Right Eye Eyelids
  const rightLids = new THREE.Group();
  rightLids.position.copy(rightEyeCenter);
  rightLids.rotation.set(0, -0.08, 0);
  robotGroup.add(rightLids);

  rightUpperLid = new THREE.Mesh(upperLidGeo, whiteGlossyMat);
  rightUpperLid.rotation.x = -1.4; // Open state
  rightLids.add(rightUpperLid);

  rightLowerLid = new THREE.Mesh(lowerLidGeo, whiteGlossyMat);
  rightLowerLid.rotation.x = 1.4; // Open state
  rightLids.add(rightLowerLid);

  // --- 6. DARK CARBON NECK & COLLAR PLATE ---
  // Neck cylinder joint
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.85, 32), darkMetalMat);
  neck.position.set(0, -1.05, -0.08);
  neck.castShadow = true;
  robotGroup.add(neck);

  // Glowing indicator details on front neck (lime cylinders/boxes)
  const neckGlowL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.25, 0.035), glowingGreenMat);
  neckGlowL.position.set(-0.16, -0.98, 0.28);
  neckGlowL.rotation.set(0.1, -0.15, 0);
  robotGroup.add(neckGlowL);

  const neckGlowR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.25, 0.035), glowingGreenMat);
  neckGlowR.position.set(0.16, -0.98, 0.28);
  neckGlowR.rotation.set(0.1, 0.15, 0);
  robotGroup.add(neckGlowR);

  // Collar ring base plate
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.18, 16, 64), whiteGlossyMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, -1.45, -0.1);
  collar.scale.set(1.0, 0.9, 0.45);
  collar.castShadow = true;
  collar.receiveShadow = true;
  robotGroup.add(collar);

  const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 8, 48), glowingGreenMat);
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.set(0, -1.25, -0.08);
  robotGroup.add(collarRing);

  // Position recruiter head centered on coordinates
  robotGroup.position.set(0, -0.3, 0);
}

// --- WEBGL FLOATING OBJECTS (Unicorn Studio inspired) ---
const floatingMeshes = [];
function buildFloatingObjects() {
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0.05,
    transmission: 0.95,
    ior: 1.48,
    thickness: 0.8,
    transparent: true,
    opacity: 1.0,
    clearcoat: 1.0
  });

  const neonGreenMat = new THREE.MeshPhysicalMaterial({
    color: 0xB3FC6A,
    roughness: 0.15,
    metalness: 0.8,
    clearcoat: 1.0
  });

  const neonBlueMat = new THREE.MeshPhysicalMaterial({
    color: 0x5869FC,
    roughness: 0.15,
    metalness: 0.8,
    clearcoat: 1.0
  });

  // 1. Floating Glass Spheres orbiting recruiter head
  const sphereGeos = [
    new THREE.SphereGeometry(0.22, 32, 32),
    new THREE.SphereGeometry(0.32, 32, 32),
    new THREE.SphereGeometry(0.16, 32, 32)
  ];
  
  const spherePositions = [
    new THREE.Vector3(2.5, 1.4, 0.8),
    new THREE.Vector3(-2.6, -1.5, 1.2),
    new THREE.Vector3(1.7, -2.1, 0.5)
  ];

  sphereGeos.forEach((geo, idx) => {
    const mesh = new THREE.Mesh(geo, glassMat);
    mesh.position.copy(spherePositions[idx]);
    mesh.castShadow = true;
    scene.add(mesh);
    
    floatingMeshes.push({
      mesh: mesh,
      initialPos: mesh.position.clone(),
      floatSpeed: 0.5 + idx * 0.15,
      floatRange: 0.11 + idx * 0.03,
      rotSpeedX: 0.003,
      rotSpeedY: 0.005
    });
  });

  // 2. Floating Neon Rings
  const ringGeos = [
    new THREE.TorusGeometry(0.38, 0.065, 16, 64),
    new THREE.TorusGeometry(0.28, 0.055, 16, 64)
  ];
  
  const ringMats = [neonBlueMat, neonGreenMat];
  const ringPositions = [
    new THREE.Vector3(2.7, 0.1, -0.4),
    new THREE.Vector3(-2.2, 1.3, 0.5)
  ];

  ringGeos.forEach((geo, idx) => {
    const mesh = new THREE.Mesh(geo, ringMats[idx]);
    mesh.position.copy(ringPositions[idx]);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.castShadow = true;
    scene.add(mesh);

    floatingMeshes.push({
      mesh: mesh,
      initialPos: mesh.position.clone(),
      floatSpeed: 0.7 + idx * 0.25,
      floatRange: 0.14,
      rotSpeedX: 0.007,
      rotSpeedY: 0.01
    });
  });

  // 3. WebGL Glass Cards Group
  const glassCardGeo = new THREE.BoxGeometry(1.5, 1.0, 0.03);
  const card3D1 = new THREE.Mesh(glassCardGeo, glassMat);
  card3D1.position.set(-2.4, 0.5, -0.8);
  card3D1.rotation.set(0.18, 0.35, -0.08);
  glassCardGroup.add(card3D1);

  const card3D2 = new THREE.Mesh(glassCardGeo, glassMat);
  card3D2.position.set(2.3, -1.1, -0.7);
  card3D2.rotation.set(-0.12, -0.28, 0.04);
  glassCardGroup.add(card3D2);

  floatingMeshes.push({
    mesh: card3D1,
    initialPos: card3D1.position.clone(),
    floatSpeed: 0.45,
    floatRange: 0.07,
    rotSpeedX: 0.001,
    rotSpeedY: 0.002
  });

  floatingMeshes.push({
    mesh: card3D2,
    initialPos: card3D2.position.clone(),
    floatSpeed: 0.4,
    floatRange: 0.07,
    rotSpeedX: -0.001,
    rotSpeedY: -0.001
  });
}

// --- LIGHT TRAILS (Curves winding around bust centerpiece) ---
const trailMeshes = [];
function buildLightTrails() {
  const createTrail = (radiusX, radiusY, rotationZ, speed, colorHex) => {
    const curve = new THREE.EllipseCurve(
      0,  0,
      radiusX, radiusY,
      0,  2 * Math.PI,
      false,
      0
    );

    const points = curve.getPoints(100);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.16
    });

    const line = new THREE.Line(lineGeo, lineMat);
    line.rotation.x = Math.PI / 2.3;
    line.rotation.y = Math.PI / 10;
    line.rotation.z = rotationZ;
    line.position.set(0, -0.3, 0); // Align with robotGroup initial offset
    scene.add(line);

    trailMeshes.push({
      mesh: line,
      rotSpeed: speed
    });
  };

  createTrail(3.1, 2.3, 0, 0.0015, 0x5869FC);
  createTrail(2.8, 1.9, Math.PI / 3, -0.002, 0xB3FC6A);
}

// --- BACKGROUND DUST PARTICLES ---
function buildBackgroundParticles() {
  const particleCount = 170;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    
    speeds[i] = 0.04 + Math.random() * 0.08;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const pTexture = createParticleTexture();
  const mat = new THREE.PointsMaterial({
    color: 0x5869FC,
    size: 0.07,
    map: pTexture,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geo, mat);
  particleGroup.add(points);
  particleGroup.userData.speeds = speeds;
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --- EYELID BLINK LOOP ---
function startBlinkLoop() {
  const blinkDurationClose = 0.08;
  const blinkDurationOpen = 0.24;

  function triggerBlink() {
    const tl = gsap.timeline({
      onComplete: () => {
        // Schedule next random blink (3 to 5 seconds)
        setTimeout(triggerBlink, gsap.utils.random(3000, 5000));
      }
    });

    // Close
    tl.to([leftUpperLid.rotation, rightUpperLid.rotation], { x: 0, duration: blinkDurationClose, ease: "power2.in" }, 0)
      .to([leftLowerLid.rotation, rightLowerLid.rotation], { x: 0, duration: blinkDurationClose, ease: "power2.in" }, 0);

    // Open
    tl.to([leftUpperLid.rotation, rightUpperLid.rotation], { x: -1.4, duration: blinkDurationOpen, ease: "power2.out" }, blinkDurationClose)
      .to([leftLowerLid.rotation, rightLowerLid.rotation], { x: 1.4, duration: blinkDurationOpen, ease: "power2.out" }, blinkDurationClose);
  }

  setTimeout(triggerBlink, 3000);
}

// --- MOUSE MOVEMENT CAPTURE ---
function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth) - 0.5;
  mouseY = (e.clientY / window.innerHeight) - 0.5;

  // Head target rotation limits (clamped for a natural neck rotation)
  targetHeadRotY = mouseX * 0.35;
  targetHeadRotX = mouseY * 0.22;

  // Eye tracking limits (tighter boundaries for realism)
  targetEyeRotY = mouseX * 0.26;
  targetEyeRotX = mouseY * 0.16;
}

// --- ANIMATION GRAPHICS FRAME TICK ---
function animate() {
  requestAnimationFrame(animate);

  const now = Date.now();
  const dt = (now - lastTime) * 0.001;
  lastTime = now;

  

  const time = now * 0.001;

  // 1. Head Rotation interpolation (Head follows mouse)
  robotGroup.rotation.y += (targetHeadRotY - robotGroup.rotation.y) * 0.06;
  robotGroup.rotation.x += (targetHeadRotX - robotGroup.rotation.x) * 0.06;

  // 2. Eyeball tracking interpolation (Eyes follows mouse)
  leftEyeball.rotation.y += (targetEyeRotY - leftEyeball.rotation.y) * 0.08;
  leftEyeball.rotation.x += (targetEyeRotX - leftEyeball.rotation.x) * 0.08;
  
  rightEyeball.rotation.y += (targetEyeRotY - rightEyeball.rotation.y) * 0.08;
  rightEyeball.rotation.x += (targetEyeRotX - rightEyeball.rotation.x) * 0.08;

  // 3. Weightless Bobbing (Anti-gravity floating centerpiece)
  robotGroup.position.y = -0.3 + Math.sin(time * 1.4) * 0.1;
  robotGroup.rotation.z = Math.cos(time * 0.85) * 0.01;

  // 4. Bob and rotate floating WebGL elements
  floatingMeshes.forEach(item => {
    const m = item.mesh;
    m.position.y = item.initialPos.y + Math.sin(time * item.floatSpeed) * item.floatRange;
    m.rotation.x += item.rotSpeedX;
    m.rotation.y += item.rotSpeedY;
  });

  // 5. Spin abstract light trails
  trailMeshes.forEach(trail => {
    trail.mesh.rotation.z += trail.rotSpeed;
  });

  // 6. Animate Orbiting Lights
  limePointLight.position.x = Math.sin(time * 0.75) * 3.4;
  limePointLight.position.y = Math.cos(time * 0.55) * 2.8;
  limePointLight.position.z = Math.cos(time * 0.75) * 3.4;

  indigoPointLight.position.x = -Math.sin(time * 0.65) * 3.4;
  indigoPointLight.position.y = -Math.cos(time * 0.85) * 2.8;
  indigoPointLight.position.z = -Math.cos(time * 0.65) * 3.4;

  // 7. Ambient Dust Particle Movement
  const posArr = particleGroup.children[0].geometry.attributes.position.array;
  const speeds = particleGroup.userData.speeds;
  
  for (let i = 0; i < speeds.length; i++) {
    posArr[i * 3 + 1] -= speeds[i] * 0.024;
    posArr[i * 3] += Math.sin(time + i) * 0.0018;
    
    if (posArr[i * 3 + 1] < -5) {
      posArr[i * 3 + 1] = 5;
      posArr[i * 3] = (Math.random() - 0.5) * 14;
    }
  }
  particleGroup.children[0].geometry.attributes.position.needsUpdate = true;

  // Render
  renderer.render(scene, camera);
}

// --- WINDOW SCROLL PARALLAX ---
function onWindowScroll() {
  const scrolled = window.pageYOffset;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = maxScroll > 0 ? scrolled / maxScroll : 0;

  // 1. Camera Zoom displacement
  camera.position.z = initialCameraZ - scrollPercent * 1.6;

  // 2. Parallax particle displacement
  particleGroup.position.z = scrollPercent * 2.2;

  // 3. Parallax scroll effect on HTML glass cards
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    const depth = parseFloat(card.getAttribute('data-depth')) || 0.1;
    const yPos = -(scrolled * depth * 0.85);
    gsap.to(card, { y: yPos, duration: 0.45, ease: "power1.out" });
  });
}

// --- WINDOW RESIZING & SCALING ---
function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  width = container.clientWidth || container.offsetWidth || window.innerWidth * 0.45;
  height = container.clientHeight || container.offsetHeight || 650;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // Responsive scaling to ensure model remains visible and larger than cards
  if (window.innerWidth < 768) {
    robotGroup.scale.set(0.74, 0.74, 0.74);
    camera.position.z = 8.6;
    initialCameraZ = 8.6;
  } else if (window.innerWidth < 1024) {
    robotGroup.scale.set(0.88, 0.88, 0.88);
    camera.position.z = 8.2;
    initialCameraZ = 8.2;
  } else {
    robotGroup.scale.set(1.08, 1.08, 1.08); // Scale model up to ensure visual prominence
    camera.position.z = 7.6;
    initialCameraZ = 7.6;
  }
}

// --- HTML CARD INTERACTIONS ---
function setupHTMLCardInteractions() {
  const cards = document.querySelectorAll('.glass-card');

  // Ambient mouse hologram tilt
  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth) - 0.5;
    const my = (e.clientY / window.innerHeight) - 0.5;

    cards.forEach(card => {
      if (card.classList.contains('is-hovered')) return;

      const depth = parseFloat(card.getAttribute('data-depth')) || 0.1;

      gsap.to(card, {
        x: mx * 45 * depth,
        y: (card.style.transform.includes('translateY') ? undefined : -my * 45 * depth),
        rotateY: mx * 16 * depth,
        rotateX: -my * 16 * depth,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });

  // Direct Hover Focus Zoom
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('is-hovered');
      
      gsap.to(card, {
        scale: 1.06,
        z: 22,
        rotateX: 0,
        rotateY: 0,
        borderColor: "rgba(88, 105, 252, 0.4)",
        boxShadow: "0 20px 40px rgba(88, 105, 252, 0.08), 0 2px 10px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hovered');

      gsap.to(card, {
        scale: 1.0,
        z: 0,
        borderColor: "rgba(255, 255, 255, 0.7)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });

  // Animated Chart path loading drawing
  const chartLine = document.querySelector('.chart-line-path');
  if (chartLine) {
    const length = chartLine.getTotalLength();
    chartLine.style.strokeDasharray = length;
    chartLine.style.strokeDashoffset = length;
    
    gsap.to(chartLine, {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: "power2.inOut",
      delay: 0.4
    });
  }
}

// Initialize Unicorn Studio if loaded
// --- PREMIUM MAGNETIC BUTTONS (Awwwards effect) ---
function setupMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cta-header, .btn-login');

  buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      // Translate the button container (magnetic pull)
      gsap.to(button, {
        x: x * 0.38,
        y: y * 0.38,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
      });

      // Shift text and icons inside slightly faster (parallax)
      const children = button.children;
      for (let i = 0; i < children.length; i++) {
        gsap.to(children[i], {
          x: x * 0.18,
          y: y * 0.18,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    });

    button.addEventListener('mouseleave', () => {
      // Bouncy elastic snap back
      gsap.to(button, {
        x: 0,
        y: 0,
        scale: 1.0,
        duration: 0.65,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto"
      });

      const children = button.children;
      for (let i = 0; i < children.length; i++) {
        gsap.to(children[i], {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "elastic.out(1, 0.3)",
          overwrite: "auto"
        });
      }
    });
  });
}

function initUnicornStudio() {
  if (typeof UnicornStudio !== 'undefined') {
    UnicornStudio.init();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof UnicornStudio !== 'undefined') {
        UnicornStudio.init();
      }
    });
  }
}


// Initialize application on load
function startApp() {
  init();
  initUnicornStudio();
  setupMagneticButtons();
  onWindowResize();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
