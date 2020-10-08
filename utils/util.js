import { READABLE_PERIODS } from '../constants';

class Util {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static userNotSet(message, args) {
    return {
      author: 'Error',
      description: `Last.FM username not set, enter \`,l set <username>\` or enter a username after \`${args[0]}\``
    };
  }

  static invalidPeriod(period) {
    return {
      author: 'Error',
      description: `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
    };
  }

  static makeReadablePeriod(period) {
    if (!period) return 'of all time';
  }

  static sortTopAlbums() {
    return (a, b) => b.playcount - a.playcount;
  }

  static pluralize(word) {
    if (word.endsWith('s')) `${word}'`;
    return `${word}'s`;
  }
}

export { Util };
