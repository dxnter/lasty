const axios = require('axios');
const { LASTFM_API_KEY } = process.env;
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

const PERIOD_PARMS = {
  week: '7day',
  month: '1month',
  '90': '3month',
  '180': '6month',
  year: '12month',
  all: 'overall'
};

module.exports.get10RecentTracks = function(fmUser) {
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

module.exports.getUsersTopTracks = function(fmUser, period) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }

  const GET_TOP_TRACKS = 'user.getTopTracks';
  const TOP_TRACKS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARMS[period]
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

module.exports.getUsersTopArtists = function(fmUser, period) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }
  const GET_TOP_ARTISTS = 'user.getTopArtists';
  const TOP_ARTISTS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARMS[period]
  }&api_key=${LASTFM_API_KEY}&limit=10&format=json`;
  const topArtistsRequestURL = `${LASTFM_API_URL}${GET_TOP_ARTISTS}${TOP_ARTISTS_QUERY_STRING}`;
  return axios.get(topArtistsRequestURL).then(topArtistsRes => {
    const topArtists = topArtistsRes.data.topartists.artist.map(artistRes => {
      const { name: artist, playcount, url } = artistRes;
      return `\`${playcount} ▶️\`•  **[${artist}](${url.replace(
        ')',
        '\\)'
      )})**`;
    });
    return topArtists;
  });
};

module.exports.getUsersTopAlbums = function(fmUser, period) {
  if (!fmUser) {
    return message.channel.send(
      `Last.FM username not set, enter \`,lf set [username]\` or enter a username after \`${
        args[0]
      }\``
    );
  }
  if (period) {
    if (!PERIOD_PARMS[period]) {
      return message.channel.send(
        `Invalid period: **${period}**\nPeriods:  \`week\`, \`month\`, \`90\`, \`180\`, \`year\`, \`all\` (Default: all)`
      );
    }
  }
  const GET_TOP_ALBUMS = 'user.getTopAlbums';
  const TOP_ALBUMS_QUERY_STRING = `&user=${fmUser}&period=${
    PERIOD_PARMS[period]
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

module.exports.getArtistTopAlbums = function(fmUser, args) {
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
