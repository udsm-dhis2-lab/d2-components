describe('Highcharts module initialization', () => {
  it('initializes only requested modules once', () => {
    jest.isolateModules(() => {
      // A fresh module instance has its own initialization set.
      const { initializeHighcharts } =
        require('./highcharts-adapter') as typeof import('./highcharts-adapter');
      const initializeEngineExtension =
        require('../testing/mocks/engine-initializer.mock')
          .default as jest.Mock;
      const before = (initializeEngineExtension as jest.Mock).mock.calls.length;
      initializeHighcharts(['drilldown']);
      expect((initializeEngineExtension as jest.Mock).mock.calls.length).toBe(
        before + 1
      );
      initializeHighcharts(['drilldown']);
      expect((initializeEngineExtension as jest.Mock).mock.calls.length).toBe(
        before + 1
      );
    });
  });
});
