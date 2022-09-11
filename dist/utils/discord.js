"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRole = exports.removeRole = exports.addRole = void 0;
/**
 * Adds role to specified Discord user
 * @param interaction
 * @param roleId
 * @param user
 */
const addRole = async (interaction, roleId, user) => {
    var _a, _b;
    try {
        const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.id === roleId);
        const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === user.discordId);
        role && (await (member === null || member === void 0 ? void 0 : member.roles.add(role.id)));
    }
    catch (error) {
        console.log('****** ERROR ADDING ROLE ******', error);
    }
};
exports.addRole = addRole;
/**
 * Removes role from specified Discord user
 * @param interaction
 * @param roleId
 * @param discordId
 */
const removeRole = async (interaction, roleId, discordId) => {
    var _a, _b;
    try {
        const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((role) => role.id === roleId);
        const member = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find((member) => member.id === discordId);
        role && (await (member === null || member === void 0 ? void 0 : member.roles.remove(role.id)));
    }
    catch (error) {
        console.log('****** ERROR DELETING ROLE ******', error);
    }
};
exports.removeRole = removeRole;
/**
 * Validates if Discord user has role
 * @param roleId
 * @param interaction
 * @param discordId
 * @returns {Boolean}
 */
const validateUserRole = (roleId, interaction, discordId) => {
    var _a;
    const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.find((member) => member.id === discordId);
    return member === null || member === void 0 ? void 0 : member.roles.cache.has(roleId);
};
exports.validateUserRole = validateUserRole;
