import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {Helper} from '../../src/utils/Helper';
import {PlatformUtils} from '@allgemein/base';
import * as micromatch from 'micromatch';


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

  @test
  async 'valid directories'() {
    let dir = await Helper.getValidDirectories(__dirname + '/../../node_modules', {depth: 5});
    let all = dir.length;
    expect(dir).to.have.length.gt(0);
    expect(dir).to.include('@allgemein');
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules', {depth: 5, exclude: ['**/@types{,**/}*']});
    expect(dir).to.have.length(all - 1);
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules',
      {depth: 5, exclude: ['**/@types{,**/}*'], include: ['**/@allgemein{,**/}*']});
    expect(dir).to.have.length(1);
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules',
      {depth: 5, exclude: ['**/@types{,**/}*'], include: ['**/@allgemein']});
    expect(dir).to.have.length(1);
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules/@allgemein',
      {depth: 5, exclude: ['**/@types{,**/}*'], include: ['**/@allgemein']});
    expect(dir).to.have.length(0);
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules/@allgemein',
      {depth: 5, exclude: ['**/@types{,**/}*'], include: ['**/@allgemein', '**/@allgemein/base']});
    expect(dir).to.have.length(1);
    dir = await Helper.getValidDirectories(__dirname + '/../../node_modules/@allgemein',
      {depth: 5, exclude: ['**/@types{,**/}*'], include: ['**/@allgemein', '**/@allgemein/base{,**/}*']});
    expect(dir).to.have.length(1);

  }


  @test
  'micromatch'() {
    const opt = {dot: true, contains: true};
    const pattern = '**/@allgemein{,**/}*';
    // const p = micromatch.parse(pattern, opt);
    // console.log(p);
    let match = micromatch.isMatch('/tmp/app/node_modules/@allgemein', pattern, opt);
    expect(match).to.be.true;

    match = micromatch.isMatch('/tmp/.mount_@aufga61Cxaz/resources/app/node_modules/@allgemein', pattern, opt);
    expect(match).to.be.true;

    match = micromatch.isMatch('/tmp/mount_@aufga61Cxaz/resources/app/node_modules/@allgemein', pattern, opt);
    expect(match).to.be.true;
  }
}
