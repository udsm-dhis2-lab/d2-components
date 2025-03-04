export class BaseTrackerSDKModel<T> {
  constructor(details?: Partial<T>) {
    if (details) {
      Object.keys(details).forEach((key: string) => {
        (this as any)[key] = (details as any)[key];
      });
    }
  }
}
