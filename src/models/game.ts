import User from './user';

export default class Game {
  constructor(
    public players: { [key: string]: User },
    public active: boolean,
    public win: false,
    public coolDown: number,
    public embed?: any
  ) {
    this.players = players;
    this.active = true;
    this.win = false;
    this.coolDown = coolDown;
    this.embed = embed;
  }
}
