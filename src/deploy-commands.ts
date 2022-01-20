import dotenv from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as Modules from './modules/index';

dotenv.config();

const { ENVIRONMENT, APPLICATION_ID, GUILD_ID, BOT_TOKEN } = process.env;

const commands: any[] = [];

Object.values(Modules).forEach((module) => {
  commands.push(module.command.toJSON());
});

if (!BOT_TOKEN) console.error('BOT_TOKEN is not defined');
if (!APPLICATION_ID) console.error('APPLICATION_ID is not defined');
if (!GUILD_ID) console.error('GUILD_ID is not defined');

if(BOT_TOKEN && APPLICATION_ID && GUILD_ID) {
  const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);
  const route = ENVIRONMENT === 'dev' ? Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID) : Routes.applicationCommands(APPLICATION_ID);
  rest.put(route, { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
}


