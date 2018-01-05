import {suite, test, timeout} from "mocha-typescript";
import {assert, expect} from "chai";
import * as fs from 'fs'
import * as _ from 'lodash'
import {ModuleRegistry} from "../../src/registry/ModuleRegistry";
import {Helper} from "../../src/utils/Helper";


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
}
