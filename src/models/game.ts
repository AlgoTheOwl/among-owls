import Player from './player'

export default class Game {
  constructor(
    public players: { [key: string]: Player },
    public active: boolean,
    public win: false,
    public coolDown: number,
    public embed?: any
  ) {
    this.players = players
    this.active = true
    this.win = false
    this.coolDown = coolDown
    this.embed = embed
  }
}
