import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { generateEmbed } from "../index";
import Poll from "../model/Poll";

export const onMessageReaction = (client: Client) => async (messageReaction: MessageReaction|PartialMessageReaction, user: User|PartialUser) => {
  const message = messageReaction.message;
  if(user.bot || !(['TextChannel', 'ThreadChannel'].includes(message.channel.constructor.name)) || !message.guild) return;

  const poll = await Poll.findOne({ messageId: message.id });
  if (!poll) return;

  const question = poll.get('question');
  const options = poll.get('options').map((item: any) => ({name: item.get('name'), value: item.get('value')}));
  const targetInfos = poll.get('target')?.toObject();

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
};
