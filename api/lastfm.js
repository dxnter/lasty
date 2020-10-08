require('dotenv').config();
import axios from 'axios';
import { Util } from '../utils/util';
import { LASTFM_API_URL, PERIOD_PARAMS } from '../constants';

const { LASTFM_API_KEY } = process.env;
/**
 * Fetches information about a registered Last.FM user
 * @param {String} fmUser - A registered user on Last.FM.
 *
 * @returns {{totalScrobbles: Number, name: String, profileURL: String, country: String, image: String, unixRegistration: Number}}
 */
export async function fetchUserInfo(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;
  const {
    data: { user: user }
  } = await axios.get(userRequestURL);

  const {
    playcount: totalScrobbles,
    name,
    url: profileURL,
    country,
    image,
    registered: { unixtime: unixRegistration }
  } = user;

  return {
    totalScrobbles,
    name,
    profileURL,
    country,
    image,
    unixRegistration
  };
}

/**
 * Fetches the total amount of scrobbles for the provided Last.FM user.
 * @param {String} fmUser - A registered user on Last.FM.
 *
 * @returns {number} playcount - Amount of scrobbles for the fmUser.
 */
export async function fetchTotalScrobbles(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`;

  const {
    data: {
      user: { playcount }
    }
  } = await axios.get(userRequestURL);

  return playcount;
}

/**
 * Fetches the most recently listened to track for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {{track: String, artist: String, album: String, albumCover: String, songURL: String, artistURL: String, userplaycount: Number}}
 */
export async function fetchRecentTrack(fmUser) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
  const songRequestURL = `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`;

  try {
    const recentRes = await axios.get(songRequestURL);
    const latestTrack = recentRes.data.recenttracks.track[0];

    const {
      name: track,
      artist: { '#text': artist },
      album: { '#text': album }
    } = latestTrack;
    const albumCover = latestTrack.image[2]['#text'];

    const TRACK_INFO = 'track.getInfo';
    const TRACK_INFO_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&track=${track}&artist=${artist}&format=json`;
    const trackInfoRequestURL = `${LASTFM_API_URL}${TRACK_INFO}${TRACK_INFO_QUERY_STRING}`;
    const { data } = await axios.get(trackInfoRequestURL);
    if (data.error) return { error: 'Track not found!' };

    const trackInfo = data.track;
    const {
      url: songURL,
      artist: { url: artistURL }
    } = trackInfo;
    const userplaycount =
      'userplaycount' in trackInfo ? trackInfo.userplaycount : 1;

    return {
      track,
      artist,
      album,
      albumCover,
      songURL,
      artistURL,
      userplaycount
    };
  } catch (err) {
    return {
      error: 'EMPTY_LISTENING_DATA'
    };
  }
}

/**
 * Fetches 10 most recently listen to tracks for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {Array} recentTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export async function fetch10RecentTracks(fmUser) {
  if (!fmUser) {
    return {
      error: 'USER_UNDEFINED'
    };
  }
  const GET_RECENT_TRACKS = 'user.getRecentTracks';
  const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const recentTracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;

  try {
    const {
      data: {
        recenttracks: { track: tracks }
      }
    } = await axios.get(recentTracksRequestURL);
    if (tracks.length === 0) {
      return {
        error: 'EMPTY_LISTENING_DATA'
      };
    }

    const recentTracks = tracks.map((track, i) => {
      const {
        artist: { '#text': artist },
        name: song,
        url
      } = track;
      return `\`${i + 1}\` [${song}](${url.replace(
        ')',
        '\\)'
      )}) by **${artist}**`;
    });

    return {
      author: `Latest tracks for ${fmUser}`,
      description: recentTracks
    };
  } catch (err) {
    return {
      error: 'USER_UNREGISTERED'
    };
  }
}

/**
 * Fetches the top 10 most scrobbled tracks for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export async function fetchUsersTopTracks(fmUser, period) {
  if (!fmUser) {
    return {
      error: 'USER_UNDEFINED'
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: 'PERIOD_INVALID',
      period
    };
  }

  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

  try {
    const {
      data: {
        toptracks: { track: tracks }
      }
    } = await axios.get(topTracksRequestURL);
    if (tracks.length === 0) {
      return {
        error: 'EMPTY_LISTENING_DATA'
      };
    }

    const topTracks = tracks.map(track => {
      const {
        artist: { name: artist, url: artistURL },
        name: song,
        playcount,
        url
      } = track;
      return `\`${playcount} ▶️\` • [${song}](${url.replace(
        ')',
        '\\)'
      )}) by **[${artist}](${artistURL.replace(')', '\\)')})**`;
    });

    return {
      author: `Top Tracks - ${Util.makeReadablePeriod(period)} - ${fmUser}`,
      description: topTracks
    };
  } catch (err) {
    return {
      error: 'USER_UNREGISTERED'
    };
  }
}

/**
 * Fetches the top 10 most scrobbled artists for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} period A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topArtists - Markdown formatted strings containing Last.FM links and artist data.
 */
