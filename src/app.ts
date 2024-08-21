import { MODELS } from "./define";
import { load } from "./meshLoader";
import renderingSystem from "./renderingSystem";
import spiralSystem from "./spiralSystem";
Promise
  .all(MODELS.map(v => load(v)))
  .then(() => {
    spiralSystem.init()

    let lastTime = 0
    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime
      lastTime = currentTime
      spiralSystem.exec(delta)
      renderingSystem.exec()
      requestAnimationFrame(loop)
    }
    loop(0)
  })

