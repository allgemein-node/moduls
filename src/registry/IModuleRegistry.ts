import {ModuleDescriptor} from './ModuleDescriptor';
import {IRequireOptions} from '../loader/require/IRequireOptions';
import {IClassesOptions} from '../loader/classes/IClassesOptions';
import {ISettingsOptions} from '../loader/settings/ISettingsOptions';
import {IRequireLoader} from '../loader/require/IRequireLoader';
import {IClassesLoader} from '../loader/classes/IClassesLoader';
import {ISettingsLoader} from '../loader/settings/ISettingsLoader';
import {IModuleRegistryOptions} from './IModuleRegistryOptions';

export interface IModuleRegistry {

  getModules(): ModuleDescriptor[];

  getOptions(): IModuleRegistryOptions;

  rebuild(): Promise<IModuleRegistry>;

  createRequireLoader?(options?: IRequireOptions): Promise<IRequireLoader>;

  createClassesLoader?(options?: IClassesOptions): Promise<IClassesLoader>;

  createSettingsLoader?(options?: ISettingsOptions): Promise<ISettingsLoader>;

}
