class ThreeEngine {
 constructor(container, options = {}) {
  this.clock = new THREE.Clock();
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.particles = null;
  this.rings = [];
  this.shards = [];
  this.orbitLights = [];
  this.centralOrb = null;
  this.secondaryParticles = null;
  this.trailParticles = null;
  this.spiralLights = [];
  this.cameraAngle = 0;
  this.animating = false;

  if (options.backgroundScene !== false) {
   this._buildBackgroundScene();
   this._startAnimation();
  }
 }

 _buildBackgroundScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  this.scene = scene;
  this.camera = camera;
  this.renderer = renderer;

  // === ENHANCED PARTICLE SYSTEMS ===
  // Primary swirling nebula (enhanced)
  const primaryParticleCount = 2200;
  const primaryPositions = new Float32Array(primaryParticleCount * 3);
  const primaryVelocities = new Float32Array(primaryParticleCount * 3);
  const primaryColors = new Float32Array(primaryParticleCount * 3);
  const primarySizes = new Float32Array(primaryParticleCount);

  for (let i = 0; i < primaryParticleCount * 3; i += 3) {
    const radius = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3;

    primaryPositions[i] = Math.cos(theta) * radius;
    primaryPositions[i + 1] = y;
    primaryPositions[i + 2] = Math.sin(theta) * radius;

    primaryVelocities[i] = (Math.random() - 0.5) * 0.02;
    primaryVelocities[i + 1] = (Math.random() - 0.5) * 0.02;
    primaryVelocities[i + 2] = (Math.random() - 0.5) * 0.02;

    // More varied color palette
    const hue = 0.45 + Math.random() * 0.25; // Cyan to purple range
    primaryColors[i] = hue;
    primaryColors[i + 1] = 0.8 + Math.random() * 0.2;
    primaryColors[i + 2] = 0.9 + Math.random() * 0.1;

    // Varied sizes for depth
    primarySizes[i / 3] = 0.02 + Math.random() * 0.02;
  }

  const primaryGeo = new THREE.BufferGeometry();
  primaryGeo.setAttribute('position', new THREE.BufferAttribute(primaryPositions, 3));
  primaryGeo.setAttribute('velocity', new THREE.BufferAttribute(primaryVelocities, 3));
  primaryGeo.setAttribute('color', new THREE.BufferAttribute(primaryColors, 3));
  primaryGeo.setAttribute('size', new THREE.BufferAttribute(primarySizes, 1));

  const primaryMat = new THREE.PointsMaterial({
    size: 0.03,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true
  });

  this.particles = new THREE.Points(primaryGeo, primaryMat);
  scene.add(this.particles);

  // Secondary sparkle particles
  const sparkleCount = 300;
  const sparklePositions = new Float32Array(sparkleCount * 3);
  const sparkleVelocities = new Float32Array(sparkleCount * 3);
  const sparkleColors = new Float32Array(sparkleCount * 3);
  const sparkleLife = new Float32Array(sparkleCount);

