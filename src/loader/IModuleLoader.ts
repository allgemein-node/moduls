import {ModuleDescriptor} from '../registry/ModuleDescriptor';

export interface IModuleLoader<T> {
  load(module: ModuleDescriptor): Promise<T>;

  load(modules: ModuleDescriptor[]): Promise<T[]>;

  load(modules: ModuleDescriptor | ModuleDescriptor[]): Promise<T | T[]>;

}
