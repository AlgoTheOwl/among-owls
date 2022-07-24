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
    public stopped?: boolean,
    public megatron?: any,
    public arena?: any,
    public update?: boolean
  ) {
    this.players = players
    this.active = false
    this.win = false
    this.coolDown = coolDown
    this.embed = embed
    this.megatron = megatron
    this.attackEngaged = false
    this.waitingRoom = false
    this.arena = arena
    this.stopped = false
    this.update = false
  }
}
