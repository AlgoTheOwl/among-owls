# When AOWLS attack

## Plan

1. Complete planning document ✓
2. Set up repo with code boilerplate ✓
3. Set up Bot and test server on Discord ✓
4. Set up MongoDB instance to hold player/game state ✓
5. Create types for game ✓
6. Add mock data ✓
7. Add game logic ✓
8. Add message/embed logic ✓
9. Hook up registration and verification functionality ✓
10. Add copy/emojis/canvas goodness
11. Configure discord privledges ✓
12. Live testing
13. Onboarding to app with AOWL team
14. Release

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
