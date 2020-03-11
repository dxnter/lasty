import {
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchUsersTopTracks,
  fetchUsersWeeklyScrobbles
} from '../api/lastfm'

async function getCronData(fmUser, LASTFM_API_KEY) {
  const { description: topArtists } = await fetchUsersTopArtists(
    fmUser,
    "week",
    null,
    null,
    LASTFM_API_KEY
  );
  const { description: topAlbums } = await fetchUsersTopAlbums(
    fmUser,
    "week",
    null,
    null,
    LASTFM_API_KEY
  );
  const { description: topTracks } = await fetchUsersTopTracks(
    fmUser,
    "week",
    null,
    null,
    LASTFM_API_KEY
  );

  const weeklyScrobbles = await fetchUsersWeeklyScrobbles(fmUser, LASTFM_API_KEY)

  return { topArtists, topAlbums, topTracks, weeklyScrobbles }
}

export default getCronData
