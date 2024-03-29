import {isEmpty} from 'lodash';
import {AbstractModuleLoader} from '../AbstractModuleLoader';
import {ModuleDescriptor} from '../../registry/ModuleDescriptor';
import {ClassesHandle} from './ClassesHandle';
import {IClassesLib, IClassesOptions} from './IClassesOptions';
import {ClassLoader, PlatformUtils} from '@allgemein/base';
import {IClassesLoader} from './IClassesLoader';


const MODULE_NAME = '__MODULNAME__';

export class ClassesLoader extends AbstractModuleLoader<ClassesHandle, IClassesOptions> implements IClassesLoader {


  getClasses(topic: string): Function[] {
    let classes: Function[] = [];
    for (let handle of this.handles()) {
      let cls = handle.getClasses(topic);
      if (!isEmpty(cls)) {
        classes = classes.concat(cls);
      }
    }
    return classes;
  }

  getClassesWithFilter(topic: string, excludeFilter?: (className: string, modulName: string) => boolean): Function[] {
    let classes: Function[] = [];
    for (let handle of this.handles()) {
      let cls = handle.getClasses(topic);
      if (!isEmpty(cls)) {
        cls.forEach(c => {
          const className = ClassLoader.getClassName(c);
          if (excludeFilter && excludeFilter(className, handle.module.name)) {
            return;
          }
          classes.push(c);
        });
      }
    }
    return classes;
  }

  getClassesByModule(topic: string): { [modul: string]: Function[] } {
    let classes: { [modul: string]: Function[] } = {};
    for (let handle of this.handles()) {
      let modulClasses = handle.getClasses(topic);
      if (!isEmpty(modulClasses)) {
        classes[handle.module.name] = modulClasses;
      }
    }
    return classes;
  }


  protected async loadOne(modul: ModuleDescriptor): Promise<ClassesHandle> {
    let handle = new ClassesHandle(modul);

    // for (let lib of this._options.libs) {
    const libs = await Promise.all(this._options.libs.map(async (lib: IClassesLib) => {
      const _lib: { topic: string, refs: string[], classes: Function[] } = {
        topic: lib.topic,
        refs: [],
        classes: []
      };
      const topic = lib.topic;
      // let refs = [];
      for (let _path of lib.refs) {
        let lib_path = PlatformUtils.join(modul.path, _path);
        let res = await ClassesLoader.glob(lib_path);

        if (!isEmpty(res)) {
          for (let r of res) {
            if (PlatformUtils.fileExist(r) && PlatformUtils.isDir(r)) {
              _lib.refs.push(PlatformUtils.join(r, '*'));
            } else if (PlatformUtils.fileExist(r) && PlatformUtils.isFile(r)) {
              _lib.refs.push(r);
            }
          }
        } else if (PlatformUtils.fileExist(lib_path + '.js') && PlatformUtils.isFile(lib_path + '.js')) {
          _lib.refs.push(lib_path + '.js');
        } else if (PlatformUtils.fileExist(lib_path + '.ts') && PlatformUtils.isFile(lib_path + '.ts')) {
          // if ts-node is used on start
          _lib.refs.push(lib_path + '.ts');
        }
      }

      if (!isEmpty(_lib.refs)) {
        _lib.classes = await this.loadClasses(_lib.refs, modul.name, topic);
        // handle: ClassesHandle,

      }
      return _lib;
    }));

    for (const lib of libs) {
      handle.add(lib.topic, lib.refs, lib.classes);
    }
    // }
    //
    // if (promises.length > 0) {
    //   await Promise.all(promises);
    // }
    return handle.hasAnyClasses() ? handle : null;
  }


  private async loadClasses(
    refs: string[], modulName: string, topic: string) {
    let classes = await ClassLoader.importClassesFromAnyAsync(refs);
    if (!isEmpty(classes)) {
      if (Reflect && Reflect['getOwnMetadata']) {
        classes.forEach(cls => {
          Reflect['defineMetadata'](MODULE_NAME, modulName, cls);
        });
      } else {
        classes.forEach(cls => {
          cls[MODULE_NAME] = modulName;
        });
      }
      return classes;
    }
    return [];
  }


  static getSource(cls: Function) {
    return ClassLoader.getSource(cls);
  }


  static getModulName(cls: Function) {
    if (Reflect && Reflect['getOwnMetadata']) {
      return Reflect['getOwnMetadata'](MODULE_NAME, cls);
    } else {
      return cls[MODULE_NAME] ? cls[MODULE_NAME] : null;
    }
  }

  static glob(lib_path: string): Promise<string[]> {
    const glob = PlatformUtils.load('glob');
    return new Promise((resolve, reject) => {
      glob(lib_path, ((err: Error, matches: string[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      }));
    });
  }


}
