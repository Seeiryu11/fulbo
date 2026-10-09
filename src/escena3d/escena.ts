// @ts-nocheck — escena 3D portada del prototipo (referencias/mockups/predio-europeo.html). Se reescribe tipada en la fase 5.
import * as THREE from 'three';
export function montarEscena(stage: HTMLElement): void {

let W = innerWidth, H = innerHeight; const ROJO = '#C8202F';
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9d6f2');
scene.fog = new THREE.Fog('#c3e2f5', 650, 1400);

const Q = new URLSearchParams(location.search);
const HERO = Q.has('hero');
const ENTORNO = Q.get('entorno') || 'ciudad';
// cámara: un punto de mira que se mueve (pan) + distancia (zoom) + ángulo fijo de 3/4
const camera = new THREE.PerspectiveCamera(32, W / H, 1, 5000);
const MIRA = new THREE.Vector3(165, 0, 10);
const DIR = new THREE.Vector3(0.1, 0.47, 0.88).normalize();
let DIST = 830;
function ubicarCamara() { camera.position.copy(MIRA).addScaledVector(DIR, DIST); camera.lookAt(MIRA); }
ubicarCamara();
if (Q.has('limpio')) document.querySelectorAll('.hud,.play,.nav').forEach(e => e.style.display = 'none');
if (HERO) {
  camera.position.set(125, 190, 200); camera.lookAt(-6, -4, -12);
  document.querySelectorAll('.hud,.play,.nav').forEach(e => e.style.display = 'none');
}

scene.add(new THREE.HemisphereLight('#e6f4ff', '#6f8a55', 0.95));
const sol = new THREE.DirectionalLight('#fff3dd', 2.4);
sol.position.set(-60, 340, 220); sol.target.position.set(140, 0, 0); scene.add(sol.target); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -360, right: 360, top: 300, bottom: -300, near: 10, far: 1400 });
sol.shadow.bias = -0.0003; sol.shadow.normalBias = 0.6;
scene.add(sol);

// ---------- utilidades ----------
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8, metalness: 0 }, o));
function caja(w, h, d, m, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m);
  mesh.position.set(x, y + h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function plano(w, d, m, x, z, y = 0.02, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), typeof m === 'string' ? mat(m) : m);
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]);
  return t;
}
let semilla = 7; const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;

// ---------- curva del estadio: rectángulo redondeado (superelipse) ----------
const A0 = 60, B0 = 42, NEXP = 0.42;   // borde interno de las tribunas, desde el centro de la cancha
function curva(o, t) {
  const c = Math.cos(t), s = Math.sin(t);
  return [(A0 + o) * Math.sign(c) * Math.pow(Math.abs(c), NEXP), (B0 + o) * Math.sign(s) * Math.pow(Math.abs(s), NEXP)];
}
// superficie entre dos anillos (o1,y1) → (o2,y2)
function anillo(o1, y1, o2, y2, material, { seg = 320, uMetro = 40, parent } = {}) {
  const pos = [], uv = [], idx = []; let largo = 0, prev = null;
  for (let i = 0; i <= seg; i++) {
    const t = i / seg * Math.PI * 2, p1 = curva(o1, t), p2 = curva(o2, t);
    if (prev) largo += Math.hypot(p1[0] - prev[0], p1[1] - prev[1]); prev = p1;
    pos.push(p1[0], y1, p1[1], p2[0], y2, p2[1]); uv.push(largo / uMetro, 0, largo / uMetro, 1);
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, material); m.castShadow = true; m.receiveShadow = true; (parent || estadio).add(m); return m;
}
const estadio = new THREE.Group(); scene.add(estadio);

