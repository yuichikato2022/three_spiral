import { DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, TextureLoader } from "three";
import { ITEMS, PLANE_ASPECT, SPIRAL_OFFSET_ANGLE_RAD, SPIRAL_OFFSET_Y, SPIRAL_SPLIT } from "./define";
import { loadedmeshes } from "./meshLoader";

const textureLoader = new TextureLoader

export default class SpiralItem {
  object!: Object3D
  isPlane = false

  rotationSpeed = {
    x: Math.random() * .01 + .01,
    y: Math.random() * .01 + .01,
    z: Math.random() * .01 + .01,
  }

  rotate() {
    this.object.rotation.x += this.rotationSpeed.x
    this.object.rotation.y += this.rotationSpeed.y
    this.object.rotation.z += this.rotationSpeed.z
  }

  initAsModel(item: typeof ITEMS[number]) {
    this.object = loadedmeshes[item.model!].clone()
    this.object.traverse(v => {
      const mesh = v as Mesh
      if (mesh.isMesh && !Array.isArray(mesh.material)) {
        mesh.material = mesh.material.clone()
        mesh.material.transparent = true
      }
    })

    this.object.scale.set(.5, .5, .5)
    this.object.rotation.x = Math.PI * 2 * Math.random()
    this.object.rotation.y = Math.PI * 2 * Math.random()
    this.object.rotation.z = Math.PI * 2 * Math.random()
  }

  initAsPlane(item: typeof ITEMS[number]) {
    const geo = new PlaneGeometry(.5, .3)
    const mat = new MeshBasicMaterial({
      map: textureLoader.load(`imgs/${item.texture}`),
      side: DoubleSide,
      transparent: true,
    })
    this.object = new Mesh(geo, mat)
    this.isPlane = true
  }

  ajustPlaneShape(spiralRot: number) {
    const itemRot = SPIRAL_OFFSET_ANGLE_RAD * this.i + spiralRot
    this.object.rotation.y = itemRot

    const halfOfPlaneWidth = Math.tan(SPIRAL_OFFSET_ANGLE_RAD / 2)

    const mesh = this.object as Mesh
    const pos = mesh.geometry.getAttribute("position")

    for (let i = 0; i < 4; i++) {
      const x = pos.getX(i)
      if (x > 0) pos.setX(i, halfOfPlaneWidth)
      if (x < 0) pos.setX(i, -halfOfPlaneWidth)
    }

    const centerRot = itemRot / (Math.PI / 180)
    let rRot = (centerRot + 360 / SPIRAL_SPLIT / 2) % 360
    let lRot = (centerRot - 360 / SPIRAL_SPLIT / 2) % 360
    if (rRot < 0) rRot += 360
    if (lRot < 0) lRot += 360

    const halfTheta = 360 / SPIRAL_SPLIT / 2
    const halfThetaL = 360 - halfTheta
    let rAjustRate = 0
    if (0 <= rRot && rRot < halfTheta) {
      rAjustRate = lerp(0, 0, halfTheta, -1, rRot)
    } else if (halfTheta <= rRot && rRot < halfThetaL) {
      rAjustRate = lerp(halfTheta, -1, halfThetaL, 1, rRot)
    } else if (halfThetaL <= rRot && rRot < 360) {
      rAjustRate = lerp(halfThetaL, 1, 360, 0, rRot)
    }
    let lAjustRate = 0
    if (0 <= lRot && lRot < halfTheta) {
      lAjustRate = lerp(0, 0, halfTheta, -1, lRot)
    } else if (halfTheta <= lRot && lRot < halfThetaL) {
      lAjustRate = lerp(halfTheta, -1, halfThetaL, 1, lRot)
    } else if (halfThetaL <= lRot && lRot < 360) {
      lAjustRate = lerp(halfThetaL, 1, 360, 0, lRot)
    }

    const rAjust = rAjustRate * SPIRAL_OFFSET_Y / 2
    const lAjust = lAjustRate * SPIRAL_OFFSET_Y / 2


    const halfOfPlaneHeight = halfOfPlaneWidth / PLANE_ASPECT
    const halfOfSpiralOffsetY = SPIRAL_OFFSET_Y / 2

    pos.setY(0, (-halfOfSpiralOffsetY) + halfOfPlaneHeight + lAjust)  // left top
    pos.setY(1, (halfOfSpiralOffsetY) + halfOfPlaneHeight + rAjust) // right top
    pos.setY(2, (-halfOfSpiralOffsetY) - halfOfPlaneHeight + lAjust) // left bottom
    pos.setY(3, (halfOfSpiralOffsetY) - halfOfPlaneHeight + rAjust) // right bottom
    pos.needsUpdate = true
  }

  constructor(item: typeof ITEMS[number], public i: number, parent: Object3D) {
    if (item.model) this.initAsModel(item)
    else this.initAsPlane(item)
    this.object.traverse(v => v.userData = { i })
    parent.add(this.object)
  }
}


function lerp(x0: number, y0: number, x1: number, y1: number, x: number) {
  return y0 + (x - x0) * (y1 - y0) / (x1 - x0)
}