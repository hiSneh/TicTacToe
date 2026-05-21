export const createDailyChallengeSeed = (date = new Date()): string =>
  `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
