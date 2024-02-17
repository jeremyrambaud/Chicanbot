import dotenv from 'dotenv'
import { Client, Intents } from "discord.js";
import mongoose from 'mongoose';

import * as Modules from './modules/index';

dotenv.config();

const { BOT_TOKEN, MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT, MONGODB_DB } = process.env;

await mongoose.connect(`mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`);

// The Client and Intents are destructured from discord.js, since it exports an object by default. Read up on destructuring here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
const client: Client = new Client({
  /*
    Partials makes the client auto cache the ID of messages, channels, reactions, users, and guild_members.
    This will fire events for partials that haven't yet been processed by the bot.
    This will also ensure that messages sent before the bot started are taken into account when reacting to message_reactions.
  */
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS
  ]
});

// Setup all command modules.
Object.values(Modules).forEach((module) => {
  module.setup(client);
});

client.on('ready', async ()  => {
  console.info(`Client ready`);

  // Set presence message
  client.user?.setPresence({
    afk: false,
    activities: [{
      type: 'WATCHING',
      name: `/chichi`,
    }],
    status: 'online',
  });
});

client.on('guildCreate', (guild) => {
  guild.systemChannel?.send(`🤖 Chicanbot activated !\nUse \`/chichi\` to get a list of all commands currently available.`);
});

// Login
client.login(BOT_TOKEN)
  .then(() => console.info(`Login successful`))
  .catch((err) => console.error(`Login failed: ${err}`));
