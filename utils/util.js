module.exports = class Util {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static extension(reaction, attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
    return attachment;
  }
};
