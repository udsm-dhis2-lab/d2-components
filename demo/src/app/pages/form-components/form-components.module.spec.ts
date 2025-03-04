import { FormComponentsModule } from './form-components.module';

describe('FormComponentsModule', () => {
  const module: FormComponentsModule = new FormComponentsModule();

  it('should create', () => {
    expect(module).toBeTruthy();
  });
});
