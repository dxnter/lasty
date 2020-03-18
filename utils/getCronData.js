import {
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchUsersTopTracks,
  fetchUserInfo,
  fetchUsersWeeklyScrobbles
} from '../api/lastfm';

async function getCronData(fmUser) {
  const { description: topArtists } = await fetchUsersTopArtists(
    fmUser,
    'week'
  );
  const { description: topAlbums } = await fetchUsersTopAlbums(fmUser, 'week');
  const { description: topTracks } = await fetchUsersTopTracks(fmUser, 'week');
  const { image } = await fetchUserInfo(fmUser);
  const weeklyScrobbles = await fetchUsersWeeklyScrobbles(fmUser);

  const lastFMAvatar = image[2]['#text'];
  return { topArtists, topAlbums, topTracks, lastFMAvatar, weeklyScrobbles };
}

export default getCronData;
