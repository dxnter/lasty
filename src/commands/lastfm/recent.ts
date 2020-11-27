import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { fetch10RecentTracks } from '../../api/lastfm';
import {
  EMBED_SIZE_EXCEEDED_RECENT,
  USER_UNDEFINED_ARGS
} from '../../constants';
import Utilities from '../../structures/Utilities';
import { EMBED_COLOR } from '../../../config.json';

interface RecentArg {
  fmUser: string;
}

export default class RecentCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'recent',
      memberName: 'recent',
      group: 'lastfm',
      description: 'Returns the 10 most recently listened to tracks.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'fmUser',
          prompt: 'Enter a registered Last.fm username.',
          type: 'string',
          default: (msg: { author: { id: string } }) =>
            Utilities.userInDatabase(msg.author.id)
        }
      ]
    });
  }

  async run(
    msg: CommandoMessage,
    { fmUser }: RecentArg
  ): Promise<Message | Message[]> {
    msg.channel.startTyping();
    if (!fmUser) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, this.name, USER_UNDEFINED_ARGS);
    }

    const { error, tracks } = await fetch10RecentTracks(fmUser);
    if (error) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, error, { fmUser });
    }

    const discordAvatar: string = msg.author.avatarURL({ dynamic: true })!;

    const recentTracks = tracks?.map((track, i) => {
      const {
        artist: { '#text': artist },
        name: song,
        url
      } = track;
      const artistURL = Utilities.encodeURL(
        `https://www.last.fm/user/${fmUser}/library/music/${artist}`
      );
      return `\`${i + 1}\` **[${song}](${Utilities.encodeURL(
        url
      )})** by [${artist}](${artistURL})`;
    });

    const recentTracksLength = recentTracks?.reduce(
      (length, track) => length + track.length,
      0
    );

    if (recentTracksLength! >= 2048) {
      msg.channel.stopTyping();
      return Utilities.replyEmbedMessage(msg, null, EMBED_SIZE_EXCEEDED_RECENT);
    }

    msg.channel.stopTyping();
    return msg.say(
      new MessageEmbed()
        .setAuthor(
          `Latest tracks for ${fmUser}`,
          discordAvatar,
          `http://www.last.fm/user/${fmUser}`
        )
        .setDescription(recentTracks)
        .setColor(EMBED_COLOR)
    );
  }
}
