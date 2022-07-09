"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWin = void 0;
const __1 = require("..");
const database_service_1 = require("../database/database.service");
const helpers_1 = require("../utils/helpers");
const settings_1 = __importDefault(require("../settings"));
const embeds_1 = __importDefault(require("../embeds"));
const embeds_2 = __importDefault(require("../constants/embeds"));
const handleWin = async (player, winByTimeout, game) => {
    const { imageDir, hootSettings } = settings_1.default;
    const { hootOnWin } = hootSettings;
    // handle win
    game.active = false;
    __1.intervals.timeoutInterval && clearInterval(__1.intervals.timeoutInterval);
    // Increment score and hoot of winning player
    const winningUser = (await database_service_1.collections.users.findOne({
        _id: player.userId,
    }));
    const currentHoot = winningUser.hoot ? winningUser.hoot : 0;
    const updatedScore = winningUser.yaoWins ? winningUser.yaoWins + 1 : 1;
    const updatedHoot = currentHoot + hootOnWin;
    console.log('updated hoot', updatedHoot);
    await database_service_1.collections.users.findOneAndUpdate({ _id: player.userId }, { $set: { yaoWins: updatedScore, hoot: updatedHoot } });
    const playerArr = Object.values(game.players);
    (0, helpers_1.resetGame)();
    (0, helpers_1.emptyDir)(imageDir);
    setAssetTimeout(playerArr);
    return game.embed.edit((0, embeds_1.default)(embeds_2.default.win, { winByTimeout, player }));
};
exports.handleWin = handleWin;
const setAssetTimeout = async (players) => {
    // For each player set Asset timeout on user
    await (0, helpers_1.asyncForEach)(players, async (player) => {
        const { userId, asset } = player;
        const { assetId } = asset;
        const { assetCooldown } = settings_1.default;
        const coolDownDoneDate = Date.now() + assetCooldown * 60000;
        const user = await database_service_1.collections.users.findOne({ _id: userId });
        await database_service_1.collections.users.findOneAndUpdate({ _id: userId }, {
            $set: {
                coolDowns: Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.coolDowns), { [assetId]: coolDownDoneDate }),
            },
        });
    });
};