// ---------- entorno ----------
const ENT = {
  ciudad:  { cielo: '#a9d6f2', niebla: '#c3e2f5', suelo: '#8db866', copa: ['#4d8f3c', '#5a9e44', '#437f36'] },
  montana: { cielo: '#9fcdf0', niebla: '#cfe5f4', suelo: '#93b860', copa: ['#2f6b3a', '#3a7a42', '#285d33'] },
}[ENTORNO] || {};
scene.background = new THREE.Color(ENT.cielo); scene.fog = new THREE.Fog(ENT.niebla, 900, 2200);
plano(6000, 6000, ENT.suelo, 0, 0, 0);
const baldosa = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d9d6cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c7c3ba'; g.lineWidth = 2; for (let k = 0; k <= w; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } }, [60, 50]);
plano(330, 280, mat('#fff', { map: baldosa, roughness: .95 }), 0, 0, .05);          // explanada del estadio
const asfalto = mat('#4f535a', { roughness: .95 });
function calle(x, z, w, d) {
  plano(w, d, asfalto, x, z, .06); const horiz = w > d;
  for (let k = -(horiz ? w : d) / 2 + 5; k < (horiz ? w : d) / 2; k += 14) plano(horiz ? 7 : .6, horiz ? .6 : 7, '#f0f0f0', horiz ? x + k : x, horiz ? z : z + k, .08);
}
calle(150, 160, 900, 16); calle(150, -165, 900, 16); calle(-185, 0, 16, 600); calle(185, 0, 16, 600); calle(460, 0, 16, 600);

// árboles: redondos (ciudad) o pinos (montaña)
const PINO = ENTORNO === 'montana';
const copa = new THREE.InstancedMesh(PINO ? new THREE.ConeGeometry(3.2, 9, 7) : new THREE.IcosahedronGeometry(3.4, 1), mat('#ffffff', { flatShading: true, roughness: .9 }), 3000);
const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(.45, .6, 3.4, 6), mat('#6e4a2e'), 3000);
copa.castShadow = tronco.castShadow = true;
const tmp = new THREE.Object3D(), col = new THREE.Color(); let nArb = 0;
function arbol(x, z, s = 1) { if (nArb >= 3000) return; s *= .85 + rnd() * .35; tmp.rotation.set(0, rnd() * 6, 0); tmp.scale.set(s, s, s);
  tmp.position.set(x, 1.7 * s, z); tmp.updateMatrix(); tronco.setMatrixAt(nArb, tmp.matrix);
  tmp.position.set(x, (PINO ? 7.6 : 5.4) * s, z); tmp.updateMatrix(); copa.setMatrixAt(nArb, tmp.matrix);
  copa.setColorAt(nArb, col.set(ENT.copa[nArb % 3])); nArb++; }
for (let x = -170; x <= 170; x += 11) { arbol(x, 146); arbol(x, -150); }
for (let z = -135; z <= 135; z += 11) { arbol(-170, z); arbol(170, z); }

if (ENTORNO === 'ciudad') {
  const tVent = (base, luz) => canvasTex(64, 128, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 9) for (let x = 3; x < w; x += 8) { g.fillStyle = rnd() < .2 ? luz : '#6f8aa6'; g.fillRect(x, y, 5, 6); } });
  const tx = [tVent('#d7dde5', '#eef5ff'), tVent('#c9d2dc', '#e4eef9'), tVent('#e3ddd2', '#fff6e6')];
  for (let i = 0; i < 160; i++) {
    const x = -700 + rnd() * 1600, z = -340 - rnd() * 420, h = 40 + rnd() * 150, w = 14 + rnd() * 22, d = 14 + rnd() * 22;
    const t = tx[i % 3].clone(); t.needsUpdate = true; t.repeat.set(w / 12, h / 14);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat('#fff', { map: t, roughness: .55, metalness: .1 })); m.position.set(x, h / 2, z); m.receiveShadow = true; scene.add(m);
  }
}

