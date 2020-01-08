import Discord from 'discord.js';
import {
  getUserInfo,
  get10RecentTracks,
  getUsersTopTracks,
  getUsersTopArtists,
  getUsersTopAlbums,
  getArtistTopAlbums
} from '../api/lastfm';
import db from '../db';

const { LASTFM_API_KEY } = process.env;

module.exports.run = async (bot, message, args) => {
  let fmUser = args[1];
  let period = args[2];
  const dbUser = db
    .get('users')
    .find({ userID: message.author.id })
    .value();
  if (dbUser && args[0] !== 'set') {
    fmUser = dbUser.lastFM;
    period = args[1];
  }
  if (args.length === 3) {
    fmUser = args[1];
    period = args[2];
  }

  switch (args[0]) {
    case 'help': {
      return message.channel.send(
        new Discord.RichEmbed()
          .setTitle('Last.FM Commands')
          .addField(
            'set - Sets Last.FM username.',
            'Example: `,lf set iiMittens`'
          )
          .addField(
            'delete - Deletes saved Last.FM username',
            'Alternate: `reset`'
          )
          .addField(
            'info - Shows Last.FM account information',
            'Example: `,lf info`'
          )
          .addField(
            'np - Shows currently playing song. (Without `,lf` prefix)',
            'Example: `,np` or `,np iiMittens`'
          )
          .addField(
            'recent - Shows 10 most recent tracks played.',
            'Alternate: None'
          )
          .addBlankField(true)
          .addField(
            'Command Paramaters',
            '`week`, `month`, `90`, `180`, `year`, `all` (Default: all)\n**Username can be omitted if set with** `,lf set`\n'
          )
          .addField(
            'tracks - Shows most played tracks',
            'Example: `,lf tracks iiMittens month`'
          )
          .addField(
            'artists - Shows most listened artists',
            'Example: `,lf artists dluxxe week`'
          )
          .addField(
            'albums - Shows most played albums',
            'Example: `,lf albums Reversibly 90`'
          )
          .setColor('#E31C23')
      );
    }

    case 'set': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (existingUser) {
        if (existingUser.lastFM === fmUser) {
          return message.channel.send(
            `Your Last.FM profile is already set to **${fmUser}**`
          );
        }
        existingUser.lastFM = fmUser;
        db.get('users')
          .find({ userID: message.author.id })
          .assign({ lastFM: fmUser })
          .write();
        return message.channel.send(
          `Last.FM username updated to **${fmUser}**`
        );
      }
      db.get('users')
        .push({ userID: message.author.id, lastFM: fmUser })
        .write();
      return message.channel.send(`Last.FM username set to **${fmUser}**`);
    }

    case 'info': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (!existingUser) {
        return message.channel.send(
          `<@${message.author.id}>, Please set your Last.FM username with \`,lf set <username>\`\nNo account? Sign up: https://www.last.fm/join`
        );
      }
      const {
        totalScrobbles,
        name,
        profileURL,
        country,
        image,
        unixRegistration
      } = await getUserInfo(fmUser, LASTFM_API_KEY);
      const lastFMAvatar = image[1]['#text'];

      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(name, lastFMAvatar, profileURL)
          .addField('Total Scrobbes', totalScrobbles.toLocaleString())
          .addField('Country', country)
          .addField('Registration Date', new Date(unixRegistration * 1000))
          .setColor('#E31C23')
      );
    }

    case 'delete':
    case 'reset': {
      const existingUser = db
        .get('users')
        .find({ userID: message.author.id })
        .value();

      if (existingUser) {
        db.get('users')
          .remove({ userID: message.author.id })
          .write();
        return message.channel.send(
          `**${existingUser.lastFM}** has been deleted from the database`
        );
      }
      return message.channel.send(
        `<@${message.author.id}>, Please set your Last.FM username with \`,lf set <username>\`\nNo account? Sign up: https://www.last.fm/join`
      );
    }

    case 'recent': {
      const recentTracks = await get10RecentTracks(
        fmUser,
        message,
        args,
        LASTFM_API_KEY
      );
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(recentTracks.author)
          .setDescription(recentTracks.description)
          .setColor('#E31C23')
      );
    }

    case 'tracks': {
      const topTracks = await getUsersTopTracks(
        fmUser,
        period,
        message,
        args,
        LASTFM_API_KEY
      );
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topTracks.author)
          .setDescription(topTracks.description)
          .setColor('#E31C23')
      );
    }

    case 'artists': {
      const topArtists = await getUsersTopArtists(
        fmUser,
        period,
        message,
        args,
        LASTFM_API_KEY
      );
      if (topArtists.description.length === 0)
        return message.channel.send(
          `<@${message.author.id}>, You don't have any listening history for that time period!`
        );
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topArtists.author)
          .setDescription(topArtists.description)
          .setColor('#E31C23')
      );
    }

    case 'albums': {
      const topAlbums = await getUsersTopAlbums(
        fmUser,
        period,
        message,
        args,
        LASTFM_API_KEY
      );
      if (topAlbums.description.length === 0) {
        return message.channel.send(
          `<@${message.author.id}>, You don't have any listening history for that time period!`
        );
      }
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(topAlbums.author)
          .setDescription(topAlbums.description)
          .setColor('#E31C23')
      );
    }

    case 'topalbums': {
      const {
        artistTopAlbums,
        formattedArtist,
        artistURL
      } = await getArtistTopAlbums(args, LASTFM_API_KEY);
      return message.channel.send(
        new Discord.RichEmbed()
          .setAuthor(`${formattedArtist}'s Top 10 Albums`, null, artistURL)
          .setDescription(artistTopAlbums)
          .setColor('#E31C23')
      );
    }

    default: {
      return message.channel.send(
        `<@${message.author.id}>, Invalid command, try \`,lf help\``
      );
    }
  }
};

module.exports.help = {
  name: 'lf'
};
