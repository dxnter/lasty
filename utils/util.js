module.exports = class Util {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
