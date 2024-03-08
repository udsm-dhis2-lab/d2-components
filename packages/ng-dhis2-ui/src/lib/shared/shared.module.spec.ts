import { SharedDhis2UiModule } from './shared.module';

describe('SharedModule', () => {
  const module: SharedDhis2UiModule = new SharedDhis2UiModule();

  it('should create', () => {
    expect(module).toBeTruthy();
  });
});
