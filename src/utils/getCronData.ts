import {
  fetchUsersTopArtists,
  fetchUsersTopAlbums,
  fetchUsersTopTracks,
  fetchUserInfo,
  fetchUsersWeeklyScrobbles
} from '../api/lastfm';
import { Track } from 'lastfm';
import { USER_UNREGISTERED } from '../constants';
import { WeeklyStatCronData } from 'lastfm';

async function getCronData(
  fmUser: string
): Promise<Partial<WeeklyStatCronData>> {
  try {
    const { artists } = await fetchUsersTopArtists('week', fmUser);
    const topArtists = artists!.map(artistRes => {
      const { name: artist, playcount } = artistRes;
      const usersArtistsSrobblesURL = `https://www.last.fm/user/${fmUser}/library/music/${artist
        .split(' ')
        .join('+')}`;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` • **[${artist}](${usersArtistsSrobblesURL})**`;
    });

    const { albums } = await fetchUsersTopAlbums('week', fmUser);
    const topAlbums = albums!.map(singleAlbum => {
      const {
        name: albumName,
        playcount,
        url: albumURL,
        artist: { name: artistName, url: artistURL }
      } = singleAlbum;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` • [${albumName}](${albumURL.replace(
        ')',
        '\\)'
      )}) by **[${artistName}](${artistURL.replace(')', '\\)')})**`;
    });

    const { tracks } = await fetchUsersTopTracks('week', fmUser);
    const topTracks = tracks!.map(track => {
      const {
        artist: { name: artist, url: artistURL },
        name: song,
        playcount,
        url
      } = track;
      return `\`${Number(
        playcount
      ).toLocaleString()} ▶️\` • [${song}](${url.replace(
        ')',
        '\\)'
      )}) by **[${artist}](${artistURL.replace(')', '\\)')})**`;
    });

    const { lastFMAvatar } = await fetchUserInfo(fmUser);
    const weeklyTracks = await fetchUsersWeeklyScrobbles(fmUser);
    const weeklyScrobbles = (weeklyTracks as Track[]).reduce(
      (total: number, track: Track) => {
        return (total += Number(track.playcount));
      },
      0
    );

    return { topArtists, topAlbums, topTracks, lastFMAvatar, weeklyScrobbles };
  } catch (err) {
    return {
      error: USER_UNREGISTERED
    };
  }
}

export default getCronData;
