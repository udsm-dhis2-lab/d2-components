// return a random value from given array
const sample = (d: any = [], fn: any = Math.random) => {
  if (d.length === 0) return;
  return d[Math.round(fn() * (d.length - 1))];
};

export function generateUid(limit = 11, fn = Math.random) {
  const allowedLetters: any = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ].join('');
  const allowedChars = ['0123456789', allowedLetters].join('');

  const arr = [sample(allowedLetters, fn)];

  for (let i = 0; i < limit - 1; i++) {
    arr.push(sample(allowedChars, fn));
  }

  return arr.join('');
}

export const generateCodes = (n = 10, limit = 11, fn = Math.random) => {
  const arr = [];

  for (let i = 0; i < n; i++) {
    arr.push(generateUid(limit, fn));
  }

  return arr;
};
