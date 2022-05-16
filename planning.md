# When AOWLS attack

## Plan

1. Complete planning document
2. Set up repo - copy in boilerplate
3. Set up Bot and test server on Discord
4. Create types for game
5. Add mock data
6. Add game logic
7. Add message/embed logic
8. Hook up registration and verification functionality
9. Live testing
10. Onboarding to app with AOWL team
11. Release

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

### MVP

- Complete short-running version of the game
- Render players entered NFT in gameplay
- Have registration and verification functionality
- Functions with up to 10 players

## Next Steps

- Add long-play passive mode
- Add image manipulation
- Increase support for number of players

## Problems to solve

q: Can we visualize players attacking in time?
a: Utilize a longer cooldown

q: Can we get server data in our deployCommands?
a: No, we can have a set of 10 options that map to a players number in the embed
