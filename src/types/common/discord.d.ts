import { Collection } from 'discord.js'

// Substitute missing discord types
declare module 'discord.js' {
  export interface Client {
    commands: Collection<unknown, any>
  }
}
