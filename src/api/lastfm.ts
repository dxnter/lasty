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
import {
  isValidKey,
  UserInfo,
  TrackScrobbles,
  SearchedTrackInfo,
  RecentTrackInfo,
  RecentTracks,
  TopTracks,
  TopArtists,
  AlbumInfo,
  TopAlbums,
  SearchedAlbum,
  ArtistInfo,
  WeeklyScrobbles
} from 'lastfm';

/**
 * Verifies that the configured Last.fm API key is valid.
 *
 * @param LASTFM_API_KEY A configured Last.fm API Key.
 *
 * @returns If the LASTFM_API_KEY is valid.
 */

export async function isValidToken(
  LASTFM_API_KEY: string
): Promise<isValidKey> {
  const GET_TOKEN = 'auth.getToken';
  const AUTH_QUERY_STRING = `&api_key=${LASTFM_API_KEY}&format=json`;
  const getAuthTokenRequestURL = `${LASTFM_API_URL}${GET_TOKEN}${AUTH_QUERY_STRING}`;

  try {
    const { data: token } = await axios.get(getAuthTokenRequestURL);
    if (token) return true;
  } catch (err) {
    console.error(err);
  }
  return false;
}

/**
 * Fetches information about a registered Last.fm user.
 *
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Information about a Last.fm user.
 */
export async function fetchUserInfo(
  fmUser: string
): Promise<Partial<UserInfo>> {
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

    const lastFMAvatar = image[2]['#text'];

    return {
      totalScrobbles: Number(totalScrobbles).toLocaleString(),
      name,
      profileURL,
      country,
      lastFMAvatar,
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
 *
 * @param trackName Name of a track to search.
 *
 * @returns Information about a searched track.
 */
export async function searchTrack(
  trackName: string
): Promise<Partial<SearchedTrackInfo>> {
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
 * Fetches the playcount and duration of a track for a fmUser.
 *
 * @param trackName Name of a track to search.
 * @param artistName Name of the artist for the track.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Total scrobbles and duration of a track.
 */

export async function fetchTrackScrobbles(
  trackName: string,
  artistName: string,
  fmUser: string | boolean
): Promise<Partial<TrackScrobbles>> {
  const TRACK_INFO = 'track.getInfo';
  const TRACK_INFO_QUERY_STRING = `&track=${trackName}&artist=${artistName}&user=${fmUser}&api_key=${LASTFM_API_KEY}&autocorrect=1&format=json`;
  const trackInfoRequestURL = encodeURI(
    `${LASTFM_API_URL}${TRACK_INFO}${TRACK_INFO_QUERY_STRING}`
  );
  try {
    const {
      data: { track }
    } = await axios.get(trackInfoRequestURL);
    const { userplaycount, duration } = track;

    return {
      userplaycount,
      duration
    };
  } catch (err) {
    return {
      error: TRACK_NOT_FOUND
    };
  }
}

/**
 * Fetches the most recently listened to track for the provided Last.fm user.
 *
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Information on the last scrobbled track for a user.
 */
export async function fetchRecentTrack(
  fmUser: string | boolean
): Promise<Partial<RecentTrackInfo>> {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
  const songRequestURL = encodeURI(
    `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`
  );

  try {
    const recentRes = await axios.get(songRequestURL);
    const latestTrack = recentRes.data.recenttracks.track[0];
    if (!latestTrack) return { error: EMPTY_LISTENING_DATA };

    const {
      name: track,
      artist: { '#text': artist },
      album: { '#text': album },
      url: songURL
    } = latestTrack;
    const albumCover = latestTrack.image[3]['#text'];

    const { error, userplaycount, duration } = await fetchTrackScrobbles(
      track,
      artist,
      fmUser
    );

    if (!track && !artist && error) {
      return {
        error: TRACK_NOT_FOUND
      };
    }

    const artistURL = Utilities.encodeURL(
      `https://www.last.fm/music/${artist}`
    );

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
      userplaycount: userplaycount ? Number(userplaycount).toLocaleString() : 0
    };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

/**
 * Fetches 10 most recently listen to tracks for the provided Last.fm user.
 *
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Array of the 10 last scrobbled tracks for a user.
 */
export async function fetch10RecentTracks(
  fmUser: string
): Promise<Partial<RecentTracks>> {
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
    if (tracks.length === 0 || tracks.length < 10) {
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
 *
 * @param period A valid period in the PERIOD_PARAMS.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Array of a user's top scrobbled tracks and a readable period.
 */
export async function fetchUsersTopTracks(
  period: string,
  fmUser: string
): Promise<Partial<TopTracks>> {
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
 *
 * @param period A valid period in the PERIOD_PARAMS.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Array of a user's top scrobbled artists and a readable period.
 */
export async function fetchUsersTopArtists(
  period: string,
  fmUser: string
): Promise<Partial<TopArtists>> {
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
 *
 * @param artistName Name of an artist to search.
 * @param albumName Name of an album to search.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Information about an album.
 */
export async function fetchAlbumInfo(
  artistName: string,
  albumName: string,
  fmUser: string
): Promise<Partial<AlbumInfo>> {
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
 *
 * @param period A valid period in the PERIOD_PARAMS.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Array of a user's top scrobbled artists and a readable period.
 */
export async function fetchUsersTopAlbums(
  period: string,
  fmUser: string
): Promise<Partial<TopAlbums>> {
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
 *
 * @param artistName Name of an artist to search.
 *
 * @returns Array of the top albums from an artist.
 */
export async function fetchArtistTopAlbums(
  artistName: string
): Promise<Partial<TopAlbums>> {
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
      data: {
        topalbums: { album: albums }
      }
    } = await axios.get(artistTopAlbumsRequestURL);
    if (!albums || albums.length === 0) {
      return { error: ARTIST_INVALID, artist: artistName };
    }

    return {
      albums
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
 *
 * @param albumName Name of an album to search.
 *
 * @returns Information about a searched album.
 */

export async function searchAlbum(
  albumName: string
): Promise<Partial<SearchedAlbum>> {
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
 *
 * @param artistName Name of an artist to search.
 *
 * @returns Array of the top tracks from an artist.
 */
export async function fetchArtistTopTracks(
  artistName: string
): Promise<Partial<TopTracks>> {
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
      data: {
        toptracks: { track: tracks }
      }
    } = await axios.get(artistTopTracksRequestURL);
    if (!tracks || tracks.length === 0) {
      return { error: ARTIST_INVALID, artist: artistName };
    }

    return {
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
 *
 * @param artistName Name of an artist to search.
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Information about an ariist and a user's scrobbles.
 */
export async function fetchArtistInfo(
  artistName: string,
  fmUser: string | boolean
): Promise<Partial<ArtistInfo>> {
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
 *
 * @param fmUser A registered user on Last.fm.
 *
 * @returns Total scrobbles of a user in the past 7 days.
 */

export async function fetchUsersWeeklyScrobbles(
  fmUser: string
): Promise<Partial<WeeklyScrobbles>> {
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
