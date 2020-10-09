import Discord from 'discord.js';
import Canvas from 'canvas';
import db from '../db';
import { replyEmbedMessage } from '../utils';
import { USER_UNDEFINED } from '../constants';

/**
 * Default grid size is 3x3 without any extra command arguments with titles and empty artwork
 *
 *
 *
 */

module.exports = {
  name: 'grid',
  run: (bot, message, args) => {
    const dbUser = db
      .get('users')
      .find({ userID: message.author.id })
      .value();
    if (!dbUser) {
      return replyEmbedMessage(message, args, USER_UNDEFINED);
    }
    const fmUser = dbUser.lastFM;

    const gridInfo = {};

    function setGridInfo() {
      gridInfo.showTitle = null;
      gridInfo.hideMissingArtwork = null;
      gridInfo.period = null;
      gridInfo.rows = null;
      gridInfo.cols = null;
    }

    function getAlbumCovers() {
      const period = gridInfo.period;
      const limit = gridInfo.rows * gridInfo.cols;
    }

    return message.channel.send('grid');
  }
};
