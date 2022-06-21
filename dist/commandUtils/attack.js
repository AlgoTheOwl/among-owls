"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attack = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = __importDefault(require("../embeds"));
const helpers_1 = require("../utils/helpers");
const __1 = require("..");
const settings_1 = __importDefault(require("../settings"));
const __2 = require("..");
const __3 = require("..");
const { timeoutInterval, coolDownInterval, hp, damagePerAowl, waitBeforeTimeoutInterval, kickPlayerTimeout, deathDeleteInterval, } = settings_1.default;
const attackStrings = [
    'HOOT, HOOT! {assetName} slashes at {victimName} for {damage} damage',
    'HI-YAH!. {assetName} karate chops at {victimName} for {damage} damage',
    'SCREEEECH!. {assetName} chucks ninja stars at {victimName} for {damage} damage',
    'HMPH!. {assetName} throws a spear at {victimName} for {damage} damage',
    'SL-SL-SL-IIICE!. {assetName} slices and dices you {victimName} for {damage} damage',
];
const errorMessages = {
    attackSelf: `Owls are supposed to be wise, but you’re clearly not. You can’t attack yourself!`,
    unRegistered: 'Please register by using the /register slash command to attack',
    victimUnRegistered: 'Intended victim is currently not registered, please try attacking another player',
    attackerDead: `You can't attack, you're dead!`,
    victimDead: `Your intended victim is already dead!`,
    timedOut: `Unfortunately, you've timed out due to inactivty.`,
    victimTimedOut: 'Unfortunately, this player has timed out due to inactivity',
    coolingDown: `HOO do you think you are? It's not your turn! Wait {seconds} seconds`,
    gameNotStarted: `HOO do you think you are? The game hasn’t started yet!`,
    noVictim: `Please select a victim before attacking!`,
};
const attack = async (interaction, random) => {
    var _a;
    if (!__1.game.active) {
        return interaction.reply({
            content: errorMessages.gameNotStarted,
            ephemeral: true,
        });
    }
    const { user } = interaction;
    const { id: attackerId } = user;
    const victimId = random
        ? getRandomVictimId(attackerId)
        : ((_a = __1.game === null || __1.game === void 0 ? void 0 : __1.game.players[user.id]) === null || _a === void 0 ? void 0 : _a.victimId) || null;
    if (!victimId && !random) {
        return interaction.reply({
            content: errorMessages.noVictim,
            ephemeral: true,
        });
    }
    if (!victimId)
        return;
    const victim = __1.game.players[victimId] ? __1.game.players[victimId] : null;
    const attacker = __1.game.players[attackerId] ? __1.game.players[attackerId] : null;
    const stillCoolingDown = (attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) && (attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) > 0;
    const playerArr = Object.values(__1.game.players);
    const attackRow = [];
    let victimDead;
    let isWin;
    // Begin watching for player inactivity
    handlePlayerTimeout(attackerId, timeoutInterval);
    if (!__1.game.attackEngaged) {
        doPlayerTimeout(attackerId);
        __1.game.attackEngaged = true;
    }
    // Handle errors
    let content;
    if (victimId === attackerId)
        content = errorMessages.attackSelf;
    if (!attacker)
        content = errorMessages.unRegistered;
    if (!victim)
        content = errorMessages.victimUnRegistered;
    if (attacker === null || attacker === void 0 ? void 0 : attacker.dead)
        content = errorMessages.attackerDead;
    if (victim === null || victim === void 0 ? void 0 : victim.dead)
        content = victimDead;
    if ((attacker === null || attacker === void 0 ? void 0 : attacker.coolDownTimeLeft) && stillCoolingDown)
        content = errorMessages.coolingDown.replace('{seconds}', (attacker.coolDownTimeLeft / 1000).toString());
    if (attacker === null || attacker === void 0 ? void 0 : attacker.timedOut)
        content = errorMessages.timedOut;
    if (victim === null || victim === void 0 ? void 0 : victim.timedOut)
        content = errorMessages.victimTimedOut;
    if (content)
        return interaction.reply({ content, ephemeral: true });
    if (victim && attacker) {
        handlePlayerCooldown(attackerId, coolDownInterval);
        const damage = doDamage(attacker);
        // const damage = 1000
        victim.hp -= damage;
        victimDead = false;
        if (victim.hp <= 0) {
            victim.dead = true;
            victimDead = true;
        }
        attacker.victimId = undefined;
        if (victimDead && attacker) {
            const attachment = new discord_js_1.MessageAttachment('src/images/death.gif', 'death.gif');
            await interaction.reply({
                files: [attachment],
                content: `${attacker.asset.assetName} took ${victim.username} in one fell swoop. Owls be swoopin'`,
            });
            setTimeout(() => {
                interaction.deleteReply();
            }, deathDeleteInterval);
        }
        else {
            interaction.deferUpdate();
        }
        const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
        isWin = !!winningPlayer;
        if (isWin && winningPlayer && __1.game.active) {
            return (0, helpers_1.handleWin)(winningPlayer, winByTimeout, __1.game);
        }
        // push attack value into embed
        attackRow.push({
            name: 'ATTACK',
            value: getAttackString(attacker.asset.assetName, victim.username, damage),
        });
    }
    const fields = [...(0, helpers_1.mapPlayersForEmbed)(playerArr), ...attackRow];
    const embedData = {
        color: 'RED',
        fields,
        image: undefined,
        isMain: true,
    };
    await __1.game.embed.edit((0, embeds_1.default)(embedData));
};
exports.attack = attack;
const getAttackString = (assetName, victimName, damage) => {
    return attackStrings[(0, helpers_1.randomNumber)(0, attackStrings.length)]
        .replace('{assetName}', assetName)
        .replace('{victimName}', victimName)
        .replace('{damage}', damage.toString());
};
const handlePlayerTimeout = (playerId, timeoutInterval) => {
    const gamePlayer = __1.game.players[playerId];
    clearTimeout(__2.playerTimeouts[playerId]);
    if (gamePlayer) {
        gamePlayer.rolledRecently = true;
        const rolledRecentlyTimeout = setTimeout(async () => {
            gamePlayer.rolledRecently = false;
        }, timeoutInterval);
        __2.playerTimeouts[playerId] = rolledRecentlyTimeout;
    }
};
const handlePlayerCooldown = async (playerId, coolDownInterval) => {
    const gamePlayer = __1.game.players[playerId];
    gamePlayer.coolDownTimeLeft = coolDownInterval;
    while (gamePlayer.coolDownTimeLeft >= 0) {
        await (0, helpers_1.wait)(1000);
        gamePlayer.coolDownTimeLeft -= 1000;
    }
};
const doPlayerTimeout = async (id) => {
    await (0, helpers_1.wait)(waitBeforeTimeoutInterval);
    __3.intervals.timeoutInterval = setInterval(async () => {
        if (__1.game.active) {
            let isTimeout = false;
            (0, helpers_1.getPlayerArray)(__1.game.players).forEach((player) => {
                if (!player.rolledRecently && !player.timedOut) {
                    __1.game.players[player.discordId].timedOut = true;
                    isTimeout = true;
                }
            });
            const playerArr = (0, helpers_1.getPlayerArray)(__1.game.players);
            const { winningPlayer, winByTimeout } = (0, helpers_1.getWinningPlayer)(playerArr);
            // If win
            if (winningPlayer && __1.game.active) {
                __3.intervals.timeoutInterval && clearInterval(__3.intervals.timeoutInterval);
                return (0, helpers_1.handleWin)(winningPlayer, winByTimeout, __1.game);
            }
            const usersTimedOut = playerArr.filter((player) => player.timedOut);
            // If everyone timed out
            if (playerArr.length === usersTimedOut.length) {
                const embedData = {
                    image: undefined,
                    title: 'BOOOO!!!',
                    description: 'Game has ended due to all players being removed for inactivity',
                };
                __1.game.embed.edit((0, embeds_1.default)(embedData));
                __1.game.active = false;
                __3.intervals.timeoutInterval && clearInterval(__3.intervals.timeoutInterval);
                return;
            }
            if (playerArr.length && isTimeout) {
                const embedData = {
                    fields: (0, helpers_1.mapPlayersForEmbed)((0, helpers_1.getPlayerArray)(__1.game.players)),
                    image: undefined,
                };
                __1.game.embed.edit((0, embeds_1.default)(embedData));
            }
        }
    }, kickPlayerTimeout);
};
const doDamage = (player) => {
    const { assetMultiplier } = player;
    const multiplierDamage = (assetMultiplier >= 20 ? 20 : assetMultiplier) * damagePerAowl;
    return Math.floor(Math.random() * (hp / 10)) + multiplierDamage;
};
const getRandomVictimId = (attackerId) => {
    const filteredPlayerArray = Object.values(__1.game.players).filter((player) => player.discordId !== attackerId && !player.timedOut && !player.dead);
    const randomIndex = Math.floor(Math.random() * filteredPlayerArray.length);
    return filteredPlayerArray[randomIndex].discordId;
};
