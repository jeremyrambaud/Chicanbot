import { SlashCommandBuilder } from '@discordjs/builders';

const command = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a new poll.');

command.addStringOption((option) => option
	.setName('question')
	.setDescription('What is the subject of the poll ?')
	.setRequired(true)
);

for (let i = 0; i <= 20; i++) {
  command.addStringOption((option) => option
		.setName(`option_${(i+10).toString(36)}`)
		.setDescription(`Choice ${(i+10).toString(36).toUpperCase()}`)
	);
}

command.addMentionableOption((option) => option
	.setName('target')
	.setDescription('Role/user targeted by the poll.')
);

export default command;
