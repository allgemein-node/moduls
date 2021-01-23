import {IModuleLoader} from '../IModuleLoader';

export interface IRequireLoader extends IModuleLoader<any> {

  invokeHook(hook: string, ...args: any[]): void;

}
