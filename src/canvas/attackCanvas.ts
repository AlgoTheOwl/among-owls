import {
  createCanvas,
  CanvasRenderingContext2D,
  registerFont,
  Image,
} from 'canvas'
import { Asset } from '../types/user'
import { readFile } from 'fs/promises'
import { randomNumber } from '../utils/helpers'

const owlReplies = [
  'HOOOOOOT!!!',
  'SCREEETCH!!!',
  'RAAWWRRR!!!',
  'CHIIIIIIRP!!!',
]

export default async function doAttackCanvas(
  damage: number,
  asset: Asset,
  victimUsername: string,
  attackerUsername: string
) {
  const { localPath } = asset
  registerFont('src/canvas/fonts/permenent-marker.ttf', {
    family: 'permanent-marker',
  })
  const canvas = createCanvas(300, 300)

  if (localPath) {
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')
    // download Image
    const nftImage = await readFile(localPath)
    const canvasImg = new Image()
    canvasImg.src = nftImage
    // draw Image
    ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height)
    // add text
    ctx.font = '45px permanent-marker'
    // Select the style that will be used to fill the text in
    ctx.fillStyle = 'red'

    const text = owlReplies[randomNumber(0, owlReplies.length)]
    // Actually fill the text with a solid color
    ctx.fillText(text, 5, 50)
  }
  return canvas
}
