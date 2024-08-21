export const SPIRAL_LOOP = 8
export const SPIRAL_SPLIT = 8
export const SPIRAL_OFFSET_Y = .1
export const SPIRAL_OFFSET_ANGLE_RAD = Math.PI * 2 / SPIRAL_SPLIT
export const NUM_TOTAL_ITEM = SPIRAL_SPLIT * SPIRAL_LOOP
export const PLANE_ASPECT = 16 / 9
export const AUTO_GLOBAL_ROT_SPEED = .1
export const CAMERA_DIST_DEFAULT = 5.5
export const CAMERA_DIST_ZOOM = 2.87
export const MODELS = ["dog.glb", "rabit.glb", "rion.glb"]

export const ITEMS = Array(NUM_TOTAL_ITEM).fill(0)
  .map((v, i) => {
    if (i < 3) {
      return { title: `DummyTitle${i}`, model: MODELS[i] }
    }

    const j = i.toString().padStart(2, "2")
    return {
      title: `DummyTitle${i}`,
      texture: `dummy${j}.svg`,
      youtubeId: "BFNekjEgvuk",
    }
  })