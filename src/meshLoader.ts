import { Group } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
const gltfLoader = new GLTFLoader
// gltfLoader.loadAsync("filename")

export const loadedmeshes = {} as { [key: string]: Group }

export const load = async (file: string) => {
  const gltf = await gltfLoader.loadAsync(`/mesh/${file}`)
  loadedmeshes[file] = gltf.scene
}