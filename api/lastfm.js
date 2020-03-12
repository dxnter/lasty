require('dotenv').config();
import axios from 'axios';

import { Util } from '../utils/util';

const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';
const { PERIOD_PARAMS } = require('../constants');

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
export async function fetchRecentTrack(fmUser, message) {
  const RECENT_TRACKS = 'user.getRecentTracks';
  const SONG_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=1&format=json`;
  const songRequestURL = `${LASTFM_API_URL}${RECENT_TRACKS}${SONG_QUERY_STRING}`;

  const recentRes = await axios.get(songRequestURL).catch(err => {
    return message.channel.send(
      `${fmUser} hasn't listened to anything lately...`
    );
  });
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
  const userplaycount = trackInfo.hasOwnProperty('userplaycount')
    ? trackInfo.userplaycount
    : 1;

  return {
    track,
    artist,
    album,
    albumCover,
    songURL,
    artistURL,
    userplaycount
  };
}

/**
 * Fetches 10 most recently listen to tracks for the provided Last.FM user.
 * @param {String} fmUser A registered user on Last.FM.
 *
 * @returns {Array} recentTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export async function fetch10RecentTracks(fmUser, message, args) {
  if (!fmUser) {
    return Util.userNotSet(message, args);
  }
  const GET_RECENT_TRACKS = 'user.getRecentTracks';
  const TRACKS_QUERY_STRING = `&user=${fmUser}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const recentTracksRequestURL = `${LASTFM_API_URL}${GET_RECENT_TRACKS}${TRACKS_QUERY_STRING}`;

  const {
    data: {
      recenttracks: { track }
    }
  } = await axios.get(recentTracksRequestURL).catch(err => {
    return message.channel.send(
      `**${fmUser}** is not a registered Last.FM user`
    );
  });

  const recentTracks = track.map((track, i) => {
    const {
      artist: { '#text': artist },
      name: song,
      url
    } = track;
    return `\`${i + 1}\` **[${song}](${url.replace(
      ')',
      '\\)'
    )})** by **${artist}**`;
  });

  return {
    author: `${fmUser}'s Recent Tracks`,
    description: recentTracks
  };
}

/**
 * Fetches the total amount of scrobbles in a week to be used on the weekly cron
 * @param {String} fmUser A registered user on Last.FM.
 */

export async function fetchUsersWeeklyScrobbles(fmUser) {
  const GET_TOP_TRACKS = 'user.gettoptracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=7day&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;

  const {
    data: {
      toptracks: {
        '@attr': { user, total: weeklyScrobbles }
      }
    }
  } = await axios.get(topTracksRequestURL);

  return weeklyScrobbles;
}

/**
 * Fetches the top 10 most scrobbled tracks for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topTracks - Markdown formatted strings containing Last.FM links and track data.
 */
export async function fetchUsersTopTracks(fmUser, period, message, args) {
  if (!fmUser) {
    return Util.userNotSet(message, args);
  }
  if (period && !PERIOD_PARAMS[period]) {
    return Util.invalidPeriod(period);
  }
  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topTracksRequestURL = `${LASTFM_API_URL}${GET_TOP_TRACKS}${TOP_TRACKS_QUERY_STRING}`;
  const {
    data: {
      toptracks: { track }
    }
  } = await axios.get(topTracksRequestURL).catch(err => {
    return message.channel.send(
      `**${fmUser}** is not a registered Last.FM user`
    );
  });

  const topTracks = track.map(track => {
    const {
      artist: { name: artist, url: artistURL },
      name: song,
      playcount,
      url
    } = track;
    return `\`${playcount} ▶️\` • **[${song}](${url.replace(
      ')',
      '\\)'
    )})** by **[${artist}](${artistURL.replace(')', '\\)')})**`;
  });

  return {
    author: `${fmUser}'s Top Tracks for time period of ${
      period ? PERIOD_PARAMS[period] : 'overall'
    }`,
    description: topTracks
  };
}

/**
 * Fetches the top 10 most scrobbled artists for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} period A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topArtists - Markdown formatted strings containing Last.FM links and artist data.
 */
export async function fetchUsersTopArtists(fmUser, period, message, args) {
  if (!fmUser) {
    return Util.userNotSet(message, args);
  }
  if (period && !PERIOD_PARAMS[period]) {
    return Util.invalidPeriod(period);
  }
  const GET_TOP_ARTISTS = 'user.getTopArtists';
  const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;
  const {
    data: {
      topartists: { artist: artists }
    }
  } = await axios.get(topArtistsRequestURL).catch(err => {
    return message.channel.send(
      `**${fmUser}** is not a registered Last.FM user`
    );
  });

  const topArtists = artists.map(artistRes => {
    const { name: artist, playcount } = artistRes;
    const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
      .split(' ')
      .join('+')}`;
    return `\`${playcount} ▶️\`•  **[${artist}](${usersArtistsSrobblesURL})**`;
  });

  return {
    author: `${fmUser}'s Top Artists for time period of ${
      period ? PERIOD_PARAMS[period] : 'overall'
    }`,
    description: topArtists
  };
}

/**
 * Fetches the top 10 most scrobbled albums for the supplied time period.
 * @param {String} fmUser A registered user on Last.FM.
 * @param {String} [period] A valid period in the PERIOD_PARAMS.
 *
 * @returns {Array} topAlbums - Markdown formatted strings containing Last.FM links and artist data.
 */
export async function fetchUsersTopAlbums(fmUser, period, message, args) {
  if (!fmUser) {
    return Util.userNotSet(message, args);
  }
  if (period && !PERIOD_PARAMS[period]) {
    return Util.invalidPeriod(period);
  }
  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${PERIOD_PARAMS[period]}&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topAlbumsRequestURL = `${LASTFM_API_URL}${GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  const {
    data: {
      topalbums: { album }
    }
  } = await axios.get(topAlbumsRequestURL).catch(err => {
    return message.channel.send(
      `**${fmUser}** is not a registered Last.FM user`
    );
  });

  const topAlbums = album.map(singleAlbum => {
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

  return {
    author: `${fmUser}'s Top Albums for time period of ${
      period ? PERIOD_PARAMS[period] : 'overall'
    }`,
    description: topAlbums
  };
}

/**
 * Fetches the top 10 albums of an artist sorted by listeners.
 * @param {Array} args - Discord.js args containing the artist paramater.
 *
 * @returns {{artistTopAlbums: Array, formattedArtist: String, artistURL: String}}
 */
export async function fetchArtistTopAlbums(args) {
  const artist = args.slice(1).join(' ');
  const ARTIST_GET_TOP_ALBUMS = 'artist.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&artist=${artist}&api_key=${LASTFM_API_KEY}&limit=10&autocorrect=1&format=json`;
  const artistTopAlbumsRequestURL = `${LASTFM_API_URL}${ARTIST_GET_TOP_ALBUMS}${TOP_ALBUMS_QUERY_STRING}`;
  const { data } = await axios.get(artistTopAlbumsRequestURL);

  const formattedArtist = data.topalbums['@attr'].artist;
  const artistURL = data.topalbums.album[0].artist.url;
  const artistTopAlbums = data.topalbums.album.map((album, i) => {
    const { name, playcount, url: albumURL } = album;
    return `\`${i + 1}\` **[${name}](${albumURL.replace(
      ')',
      '\\)'
    )})** • \`${playcount.toLocaleString()} ▶\`  ️`;
  });

  return { artistTopAlbums, formattedArtist, artistURL };
}
