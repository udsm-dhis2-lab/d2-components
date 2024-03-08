/* global describe, it, before */

import { Fn } from './index';

beforeAll(() => {
  Fn.init({
    baseUrl: 'https://play.dhis2.org/2.36/api/',
    username: 'admin',
    password: 'district',
  });
});

describe('Given an initial instance', () => {
  it('Check if instance is ready', () => {
    var runner = Fn.Runner.getInstance();

    expect(runner.instance !== undefined).toEqual(true);
  });
  it('should return promise with analytics results', () => {
    var analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('ImspTQPwCqd');
    return analytics.get().then((results) => {
      expect(results.headers !== undefined).toEqual(true);
      expect(results.rows !== undefined).toEqual(true);
      expect(results.metaData !== undefined).toEqual(true);
      expect(results.height !== undefined).toEqual(true);
      expect(results.width !== undefined).toEqual(true);
    });
  }, 5000);
  it('should return promise with analytics results with ouHierarch', () => {
    var analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('ImspTQPwCqd').setParameters({
      hierarchyMeta: 'true',
    });
    return analytics.get().then((results) => {
      expect(results.headers !== undefined).toEqual(true);
      expect(results.rows !== undefined).toEqual(true);
      expect(results.metaData.ouHierarchy !== undefined).toEqual(true);
      expect(results.metaData !== undefined).toEqual(true);
      expect(results.height !== undefined).toEqual(true);
      expect(results.width !== undefined).toEqual(true);
    });
  }, 5000);
  it('should return promise with analytics results with ouHierarch(Test Caching)', () => {
    var analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('ImspTQPwCqd').setParameters({
      hierarchyMeta: 'true',
    });
    return analytics.get().then((results) => {
      expect(results.headers !== undefined).toEqual(true);
      expect(results.rows !== undefined).toEqual(true);
      expect(results.metaData.ouHierarchy !== undefined).toEqual(true);
      expect(results.metaData !== undefined).toEqual(true);
      expect(results.height !== undefined).toEqual(true);
      expect(results.width !== undefined).toEqual(true);
    });
  }, 5000);
  it('should return promise with sql results results', () => {
    var sqlView = new Fn.SQLViewData('GCZ01m3pIRd');

    return sqlView.get().then((results) => {
      expect(results.headers !== undefined).toEqual(true);
      expect(results.rows !== undefined).toEqual(true);
      expect(results.height !== undefined).toEqual(true);
      expect(results.width !== undefined).toEqual(true);
      expect(results.title !== undefined).toEqual(true);
      expect(results.subtitle !== undefined).toEqual(true);
    });
  }, 5000);
});

describe('Given an initial instance (Dependency Test)', () => {
  it('should return promise with analytics results (Dependency)', () => {
    let orgunitProcessor = new Fn.IdentifiableObject('organisationUnits');

    orgunitProcessor.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

    let analytics = new Fn.Analytics();

    analytics.preProcess(
      new Fn.Dependency(
        orgunitProcessor,
        (data: any, analyticsProcessor: any) => {
          let ous = data.organisationUnits
            .map((organisationUnit: any) => {
              return organisationUnit.id;
            })
            .join(';');

          analyticsProcessor.setPeriod('2016').setOrgUnit(ous);
        }
      )
    );
    return analytics.get().then((results) => {
      expect(results.headers !== undefined).toEqual(true);
      expect(results.rows !== undefined).toEqual(true);
      expect(results.height !== undefined).toEqual(true);
      expect(results.width !== undefined).toEqual(true);
    });
  }, 5000);
});

describe('Given an initial instance (Multiple Process Test)', () => {
  it('should return promise with multiple results (Multiple Post Processing)', () => {
    let orgunitProcessor = new Fn.IdentifiableObject('organisationUnits');

    orgunitProcessor.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

    let analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('Rp268JB6Ne4;Rp268JB6Ne2');

    let multiProcesses = new Fn.MultiFetcher([orgunitProcessor, analytics]);
    return multiProcesses.get().then((results) => {
      expect(results.length).toEqual(2);
      expect(results[0].organisationUnits !== undefined).toEqual(true);
      expect(results[1].headers !== undefined).toEqual(true);
      expect(results[1].rows !== undefined).toEqual(true);
      expect(results[1].height !== undefined).toEqual(true);
      expect(results[1].width !== undefined).toEqual(true);
    });
  }, 5000);
  it('should return promise with multiple results with post processing (Multiple Post Processing)', () => {
    let orgunitProcessor = new Fn.IdentifiableObject('organisationUnits');

    orgunitProcessor.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

    let analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('Rp268JB6Ne4;Rp268JB6Ne2');

    let multiProcesses = new Fn.MultiFetcher([orgunitProcessor, analytics]);
    multiProcesses.postProcess((res) => {
      return [res[1], res[0]];
    });
    return multiProcesses.get().then((results) => {
      expect(results.length).toEqual(2);
      expect(results[1].organisationUnits !== undefined).toEqual(true);
      expect(results[0].headers !== undefined).toEqual(true);
      expect(results[0].rows !== undefined).toEqual(true);
      expect(results[0].height !== undefined).toEqual(true);
      expect(results[0].width !== undefined).toEqual(true);
    });
  }, 5000);

  it('should return promise with multiple results with post processing within another multiple process (Multiple Post Processing)', () => {
    let orgunitProcessor = new Fn.IdentifiableObject('organisationUnits');

    orgunitProcessor.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

    let analytics = new Fn.Analytics();

    analytics.setPeriod('2016').setOrgUnit('Rp268JB6Ne4;Rp268JB6Ne2');

    let multiProcesses = new Fn.MultiFetcher([orgunitProcessor, analytics]);
    multiProcesses.postProcess((res) => {
      return [res[1], res[0]];
    });

    let orgunitProcessor2 = new Fn.IdentifiableObject('organisationUnits');

    orgunitProcessor2.where('id', 'in', ['Rp268JB6Ne4', 'Rp268JB6Ne2']);

    let analytics2 = new Fn.Analytics();

    analytics2.setPeriod('2016').setOrgUnit('Rp268JB6Ne4;Rp268JB6Ne2');

    let multiProcesses2 = new Fn.MultiFetcher([orgunitProcessor2, analytics2]);
    multiProcesses2.postProcess((res) => {
      return [res[1], res[0]];
    });
    return new Fn.MultiFetcher([multiProcesses, multiProcesses2])
      .get()
      .then((results) => {
        expect(results.length).toEqual(2);
        expect(results[0].length).toEqual(2);
        expect(results[1].length).toEqual(2);
        expect(results[0][1].organisationUnits !== undefined).toEqual(true);
        expect(results[0][0].headers !== undefined).toEqual(true);
        expect(results[0][0].rows !== undefined).toEqual(true);
        expect(results[0][0].height !== undefined).toEqual(true);
        expect(results[0][0].width !== undefined).toEqual(true);

        expect(results[1][1].organisationUnits !== undefined).toEqual(true);
        expect(results[1][0].headers !== undefined).toEqual(true);
        expect(results[1][0].rows !== undefined).toEqual(true);
        expect(results[1][0].height !== undefined).toEqual(true);
        expect(results[1][0].width !== undefined).toEqual(true);
      });
  }, 5000);
});
