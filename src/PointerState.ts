export default class PointerState {
  down = false
  click = false
  preventClick = false
  downStartPos = { x: 0, y: 0 }
  currentPos = { x: 0, y: 0 }
  lastPos = { x: 0, y: 0 }
  deltaPos = { x: 0, y: 0 }

  constructor() {
    const target = document.body
    target.addEventListener("pointerdown", e => {
      this.currentPos.x = e.clientX
      this.currentPos.y = e.clientY
      this.lastPos.x = e.clientX
      this.lastPos.y = e.clientY
      if (e.button === 0) {
        this.down = true
        this.click = false
        this.preventClick = false
      }
      Object.assign(this.downStartPos, this.currentPos)
    })

    target.addEventListener("pointermove", e => {
      this.currentPos.x = e.clientX
      this.currentPos.y = e.clientY

      const dist = Math.sqrt((this.currentPos.x - this.downStartPos.x) ** 2
        + (this.currentPos.y - this.downStartPos.y) ** 2)

      if (dist > 3) this.preventClick = true
    })

    target.addEventListener("pointerup", e => {
      this.currentPos.x = e.clientX
      this.currentPos.y = e.clientY
      if (e.button === 0) {
        this.down = false
        if (!this.preventClick) this.click = true
      }
    })
  }

  update() {
    this.deltaPos.x = this.currentPos.x - this.lastPos.x
    this.deltaPos.y = this.currentPos.y - this.lastPos.y
    Object.assign(this.lastPos, this.currentPos)

    this.click = false
  }
}