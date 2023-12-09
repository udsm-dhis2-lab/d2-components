import { AppShellModule } from './app-shell.module';

describe('AppShellModule', () => {
  const module: AppShellModule = new AppShellModule();

  it('should create', () => {
    expect(module).toBeTruthy();
  });
});