if (ENTORNO === 'montana') {
  // cordillera: picos con nieve, en tres planos de profundidad
  const roca = ['#7d8794', '#8a8f86', '#6f7b72', '#949aa3'];
  function pico(x, z, alto, ancho, nieve = true, color) {
    const c = color || roca[Math.floor(rnd() * roca.length)];
    const m = new THREE.Mesh(new THREE.ConeGeometry(ancho, alto, 6 + Math.floor(rnd() * 3), 1), mat(c, { flatShading: true, roughness: 1 }));
    m.position.set(x, alto / 2 - 2, z); m.rotation.y = rnd() * 6; m.scale.z = .7 + rnd() * .5; scene.add(m);
    if (nieve) { const hn = alto * (.28 + rnd() * .1); const n = new THREE.Mesh(new THREE.ConeGeometry(ancho * hn / alto * 1.02, hn, m.geometry.parameters.radialSegments, 1), mat('#f7fbff', { flatShading: true, roughness: .7 }));
      n.position.set(x, alto - 2 - hn / 2 + .3, z); n.rotation.y = m.rotation.y; n.scale.z = m.scale.z; scene.add(n); }
  }
  for (let i = 0; i < 26; i++) pico(-1000 + i * 90 + rnd() * 40, -1150 - rnd() * 150, 520 + rnd() * 260, 200 + rnd() * 90);
  for (let i = 0; i < 22; i++) pico(-850 + i * 85 + rnd() * 40, -800 - rnd() * 120, 330 + rnd() * 220, 150 + rnd() * 60);
  for (let i = 0; i < 16; i++) pico(-700 + i * 105 + rnd() * 50, -540 - rnd() * 80, 45 + rnd() * 40, 130 + rnd() * 60, false, ['#5f8a4e', '#6b9455', '#56804a'][i % 3]);
  // lomas a los costados
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(140 + rnd() * 80, 12, 8), mat(['#7fae55', '#88b75c'][i % 2], { flatShading: true })); m.scale.y = .25; m.position.set((i % 2 ? -1 : 1) * (560 + rnd() * 250), -10, -380 + i * 90); scene.add(m); }
  // bosques de pinos
  for (let i = 0; i < 1500; i++) { const x = -650 + rnd() * 1500, z = -520 + rnd() * 340; if (x > -230 && x < 520 && z > -200) continue; arbol(x, z, 1 + rnd() * .6); }
  for (let i = 0; i < 500; i++) { const lado = rnd() < .5, x = lado ? -260 - rnd() * 380 : 500 + rnd() * 380, z = -200 + rnd() * 520; arbol(x, z, 1 + rnd() * .5); }
  // lago
  const lago = new THREE.Mesh(new THREE.CircleGeometry(90, 40), mat('#4a9fd0', { roughness: .1, metalness: .3 })); lago.rotation.x = -Math.PI / 2; lago.scale.set(1.8, 1, 1); lago.position.set(-420, .3, 230); scene.add(lago);
}
// ---------- cancha ----------
const tCancha = canvasTex(1050, 680, (g, w, h) => {
  for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? '#3b8f3a' : '#44a142'; g.fillRect(i * w / 18, 0, w / 18 + 1, h); }
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4; const s = 10;
  g.strokeRect(2, 2, w - 4, h - 4); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.beginPath(); g.arc(w / 2, h / 2, 9.15 * s, 0, 7); g.stroke();
  for (const L of [0, 1]) { g.strokeRect(L ? w - 16.5 * s : 0, h / 2 - 20.15 * s, 16.5 * s, 40.3 * s); g.strokeRect(L ? w - 5.5 * s : 0, h / 2 - 9.15 * s, 5.5 * s, 18.3 * s);
    g.beginPath(); g.arc(L ? w - 11 * s : 11 * s, h / 2, 9.15 * s, L ? Math.PI * .7 : -Math.PI * .3, L ? Math.PI * 1.3 : Math.PI * .3); g.stroke(); }
});
tCancha.wrapS = tCancha.wrapT = THREE.ClampToEdgeWrapping;
plano(2 * A0 + 6, 2 * B0 + 6, '#3a8a3a', 0, 0, .2, estadio);
plano(105, 68, mat('#fff', { map: tCancha, roughness: .9 }), 0, 0, .25, estadio);
for (const sx of [-1, 1]) { caja(.25, 2.44, .25, '#fff', sx * 52.5, .25, -3.66, estadio); caja(.25, 2.44, .25, '#fff', sx * 52.5, .25, 3.66, estadio); caja(.25, .25, 7.6, '#fff', sx * 52.5, 2.5, 0, estadio);
  const red = caja(2.2, 2.4, 7.3, mat('#fff', { transparent: true, opacity: .3 }), sx * 53.7, .25, 0, estadio); red.castShadow = false; }
