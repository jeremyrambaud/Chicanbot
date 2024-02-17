import { Client } from 'discord.js';

import { onInteractionCreate } from './events/onInteractionCreate';

export const setup = (client: Client) => {
  client.on('interactionCreate', onInteractionCreate(client));
};

export * from './command';
