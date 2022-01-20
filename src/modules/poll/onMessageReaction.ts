import { Client, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, ThreadChannel, User } from "discord.js";
import { generateEmbed } from ".";
import Poll from "./model/Poll";

export const onMessageReaction = (client: Client) => async (messageReaction: MessageReaction|PartialMessageReaction, user: User|PartialUser) => {
  const message = messageReaction.message;
  if(user.bot || !(['TextChannel', 'ThreadChannel'].includes(message.channel.constructor.name)) || !message.guild) return;

  const poll = await Poll.findOne({ messageId: message.id });
  if (!poll) return;

  const question = poll.get('question');
  const options = poll.get('options').map((item: any) => ({name: item.get('name'), value: item.get('value')}));
  const targetInfos = poll.get('target').toObject();

  let targetObject = null;
  switch(targetInfos?.type) {
    case 'Role':
      targetObject = await message.guild?.roles.fetch(targetInfos.id);
      break;

    case 'GuildMember':
      targetObject = await message.guild?.members.fetch(targetInfos.id);
      break;

    case 'User':
      targetObject = await client.users.fetch(targetInfos.id);
      break;

    default:
      break;
  }

  const messageEmbed = await generateEmbed(message.guild, question, options, targetObject, message.reactions.cache);

  message.edit({ embeds: [messageEmbed]})


  // const newMessageEmbed = messageEmbed;
  // const letter = messageReaction.emoji.name && emojiIndicatorToLetter(messageReaction.emoji.name);
  // if (!letter) return;

  // const line = optionsLines[letter];
  // const reactionUsers = await messageReaction.users.fetch();
  // const users = reactionUsers
  //   .filter(reactionUser => !reactionUser.bot)
  //   .sort((a, b) => +a.username - +b.username);
  // const userCount = users.size;

  // const regex = new RegExp(`\\*\\*:regional_indicator_${letter}:.+(?:\n|$)(?:\\*[^\\*]+?\\*\n?)?`, 'g');

  // let newLine = line;
  // if (userCount > 0) {
  //   let userListLine = '';
  //   users.forEach((sortedUser) => userListLine += userListLine === '' ? sortedUser.username : `, ${sortedUser.username}`);

  //   newLine = `${line.replace('**\n', '')} (${userCount})**\n*${userListLine}*\n`;
  // }

  // newMessageEmbed.description && newMessageEmbed.setDescription(newMessageEmbed.description.replace(regex, newLine));

  // // const regexAffected = new RegExp('\\*❓[^\\*]+\\*', 'g');
  // // newMessageEmbed.description && newMessageEmbed.setDescription(newMessageEmbed.description.replace(regexAffected, `\n\n*❓ : ${undecidedList.slice(0, -2)}*`));

};