// carteles LED perimetrales
const tLED = canvasTex(1024, 64, (g, w, h) => { const marcas = ['APOSTAR', 'YERBA LA PATRONA', 'BILLETERA YA', 'CERVEZA DEL SUR', 'CRIPTOGOL', 'TELCO+']; for (let i = 0; i < 6; i++) { g.fillStyle = ['#0f7a3c', '#f5c518', '#2b5bd7', '#c8202f', '#111', '#7a2bd7'][i]; g.fillRect(i * w / 6, 0, w / 6, h); g.fillStyle = i === 1 ? '#222' : '#fff'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText(marcas[i], i * w / 6 + w / 12, 43); } }, [3, 1]);
anillo(-4, .2, -4, 1.1, mat('#fff', { map: tLED, emissive: '#ffffff', emissiveMap: tLED, emissiveIntensity: .45, side: THREE.DoubleSide }), { uMetro: 120 });

// ---------- butacas ----------
function texGradas(colorA, colorB, filas) {
  return canvasTex(512, 512, (g, w, h) => {
    const fh = h / filas;
    for (let r = 0; r < filas; r++) {
      g.fillStyle = '#3a3e45'; g.fillRect(0, r * fh, w, fh);
      for (let k = 0; k < 64; k++) {
        const x = k * 8; const ocupado = rnd() < .62;
        g.fillStyle = (k % 16 < 8) ? colorA : colorB; g.fillRect(x + 1, r * fh + fh * .25, 6, fh * .55);
        if (ocupado) { g.fillStyle = ['#f2d0b0', '#c89670', '#8a5a3c', '#e9e9e9', colorA, '#1d1d1d'][Math.floor(rnd() * 6)]; g.fillRect(x + 2, r * fh + fh * .05, 4, fh * .45); }
      }
    }
  });
}
const mGradaBaja = mat('#fff', { map: texGradas(ROJO, '#a8182a', 24), roughness: .8, side: THREE.DoubleSide });
mGradaBaja.map.repeat.set(1, 1);
const mGradaAlta = mat('#fff', { map: texGradas(ROJO, '#ffffff', 26), roughness: .8, side: THREE.DoubleSide });
const hormigon = mat('#d8dbe0', { roughness: .9, side: THREE.DoubleSide });
const vidrioVIP = mat('#2a3c52', { roughness: .15, metalness: .5, emissive: '#ffcf8a', emissiveIntensity: .18, side: THREE.DoubleSide });

// anillo inferior, palcos, anillo superior
anillo(0, .8, 0, 2.2, hormigon);                       // muro frente a la cancha
anillo(0, 2.2, 21, 15, mGradaBaja, { uMetro: 45 });
anillo(21, 15, 21, 20, vidrioVIP);                      // palcos vidriados
anillo(21, 20, 23.5, 20, hormigon);                     // pasillo
anillo(23.5, 20.3, 23.5, 21.5, hormigon);
anillo(23.5, 21.5, 46, 38, mGradaAlta, { uMetro: 50 });
anillo(46, 38, 46, 40, hormigon);

