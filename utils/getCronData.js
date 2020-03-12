import {
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchUsersTopTracks,
  fetchUsersWeeklyScrobbles
} from '../api/lastfm';

async function getCronData(fmUser) {
  const { description: topArtists } = await fetchUsersTopArtists(
    fmUser,
    'week'
  );
  const { description: topAlbums } = await fetchUsersTopAlbums(fmUser, 'week');
  const { description: topTracks } = await fetchUsersTopTracks(fmUser, 'week');

  const weeklyScrobbles = await fetchUsersWeeklyScrobbles(fmUser);

  return { topArtists, topAlbums, topTracks, weeklyScrobbles };
}

export default getCronData;
