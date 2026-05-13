import { profileActionMethods } from './profiles/actions.js';
import { profileBulkMethods } from './profiles/bulk.js';
import { profileSelectionMethods } from './profiles/selection.js';
import { profileStoreMethods } from './profiles/store.js';

export const profileMethods = {
  ...profileStoreMethods,
  ...profileSelectionMethods,
  ...profileBulkMethods,
  ...profileActionMethods,
};
