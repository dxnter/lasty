import axios from 'axios';
import Utilities from '../structures/Utilities';
import { LASTFM_API_KEY } from '../../config.json';
import {
  ARTIST_INVALID,
  ARTIST_UNDEFINED,
  EMPTY_LISTENING_DATA,
  TRACK_NOT_FOUND,
  LASTFM_API_URL,
  PERIOD_INVALID,
  PERIOD_PARAMS,
  USER_UNDEFINED_ARGS,
  USER_UNREGISTERED,
  ARTIST_NOT_FOUND,
  ALBUM_UNDEFINED,
  ALBUM_INVALID,
  ALBUM_NOT_FOUND
} from '../constants';

/**
 * Verifies that the configured Last.fm API key is valid.
 * @param {string} LASTFM_API_KEY A configured Last.fm API Key.
 *
 * @returns {boolean} true if the LASTFM_API_KEY is valid.
 * @returns {boolean} false if the LASTFM_API_KEY is invalid.
 */

export async function isValidToken(LASTFM_API_KEY) {
  const GET_TOKEN = 'auth.getToken';
  const AUTH_QUERY_STRING = `&api_key=${LASTFM_API_KEY}&format=json`;
  const getAuthTokenRequestURL = `${LASTFM_API_URL}${GET_TOKEN}${AUTH_QUERY_STRING}`;

  try {
    const { data: token } = await axios.get(getAuthTokenRequestURL);
    if (token) return true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches information about a registered Last.fm user.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Object>}
 */
export async function fetchUserInfo(fmUser) {
  const USER_INFO = 'user.getInfo';
  const USER_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&format=json`;
  const userRequestURL = encodeURI(
    `${LASTFM_API_URL}${USER_INFO}${USER_QUERY_STRING}`
  );

  try {
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
      totalScrobbles: Number(totalScrobbles).toLocaleString(),
      name,
      profileURL,
      country,
      image,
      unixRegistration
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches track information.
 * @param {string} trackName Name of a track to search.
 *
 * @returns {Promise<Object>}
 */
export async function searchTrack(trackName) {
  const SEARCH_TRACKS = 'track.search';
  const TRACK_SEARCH_QUERY_STRING = `&track=${trackName}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const trackSearchReqeustURL = encodeURI(
    `${LASTFM_API_URL}${SEARCH_TRACKS}${TRACK_SEARCH_QUERY_STRING}`
  );

  try {
    const {
      data: {
        results: {
          trackmatches: { track: tracks }
        }
      }
    } = await axios.get(trackSearchReqeustURL);

    const { name: track, artist, url: songURL } = tracks[0];

    return {
      track,
      artist,
      songURL
    };
  } catch (err) {
    return {
      error: TRACK_NOT_FOUND
    };
  }
}

/**
 * Fetches the playcount of a track for a fmUser.
 * @param {string} trackName Name of a track to search.
 * @param {string} artistName Name of the artist for the track.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<String>}
 */
export async function fetchTrackScrobbles(trackName, artistName, fmUser) {
  const TRACK_INFO = 'track.getInfo';
  const TRACK_INFO_QUERY_STRING = `&track=${trackName}&artist=${artistName}&user=${fmUser}&api_key=${LASTFM_API_KEY}&autocorrect=1&format=json`;
  const trackInfoRequestURL = encodeURI(
    `${LASTFM_API_URL}${TRACK_INFO}${TRACK_INFO_QUERY_STRING}`
  );

  try {
    const {
      data: { track }
    } = await axios.get(trackInfoRequestURL);
    const { userplaycount } = track;

    return userplaycount;
  } catch (err) {
    return {
      error: TRACK_NOT_FOUND
    };
  }
}

/**
 * Fetches the most recently listened to track for the provided Last.fm user.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Object>}
 */
export async function fetchRecentTrack(fmUser) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
  const songRequestURL = encodeURI(
    `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`
  );

  try {
    const recentRes = await axios.get(songRequestURL);
    const latestTrack = recentRes.data.recenttracks.track[0];
    if (!latestTrack) return { error: EMPTY_LISTENING_DATA, fmUser };

    const {
      name: track,
      artist: { '#text': artist },
      album: { '#text': album }
    } = latestTrack;
    const albumCover = latestTrack.image[3]['#text'];

    const TRACK_INFO = 'track.getInfo';
    const TRACK_INFO_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&track=${track}&artist=${artist}&format=json`;
    const trackInfoRequestURL = encodeURI(
      `${LASTFM_API_URL}${TRACK_INFO}${TRACK_INFO_QUERY_STRING}`
    );
    const { data } = await axios.get(trackInfoRequestURL);
    if (data.error) return { error: TRACK_NOT_FOUND };

    const trackInfo = data.track;
    const {
      url: songURL,
      duration,
      artist: { url: artistURL }
    } = trackInfo;
    const userplaycount =
      'userplaycount' in trackInfo ? trackInfo.userplaycount : 1;
    const trackLength =
      duration && duration !== '0'
        ? Utilities.millisToMinutesAndSeconds(Number(duration))
        : undefined;

    return {
      track,
      artist,
      trackLength,
      album,
      albumCover,
      songURL,
      artistURL,
      userplaycount: Number(userplaycount).toLocaleString()
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches 10 most recently listen to tracks for the provided Last.fm user.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array<Object>>}
 */
export async function fetch10RecentTracks(fmUser) {
  if (!fmUser) {
    return {
      error: USER_UNDEFINED_ARGS
    };
  }
  const GET_RECENT_TRACKS = 'user.getRecentTracks';
  const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const recentTracksRequestURL = encodeURI(
    `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`
  );

  try {
    const {
      data: {
        recenttracks: { track: tracks }
      }
    } = await axios.get(recentTracksRequestURL);
    if (tracks.length === 0) {
      return {
        error: EMPTY_LISTENING_DATA
      };
    }

    return {
      tracks
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches a user's top 10 most scrobbled tracks for the provided time period.
 * @param {string} period A valid period in the PERIOD_PARAMS.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array<Object>,<String>>}
 */
export async function fetchUsersTopTracks(period, fmUser) {
  if (!fmUser) {
    return {
      error: USER_UNDEFINED_ARGS
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: PERIOD_INVALID,
      period
    };
  }

  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = encodeURI(
    `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`
  );

  try {
    const {
      data: {
        toptracks: { track: tracks }
      }
    } = await axios.get(topTracksRequestURL);
    if (tracks.length === 0) {
      return {
        error: EMPTY_LISTENING_DATA
      };
    }

    return {
      tracks,
      readablePeriod: Utilities.makeReadablePeriod(period)
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches a user's top 10 most scrobbled artists for the provided time period.
 * @param {string} period A valid period in the PERIOD_PARAMS.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array<Object>,<String>>}
 */
export async function fetchUsersTopArtists(period, fmUser) {
  if (!fmUser) {
    return {
      error: USER_UNDEFINED_ARGS
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: PERIOD_INVALID,
      period
    };
  }

  const GET_TOP_ARTISTS = 'user.getTopArtists';
  const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topArtistsRequestURL = encodeURI(
    `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`
  );

  try {
    const {
      data: {
        topartists: { artist: artists }
      }
    } = await axios.get(topArtistsRequestURL);
    if (artists.length === 0) {
      return {
        error: EMPTY_LISTENING_DATA
      };
    }

    return {
      artists,
      readablePeriod: Utilities.makeReadablePeriod(period)
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches information about an album and returns the url and playcount for an fmUser.
 * @param {string} artistName Name of an artist to search.
 * @param {string} albumName Name of an album to search.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Object>}
 */
export async function fetchAlbumInfo(artistName, albumName, fmUser) {
  if (!albumName) {
    return {
      error: ALBUM_UNDEFINED
    };
  }

  const ALBUM_GET_INFO = 'album.getInfo';
  const ALBUM_INFO_QUERY_STRING = `&artist=${artistName}&album=${albumName}&api_key=${LASTFM_API_KEY}&limit10&username=${fmUser}&autocorrect=1&format=json`;
  const albumInfoReqeustURL = encodeURI(
    `${LASTFM_API_URL}${ALBUM_GET_INFO}${ALBUM_INFO_QUERY_STRING}`
  );

  try {
    const {
      data: {
        album: { name: formattedArtistName, url: albumURL, userplaycount }
      }
    } = await axios.get(albumInfoReqeustURL);

    return {
      formattedArtistName,
      albumURL,
      userplaycount
    };
  } catch (err) {
    return {
      error: ALBUM_NOT_FOUND,
      albumName
    };
  }
}

/**
 * Fetches a user's top 10 most scrobbled albums for the provided time period.
 * @param {string} period A valid period in the PERIOD_PARAMS.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array<Object>,<String>>}
 */
export async function fetchUsersTopAlbums(period, fmUser) {
  if (!fmUser) {
    return {
      error: USER_UNDEFINED_ARGS
    };
  }
  if (period && !PERIOD_PARAMS[period]) {
    return {
      error: PERIOD_INVALID,
      period
    };
  }

  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topAlbumsRequestURL = encodeURI(
    `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`
  );

  try {
    const {
      data: {
        topalbums: { album: albums }
      }
    } = await axios.get(topAlbumsRequestURL);
    if (albums.length === 0) {
      return {
        error: EMPTY_LISTENING_DATA
      };
    }

    return {
      albums,
      readablePeriod: Utilities.makeReadablePeriod(period)
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches the top 10 albums of an artist sorted by listeners.
 * @param {string} artistName Name of an artist to search.
 *
 * @returns {Promise<Array<Object>>}
 */
export async function fetchArtistTopAlbums(artistName) {
  if (!artistName) {
    return {
      error: ARTIST_UNDEFINED
    };
  }

  const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&artist=${artistName}&api_key=${LASTFM_API_KEY}&limit=11&autocorrect=1&format=json`;
  const artistTopAlbumsRequestURL = encodeURI(
    `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`
  );

  try {
    const {
      data: { topalbums }
    } = await axios.get(artistTopAlbumsRequestURL);
    if (!topalbums || topalbums.album.length === 0) {
      return { error: ARTIST_INVALID, artist: artistName };
    }

    return {
      topalbums
    };
  } catch (err) {
    return {
      error: ARTIST_INVALID,
      artist: artistName
    };
  }
}

/**
 * Fetches album information and the album cover image.
 * @param {string} albumName Name of an album to search.
 *
 * @returns {Promise<Object>}
 */

export async function searchAlbum(albumName) {
  if (!albumName) {
    return {
      error: ALBUM_UNDEFINED
    };
  }

  const ALBUM_SEARCH = 'album.search';
  const ALBUM_SEARCH_QUERY_STRING = `&album=${albumName}&api_key=${LASTFM_API_KEY}&autocorrect=1&format=json`;
  const albumSearchRequestURL = encodeURI(
    `${LASTFM_API_URL}${ALBUM_SEARCH}${ALBUM_SEARCH_QUERY_STRING}`
  );

  try {
    const {
      data: {
        results: {
          albummatches: { album: albums }
        }
      }
    } = await axios.get(albumSearchRequestURL);

    if (albums.length === 0) {
      return {
        error: ALBUM_INVALID
      };
    }

    const { name, artist, url: albumURL, image } = albums[0];
    const coverURL = image[3]['#text'];

    return {
      name,
      artist,
      albumURL,
      albumCoverURL: coverURL
    };
  } catch (err) {
    return {
      error: ALBUM_INVALID
    };
  }
}

/**
 * Fetches the top 10 tracks of an artist sorted by listeners.
 * @param {string} artistName Name of an artist to search.
 *
 * @returns {Promise<Array<Object>,<String>>}
 */
export async function fetchArtistTopTracks(artistName) {
  if (!artistName) {
    return {
      error: ARTIST_UNDEFINED
    };
  }

  const ARTIST_GET_TOP_TRACKS = 'artist.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&artist=${artistName}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
  const artistTopTracksRequestURL = encodeURI(
    `${LASTFM_API_URL}${ARTIST_GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`
  );

  try {
    const {
      data: { toptracks },
      data: {
        toptracks: { track: tracks }
      }
    } = await axios.get(artistTopTracksRequestURL);
    if (!toptracks || tracks.length === 0) {
      return { error: ARTIST_INVALID, artist: artistName };
    }

    return {
      toptracks,
      tracks
    };
  } catch (err) {
    return {
      error: ARTIST_INVALID,
      artist: artistName
    };
  }
}

/**
 * Fetches information and listening data about an artist.
 * @param {string} artistName Name of an artist to search.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array<Object>>}
 */
export async function fetchArtistInfo(artistName, fmUser) {
  if (!artistName) {
    return {
      error: ARTIST_UNDEFINED
    };
  }

  const ARTIST_GET_INFO = 'artist.getInfo';
  const ARTIST_INFO_QUERY_STRING = `&artist=${artistName}&api_key=${LASTFM_API_KEY}&limit=10&username=${fmUser}&autocorrect=1&format=json`;
  const artistInfoRequestURL = encodeURI(
    `${LASTFM_API_URL}${ARTIST_GET_INFO}${ARTIST_INFO_QUERY_STRING}`
  );

  try {
    const {
      data: {
        artist: {
          name: formattedArtistName,
          url: artistURL,
          stats: { listeners, playcount, userplaycount },
          similar: { artist: similarArtists },
          bio: { summary }
        }
      }
    } = await axios.get(artistInfoRequestURL);

    return {
      formattedArtistName,
      artistURL,
      listeners,
      playcount,
      userplaycount,
      similarArtists,
      summary
    };
  } catch (err) {
    return {
      error: ARTIST_NOT_FOUND,
      artist: artistName
    };
  }
}

/**
 * Fetches the total amount of scrobbles in a week to be used on the weekly cron.
 * @param {string} fmUser A registered user on Last.fm.
 *
 * @returns {Promise<Array>}
 */

export async function fetchUsersWeeklyScrobbles(fmUser) {
  const GET_TOP_TRACKS = 'user.gettoptracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=7day&api_key=${LASTFM_API_KEY}&limit=1000&format=json`;
  const topTracksRequestURL = encodeURI(
    `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`
  );

  const {
    data: {
      toptracks: { track: songs }
    }
  } = await axios.get(topTracksRequestURL);

  return songs;
}
