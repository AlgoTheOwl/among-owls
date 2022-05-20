import Canvas, { CanvasRenderingContext2D } from 'canvas'
import { Asset } from '../types/user'

const canvas = Canvas.createCanvas(0, 0)
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

export default function doAttackCanvas(
  damage: number,
  asset: Asset,
  username: string
) {
  return canvas
}