// ---------- fachada ----------
const tFachada = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e84a5a'); gr.addColorStop(1, '#9e1424'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let k = -h; k < w; k += 32) { g.beginPath(); g.moveTo(k, h); g.lineTo(k + h, 0); g.stroke(); g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); } }, [1, 1]);
anillo(48, 7, 48, 40, mat('#fff', { map: tFachada, emissive: '#ff3b4f', emissiveMap: tFachada, emissiveIntensity: .25, roughness: .4, metalness: .1, side: THREE.DoubleSide }), { uMetro: 18 });
anillo(49.5, 0, 49.5, 7, mat('#9fc9e8', { roughness: .1, metalness: .55, side: THREE.DoubleSide }), { uMetro: 18 });   // planta baja vidriada
anillo(49.5, 7, 48, 7, hormigon);
// columnas / costillas de la fachada
const NCOST = 96;
const costillas = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 44, 2.6), mat('#f4f5f7', { roughness: .4, metalness: .2 }), NCOST);
costillas.castShadow = true;
for (let i = 0; i < NCOST; i++) { const t = i / NCOST * Math.PI * 2, [x, z] = curva(50.2, t); tmp.position.set(x, 22, z); tmp.rotation.set(0, 0, 0); tmp.scale.set(1, 1, 1); tmp.lookAt(0, 22, 0); tmp.updateMatrix(); costillas.setMatrixAt(i, tmp.matrix); }
estadio.add(costillas);

// ---------- techo ----------
const membrana = mat('#f3f5f8', { roughness: .35, metalness: .1, side: THREE.DoubleSide });
anillo(52, 46, 14, 41, membrana);
anillo(52, 46, 52, 43.5, mat('#e6e9ee', { side: THREE.DoubleSide }));
anillo(14, 41, 14, 40, mat('#fffbe6', { emissive: '#fff6d0', emissiveIntensity: 1.0, side: THREE.DoubleSide }));   // aro de luces
// cerchas radiales
const NC = 72;
const cerchas = new THREE.InstancedMesh(new THREE.BoxGeometry(.8, 1.6, 1), mat('#c9cfd8', { metalness: .4, roughness: .4 }), NC);
cerchas.castShadow = true;
for (let i = 0; i < NC; i++) { const t = i / NC * Math.PI * 2, a = curva(14, t), b = curva(52, t), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  tmp.position.set((a[0] + b[0]) / 2, 44.4, (a[1] + b[1]) / 2); tmp.scale.set(1, 1, L); tmp.rotation.set(0, 0, 0); tmp.lookAt(b[0], 45.6, b[1]); tmp.updateMatrix(); cerchas.setMatrixAt(i, tmp.matrix); }
estadio.add(cerchas);
// pantallas gigantes en dos esquinas
for (const [t, r] of [[Math.PI * .25, 1], [Math.PI * 1.25, -1]]) { const [x, z] = curva(30, t); const p = caja(16, 8, 1, mat('#0b1220', { emissive: '#1d4f8f', emissiveIntensity: .7 }), x, 30, z, estadio); p.lookAt(0, 30, 0); }

// ---------- explanada: accesos, nombre, monumento ----------
const tNombre = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 110px Arial'; g.textAlign = 'center'; g.fillText('VILLA FERRO ARENA', w / 2, 120); });
const cartelNombre = new THREE.Mesh(new THREE.PlaneGeometry(70, 11), mat('#fff', { map: tNombre, transparent: true, emissive: '#ffffff', emissiveMap: tNombre, emissiveIntensity: .6 }));
{ const [x, z] = curva(52.5, Math.PI / 2); cartelNombre.position.set(x, 32, z); estadio.add(cartelNombre); }
for (const t of [Math.PI / 2 - .5, Math.PI / 2 + .5, -Math.PI / 2]) { const [x, z] = curva(58, t); const esc = caja(16, .8, 10, '#c4c0b6', x, 0, z, estadio); esc.lookAt(0, .4, 0); }
// estatua del ídolo en la plaza
caja(8, 3, 8, '#bfc4cc', -70, 0, 110); caja(2.4, 6, 2.4, '#8f7a4a', -70, 3, 110); caja(3.6, 2, 2, '#8f7a4a', -70, 7.2, 110);
// macetones con árboles en la plaza
for (let k = -130; k <= 130; k += 26) { caja(5, 1, 5, '#b8b3a8', k, 0, 128); arbol(k, 128, 1.1); }
// estacionamiento
plano(110, 90, asfalto, -105, -95, .07);
for (let k = 0; k < 10; k++) plano(.4, 80, '#e8e8e8', -155 + k * 11, -95, .09);
for (let i = 0; i < 46; i++) { const c = caja(4.4, 1.5, 2.1, ['#e9e9e9', '#2b2f36', '#9aa1ab', '#c8202f', '#3c6fd1'][i % 5], -152 + (i % 9) * 11 + rnd(), .07, -130 + Math.floor(i / 9) * 13 + rnd() * 2); c.rotation.y = Math.PI / 2; }

