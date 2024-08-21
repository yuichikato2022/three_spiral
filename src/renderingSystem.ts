import {
  BoxGeometry,
  DirectionalLight,
  GridHelper,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CAMERA_DIST_DEFAULT,
  SPIRAL_LOOP,
  SPIRAL_OFFSET_Y,
  SPIRAL_SPLIT,
} from "./define";

class RenderingSystem {
  canvas = document.createElement("canvas");
  renderer = new WebGLRenderer({
    canvas: this.canvas,
    antialias: true,
    alpha: true,
  });

  fov = 25;

  camera = new PerspectiveCamera(this.fov);
  // controls = new OrbitControls(this.camera, this.canvas)

  scene = new Scene();

  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x333333);
    this.renderer.setPixelRatio(devicePixelRatio);

    const y = (SPIRAL_LOOP * SPIRAL_OFFSET_Y * SPIRAL_SPLIT) / 2;
    this.camera.aspect = width / height;
    this.camera.position.set(0, y, CAMERA_DIST_DEFAULT);
    this.camera.lookAt(0, y, 0);
    this.camera.updateProjectionMatrix();

    const grid = new GridHelper(100, 100);
    this.scene.add(grid);

    // const boxGeo = new BoxGeometry
    // const boxMat = new MeshStandardMaterial({
    //   color: 0x0000ff,
    //   transparent: true,
    //   opacity: .5,
    // })
    // const box = new Mesh(boxGeo, boxMat)
    // this.scene.add(box)

    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(10, 20, 20);
    directionalLight.lookAt(0, 0, 0);
    this.scene.add(directionalLight);

    document.body.append(this.canvas);

    window.addEventListener("resize", this.resize);
    this.resize();
  }

  resize = () => {
    const width = innerWidth;
    const height = innerHeight;
    this.renderer.setSize(width, height);

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = hfov2vfov(this.fov, aspect);
    this.camera.updateProjectionMatrix();
  };

  exec() {
    // this.controls.update()
    this.renderer.render(this.scene, this.camera);
  }
}

const renderingSystem = new RenderingSystem();
export default renderingSystem;

function hfov2vfov(hfov: number, aspect: number) {
  return MathUtils.radToDeg(
    Math.atan(Math.tan(MathUtils.degToRad(hfov) / 2) / aspect) * 2
  );
}
