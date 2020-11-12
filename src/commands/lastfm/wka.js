import { MessageEmbed } from 'discord.js';
import { Command } from 'discord.js-commando';
import {
  fetchRecentTrack,
  searchAlbum,
  fetchAlbumInfo
} from '../../api/lastfm';
import { NOT_ENOUGH_LISTENERS, USER_UNDEFINED } from '../../constants';
import db from '../../db';

export default class WhoKnowsAlbumCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'wkalbum',
      memberName: 'wkalbum',
      aliases: ['wka'],
      group: 'lastfm',
      description: 'Returns the top listeners in the server of an album.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'albumName',
          prompt: 'Enter an album name.',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run(msg, { albumName }) {
    msg.channel.startTyping();
    const fmUser = this.client.util.userInDatabase(msg.author.id);

    let artistName;
    if (!albumName) {
      /**
       * If no albumName is given, it checks to see if the user has both set
       * their Last.fm username with Lasty and has scrobbled a track. If the user
       * has recently scrobbled, we use their recent track to find the albumName.
       */
      if (!fmUser) {
        msg.channel.stopTyping();
        return this.client.util.replyEmbedMessage(msg, null, USER_UNDEFINED);
      }

      const { error, artist, album } = await fetchRecentTrack(fmUser);
      if (error) {
        msg.channel.stopTyping();
        return this.client.util.replyEmbedMessage(msg, null, error, { fmUser });
      }
      albumName = album;
      artistName = artist;
    }

    // If artistName is undefined that means albumName is provided so we check
    // if it's a valid album on Last.fm
    if (!artistName) {
      const { error, artist, name: album } = await searchAlbum(albumName);
      if (error) {
        msg.channel.stopTyping();
        return this.client.util.replyEmbedMessage(msg, this.name, error, {
          albumName: album
        });
      }
      artistName = artist;
      albumName = album;
    }

    const users = db.get('users').value();

    const scrobblesPerUser = [];
    for await (const { userID, fmUser } of users) {
      const { username: discordUsername } = await this.client.users.fetch(
        userID
      );
      const { userplaycount } = await fetchAlbumInfo(
        artistName,
        albumName,
        fmUser
      );
      if (userplaycount > 0) {
        scrobblesPerUser.push({
          discordUsername,
          fmUser,
          playcount: Number(userplaycount)
        });
      }
    }
    if (scrobblesPerUser.length === 0) {
      msg.channel.stopTyping();
      return this.client.util.replyEmbedMessage(
        msg,
        null,
        NOT_ENOUGH_LISTENERS,
        { wkArg: albumName }
      );
    }

    const totalListeners = scrobblesPerUser.length;
    const totalScrobbles = scrobblesPerUser.reduce(
      (sum, user) => sum + user.playcount,
      0
    );
    const averageScrobbles = Math.floor(
      totalScrobbles / totalListeners
    ).toLocaleString();

    const top10Listeners = scrobblesPerUser
      .sort(this.client.util.sortTotalListeners())
      .slice(0, 10)
      .map(({ discordUsername, fmUser, playcount }, i) => {
        const usersAlbumScrobblesURL = this.client.util.encodeURL(
          `https://www.last.fm/user/${fmUser}/library/music/${artistName}/${albumName}`
        );

        if (i === 0) {
          return `👑 [${discordUsername}](${usersAlbumScrobblesURL}) ∙ \`${playcount.toLocaleString()} ▶️\``;
        }
        return `[${discordUsername}](${usersAlbumScrobblesURL}) ∙ \`${playcount.toLocaleString()} ▶️\``;
      });

    const albumURL = this.client.util.encodeURL(
      `https://www.last.fm/music/${artistName}/${albumName}`
    );

    const listeningStatistics = `${totalListeners.toLocaleString()} listener${
      totalListeners === 1 ? '' : 's'
    } ∙ ${totalScrobbles.toLocaleString()} total plays ∙ ${averageScrobbles} average plays`;

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setTitle(`${albumName} ∙ ${artistName}`)
        .setURL(albumURL)
        .setDescription(top10Listeners)
        .setFooter(listeningStatistics)
        .setColor(this.client.color)
    );
  }
}
