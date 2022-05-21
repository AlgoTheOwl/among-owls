import Canvas, { CanvasRenderingContext2D } from 'canvas'
import { Asset } from '../types/user'
import { readFile } from 'fs/promises'

const canvas = Canvas.createCanvas(0, 0)
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

export default async function doAttackCanvas(
  damage: number,
  asset: Asset,
  victimUsername: string,
  attackerUsername: string
) {
  const { localPath } = asset

  if (localPath) {
    // download Image
    const nftImage = await readFile(localPath)
    const canvasImg = new Canvas.Image()
    canvasImg.src = nftImage
    // size image
    canvas.width = 300
    canvas.height = 300
    // canvas.width = canvasImg.width
    // canvas.height = canvasImg.height
    // draw Image
    ctx.drawImage(canvasImg, 0, 0, canvas.width, canvas.height)
    // add text
    ctx.font = '15px sans-serif'

    // Select the style that will be used to fill the text in
    ctx.fillStyle = 'black'

    // Actually fill the text with a solid color
    ctx.fillText(`${victimUsername} takes ${damage} damage`, 75, 30)
  }
  // return
  return canvas
}
