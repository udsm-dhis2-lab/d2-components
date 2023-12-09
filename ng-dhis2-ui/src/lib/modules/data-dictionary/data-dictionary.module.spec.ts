import { DataDictionaryModule } from './data-dictionary.module';

describe('DataDictionaryModule', () => {
  const module: DataDictionaryModule = new DataDictionaryModule();

  it('should create', () => {
    expect(module).toBeTruthy();
  });
});