export async function fetchUsersTopArtists(fmUser, period) {
  if (!fmUser) {
    return {
      error: 'USER_UNDEFINED'
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: 'PERIOD_INVALID',
      period
    };
  }

  const GET_TOP_ARTISTS = 'user.getTopArtists';
  const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;

  try {
    const {
      data: {
        topartists: { artist: artists }
      }
    } = await axios.get(topArtistsRequestURL);
    if (artists.length === 0) {
      return {
        error: 'EMPTY_LISTENING_DATA'
      };
    }

    const topArtists = artists.map(artistRes => {
      const { name: artist, playcount } = artistRes;
      const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
        .split(' ')
        .join('+')}`;
      return `\`${playcount} ▶️\` • **[${artist}](${usersArtistsSrobblesURL})**`;
    });

    return {
      author: `Top Artists - ${Util.makeReadablePeriod(period)} - ${fmUser}`,
      description: topArtists
    };
  } catch (err) {
    return {
      error: 'USER_UNREGISTERED'
    };
  }
}

/**
 * Fetches the top 10 most scrobbled albums for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topAlbums - Markdown formatted strings containing Last.FM links and artist data.
 */
export async function fetchUsersTopAlbums(fmUser, period) {
  if (!fmUser) {
    return {
      error: 'USER_UNDEFINED'
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: 'PERIOD_INVALID',
      period
    };
  }

  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;

  try {
    const {
      data: {
        topalbums: { album: albums }
      }
    } = await axios.get(topAlbumsRequestURL);
    if (albums.length === 0) {
      return {
        error: 'EMPTY_LISTENING_DATA'
      };
    }

    const topAlbums = albums.map(singleAlbum => {
      const {
        name: albumName,
        playcount,
        url: albumURL,
        artist: { name: artistName, url: artistURL }
      } = singleAlbum;
      return `\`${playcount} ▶️\` • [${albumName}](${albumURL.replace(
        ')',
        '\\)'
      )}) by **[${artistName}](${artistURL.replace(')', '\\)')})**`;
    });

    return {
      author: `Top Albums - ${Util.makeReadablePeriod(period)} - ${fmUser}`,
      description: topAlbums
    };
  } catch (err) {
    return {
      error: 'USER_UNREGISTERED'
    };
  }
}

/**
 * Fetches the top 10 albums of an artist sorted by listeners.
 * @param {Array} args - Discord.js args containing the artist paramater.
 *
 * @returns {{artistTopAlbums: Array, formattedArtist: String, artistURL: String}}
 */
export async function fetchArtistTopAlbums(message, args) {
  const artist = args.slice(1).join(' ');
  if (!artist) {
    return {
      error: 'ARTIST_UNDEFINED'
    };
  }

  const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
  const artistTopAlbumsRequestURL = `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  const { data } = await axios.get(artistTopAlbumsRequestURL);

  const formattedArtist = data.topalbums['@attr'].artist;
  const artistURL = data.topalbums.album[0].artist.url;
  const artistTopAlbums = data.topalbums.album
    .sort(Util.sortTopAlbums())
    .map(album => {
      const { name, playcount, url: albumURL } = album;
      return `\`${playcount.toLocaleString()} ▶️\` • **[${name}](${albumURL.replace(
        ')',
        '\\)'
      )})**`;
    });

  return {
    author: `${Util.pluralize(formattedArtist)} Top 10 Albums`,
    description: artistTopAlbums,
    artistURL: artistURL
  };
}

/**
 * Fetches the total amount of scrobbles in a week to be used on the weekly cron
 * @param {String} fmUser A registered user on Last.FM.
 */

export async function fetchUsersWeeklyScrobbles(fmUser) {
  const GET_TOP_TRACKS = 'user.gettoptracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=7day&api_key=${LASTFM_API_KEY}&limit=1000&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

  const {
    data: {
      toptracks: { track: songs }
    }
  } = await axios.get(topTracksRequestURL);

  const totalScrobbles = songs.reduce((total, track) => {
    return (total += Number(track.playcount));
  }, 0);

  return totalScrobbles;
}