// ---------- la villa (a la derecha del estadio) ----------
const pasto2 = mat(ENTORNO === 'montana' ? '#8cbf5f' : '#86bb5e');
const lote = (x, z, w, d) => { caja(w, .5, d, '#d6d2c8', x, 0, z); plano(w - 6, d - 6, pasto2, x, z, .52); };
lote(320, -82, 236, 144); lote(320, 85, 236, 144);
const vereda = mat('#e3ddcf', { roughness: .95 });
plano(236, 10, vereda, 320, -2, .53); plano(10, 130, vereda, 300, -82, .54); plano(10, 130, vereda, 300, 85, .54);

// sede / oficinas (el Despacho): edificio en L con vidrio y franja roja
const vidrioOf = mat('#8cc3e8', { roughness: .1, metalness: .45 });
const blanco = mat('#f2f3f5', { roughness: .6 });
const sede = new THREE.Group(); sede.position.set(250, .5, -100); scene.add(sede);
caja(64, 4, 30, blanco, 0, 0, 0, sede);
for (let p = 0; p < 5; p++) { caja(64.2, 3.2, 30.2, vidrioOf, 0, 4 + p * 4.4, 0, sede); caja(64.6, 1.2, 30.6, blanco, 0, 7.2 + p * 4.4, 0, sede); }
for (let k = -30; k <= 30; k += 6) caja(.6, 22, 30.8, blanco, k, 4, 0, sede);
caja(66, 1.6, 32, ROJO, 0, 26, 0, sede);
caja(30, 12, 20, blanco, -14, 0, 28, sede); for (let p = 0; p < 2; p++) caja(30.2, 3.2, 20.2, vidrioOf, -14, 2 + p * 4.6, 28, sede); caja(31, 1.2, 21, ROJO, -14, 12, 28, sede);
caja(16, .8, 8, '#d9dde3', 14, 5, 18.5, sede); caja(.5, 5, .5, '#c9ced6', 7, 0, 21.5, sede); caja(.5, 5, .5, '#c9ced6', 21, 0, 21.5, sede);     // marquesina
caja(10, 4, 8, '#c9ced6', 18, 27.6, -6, sede); caja(6, 3, 6, '#c9ced6', -18, 27.6, 4, sede);                                                   // equipos de la terraza
const tSede = canvasTex(1024, 96, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#C8202F'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('SEDE · ATLÉTICO VILLA FERRO', w / 2, 70); });
tSede.wrapS = tSede.wrapT = THREE.ClampToEdgeWrapping;
{ const s = new THREE.Mesh(new THREE.PlaneGeometry(44, 4.2), mat('#fff', { map: tSede, transparent: true })); s.position.set(8, 2.2 + .5, 15.25); sede.add(s); }
for (let k = 0; k < 3; k++) { caja(.35, 16, .35, '#dfe3e8', 26 + k * 5, 0, 26, sede); caja(4.5, 2.6, .1, [ROJO, '#ffffff', ROJO][k], 28.3 + k * 5, 12.8, 26, sede); }

// prensa y redes: caja oscura, pantalla y antenas
const pre = new THREE.Group(); pre.position.set(345, .5, -112); scene.add(pre);
caja(42, 15, 26, '#39424f', 0, 0, 0, pre); caja(43, 1, 27, '#2a313b', 0, 15, 0, pre);
const tVivo = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff3355'; g.beginPath(); g.arc(40, 64, 16, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 54px Arial'; g.fillText('EN VIVO · 12,4k', 70, 82); });
tVivo.wrapS = tVivo.wrapT = THREE.ClampToEdgeWrapping;
{ const s = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), mat('#fff', { map: tVivo, emissive: '#ffffff', emissiveMap: tVivo, emissiveIntensity: .7 })); s.position.set(0, 8, 13.1); pre.add(s); }
for (const [x, z] of [[-12, -4], [-2, -6]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#eef1f4', { side: THREE.DoubleSide })); d.rotation.x = -1.0; d.position.set(x, 18, z); d.castShadow = true; pre.add(d); caja(.5, 3, .5, '#aab1bb', x, 16, z - 1, pre); }
caja(.6, 16, .6, '#aab1bb', 14, 16, -6, pre);

// ojeadores: pabellón chico con frente vidriado
caja(28, 8, 18, '#e9e2d4', 400, .5, -60); caja(28.4, 5, .4, vidrioOf, 400, 2, -50.8); caja(32, 1, 22, '#2f5f9e', 400, 8.5, -60);
// parrilla con deck, mesas y sombrillas
caja(20, 6, 14, '#efe1c6', 400, .5, -120); caja(22, .8, 16, '#2f7d3a', 400, 6.5, -120);
caja(26, .6, 16, '#a47a4f', 400, .5, -101);
for (let k = 0; k < 4; k++) { const x = 390 + k * 7; caja(.25, 3.6, .25, '#ddd', x, 1.1, -101); const s = new THREE.Mesh(new THREE.ConeGeometry(3, 1.4, 8), mat(k % 2 ? ROJO : '#ffffff')); s.position.set(x, 5.2, -101); s.castShadow = true; scene.add(s); caja(2.4, .3, 2.4, '#e8e2d6', x, 2.1, -101); }
// estacionamiento de la sede
plano(70, 34, asfalto, 345, -55, .56);
for (let i = 0; i < 14; i++) { const c = caja(4.4, 1.5, 2.1, ['#e9e9e9', '#2b2f36', '#9aa1ab', ROJO, '#3c6fd1'][i % 5], 316 + (i % 7) * 9.5, .56, -66 + Math.floor(i / 7) * 22); c.rotation.y = Math.PI / 2; }

// ciudad deportiva: dos canchas, tribunita, bancos, alambrado, gimnasio y pensión
const tEnt = canvasTex(512, 330, (g, w, h) => { for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#3b8f3a' : '#45a043'; g.fillRect(i * w / 10, 0, w / 10 + 1, h); } g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 40, 0, 7); g.stroke(); g.strokeRect(2, h / 2 - 80, 70, 160); g.strokeRect(w - 72, h / 2 - 80, 70, 160); });
tEnt.wrapS = tEnt.wrapT = THREE.ClampToEdgeWrapping;
for (const [cx, cz] of [[262, 70], [372, 70]]) {
  plano(100, 66, '#3a8a3a', cx, cz, .58); plano(90, 58, mat('#fff', { map: tEnt }), cx, cz, .6);
  for (const sx of [-1, 1]) { caja(.3, 2.2, .3, '#fff', cx + sx * 45, .6, cz - 3.3); caja(.3, 2.2, .3, '#fff', cx + sx * 45, .6, cz + 3.3); caja(.3, .3, 6.9, '#fff', cx + sx * 45, 2.6, cz); }
  for (let k = -50; k <= 50; k += 5) { caja(.2, 3, .2, '#9aa1ab', cx + k, .6, cz - 33); }   // alambrado del fondo
  caja(8, 2.2, 2, '#2d3440', cx - 8, .6, cz + 31); caja(8, 2.2, 2, '#2d3440', cx + 8, .6, cz + 31);   // bancos
}
for (let i = 0; i < 4; i++) caja(60, (i + 1) * .9, 2, ['#c9ccd2', '#d6d9de'][i % 2], 262, .6, 108 + i * 2);   // tribunita
// gimnasio (techo curvo)
{ const g = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 40, 24, 1, false, 0, Math.PI), mat('#dfe5ec', { metalness: .3, roughness: .4, side: THREE.DoubleSide })); g.rotation.z = Math.PI / 2; g.rotation.y = Math.PI / 2; g.position.set(400, .6, 128); g.castShadow = true; scene.add(g);
  caja(24, 1, 40, '#cfd5dc', 400, .5, 128).scale.set(1, 1, 1); }
// pensión de inferiores
caja(40, 14, 14, '#efe9de', 330, .5, 134); for (let p = 0; p < 3; p++) caja(40.2, 2.4, 14.2, vidrioOf, 330, 2.5 + p * 4, 134); caja(41, 1, 15, ROJO, 330, 14.5, 134);
for (let x = 210; x <= 430; x += 12) { arbol(x, 152); arbol(x, -158); }
for (let z = -140; z <= 150; z += 12) arbol(440, z);
copa.count = tronco.count = nArb;   // los no usados quedarían apilados en el origen
copa.instanceMatrix.needsUpdate = true; tronco.instanceMatrix.needsUpdate = true; scene.add(copa, tronco);

// ---------- etiquetas (se reubican en cada render) ----------
const etiquetas = [];
function etiqueta(texto, x, y, z, cls = '') {
  const d = document.createElement('div'); d.className = 'lbl ' + cls; d.textContent = texto; stage.appendChild(d);
  etiquetas.push({ d, p: new THREE.Vector3(x, y, z) });
}
if (!HERO) {
  etiqueta('Tu estadio · Estilo europeo · 62.000', 0, 62, 0, 'big');
  etiqueta('Sede · el Despacho 📣 3 movidas', 250, 36, -100);
  etiqueta('Prensa y redes', 345, 26, -112);
  etiqueta('Ojeadores', 400, 14, -60);
  etiqueta('Parrilla', 400, 12, -120);
  etiqueta('Ciudad deportiva', 317, 8, 70);
  etiqueta('Gimnasio', 400, 18, 128);
  etiqueta('Pensión · Inferiores', 330, 20, 134);
}
function render() {
  renderer.render(scene, camera);
  for (const { d, p } of etiquetas) { const v = p.clone().project(camera); const vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    d.style.display = vis ? '' : 'none'; d.style.left = ((v.x + 1) / 2 * W) + 'px'; d.style.top = ((1 - v.y) / 2 * H) + 'px'; }
}
render();

// ---------- mover el mapa: arrastrar = desplazar, rueda = zoom ----------
let arrastre = null;
stage.addEventListener('pointerdown', e => { arrastre = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointerup', () => arrastre = null);
stage.addEventListener('pointermove', e => {
  if (!arrastre || HERO) return;
  const k = DIST / 900; MIRA.x -= (e.clientX - arrastre.x) * k; MIRA.z -= (e.clientY - arrastre.y) * k * 1.3;
  MIRA.x = Math.max(-300, Math.min(520, MIRA.x)); MIRA.z = Math.max(-250, Math.min(250, MIRA.z));
  arrastre = { x: e.clientX, y: e.clientY }; ubicarCamara(); render();
});
stage.addEventListener('wheel', e => { if (HERO) return; e.preventDefault(); DIST = Math.max(250, Math.min(1500, DIST * (e.deltaY > 0 ? 1.1 : 0.9))); ubicarCamara(); render(); }, { passive: false });

window.listo = true; window.__escena = { scene, camera, THREE };
function ajustar() { W = innerWidth; H = innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); render(); }
addEventListener('resize', ajustar);
}
