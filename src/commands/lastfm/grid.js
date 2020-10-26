import Canvas from 'canvas';
import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';

export default class GridCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'grid',
      memberName: 'grid',
      group: 'lastfm',
      description: 'Returns an album cover grid of a specified size.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(msg) {
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

    return msg.say('Work in progress, follow Github for updates.');
  }
}
