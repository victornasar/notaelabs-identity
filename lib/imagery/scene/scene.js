/**
 * Lit three.js scenes for generated imagery. Runs in a browser page that
 * scripts/render-imagery.ts opens; `window.render(spec)` draws one image into
 * the page's canvas, then adds grain.
 *
 * Hard light: spot lights with no penumbra (a hard cut-off), hard shadows, and
 * the natural falloff of light across a surface. Nothing glows: there is no
 * bloom, no haze and no visible beam in the air.
 */
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mirrors a geometry top to bottom, keeping its faces facing out. */
function flipY(geometry) {
  geometry.scale(1, -1, 1);
  for (const name of Object.keys(geometry.attributes)) {
    const a = geometry.attributes[name];
    for (let i = 0; i < a.count; i += 3)
      for (let c = 0; c < a.itemSize; c++) {
        const t = a.array[(i + 1) * a.itemSize + c];
        a.array[(i + 1) * a.itemSize + c] = a.array[(i + 2) * a.itemSize + c];
        a.array[(i + 2) * a.itemSize + c] = t;
      }
  }
}

/**
 * spec: { type, width, height, seed, ground, ink, surface, spread, symbol, composition? }
 * Colors are hex. `spread` is the beam's widening per unit of fall, each side.
 * `symbol` is the symbol's SVG markup, for symbol renders.
 */
