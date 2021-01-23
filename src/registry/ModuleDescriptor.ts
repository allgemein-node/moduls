import {ISubModule} from './ISubModule';

export class ModuleDescriptor {

  name: string;

  version: string;

  path: string;

  weight: number = 0;

  dependencies: any = {};

  peerDependencies: any = {};

  child_modules: string[] = [];

  /**
   * if modul is declared outside a node_modules directory
   *
   * @type {boolean}
   */
  internal: boolean = false;

  main: string;

  sub_modules: { [subpath: string]: ISubModule } = {};

  submodule: boolean = false;


  constructor() {
    this.name = null;
    this.version = null;
    this.path = null;
    this.weight = 0;
    this.dependencies = {};
    this.peerDependencies = {};
    this.child_modules = [];
  }


  static fromOptions(options: any): ModuleDescriptor {
    let m = new ModuleDescriptor();
    m.name = options.name;
    m.version = options.version || null;
    m.path = options.path || null;
    m.main = options.main || null;
    m.internal = !/(\/|\\)node_modules(\/|\\)/.test(m.path);
    m.dependencies = options.dependencies || {};
    m.peerDependencies = options.peerDependencies || {};
    m.child_modules = options.child_modules || [];
    m.sub_modules = options.sub_modules || {};
    return m; //merge(m,options)
  }

  getMain(sep: string = '/'): string {
    let chain = [this.path];
    if (this.main) {
      chain.push(this.main.replace(/.\w+$/, ''));
    }
    return chain.join(sep);
  }
}
