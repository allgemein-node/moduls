import {IModuleRegistryOptions} from './IModuleRegistryOptions';

export const MODUL_REGISTRY_DEFAULT_OPTIONS: IModuleRegistryOptions = {

  paths: [],

  pattern: [],

  module: module,

  handleErrorOnDuplicate: 'skip'
};
