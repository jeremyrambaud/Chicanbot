import { Client, Interaction } from "discord.js";
import { command } from '../index';
import * as Modules from '../../index';

export const onInteractionCreate = (client: Client) => async (interaction: Interaction) => {
  if (!interaction.isCommand() || !interaction.guild || interaction.commandName !== command.name) return;

  const helpMessages: string[] = [];

  Object.values(Modules)
    .sort((a, b) => +a.command.name - +b.command.name)
    .forEach((module) => {
    helpMessages.push(`**/${module.command.name}** :\n${module.help}\n`)
  });

  const helpMessage = `__**List of all commands available for GérardBot :**__\n\n${helpMessages.join('\n')}`;

  interaction.reply({content: helpMessage, ephemeral: true})
};
