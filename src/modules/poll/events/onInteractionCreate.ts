import { Client, GuildMember, Interaction, Message, Role, User } from "discord.js";
import { letterToEmojiIndicator } from "../../../utils/letterRegionalIndicator";
import { command, generateEmbed } from '../index';
import Poll from '../model/Poll';

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
};
