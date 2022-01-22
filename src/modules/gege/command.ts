import { SlashCommandBuilder } from '@discordjs/builders';

export const command = new SlashCommandBuilder()
  .setName('gege')
  .setDescription('List all commands available with GérardBot.');

command.addBooleanOption((option) => option
	.setName('show_everyone')
	.setDescription('Display the list of commands to everybody in the channel.')
);

export const help =
`List all commands available with GérardBot.
By default the list is only visible to the user who executed the command.
To show the list to a whole channel, set the \`showEveryone\`to true`;
