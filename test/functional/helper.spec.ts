import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {Helper} from '../../src/utils/Helper';
import {PlatformUtils} from '@allgemein/base';


@suite('helper functions')
class ModulesSpec {

  @test
  async 'correct node modul paths'() {

    let res = Helper.checkPaths([
      './test/functional/fake_scenario/fake_app_01'
    ]);
    expect(res[0]).to.be.eq(__dirname + '/fake_scenario/fake_app_01/node_modules');

    res = Helper.checkPaths([
      './test/functional/fake_scenario/fake_app_01/node_modules'
    ]);
    expect(res[0]).to.be.eq(__dirname + '/fake_scenario/fake_app_01/node_modules');
  }


  @test
  async 'get package json'() {
    let packageJson = await Helper.getPackageJson(__dirname + '/fake_scenario/fake_app_01');
    expect(packageJson.name).to.be.eq('fake_app_01');
  }

  @test
  async 'remove path'() {
    let _path = __dirname + '/fake_scenario/fake_app_01';
    let dirname = PlatformUtils.dirname(_path);
    let basename = PlatformUtils.basename(_path);
    expect(dirname).to.eq(__dirname + '/fake_scenario');
    expect(basename).to.eq('fake_app_01');

  }


}
