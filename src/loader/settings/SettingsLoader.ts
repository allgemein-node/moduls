import {get} from 'lodash';
import {AbstractModuleLoader} from '../AbstractModuleLoader';
import {ModuleDescriptor} from '../../registry/ModuleDescriptor';
import {SettingsHandle} from './SettingsHandle';
import {ISettingsOptions} from './ISettingsOptions';
import {Helper} from '../../utils/Helper';
import {PlatformUtils} from '@allgemein/base';
import {ISettingsLoader} from './ISettingsLoader';


export class SettingsLoader extends AbstractModuleLoader<SettingsHandle, ISettingsOptions> implements ISettingsLoader {


  getSettings() {
    let settings: any = {};
    for (let x of this.handles()) {
      settings[x.module.name] = x.settings;
    }
    return settings;
  }

  protected async loadOne(modul: ModuleDescriptor): Promise<SettingsHandle> {
    let handle = null;
    let filepath = PlatformUtils.join(modul.path, this._options.ref);
    let ext = PlatformUtils.pathExtname(filepath, false);

    if (PlatformUtils.fileExist(filepath)) {
      handle = new SettingsHandle(modul);
      let file = await Helper.readFile(filepath);
      let settings = {};

      switch (ext) {
        case 'json':
          settings = JSON.parse(file.toString('utf8'));
          break;
        default:
          throw new Error('Cannot load settings from ' + ext);
      }

      if (this._options.path) {
        settings = get(settings, this._options.path);
      }

      handle.settings = settings;
    }

    return handle;
  }


}
