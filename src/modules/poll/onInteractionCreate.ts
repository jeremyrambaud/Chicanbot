import { Client, GuildMember, Interaction, Message, MessageEmbed, MessageReaction, Role, User } from "discord.js";
import { letterToEmojiIndicator } from "../../utils/letterRegionalIndicator";
import { command, generateEmbed } from './index';
import Poll from './model/Poll';

const allowedTargetType = (target: any) => target instanceof Role || target instanceof GuildMember || target instanceof User;

export const onInteractionCreate = (client: Client) => async (interaction: Interaction) => {
  if (!interaction.isCommand() || !interaction.guild || interaction.commandName !== command.name) return;

  const question = interaction.options.getString('question');
  if(!question) return;

  const target = interaction.options.getMentionable('target');
  const targetInfos = allowedTargetType(target) ? {
    id: (<Role|GuildMember|User>target).id,
    type: (<Role|GuildMember|User>target).constructor.name,
  } : null;
  const targetObject = allowedTargetType(target) ? <Role|GuildMember|User>target : null;

  const options = interaction.options.data
    .filter((option) => option.name.substring(0, 7) === 'option_')
    .map((option) => ({
      name: option.name,
      value: <string>option.value
    }));

  const messageEmbed = await generateEmbed(interaction.guild, question, options, targetObject);

  const message = await interaction.reply({ content: target?.toString(), embeds: [messageEmbed], fetchReply: true });
  if (!(message instanceof Message)) return;

  const poll = new Poll({
    messageId: message.id,
    question: question,
    target: targetInfos,
    options: options
  });
  poll.save();

  options.forEach((option) => {
    message.react(letterToEmojiIndicator(option.name.replace('option_', '')));
  });

  // const collector = message.createReactionCollector({
  //   filter: (reaction, user) => !!(reaction.emoji.name && reactions.includes(reaction.emoji.name) && !user.bot),
  //   dispose: true,
  // });

  // const handleReaction = async (type: string, reaction: MessageReaction, user: User) => {
  //   const newResponse = response;
  //   const letter = reaction.emoji.name && emojiIndicatorToLetter(reaction.emoji.name);
  //   if (!letter) return;

  //   const line = optionsLines[letter];
  //   const reactionUsers = await reaction.users.fetch();
  //   const users = reactionUsers
  //     .filter(reactionUser => !reactionUser.bot)
  //     .sort((a, b) => +a.username - +b.username);
  //   const userCount = users.size;

  //   const regex = new RegExp(`\\*\\*:regional_indicator_${letter}:.+(?:\n|$)(?:\\*[^\\*]+?\\*\n?)?`, 'g');

  //   let newLine = line;
  //   if (userCount > 0) {
  //     let userListLine = '';
  //     users.forEach((sortedUser) => userListLine += userListLine === '' ? sortedUser.username : `, ${sortedUser.username}`);

  //     newLine = `${line.replace('**\n', '')} (${userCount})**\n*${userListLine}*\n`;
  //   }

  //   newResponse.description && newResponse.setDescription(newResponse.description.replace(regex, newLine));

  //   // const regexAffected = new RegExp('\\*❓[^\\*]+\\*', 'g');
  //   // newResponse.description && newResponse.setDescription(newResponse.description.replace(regexAffected, `\n\n*❓ : ${undecidedList.slice(0, -2)}*`));

  //   message.edit({ embeds: [newResponse]})
  //   console.log(`${type} ${reaction.emoji.name} from ${user.tag}`);
  // }

  // collector.on('collect', (reaction, user) => handleReaction('collect', reaction, user));
  // collector.on('remove', (reaction, user) => handleReaction('remove', reaction, user));
};
