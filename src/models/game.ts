import Player from './player'

export default class Game {
  constructor(
    public players: { [key: string]: Player },
    public active: boolean,
    public win: false,
    public coolDown: number,
    public embed?: any,
    public attackEngaged?: boolean,
    public waitingRoom?: boolean,
    public stopped?: boolean
  ) {
    this.players = players
    this.active = false
    this.win = false
    this.coolDown = coolDown
    this.embed = embed
    this.attackEngaged = false
    this.waitingRoom = false
    this.stopped = false
  }
}
