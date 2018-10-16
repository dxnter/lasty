const Discord = require('discord.js');
const axios = require('axios');

const User = require('../models/user');

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

function getTotalScrobbles(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;
  return axios.get(userRequestURL).then(totalScrobblesRes => {
    const {
      data: {
        user: { playcount }
      }
    } = totalScrobblesRes;

    return playcount;
  });
}

function getRecentTracks(fmUser) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=2&format=json`;
  const songRequestURL = `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`;
  return axios.get(songRequestURL).then(recentTracksRes => {
    const latestTrack = recentTracksRes.data.recenttracks.track[0];
    if (!latestTrack) {
      return message.channel.send(
        `${fmUser} hasn't listen to anything lately...`
      );
    }
    const {
      name: track,
      artist: { '#text': artist },
      album: { '#text': album },
      url: songUrl
    } = latestTrack;
    const albumCover = latestTrack.image[2]['#text'];
    globalArtist = artist;
    return { track, artist, album, songUrl, albumCover };
  });
}

function getArtistScrobbles(fmUser) {
  const ARTIST_INFO = 'artist.getInfo';
  const ARTIST_QUERY_STRING = `&artist=${globalArtist}&api_key=${LASTFM_API_KEY}&username=${fmUser}&format=json`;
  const artistRequestURL = `${LASTFM_API_URL}${ARTIST_INFO}${ARTIST_QUERY_STRING}`;
  return axios.get(artistRequestURL).then(artistScrobblesRes => {
    const {
      data: {
        artist: { url },
        artist: {
          stats: { userplaycount: artistScrobbles }
        }
      }
    } = artistScrobblesRes;

    return { url, artistScrobbles };
  });
}

module.exports.run = async (bot, message, args) => {
  let fmUser = args[0];
  if (!fmUser) {
    const dbUser = await User.findOne({ userID: message.author.id });
    try {
      fmUser = dbUser.lastFM;
    } catch (e) {
      return message.channel.send(
        'Please set your Last.FM username with `,lf set [username]`\nNo account? Sign up: https://www.last.fm/join'
      );
    }
  }

  axios
    .all([
      getTotalScrobbles(fmUser),
      getRecentTracks(fmUser),
      getArtistScrobbles(fmUser)
    ])
    .then(
      axios.spread(
        (
          totalScrobbles,
          { track, artist, album, songUrl, albumCover },
          { url, artistScrobbles }
        ) => {
          const avatarURL = `https://cdn.discordapp.com/avatars/${
            message.author.id
          }/${message.author.avatar}`;

          const embed = new Discord.RichEmbed()
            .setAuthor(
              `Last.FM: ${fmUser}`,
              avatarURL,
              `http://www.last.fm/user/${fmUser}`
            )
            .setThumbnail(albumCover)
            .addField(
              'Track',
              `[${track}](${songUrl.replace(')', '\\)')})`,
              true
            )
            .addField('Artist', `[${artist}](${url})`, true)
            .setFooter(
              `'${artist}' Scrobbles: ${artistScrobbles ||
                0} | Total Scrobbles: ${totalScrobbles || 0} | Album: ${album}`
            );

          message.channel.send(embed).then(async embedMessage => {
            await embedMessage.react('👍');
            await embedMessage.react('👎');
          });
        }
      )
    );
};

module.exports.help = {
  name: 'np'
};
