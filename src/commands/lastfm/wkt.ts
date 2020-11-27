import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
  fetchRecentTrack,
  fetchTrackScrobbles,
  searchTrack
} from '../../api/lastfm';
import { NOT_ENOUGH_LISTENERS, USER_UNDEFINED } from '../../constants';
import db from '../../db';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface WkTrackArg {
  trackName: string;
}

export default class WhoKnowsTrackCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'wktrack',
      memberName: 'wktrack',
      aliases: ['wkt'],
      group: 'lastfm',
      description: 'Returns the top listeners in the server of a track.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'trackName',
          prompt: 'Enter a track name.',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run(
    msg: CommandoMessage,
    { trackName }: WkTrackArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    const fmUser = Utilities.userInDatabase(msg.author.id);

    let artistName = '';
    let trackURL = '';
    if (!trackName) {
      /**
       * If no trackName is given, it checks to see if the user has both set
       * their Last.fm username with Lasty and has scrobbled a track. If the user
       * has recently scrobbled, we use their recent track to find the trackName.
       */
      if (!fmUser) {
        msg.channel.stopTyping();
        return Utilities.replyEmbedMessage(msg, null, USER_UNDEFINED);
      }

      const { error, track, artist, songURL } = await fetchRecentTrack(fmUser);
      if (error) {
        msg.channel.stopTyping();
        return Utilities.replyEmbedMessage(msg, null, error, { fmUser });
      }
      trackName = track!;
      artistName = artist!;
      trackURL = songURL!;
    }

    // If artistName is undefined that means trackName is provided so we check
    // if it's a valid track on Last.fm
    if (artistName === '') {
      const { error, track, artist, songURL } = await searchTrack(trackName);
      if (error) {
        msg.channel.stopTyping();
        return Utilities.replyEmbedMessage(msg, null, error);
      }
      trackName = track!;
      artistName = artist!;
      trackURL = songURL!;
    }

    const users = db.get('users').value();

    const scrobblesPerUser = [];
    for await (const { userID, fmUser } of users) {
      const { username: discordUsername } = await this.client.users.fetch(
        userID
      );
      const { userplaycount } = await fetchTrackScrobbles(
        trackName,
        artistName,
        fmUser
      );
      if (Number(userplaycount) > 0) {
        scrobblesPerUser.push({
          discordUsername,
          fmUser,
          playcount: Number(userplaycount)
        });
      }
    }
    if (scrobblesPerUser.length === 0) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, NOT_ENOUGH_LISTENERS, {
        wkArg: trackName
      });
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
      .sort(Utilities.sortTotalListeners())
      .slice(0, 10)
      .map(({ discordUsername, fmUser, playcount }, i) => {
        const usersTrackScrobblesURL = Utilities.encodeURL(
          `https://www.last.fm/user/${fmUser}/library/music/${artistName}/_/${trackName}`
        );

        if (i === 0) {
          return `👑 [${discordUsername}](${usersTrackScrobblesURL}) ∙ \`${playcount.toLocaleString()} ▶️\``;
        }
        return `[${discordUsername}](${usersTrackScrobblesURL}) ∙ \`${playcount.toLocaleString()} ▶️\``;
      });

    const listeningStatistics = `${totalListeners.toLocaleString()} listener${totalListeners === 1 ? '' : 's'
      } ∙ ${totalScrobbles.toLocaleString()} total plays ∙ ${averageScrobbles} average plays`;

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setTitle(`${trackName} ∙ ${artistName}`)
        .setURL(trackURL)
        .setDescription(top10Listeners)
        .setFooter(listeningStatistics)
        .setColor(EMBED_COLOR)
    );
  }
}