window.render = async (spec) => {
  const rand = random(spec.seed);
  const canvas = document.getElementById("gl");
  canvas.width = spec.width;
  canvas.height = spec.height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(spec.width, spec.height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(spec.ground);
  // Stone in slabs or blocks: slight variation from one to the next and dark joints,
  // so light has something to fall off across.
  const texture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    const tex = random(spec.seed * 31 + 7);
    g.fillStyle = "#b4b4b4";
    g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const v = Math.round(230 + tex() * 25);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(x * 128 + 1, y * 128 + 1, 126, 126);
      }
    const speck = g.getImageData(0, 0, 512, 512);
    for (let i = 0; i < speck.data.length; i += 4) {
      const n = (tex() - 0.5) * 22;
      speck.data[i] += n;
      speck.data[i + 1] += n;
      speck.data[i + 2] += n;
    }
    g.putImageData(speck, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  })();
  // One unit of texture holds 4 × 4 slabs; `slab` is a slab's size in metres.
  const stone = (u = 1, v = 1, slab = 0.6) => {
    const map = texture.clone();
    map.repeat.set(u / (slab * 4), v / (slab * 4));
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: spec.surface, map, roughness: 0.92, metalness: 0 });
  };
  // Unlit stone reads as the ground color, so the scene and the page are one dark.
  const albedo = new THREE.Color(spec.surface);
  const night = new THREE.Color(spec.ground);
  scene.add(new THREE.AmbientLight(new THREE.Color(night.r / albedo.r, night.g / albedo.g, night.b / albedo.b), Math.PI));

  const camera = new THREE.PerspectiveCamera(40, spec.width / spec.height, 0.1, 400);
  const angle = Math.atan(spec.spread);
  const lamp = (x, y, z, tx = x, tz = z, power = 1) => {
    const light = new THREE.SpotLight(spec.ink, 0, 0, angle, 0, 2);
    // Brightest where it lands straight below: the ink's own value on the surface.
    light.intensity = (power * y * y * Math.PI) / Math.max(albedo.r, albedo.g, albedo.b);
    light.position.set(x, y, z);
    light.target.position.set(tx, 0, tz);
    light.castShadow = true;
    light.shadow.mapSize.set(4096, 4096);
    light.shadow.bias = -0.0004;
    scene.add(light, light.target);
  };
  const box = (w, h, d, x, y, z, slab = 0.6) => {
    const [u, v] = [w, h, d].sort((a, b) => b - a);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone(u, v, slab));
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const ground = (w, d, x = 0, z = 0) => box(w, 0.2, d, x, -0.2, z);

  const compositions = spec.type === "symbol-render" ? ["symbol"] : ["street", "bridge", "stair"];
  // The seed walks through the compositions, so a set of images varies.
  const composition = spec.composition ?? compositions[spec.seed % compositions.length];
  const side = rand() < 0.5 ? 1 : -1;
  const wide = spec.width / spec.height;

  if (composition === "street" || composition === "bridge") {
    // Lamps along one edge at the interval: the gap between two pools is one pool wide.
    const height = 5;
    const pool = 2 * height * spec.spread;
    const step = pool * 2;
    const bridge = composition === "bridge";
    if (bridge) ground(9, 260, 0, -110);
    else ground(80, 260, 0, -110);
    box(0.3, 1.1, 260, side * 4.6, 0, -110); // parapet, catching each pool's edge
    for (let k = 0; k < 14; k++) lamp(side * 2.8, height, 4 - k * step - rand() * 0.01, side * 2.8, 4 - k * step);
    // Portrait frames are narrow, so stand nearer the lamp line to keep the near pools in.
    if (wide < 1) {
      camera.position.set(side * (0.6 + rand() * 0.6), 1.6, 10);
      camera.lookAt(side * 2.4, 0.2, -14);
    } else {
      camera.position.set(-side * (1.2 + rand()), 1.6, 12);
      camera.lookAt(side * 1.5, 0.6, -30);
    }
    camera.fov = wide < 1 ? 62 : 40;
  } else if (composition === "stair") {
    // One flight rising away between two walls, a downlight over every fifth tread.
    const rise = 0.17;
    const tread = 0.32;
    const n = 26;
    ground(30, 30, 0, 4);
    for (let k = 0; k < n; k++) box(2.4, rise * (k + 1), tread, 0, 0, -k * tread, 0.4);
    box(30, rise * n, 20, 0, 0, -n * tread - 10 + tread / 2); // the landing
    for (const s of [-1, 1]) box(0.3, rise * n + 3, n * tread + 6, s * 1.35, 0, -n * tread / 2 + 3, 0.5);
    for (let k = 2; k < n; k += 5) lamp(side * 0.5, rise * k + 3, -k * tread, side * 0.3, -k * tread);
    camera.position.set(-side * 0.5, 1.6, 4.2);
    camera.lookAt(side * 0.1, 2.2, -4);
    camera.fov = wide < 1 ? 64 : 50;
  } else if (composition === "scallop") {
    // Lamps close to a wall: each throws a hard-edged scallop up the wall and a pool at its foot.
    ground(60, 30, 0, 0);
    box(60, 9, 0.4, 0, 0, -3);
    const height = 4.2;
    const pool = 2 * height * spec.spread;
    // Close to the wall and aimed at its foot, so wash and pool are one shape, not a hat.
    for (let k = -4; k <= 4; k++) lamp(k * pool * 2, height, -2.45, k * pool * 2, -2.8);
    camera.position.set(side * (1 + rand() * 2), 1.6, wide < 1 ? 6 : 9);
    camera.lookAt(0, wide < 1 ? 2.8 : 2.2, -3);
    camera.fov = wide < 1 ? 70 : 45;
  } else {
    // The symbol, cut from stone and lit from above by one lamp.
    const shapes = new SVGLoader().parse(spec.symbol).paths.flatMap((p) => SVGLoader.createShapes(p));
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 4, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 });
    flipY(geometry); // SVG's y runs down
    geometry.center();
    const mark = new THREE.Mesh(geometry, stone(20, 20, 2));
    mark.castShadow = mark.receiveShadow = true;
    mark.position.y = 10;
    mark.rotation.y = side * (0.25 + rand() * 0.2);
    scene.add(mark);
    ground(300, 300, 0, 0);
    // From the front and above: the face falls off toward the foot, the mark's shadow runs back.
    lamp(side * 3, 46, 7, 0, 1, 0.9);
    camera.position.set(side * 24, 8, 48);
    camera.lookAt(0, 9, 0);
    camera.fov = wide < 1 ? 46 : 32;
  }
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  // Fine grain, the same for the same seed.
  const out = document.getElementById("out");
  out.width = spec.width;
  out.height = spec.height;
  const ctx = out.getContext("2d");
  ctx.drawImage(canvas, 0, 0);
  const image = ctx.getImageData(0, 0, spec.width, spec.height);
  const grain = random(spec.seed * 7919);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (grain() - 0.5) * 14;
    image.data[i] += n;
    image.data[i + 1] += n;
    image.data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
  return composition;
};
