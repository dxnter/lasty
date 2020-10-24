import { Command } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { fetch10RecentTracks } from '../../api/lastfm';
import { USER_UNDEFINED_ARGS } from '../../constants';
import { replyEmbedMessage, userInDatabase } from '../../utils';

export default class RecentCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'recent',
      memberName: 'recent',
      group: 'lastfm',
      description: 'Returns the 10 most recently listened to tracks.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: msg => userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(msg, { fmUser }) {
    if (!fmUser) {
      return replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, tracks } = await fetch10RecentTracks(fmUser);
    if (error) return replyEmbedMessage(msg, null, error, { fmUser });

    const recentTracks = tracks.map((track, i) => {
      const {
        artist: { '#text': artist },
        name: song,
        url
      } = track;
      const artistURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
        .split(' ')
        .join('+')}`;
      return `\`${i + 1}\` [${song}](${url.replace(
        ')',
        '\\)'
      )}) by **[${artist}](${artistURL})**`;
    });

    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Latest tracks for ${fmUser}`,
          msg.author.avatarURL({ dynamic: true }),
          `http://www.last.fm/user/${fmUser}`
        )
        .setDescription(recentTracks)
        .setColor('#E31C23')
    );
  }
}
