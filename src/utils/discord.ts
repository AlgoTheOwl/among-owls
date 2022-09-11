import { Interaction } from 'discord.js'
import User from '../models/user'

/**
 * Adds role to specified Discord user
 * @param interaction
 * @param roleId
 * @param user
 */
export const addRole = async (
  interaction: Interaction,
  roleId: string,
  user: User
): Promise<void> => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === roleId
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === user.discordId
    )
    role && (await member?.roles.add(role.id))
  } catch (error) {
    console.log('****** ERROR ADDING ROLE ******', error)
  }
}

/**
 * Removes role from specified Discord user
 * @param interaction
 * @param roleId
 * @param discordId
 */
export const removeRole = async (
  interaction: Interaction,
  roleId: string,
  discordId: string
): Promise<void> => {
  try {
    const role = interaction.guild?.roles.cache.find(
      (role) => role.id === roleId
    )
    const member = interaction.guild?.members.cache.find(
      (member) => member.id === discordId
    )
    role && (await member?.roles.remove(role.id))
  } catch (error) {
    console.log('****** ERROR DELETING ROLE ******', error)
  }
}

/**
 * Validates if Discord user has role
 * @param roleId
 * @param interaction
 * @param discordId
 * @returns {Boolean}
 */
export const validateUserRole = (
  roleId: string,
  interaction: Interaction,
  discordId: string
): boolean | undefined => {
  const member = interaction.guild?.members.cache.find(
    (member) => member.id === discordId
  )
  return member?.roles.cache.has(roleId)
}
