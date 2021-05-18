import {find, isArray, orderBy} from 'lodash';
import {ModuleDescriptor} from '../registry/ModuleDescriptor';
import {AbstractModuleHandle} from './AbstractModuleHandle';
import {ModuleRegistry} from '../registry/ModuleRegistry';
import {IModuleOptions} from './IModuleOptions';
import {IModuleLoader} from './IModuleLoader';

export abstract class AbstractModuleLoader<T extends AbstractModuleHandle, OPT extends IModuleOptions> implements IModuleLoader<T> {

  _options: OPT;

  protected readonly registry: ModuleRegistry;

  _handles: T[] = [];

  constructor(registry: ModuleRegistry, options?: OPT) {
    this.registry = registry;
    this._options = options || <OPT>{};
  }

  handles(): T[] {
    return this._handles;
  }

  add(handle: T) {
    if (handle) {
      let exists = find(this._handles, (x) => {
        return x.module.name === handle.module.name;
      });
      if (!exists) {
        this._handles.push(handle);
        // correct order if necessary
        this._handles = orderBy(this._handles, [
          x => x.module.weight,
          x => x.module.child_modules.length,
          x => x.module.id
        ], ['asc', 'asc', 'asc']);
      } else {
        throw new Error('handle for module ' + handle.module.name + ' already loaded');
      }
    }
    return handle;
  }

  protected abstract loadOne(modul: ModuleDescriptor): Promise<T>;

  load(module: ModuleDescriptor): Promise<T> ;
  load(modules: ModuleDescriptor[]): Promise<T[]> ;
  load(modules: ModuleDescriptor | ModuleDescriptor[]): Promise<T | T[]> {
    if (isArray(modules)) {
      const promises = [];
      for (let x of modules) {
        if (this._options.filter && !this._options.filter(x)) {
          continue;
        }
        promises.push(this._loadOne(x));
      }
      return Promise.all(promises);
    } else {
      return this._loadOne(modules);
    }
  }


  private async _loadOne(modules: ModuleDescriptor) {
    let res = null;
    let y = await this.loadOne(modules);
    try {
      res = this.add(y);
    } catch (err) {
      if (this.registry.options().handleErrorOnDuplicate) {
        switch (this.registry.options().handleErrorOnDuplicate) {
          case 'skip':
            break;
          case 'log':
            console.error(err);
            break;
          default:
            throw err;
        }
      } else {
        throw err;
      }
    }
    return res;
  }

}
