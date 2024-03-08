export function getDataStoreUrlParams(dataStoreUrl: string) {
  const urlSection = (dataStoreUrl || '').split('/');
  return {
    namespace: urlSection[1],
    key: urlSection[2],
  };
}
