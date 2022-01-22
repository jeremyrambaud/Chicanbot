import { SlashCommandBuilder } from '@discordjs/builders';

export const command = new SlashCommandBuilder()
  .setName('gege')
  .setDescription('List all commands available with GérardBot.');

export const help = command.description;
