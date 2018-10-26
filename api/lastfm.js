const axios = require('axios');
const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

const PERIOD_PARAMS = {
  week: '7day',
  month: '1month',
  '90': '3month',
  '180': '6month',
  year: '12month',
  all: 'overall'
};

/**
 * Fetches the total amount of scrobbles for the provided Last.FM user.
 * @param {String} fmUser - A registered user on Last.FM.
 *
 * @returns {number} playcount - Amount of scrobbles for the fmUser.
 */
module.exports.getTotalScrobbles = function(fmUser) {
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
};

let globalArtist;
/**
 * Fetches the most recently listened to track for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {{track: String, artist: String, album: String, songUrl: String, albumCover: String}}
 */
module.exports.getRecentTrack = function(fmUser, message) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
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
};

/**
 * Fetches 10 most recently listen to tracks for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {Array} recentTracks - Markdown formatted strings containing Last.FM links and track data.
 */
module.exports.get10RecentTracks = function(fmUser, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  const GET_RECENT_TRACKS = 'user.getRecentTracks';
  const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const recentTracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;
  return axios.get(recentTracksRequestURL).then(recentTracksRes => {
    const recentTracks = recentTracksRes.data.recenttracks.track.map(
      (track, i) => {
        const {
          artist: { '#text': artist },
          name: song,
          url
        } = track;
        return `\`${i + 1}\` **[${song}](${url.replace(
          ')',
          '\\)'
        )})** by **${artist}**`;
      }
    );
    return recentTracks;
  });
};

/**
 * Fetches the total amount of scrobbles a Last.FM user has
 * for a specific artist.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {{url: String, artistScrobbles: Number}}
 */
module.exports.getArtistScrobbles = function(fmUser) {
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
};

/**
 * Fetches the top 10 most scrobbled songs for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topTracks - Markdown formatted strings containing Last.FM links and track data.
 */
module.exports.getUsersTopTracks = function(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }

  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARAMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;
  return axios.get(topTracksRequestURL).then(topTracksRes => {
    const topTracks = topTracksRes.data.toptracks.track.map(track => {
      const {
        artist: { name: artist },
        name: song,
        playcount,
        url
      } = track;
      return `\`${playcount} ▶️\` • **[${song}](${url.replace(
        ')',
        '\\)'
      )})** by **${artist}**`;
    });
    return topTracks;
  });
};

/**
 * Fetches the top 10 most scrobbled artists for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} period A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topArtists - Markdown formatted strings containing Last.FM links and artist data.
 */
module.exports.getUsersTopArtists = function(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }
  const GET_TOP_ARTISTS = 'user.getTopArtists';
  const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARAMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;
  return axios.get(topArtistsRequestURL).then(topArtistsRes => {
    const topArtists = topArtistsRes.data.topartists.artist.map(artistRes => {
      const { name: artist, playcount, url } = artistRes;
      const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
        .split(' ')
        .join('+')}`;
      return `\`${playcount} ▶️\`•  **[${artist}](${usersArtistsSrobblesURL})**`;
    });
    return topArtists;
  });
};

/**
 * Fetches the top 10 most scrobbled albums for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topAlbums - Markdown formatted strings containing Last.FM links and artist data.
 */
module.exports.getUsersTopAlbums = function(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }
  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARAMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  return axios.get(topAlbumsRequestURL).then(albumsRes => {
    const topAlbums = albumsRes.data.topalbums.album.map(singleAlbum => {
      const {
        name: albumName,
        playcount,
        url: albumURL,
        artist: { name: artistName, url: artistURL }
      } = singleAlbum;
      return `\`${playcount} ▶️\`•  **[${albumName}](${albumURL.replace(
        ')',
        '\\)'
      )})** by **[${artistName}](${artistURL.replace(')', '\\)')})**`;
    });
    return topAlbums;
  });
};

/**
 * Fetches the top 10 albums of an artist sorted by listeners.
 * @param {Array} args - Discord.js args containing the artist paramater.
 *
 * @returns {{artistTopAlbums: Array, formattedArtist: String, artistURL: String}}
 */
module.exports.getArtistTopAlbums = function(args) {
  const artist = args.slice(1).join(' ');
  const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
  const artistTopAlbumsRequestURL = `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  return axios.get(artistTopAlbumsRequestURL).then(topAlbumsRes => {
    const formattedArtist = topAlbumsRes.data.topalbums['@attr'].artist;
    const artistURL = topAlbumsRes.data.topalbums.album[0].artist.url;
    const artistTopAlbums = topAlbumsRes.data.topalbums.album.map(
      (album, i) => {
        const { name, playcount, url: albumURL } = album;
        return `\`${i + 1}\` **[${name}](${albumURL.replace(
          ')',
          '\\)'
        )})** • \`${playcount.toLocaleString()} ▶\`  ️`;
      }
    );
    return { artistTopAlbums, formattedArtist, artistURL };
  });
};
