export const joinPath = (...parts: any[]) => {
  const realParts = parts.filter((part) => !!part);
  return realParts.map((part) => part.replace(/^\/+|\/+$/g, '')).join('/');
};
