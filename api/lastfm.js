import axios from 'axios';

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';
const { PERIOD_PARAMS } = require('../constants');

export function getUserInfo(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;
  return axios.get(userRequestURL).then(userInfoRes => {
    const {
      playcount: totalScrobbles,
      name,
      url: profileURL,
      country,
      image,
      registered: { unixtime: unixRegistration },
    } = userInfoRes.data.user;
    return {
      totalScrobbles,
      name,
      profileURL,
      country,
      image,
      unixRegistration,
    };
  });
}

/**
 * Fetches the total amount of scrobbles for the provided Last.FM user.
 * @param {String} fmUser - A registered user on Last.FM.
 *
 * @returns {number} playcount - Amount of scrobbles for the fmUser.
 */
export function getTotalScrobbles(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;
  return axios.get(userRequestURL).then(totalScrobblesRes => {
    const { data: { user: { playcount } } } = totalScrobblesRes;

    return playcount;
  });
}

/**
 * Fetches the most recently listened to track for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {{track: String, artist: String, album: String, albumCover: String, songURL: String, artistURL: String, userplaycount: Number}}
 */
export function getRecentTrack(fmUser, message) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
  const songRequestURL = `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`;
  return axios.get(songRequestURL).then(recentTracksRes => {
    const latestTrack = recentTracksRes.data.recenttracks.track[0];
    if (!latestTrack) {
      return message.channel.send(`${fmUser} hasn't listen to anything lately...`);
    }
    const { name: track, artist: { '#text': artist }, album: { '#text': album } } = latestTrack;
    const albumCover = latestTrack.image[2]['#text'];

    const TRACK_INFO = 'track.getInfo';
    const TRACK_INFO_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&track=${track}&artist=${artist}&format=json`;
    const trackInfoRequestURL = `${LASTFM_API_URL}${TRACK_INFO}${TRACK_INFO_QUERY_STRING}`;
    return axios.get(trackInfoRequestURL).then(trackInfoRes => {
      if (trackInfoRes.data.error) return { error: 'Track not found!' };

      let userplaycount;
      if (trackInfoRes.data.track.hasOwnProperty('userplaycount')) {
        userplaycount = trackInfoRes.data.track.userplaycount;
      } else {
        userplaycount = 1;
      }
      const { url: songURL, artist: { url: artistURL } } = trackInfoRes.data.track;
      return {
        track,
        artist,
        album,
        albumCover,
        songURL,
        artistURL,
        userplaycount,
      };
    });
  });
}

/**
 * Fetches 10 most recently listen to tracks for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {Array} recentTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export function get10RecentTracks(fmUser, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set <username>\` or enter a username after \`${args[0]}\``
    );
  }
  const GET_RECENT_TRACKS = 'user.getRecentTracks';
  const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const recentTracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;
  return axios.get(recentTracksRequestURL).then(recentTracksRes => {
    const recentTracks = recentTracksRes.data.recenttracks.track.map((track, i) => {
      const { artist: { '#text': artist }, name: song, url } = track;
      return `\`${i + 1}\` **[${song}](${url.replace(')', '\\)')})** by **${artist}**`;
    });
    return recentTracks;
  });
}

/**
 * Fetches the top 10 most scrobbled tracks for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export function getUsersTopTracks(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set <username>\` or enter a username after \`${args[0]}\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return {
        author: 'Error',
        description: `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`,
      };
    }
  }

  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARAMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;
  return axios.get(topTracksRequestURL).then(topTracksRes => {
    const topTracks = topTracksRes.data.toptracks.track.map(track => {
      const { artist: { name: artist }, name: song, playcount, url } = track;
      return `\`${playcount} ▶️\` • **[${song}](${url.replace(')', '\\)')})** by **${artist}**`;
    });
    return {
      author: `${fmUser}'s Top Tracks for time period of ${period ? PERIOD_PARAMS[period] : 'overall'}`,
      description: topTracks,
    };
  });
}

/**
 * Fetches the top 10 most scrobbled artists for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} period A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topArtists - Markdown formatted strings containing Last.FM links and artist data.
 */
export function getUsersTopArtists(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set <username>\` or enter a username after \`${args[0]}\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return {
        author: 'Error',
        description: `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`,
      };
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
      const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist.split(' ').join('+')}`;
      return `\`${playcount} ▶️\`•  **[${artist}](${usersArtistsSrobblesURL})**`;
    });
    return {
      author: `${fmUser}'s Top Artists for time period of ${period ? PERIOD_PARAMS[period] : 'overall'}`,
      description: topArtists,
    };
  });
}

/**
 * Fetches the top 10 most scrobbled albums for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topAlbums - Markdown formatted strings containing Last.FM links and artist data.
 */
export function getUsersTopAlbums(fmUser, period, message, args) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set <username>\` or enter a username after \`${args[0]}\``
    );
  }
  if (period) {
    if (!PERIOD_PARAMS[period]) {
      return {
        author: 'Error',
        description: `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`,
      };
    }
  }
  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARAMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  return axios.get(topAlbumsRequestURL).then(albumsRes => {
    const topAlbums = albumsRes.data.topalbums.album.map(singleAlbum => {
      const { name: albumName, playcount, url: albumURL, artist: { name: artistName, url: artistURL } } = singleAlbum;
      return `\`${playcount} ▶️\`•  **[${albumName}](${albumURL.replace(
        ')',
        '\\)'
      )})** by **[${artistName}](${artistURL.replace(')', '\\)')})**`;
    });
    return {
      author: `${fmUser}'s Top Albums for time period of ${period ? PERIOD_PARAMS[period] : 'overall'}`,
      description: topAlbums,
    };
  });
}

/**
 * Fetches the top 10 albums of an artist sorted by listeners.
 * @param {Array} args - Discord.js args containing the artist paramater.
 *
 * @returns {{artistTopAlbums: Array, formattedArtist: String, artistURL: String}}
 */
export function getArtistTopAlbums(args) {
  const artist = args.slice(1).join(' ');
  const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
  const artistTopAlbumsRequestURL = `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  return axios.get(artistTopAlbumsRequestURL).then(topAlbumsRes => {
    const formattedArtist = topAlbumsRes.data.topalbums['@attr'].artist;
    const artistURL = topAlbumsRes.data.topalbums.album[0].artist.url;
    const artistTopAlbums = topAlbumsRes.data.topalbums.album.map((album, i) => {
      const { name, playcount, url: albumURL } = album;
      return `\`${i + 1}\` **[${name}](${albumURL.replace(')', '\\)')})** • \`${playcount.toLocaleString()} ▶\`  ️`;
    });
    return { artistTopAlbums, formattedArtist, artistURL };
  });
}
