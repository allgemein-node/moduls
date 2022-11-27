import {existsSync, readdir, readFile, stat, Stats} from 'fs';
import {join, resolve} from 'path';
import {find, has, isEmpty, map, remove} from 'lodash';
import {PlatformUtils} from '@allgemein/base';
import {INpmlsOptions} from './INpmlsOptions';
import {ISubModule} from '../registry/ISubModule';
import * as glob from 'glob';
import {isMatch} from 'micromatch';
import {C_NODE_MODULES, C_PACKAGE_JSON} from '../Constants';


export class Helper {

  static glob(lib_path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(lib_path, ((err, matches: string[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      }));
    });
  }

  static readFile(file: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (existsSync(file)) {
        readFile(file, (err, buf) => {
          if (err) {
            reject(err);
          } else {
            try {
              resolve(buf);
            } catch (err) {
              reject(err);
            }
          }
        });
      } else {
        reject(new Error('cant find file ' + file));
      }
    });

  }

  static getPackageJson(_path: string): Promise<any> {
    if (!/package\.json$/.test(_path)) {
      _path = join(_path, C_PACKAGE_JSON);
    }
    return this.readFile(_path).then(buf => {
      let data = buf.toString('utf8');
      let json = JSON.parse(data);
      return json;
    });
  }

  static ucfirst(word: string): string {
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
  }

  static async readdir(dir: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      readdir(dir, (err: NodeJS.ErrnoException, files: string[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  static async stat(dir: string): Promise<Stats> {
    return new Promise<Stats>((resolve, reject) => {
      stat(dir, (err: NodeJS.ErrnoException, stats: Stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats);
        }
      });
    });
  }


  static async npmls(node_modules_dir: string, options: INpmlsOptions = {depth: 1, level: 0}): Promise<any[]> {
    let depth = options.depth;
    let inc = options.level;

    if (inc >= depth) {
      return [];
    }

    options.level = inc + 1;

    let modules: any[] = [];
    let directories = await this.getValidDirectories(node_modules_dir, options);
    await Promise.all(map(directories, async (directory: string) => {
      if (/^@/.test(directory)) {
        // is grouped
        let _grouped_node_modules_dir = PlatformUtils.join(node_modules_dir, directory);
        let _directories = await this.getValidDirectories(_grouped_node_modules_dir, options);
        return Promise.all(map(_directories, async (_directory: string) => {
          _directory = PlatformUtils.join(directory, _directory);
          return Helper.lookupNpmInDirectory(node_modules_dir, _directory, modules, options);
        }));
      } else {
        return Helper.lookupNpmInDirectory(node_modules_dir, directory, modules, options);
      }

    }));
    return modules;
  }

  static async getValidDirectories(node_modules_dir: string, options: INpmlsOptions) {
    let directories = await this.readdir(node_modules_dir);
    if (has(options, 'exclude') || has(options, 'include')) {

      if (has(options, 'include') && !isEmpty(options.include)) {
        let includes: string[] = [];
        for (const entry of options.include || []) {
          includes = includes.concat(
            directories.filter((path => {
              const _resolve = join(node_modules_dir, path);
              return isMatch(_resolve, entry, options.matcherOptions || {dot: true});
            }))
          );
        }
        directories = includes;
      }

      for (const entry of options.exclude || []) {
        remove(directories, (path => {
          const _resolve = join(node_modules_dir, path);
          return isMatch(_resolve, entry, options.matcherOptions || {dot: true});
        }));
      }
    }
    return directories;
  }


  static async lookupNpmInDirectory(node_modules_dir: string, directory: string, modules: any[] = [], options?: INpmlsOptions): Promise<any> {
    let _path = join(node_modules_dir, directory);
    if (!existsSync(join(_path, C_PACKAGE_JSON))) {
      return;
    }

    let package_json = await this.getPackageJson(_path);
    let modul_exists = find(modules, x => x.name == directory);

    if (modul_exists) {
      return;
    }

    package_json.path = PlatformUtils.pathResolve(_path);
    package_json.child_modules = [];
    package_json.sub_modules = {};

    if (options && options.filter) {
      if (!options.filter(package_json)) {
        return;
      }
    }
    modules.push(package_json);

    if (options.subModulePaths) {
      // look in subpath like "node_modules"
      let results = await Promise.all(map(options.subModulePaths, subpath => {
        return this.look(_path, subpath, modules, options);
      }));

      for (let res of results) {
        if (res.subpath === C_NODE_MODULES) {
          package_json.has_node_modules = res.has_modules;
          package_json.child_modules = res.child_modules;
        } else {
          package_json.sub_modules[res.subpath] = <ISubModule>{
            has_modules: res.has_modules,
            modules: res.child_modules
          };
        }
      }
    }
    return modules;
  }


  static async look(_path: string, subpath: string, modules: any[] = [], options?: INpmlsOptions) {
    // FIXME detect the node_modules path
    let _new_node_module_dir = join(_path, subpath);
    let info: { subpath: string, has_modules: boolean, child_modules: string[] } = {
      subpath: subpath,
      has_modules: false,
      child_modules: []
    };
    if (PlatformUtils.fileExist(_new_node_module_dir)) {
      try {
        let stat = await this.stat(_new_node_module_dir);
        if (stat && stat.isDirectory()) {
          let _modules = await this.npmls(_new_node_module_dir, options);
          info.has_modules = true;
          for (let _x of _modules) {
            info.child_modules.push(_x.name);
            let _modul_exists = modules.find(function (_m) {
              return _m.name == _x.name;
            });
            if (!_modul_exists) {
              modules.push(_x);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    return info;
  }

  static checkPaths(paths: string[]) {
    let ret_paths = [];
    for (let _path of paths) {
      _path = resolve(_path);
      let _try_path = join(_path, C_NODE_MODULES);
      let _try_package = join(_path, C_PACKAGE_JSON);
      if (existsSync(_path)) {
        if (existsSync(_try_package) && existsSync(_try_path)) {
          _path = _try_path;
        }
      } else {
        throw new Error('checking path ' + _path + ' doesn\'t exists');
      }
      ret_paths.push(_path);
    }
    return ret_paths;
  }


  /**
   * Checks if x is an glob pattern
   *
   * @param x
   */
  static isGlobPattern(x: string) {
    return /\+|\.|\(|\||\)|\*/.test(x);
  }

}
