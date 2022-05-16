# When AOWLS attack

## Plan

1. Complete planning document
2. Set up repo - copy in boilerplate
3. Set up Bot and test server on Discord
4. Create types for game
5. Create game logic
6. Hook up registration and verification functionality

## Concept

- Up to 10 players can register and join game at one time
- Players can attack other players
- Last player standing loses
- HP is regenerated each round
- Players can see HP
- When a player is dead we send a message and disable them from gameplay
- the NFT attacking other nfts is visualized

## Stack

- NodeJS
- DiscordJS
- MongoDB
- TypeScript

## Technical Requirements

## Problems to solve

- Can we visualize players attacking in time? Cooldown could be longer
- Can we get server data in our deployCommands?
- Game master will have to set the number of registrants in the deploycommands - we can also do error handling for
  players not in the game
