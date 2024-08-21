class InfoPanel {
  infoPanel = document.querySelector(".infoPanel") as HTMLDivElement
  youtubeWrap = document.querySelector(".youtubeWrap") as HTMLDivElement
  closeBtn = document.querySelector(".closeWrap button") as HTMLButtonElement

  show(youtubeId?: string) {
    if (youtubeId) {
      const iframe = document.createElement("iframe")
      iframe.src = `https://www.youtube.com/embed/${youtubeId}`

      this.youtubeWrap.innerHTML = ""
      this.youtubeWrap.append(iframe)

      iframe.addEventListener("load", () => {
        this.infoPanel.classList.remove("hide")
      })
    } else {
      this.youtubeWrap.innerHTML = ""
      this.infoPanel.classList.remove("hide")
    }
  }

  hide() {
    this.infoPanel.classList.add("hide")
  }
}

const infoPanel = new InfoPanel
export default infoPanel