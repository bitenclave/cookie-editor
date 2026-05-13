import { profileCardMethods } from './profiles/cards.js';
import { profileRenderMethods } from './profiles/rendering.js';

export const profileRenderingMethods = {
  ...profileRenderMethods,
  ...profileCardMethods,
};
