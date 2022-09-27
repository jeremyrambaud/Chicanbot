import { SlashCommandBuilder } from '@discordjs/builders';

export const command = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a new poll.');

command.addStringOption((option) => option
	.setName('question')
	.setDescription('What is the subject of the poll ?')
	.setRequired(true)
);

command.addMentionableOption((option) => option
	.setName('target')
	.setDescription('Role/user targeted by the poll.')
);

for (let i = 0; i <= 20; i++) {
  command.addStringOption((option) => option
		.setName(`option_${(i+10).toString(36)}`)
		.setDescription(`Choice ${(i+10).toString(36).toUpperCase()}`)
	);
}

export const help =
`Create a poll with up to 20 options.
You can add 20 poll options (\`option_a\` to \`option_u\`).
To target a specific role or user and enable the list of users who haven't voted yet, use the option \`target\`.`;
