export function isDataStoreRequest(url: string) {
  return (url || '').split('/').includes('dataStore');
}
