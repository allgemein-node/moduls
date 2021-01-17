import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {ModuleRegistry} from '../../src/registry/ModuleRegistry';
import {ClassesLoader} from '../../src/loader/classes/ClassesLoader';
import {IClassesOptions} from '../../src/loader/classes/IClassesOptions';


let registry: ModuleRegistry;

@suite('load of classes')
class Load_of_classesSpec {

  static async before() {
    registry = new ModuleRegistry({
      paths: [
        './test/functional/fake_scenario/fake_app_02/node_modules'
      ],
    });
    await registry.rebuild();

    expect(registry.modules()).to.have.length(2);
  }


  @test
  async 'use classes loader on path'() {
    let loader = await registry.loader<ClassesLoader, IClassesOptions>(ClassesLoader, {
      libs: [{
        topic: 'generic',
        refs: ['lib']
      }, {
        topic: 'commands',
        refs: ['commands']
      }]
    });
    let handles = loader.handles();
    expect(handles).to.have.length(2);

    let classes = loader.getClasses('generic');
    expect(classes).to.have.length(2);
    expect(classes.map(x => x.prototype.constructor.name).sort()).to.be.deep.eq(['KlassM3', 'KlassM4']);

    let commandClasses = loader.getClasses('commands');
    expect(commandClasses).to.have.length(1);
  }


  @test
  async 'use classes loader single file'() {
    let loader = await registry.loader<ClassesLoader, IClassesOptions>(ClassesLoader, {
      libs: [{
        topic: 'generic',
        refs: ['Activator']
      }]
    });

    let handles = loader.handles();
    expect(handles).to.have.length(2);

    let classes = loader.getClasses('generic');
    expect(classes).to.have.length(2);
    expect(classes[0].prototype.constructor.name).to.eq('Activator');
    expect(classes[1].prototype.constructor.name).to.eq('Activator');

    let classesByModule = loader.getClassesByModule('generic');
    expect(Object.keys(classesByModule)).to.deep.eq(['module3', 'module4']);
  }


  @test
  async 'use loader by pattern'() {
    let loader = await registry.createClassesLoader({
      libs: [{
        topic: 'pattern',
        refs: ['clazzes/*/dir']
      }]
    });

    let handles = loader.handles();
    expect(handles).to.have.length(1);

    let classes = loader.getClasses('pattern');
    expect(classes).to.have.length(2);

  }

}