  for (let i = 0; i < sparkleCount * 3; i += 3) {
    sparklePositions[i] = (Math.random() - 0.5) * 20;
    sparklePositions[i + 1] = (Math.random() - 0.5) * 10;
    sparklePositions[i + 2] = (Math.random() - 0.5) * 20;

    sparkleVelocities[i] = (Math.random() - 0.5) * 0.03;
    sparkleVelocities[i + 1] = (Math.random() - 0.5) * 0.03;
    sparkleVelocities[i + 2] = (Math.random() - 0.5) * 0.03;

    // Bright, varied colors for sparkles
    sparkleColors[i] = Math.random();
    sparkleColors[i + 1] = Math.random();
    sparkleColors[i + 2] = Math.random();

    sparkleLife[i / 3] = 1 + Math.random() * 2; // Life in seconds
  }

  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  sparkleGeo.setAttribute('velocity', new THREE.BufferAttribute(sparkleVelocities, 3));
  sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));
  sparkleGeo.setAttribute('life', new THREE.BufferAttribute(sparkleLife, 1));
  sparkleGeo.setAttribute('startTime', new THREE.BufferAttribute(
    sparkleLife.map(() => Math.random()), 1));

  const sparkleMat = new THREE.PointsMaterial({
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  this.secondaryParticles = new THREE.Points(sparkleGeo, sparkleMat);
  scene.add(this.secondaryParticles);

  // Trail particles for motion effects
  const trailCount = 150;
  const trailPositions = new Float32Array(trailCount * 3);
  const trailVelocities = new Float32Array(trailCount * 3);
  const trailColors = new Float32Array(trailCount * 3);
  const trailAlphas = new Float32Array(trailCount);

  for (let i = 0; i < trailCount * 3; i += 3) {
    trailPositions[i] = (Math.random() - 0.5) * 2;
    trailPositions[i + 1] = (Math.random() - 0.5) * 2;
    trailPositions[i + 2] = (Math.random() - 0.5) * 2;

    trailVelocities[i] = 0;
    trailVelocities[i + 1] = 0;
    trailVelocities[i + 2] = 0;

    // Faint trailing colors
    trailColors[i] = 0.5 + Math.random() * 0.5;
    trailColors[i + 1] = 0.5 + Math.random() * 0.5;
    trailColors[i + 2] = 0.5 + Math.random() * 0.5;

    trailAlphas[i / 3] = 0.1 + Math.random() * 0.2;
  }

  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeo.setAttribute('velocity', new THREE.BufferAttribute(trailVelocities, 3));
  trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  trailGeo.setAttribute('alpha', new THREE.BufferAttribute(trailAlphas, 1));

  const trailMat = new THREE.PointsMaterial({
    size: 0.04,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  this.trailParticles = new THREE.Points(trailGeo, trailMat);
  scene.add(this.trailParticles);

  // === ENHANCED NEON RINGS ===
  const ringColors = [0x00f2fe, 0x9d4edd, 0xff007f, 0x38b000, 0xf77f00, 0x00ffcc, 0xff8800];
  const ringSizes = [5.8, 7.6, 9.8, 12.5, 15.2, 18.0, 20.5];
  const ringSpeeds = [0.12, 0.09, 0.07, 0.05, 0.04, 0.03, 0.02];
  const ringThickness = [0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055];

  ringColors.forEach((color, i) => {
    const geo = new THREE.TorusGeometry(ringSizes[i], ringThickness[i], 64, 180);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.95,
      roughness: 0.05
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.8 + (i * 0.1); // Slight stagger
    scene.add(ring);

    this.rings.push({
      mesh: ring,
      speed: ringSpeeds[i],
      baseEmissive: 0.6,
      thickness: ringThickness[i]
    });
  });

  // === ENHANCED FLOATING SHARDS ===
  const shardSpecs = [
    { geo: new THREE.IcosahedronGeometry(0.7, 1), color: 0x00f2fe, speed: 0.25, amplitude: 0.8 },
    { geo: new THREE.OctahedronGeometry(0.6), color: 0x9d4edd, speed: 0.2, amplitude: 0.6 },
    { geo: new THREE.TetrahedronGeometry(0.65), color: 0xff007f, speed: 0.3, amplitude: 0.7 },
    { geo: new THREE.BoxGeometry(0.6, 0.6, 0.6), color: 0x38b000, speed: 0.15, amplitude: 0.5 },
    { geo: new THREE.DodecahedronGeometry(0.5), color: 0xf77f00, speed: 0.22, amplitude: 0.6 },
    { geo: new THREE.OctahedronGeometry(0.45), color: 0xffaa00, speed: 0.18, amplitude: 0.4 },
    { geo: new THREE.ConeGeometry(0.5, 1.0, 8), color: 0x00ffcc, speed: 0.28, amplitude: 0.9 },
    { geo: new THREE.TorusGeometry(0.5, 0.2, 16, 32), color: 0xff00ff, speed: 0.24, amplitude: 0.7 }
  ];

  shardSpecs.forEach(spec => {
    const mat = new THREE.MeshStandardMaterial({
      color: spec.color,
      emissive: spec.color,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.3
    });
    const mesh = new THREE.Mesh(spec.geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() * 6) - 3,
      (Math.random() - 0.5) * 16
    );
    mesh.userData = {
      phase: Math.random() * Math.PI * 2,
      speed: spec.speed,
      amplitude: spec.amplitude,
      baseY: mesh.position.y,
      baseX: mesh.position.x,
      baseZ: mesh.position.z,
      orbitSpeed: 0.02 + Math.random() * 0.03,
      orbitRadius: 3 + Math.random() * 4
    };
    scene.add(mesh);
    this.shards.push(mesh);
  });

  // === ENHANCED CENTRAL ORB WITH LAYERS ===
  // Inner core
  const innerGeo = new THREE.SphereGeometry(0.8, 24, 24);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.3
  });
  const innerOrb = new THREE.Mesh(innerGeo, innerMat);
  innerOrb.position.y = -1.2;
  scene.add(innerOrb);

  // Outer glow layers
  const outerGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.1
  });
  const outerOrb = new THREE.Mesh(outerGeo, outerMat);
  outerOrb.position.y = -1.2;
  scene.add(outerOrb);

  this.centralOrb = { inner: innerOrb, outer: outerOrb };

  // === ENHANCED ORBITING LIGHT SYSTEMS ===
  // Primary orbiting lights
  for (let i = 0; i < 5; i++) {
    const light = new THREE.PointLight(0x00f2fe, 1.6, 50);
    light.position.set(0, 0, 0);
    scene.add(light);
    this.orbitLights.push({
      light: light,
      speed: 0.15 + i * 0.03,
      radius: 6 + i * 1.5,
      height: Math.sin(i) * 2,
      phase: i * Math.PI * 0.4
    });
  }

  // Spiral lights for extra dynamism
  for (let i = 0; i < 3; i++) {
    const spiralLight = new THREE.PointLight(0xff007f + i * 0x00ffff, 0.8, 30);
    spiralLight.position.set(0, 0, 0);
    scene.add(spiralLight);
    this.spiralLights.push({
      light: spiralLight,
      speed: 0.08 + i * 0.02,
      radius: 4 + i * 2,
      heightOffset: i * 1.5,
      phase: i * Math.PI * 0.6,
      verticalSpeed: 0.1 + i * 0.05
    });
  }

  // === LIGHTING SYSTEM ===
  const ambient = new THREE.AmbientLight(0x6b7c99, 0.5);
  scene.add(ambient);

  this.pulseAmbient = new THREE.AmbientLight(0x00f2fe, 0.4);
  scene.add(this.pulseAmbient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(8, 12, 6);
  scene.add(dirLight);

  this.pulseDir = new THREE.DirectionalLight(0x00f2fe, 0.8);
  this.pulseDir.position.set(12, 18, 10);
  scene.add(this.pulseDir);

  const hemi = new THREE.HemisphereLight(0x88ccff, 0x1a1630, 0.75);
  scene.add(hemi);

  this.pulseHemi = new THREE.HemisphereLight(0x00f2fe, 0x1a1630, 0.5);
  scene.add(this.pulseHemi);

  // Add some rim lighting for depth
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(-5, 8, -4);
  scene.add(rimLight);

  this.camera.position.set(0, 2, 16);
 }

 _startAnimation() {
  this.animating = true;
  const animate = () => {
   if (!this.animating) return;

   const delta = this.clock.getDelta();
   this.update(delta);
   this.renderer.render(this.scene, this.camera);

   requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
 }

 update(delta) {
  if (!this.clock) return;
  const t = this.clock.getElapsedTime();

  // === PRIMARY PARTICLES (enhanced swirling) ===
  if (this.particles) {
   const positions = this.particles.geometry.attributes.position.array;
   const velocities = this.particles.geometry.attributes.velocity.array;
   const colors = this.particles.geometry.attributes.color.array;
   const sizes = this.particles.geometry.attributes.size.array;

   for (let i = 0; i < positions.length; i += 3) {
    // Base motion
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // Enhanced swirling with multiple frequencies
    const angle1 = t * 0.09 + i * 0.003;
    const angle2 = t * 0.15 + i * 0.007;
    const radius1 = 4.8 + Math.sin(t * 0.3 + i * 0.01) * 1.2;
    const radius2 = 2.5 + Math.sin(t * 0.7 + i * 0.005) * 0.8;

    positions[i] = Math.cos(angle1) * radius1 + Math.cos(angle2) * radius2 * 0.3;
    positions[i + 2] = Math.sin(angle1) * radius1 + Math.sin(angle2) * radius2 * 0.3;

    // Vertical drift with slow oscillation
    positions[i + 1] += Math.sin(t * 0.2 + i * 0.01) * 0.008;

    // Color shifting with more variety
    const hueShift = 0.5 + Math.sin(t * 0.8 + i * 0.02) * 0.15;
    colors[i] = hueShift;
    colors[i + 1] = 0.7 + Math.sin(t * 1.2 + i * 0.03) * 0.3;
    colors[i + 2] = 0.8 + Math.cos(t * 0.9 + i * 0.01) * 0.2;

    // Size pulsing for depth effect
    sizes[i / 3] = 0.02 + Math.sin(t * 0.6 + i * 0.005) * 0.015;
   }

   this.particles.geometry.attributes.position.needsUpdate = true;
   this.particles.geometry.attributes.color.needsUpdate = true;
   this.particles.geometry.attributes.size.needsUpdate = true;
  }

  // === SECONDARY SPARKLE PARTICLES ===
  if (this.secondaryParticles) {
   const positions = this.secondaryParticles.geometry.attributes.position.array;
   const velocities = this.secondaryParticles.geometry.attributes.velocity.array;
   const colors = this.secondaryParticles.geometry.attributes.color.array;
   const life = this.secondaryParticles.geometry.attributes.life.array;
   const startTime = this.secondaryParticles.geometry.attributes.startTime.array;

   for (let i = 0; i < positions.length; i += 3) {
    const particleIndex = i / 3;
    const age = (t - startTime[particleIndex]) % life[particleIndex];
    const progress = age / life[particleIndex];

    // Reset particle if it's too old
    if (progress > 0.98) {
     // Respawn
     positions[i] = (Math.random() - 0.5) * 20;
     positions[i + 1] = (Math.random() - 0.5) * 10;
     positions[i + 2] = (Math.random() - 0.5) * 20;

     velocities[i] = (Math.random() - 0.5) * 0.03;
     velocities[i + 1] = (Math.random() - 0.5) * 0.03;
     velocities[i + 2] = (Math.random() - 0.5) * 0.03;

     startTime[particleIndex] = t - Math.random() * 2;
    }

    // Motion
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // Fade based on life
    const alpha = 1.0 - progress;
    colors[i] = Math.min(1, colors[i] * alpha);
    colors[i + 1] = Math.min(1, colors[i + 1] * alpha);
    colors[i + 2] = Math.min(1, colors[i + 2] * alpha);
   }

   this.secondaryParticles.geometry.attributes.position.needsUpdate = true;
   this.secondaryParticles.geometry.attributes.color.needsUpdate = true;
   this.secondaryParticles.geometry.attributes.startTime.needsUpdate = true;
  }

  // === TRAIL PARTICLES ===
  if (this.trailParticles) {
   const positions = this.trailParticles.geometry.attributes.position.array;
   const colors = this.trailParticles.geometry.attributes.color.array;
   const alphas = this.trailParticles.geometry.attributes.alpha.array;

   for (let i = 0; i < positions.length; i += 3) {
    // Slow drift
    positions[i] += Math.sin(t * 0.1 + i * 0.01) * 0.002;
    positions[i + 1] += Math.cos(t * 0.15 + i * 0.008) * 0.002;
    positions[i + 2] += Math.sin(t * 0.08 + i * 0.012) * 0.002;

    // Color cycling
    const hue = t * 0.2 + i * 0.005;
    colors[i] = 0.5 + Math.sin(hue) * 0.3;
    colors[i + 1] = 0.5 + Math.sin(hue + 2) * 0.3;
    colors[i + 2] = 0.5 + Math.sin(hue + 4) * 0.3;
   }

   this.trailParticles.geometry.attributes.position.needsUpdate = true;
   this.trailParticles.geometry.attributes.color.needsUpdate = true;
  }

  // === ENHANCED NEON RINGS ===
  this.rings.forEach((ring, i) => {
   ring.mesh.rotation.z = t * ring.speed * 0.8 + i * 0.3;
   ring.mesh.rotation.y = t * ring.speed * 0.3;

   // More complex emissive pulsing
   const pulse1 = Math.sin(t * 3.2 + i) * 0.25;
   const pulse2 = Math.sin(t * 1.8 + i * 0.7) * 0.15;
   const pulse3 = Math.sin(t * 5.1 + i * 1.3) * 0.1;
   ring.mesh.material.emissiveIntensity = ring.baseEmissive + pulse1 + pulse2 + pulse3;

   // Slow scale breathing
   const scale = 1 + Math.sin(t * 0.7 + i) * 0.02;
   ring.mesh.scale.set(scale, scale, scale);
  });

  // === ENHANCED FLOATING SHARDS ===
  this.shards.forEach(shard => {
   const u = shard.userData;

   // Orbital motion
   const orbitAngle = t * u.orbitSpeed + u.phase;
   const offsetX = Math.cos(orbitAngle) * u.orbitRadius;
   const offsetZ = Math.sin(orbitAngle) * u.orbitRadius;

   // Vertical bobbing
   const bob = Math.sin(t * u.speed + u.phase) * u.amplitude;

   // Position
   shard.position.x = u.baseX + offsetX;
   shard.position.y = u.baseY + bob;
   shard.position.z = u.baseZ + offsetZ;

   // Rotation
   shard.rotation.y = t * u.speed * 1.2 + u.phase;
   shard.rotation.x = t * 0.5 + Math.sin(t * 0.3) * 0.2;
   shard.rotation.z = t * 0.3;

   // Subtle scale pulsation
   const scale = 1 + Math.sin(t * u.speed * 2 + u.phase) * 0.05;
   shard.scale.set(scale, scale, scale);
  });

  // === ENHANCED CENTRAL ORB ===
  if (this.centralOrb) {
   // Inner core pulse
   const innerPulse = Math.sin(t * 2.2) * 0.15 + 1;
   this.centralOrb.inner.scale.setScalar(innerPulse);
   this.centralOrb.inner.material.emissiveIntensity = 0.8 + Math.sin(t * 3.5) * 0.4;

   // Outer glow pulse (slower)
   const outerPulse = Math.sin(t * 1.3) * 0.2 + 1;
   this.centralOrb.outer.scale.setScalar(outerPulse * 1.3);
   this.centralOrb.outer.material.emissiveIntensity = 0.2 + Math.sin(t * 2.1) * 0.15;

   // Color shifting
   const hue = t * 0.1;
   const r = 0.5 + Math.sin(hue) * 0.5;
   const g = 0.5 + Math.sin(hue + 2) * 0.5;
   const b = 0.5 + Math.sin(hue + 4) * 0.5;
   const color = new THREE.Color(r, g, b);
   this.centralOrb.inner.material.color.copy(color);
   this.centralOrb.outer.material.color.copy(color);
  }

  // === PRIMARY ORBITING LIGHTS ===
  this.orbitLights.forEach((lightObj, i) => {
   const angle = t * lightObj.speed + lightObj.phase;
   lightObj.light.position.x = Math.cos(angle) * lightObj.radius;
   lightObj.light.position.z = Math.sin(angle) * lightObj.radius;
   lightObj.light.position.y = 2 + Math.sin(t * (lightObj.speed * 0.7) + lightObj.phase) * lightObj.height;

   // Color cycling
   const hue = t * 0.3 + i * 0.2;
   const color = new THREE.Color(
    0.5 + Math.sin(hue) * 0.5,
    0.5 + Math.sin(hue + 2) * 0.5,
    0.5 + Math.sin(hue + 4) * 0.5
   );
   lightObj.light.color.copy(color);

   // Intensity pulsing
   lightObj.light.intensity = 1.2 + Math.sin(t * 2.1 + i) * 0.4;
  });

  // === SPIRAL LIGHTS ===
  this.spiralLights.forEach((spiralObj, i) => {
   const angle = t * spiralObj.speed + spiralObj.phase;
   const height = t * spiralObj.verticalSpeed + spiralObj.heightOffset;

   spiralObj.light.position.x = Math.cos(angle) * spiralObj.radius;
   spiralObj.light.position.z = Math.sin(angle) * spiralObj.radius;
   spiralObj.light.position.y = height;

   // Color cycling through spectrum
   const hue = t * 0.1 + i * 0.3;
   const color = new THREE.Color(
    Math.abs(Math.sin(hue)),
    Math.abs(Math.sin(hue + 2)),
    Math.abs(Math.sin(hue + 4))
   );
   spiralObj.light.color.copy(color);

   // Pulsing intensity
   spiralObj.light.intensity = 0.6 + Math.sin(t * 1.5 + i * 0.5) * 0.4;
  });

  // === CAMERA MOTION (more complex 3D path) ===
  this.cameraAngle += 0.022;
  const camRadius = 14 + Math.sin(t * 0.15) * 1.5;
  const camHeight = 2.2 + Math.sin(t * 0.4) * 1.2 + Math.sin(t * 0.07) * 0.8;
  const camOffsetX = Math.sin(t * 0.22) * 0.8;
  const camOffsetZ = Math.cos(t * 0.18) * 0.6;

  this.camera.position.x = Math.cos(this.cameraAngle) * camRadius + camOffsetX;
  this.camera.position.z = Math.sin(this.cameraAngle) * camRadius + camOffsetZ;
  this.camera.position.y = camHeight;

  // Look at point with slight movement
  const lookOffset = Math.sin(t * 0.1) * 0.3;
  this.camera.lookAt(lookOffset, 0.2 + Math.sin(t * 0.08) * 0.2, lookOffset * 0.5);

  // === LIGHT PULSING (enhanced) ===
  const pulseCycle = t * 0.6;
  const intensityWave = Math.sin(pulseCycle) * 0.3 + 0.7;

  if (this.pulseAmbient) this.pulseAmbient.intensity = intensityWave * 0.35;
  if (this.pulseDir) this.pulseDir.intensity = intensityWave * 0.6;
  if (this.pulseHemi) this.pulseHemi.intensity = intensityWave * 0.45;

  // Additional color pulse for lights
  const lightHue = t * 0.2;
  const pulseColor = new THREE.Color(
   0.5 + Math.sin(lightHue) * 0.5,
   0.5 + Math.sin(lightHue + 2) * 0.5,
   0.5 + Math.sin(lightHue + 4) * 0.5
  );

  if (this.pulseDir) this.pulseDir.color.copy(pulseColor);
  if (this.pulseHemi) {
   const groundColor = new THREE.Color(0.1, 0.1, 0.2);
   this.pulseHemi.color.copy(pulseColor);
   this.pulseHemi.groundColor.copy(groundColor);
  }
 }

 // Required methods for app.js theme sync
 setTheme(theme) {
  if (!this.scene) return;
  const isDark = theme === 'dark';
  const bgColor = isDark ? 0x0a0f1a : 0xf0f4f8;
  this.scene.background = new THREE.Color(bgColor);
  this.renderer.setClearColor(bgColor, 0);

  if (this.particles) {
   this.particles.material.opacity = isDark ? 0.8 : 0.45;
  }
  if (this.secondaryParticles) {
   this.secondaryParticles.material.opacity = isDark ? 0.5 : 0.25;
  }
  if (this.trailParticles) {
   this.trailParticles.material.opacity = isDark ? 0.25 : 0.1;
  }
  if (this.centralOrb) {
   this.centralOrb.inner.material.opacity = isDark ? 0.3 : 0.15;
   this.centralOrb.outer.material.opacity = isDark ? 0.12 : 0.06;
  }
  this.rings.forEach(r => {
   r.mesh.material.emissiveIntensity = isDark ? r.baseEmissive : r.baseEmissive * 0.5;
  });
 }

 onResize() {
  if (!this.camera || !this.renderer) return;
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
 }

 destroy() {
  this.animating = false;
  if (this.renderer) {
   this.renderer.dispose();
   this.renderer.domElement.remove();
  }
 }
}

export function initThreeEngine(container, options) {
 return new ThreeEngine(container, options);
}

// Expose for classic scripts (index.html inline script is not a module)
window.initThreeEngine = initThreeEngine;