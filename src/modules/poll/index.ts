import { Client, Collection, Guild, GuildMember, MessageEmbed, MessageReaction, Role, User } from 'discord.js';
import { emojiIndicatorToLetter } from '../../utils/letterRegionalIndicator';

import { onInteractionCreate } from './events/onInteractionCreate';
import { onMessageReaction } from './events/onMessageReaction';

export const setup = (client: Client) => {
  client.on('interactionCreate', onInteractionCreate(client));
  client.on('messageReactionAdd', onMessageReaction(client));
  client.on('messageReactionRemove', onMessageReaction(client));
};

export const generateEmbed = async (
  guild: Guild,
  question: string,
  options: { name: string, value: string }[]|null,
  target: GuildMember|User|Role|null,
  reactions: Collection<string, MessageReaction>|null = null
) => {
  const messageEmbed = new MessageEmbed()
  .setColor('#1e88e5')
  .setTitle(`🗳️ ${question}`);

  let description = "";
  let targetedUsers: User[] = [];
  let listReactions: {
    letter: string|null,
    users: Collection<string, User>,
    count: number
  }[] = [];

  if(target) {
    await guild.members.fetch();

    switch(true) {
      case target instanceof Role:
        targetedUsers = (<Role>target).members
          .map((member) => member.user)
          .filter((member) => !member.bot);
        break;

      case target instanceof GuildMember:
        targetedUsers = [(<GuildMember>target).user];
        break;

      case target instanceof User:
        targetedUsers = [<User>target];
        break;

      default:
        break;
    }
  }

  let undecidedUsers: User[] = [...targetedUsers];

  if (reactions) {
    const reactionPromises = reactions.map(async (reaction) => {
      const letter = (reaction.emoji.name && emojiIndicatorToLetter(reaction.emoji.name)) || null;
      const reactionUsers = await reaction.users.fetch();
      const users = reactionUsers
        .filter(reactionUser => !reactionUser.bot && targetedUsers.map((targetedUser) => targetedUser.id).includes(reactionUser.id))
        .sort((a, b) => +a.username - +b.username);
      const userCount = users.size;

      listReactions.push({
        letter,
        users,
        count: userCount,
      });
      undecidedUsers = undecidedUsers.filter((user) => !reactionUsers.map((reactionUser) => reactionUser.id).includes(user.id));
    });

    await Promise.all(reactionPromises);

    console.log(listReactions);
  }

  const optionsLines: { [key: string]: string} = {};
  options?.forEach((option) => {
    const letter = option.name.replace('option_', '');
    let line = `**:regional_indicator_${letter}: ${option.value}**\n`;

    const reaction = listReactions.find((reaction) => reaction.letter === letter);
    if (reaction && reaction.count > 0) {
      line = `**:regional_indicator_${letter}: ${option.value} (${reaction.count})**\n*${reaction.users.map((user) => user.username).join(', ')}*\n`;
    }

    optionsLines[option.name.replace('option_', '')] = line;
    description += line;
  });

  if(target && undecidedUsers.length > 0) {
    description += `\n\n*❓ : ${undecidedUsers.map((undecidedUser) => undecidedUser.username).join(', ')}*`;
  }

  messageEmbed.setDescription(description);

  return messageEmbed;
}

export * from './command';
