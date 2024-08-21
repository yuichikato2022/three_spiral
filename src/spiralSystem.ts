import gsap from "gsap"
import { Material, Mesh, Raycaster, Vector3 } from "three"
import { AUTO_GLOBAL_ROT_SPEED, CAMERA_DIST_DEFAULT, CAMERA_DIST_ZOOM, ITEMS, SPIRAL_LOOP, SPIRAL_OFFSET_ANGLE_RAD, SPIRAL_OFFSET_Y, SPIRAL_SPLIT } from "./define"
import infoPanel from "./infoPanel"
import PointerState from "./PointerState"
import renderingSystem from "./renderingSystem"
import SpiralItem from "./SpiralItem"

class SpiralSystem {
  pointerState = new PointerState
  spiralRot = 0
  spiralYByScroll = 0
  spiralVelocity = { rot: 0, y: 0 }
  items!: SpiralItem[]
  raycaster = new Raycaster

  focusTargetIndex = -1
  isInFocus = false
  opacity = 1
  cameraDist = CAMERA_DIST_DEFAULT

  focusItem(i: number) {
    const spiralRotCurrent = this.spiralRot
    const spiralRotTarget = SPIRAL_OFFSET_ANGLE_RAD * i * -1

    const spiralRotCurrentRem = spiralRotCurrent % (Math.PI * 2)
    const spiralRotTargetRem = spiralRotTarget % (Math.PI * 2)
    let spiralRotSub = spiralRotTargetRem - spiralRotCurrentRem

    if (Math.abs(spiralRotSub) > Math.PI) {
      spiralRotSub = (Math.PI * 2 - Math.abs(spiralRotSub)) *
        -Math.sign(spiralRotSub)
    }

    const spiralRotResult = spiralRotCurrent + spiralRotSub


    const rotRate = spiralRotResult / (Math.PI * 2)
    const spiralYByRot = rotRate * SPIRAL_SPLIT * SPIRAL_OFFSET_Y
    const spiralYResult = spiralYByRot + this.spiralYByScroll

    const positionBuffer = new Vector3
    this.calcItemPosition(i, spiralRotResult, spiralYResult, positionBuffer)

    const cameraY = SPIRAL_LOOP * SPIRAL_OFFSET_Y * SPIRAL_SPLIT / 2
    const spiralYByScrollSub = cameraY - positionBuffer.y

    const spiralYByScrollResult = this.spiralYByScroll + spiralYByScrollSub

    // this.spiralRot = spiralRotResult
    // this.spiralYByScroll = spiralYByScrollResult
    this.focusTargetIndex = i
    this.isInFocus = true
    gsap.to(this, {
      opacity: 0,
      spiralRot: spiralRotResult,
      cameraDist: CAMERA_DIST_ZOOM,
      spiralYByScroll: spiralYByScrollResult,
      duration: .5,
      onUpdate: () => {
        renderingSystem.camera.position.z = this.cameraDist
      },
      onComplete: () => {
        infoPanel.show(ITEMS[i].youtubeId)
      }
    })
  }

  getPointedObj() {
    const rayFrom = {
      x: this.pointerState.currentPos.x / innerWidth * 2 - 1,
      y: (this.pointerState.currentPos.y / innerHeight * 2 - 1) * -1
    }
    this.raycaster.setFromCamera(rayFrom, renderingSystem.camera)

    const objs = this.items.map(v => v.object)
    const intersected = this.raycaster.intersectObjects(objs)
    return intersected[0]
  }

  init() {
    this.items = ITEMS.map((v, i) => {
      return new SpiralItem(v, i, renderingSystem.scene)
    })

    infoPanel.closeBtn.addEventListener("click", () => {
      infoPanel.hide()
      gsap.to(this, {
        opacity: 1,
        cameraDist: CAMERA_DIST_DEFAULT,
        duration: .5,
        onUpdate: () => {
          renderingSystem.camera.position.z = this.cameraDist
        },
        onComplete: () => {
          this.isInFocus = false
        }
      })
    })
  }

  calcItemPosition(i: number, spiralRot: number, spiralY: number, position: Vector3) {
    const itemRot = SPIRAL_OFFSET_ANGLE_RAD * i + spiralRot
    const x = Math.sin(itemRot)
    const z = Math.cos(itemRot)
    let y = SPIRAL_OFFSET_Y * i + spiralY
    y %= SPIRAL_OFFSET_Y * SPIRAL_SPLIT * SPIRAL_LOOP
    if (y < 0) y += SPIRAL_OFFSET_Y * SPIRAL_SPLIT * SPIRAL_LOOP

    position.set(x, y, z)
  }

  calcSpiralPositionAndRotation(delta: number) {
    if (this.pointerState.down) {
      this.spiralVelocity.rot = this.pointerState.deltaPos.x * .008
      this.spiralVelocity.y = this.pointerState.deltaPos.y * .008 * -1

      this.spiralRot += this.spiralVelocity.rot
      this.spiralYByScroll += this.spiralVelocity.y
    } else {
      this.spiralRot += delta / 1000 * AUTO_GLOBAL_ROT_SPEED
      this.spiralRot += this.spiralVelocity.rot
      this.spiralYByScroll += this.spiralVelocity.y

      this.spiralVelocity.rot *= .95
      this.spiralVelocity.y *= .95
    }
  }

  exec(delta: number) {
    const rotRate = this.spiralRot / (Math.PI * 2)
    const spiralYByRot = rotRate * SPIRAL_SPLIT * SPIRAL_OFFSET_Y
    const spiralY = this.spiralYByScroll + spiralYByRot

    if (!this.isInFocus) this.calcSpiralPositionAndRotation(delta)

    this.items.forEach((v, i) => {
      this.calcItemPosition(i, this.spiralRot, spiralY, v.object.position)
      if (v.isPlane) v.ajustPlaneShape(this.spiralRot)
      else v.rotate()

      v.object.traverse(v => {
        const mat = ((v as Mesh).material as Material)
        if (mat) {
          mat.opacity = this.focusTargetIndex === i
            ? 1
            : this.opacity
        }
      })
    })

    if (this.pointerState.click && !this.isInFocus) {
      const t = this.getPointedObj()
      if (t) {
        console.log(t.object.userData)
        this.focusItem(t.object.userData.i)
      }
    }

    this.pointerState.update()
  }
}

const spiralSystem = new SpiralSystem
export default spiralSystem