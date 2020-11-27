declare module 'lastfm' {
  type isValidKey = true | false;

  interface Image {
    size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | '';
    ['#text']: string;
  }

  interface UserInfo {
    totalScrobbles: string;
    name: string;
    profileURL: string;
    country: string;
    lastFMAvatar: string;
    unixRegistration: string;
    error: string;
  }

  interface SearchedTrackInfo {
    track: string;
    artist: string;
    songURL: string;
    error: string;
  }

  interface TrackScrobbles {
    userplaycount: string;
    duration: string;
    error: string;
  }

  interface RecentTrackInfo {
    track: string;
    trackLength: string;
    artist: string;
    album: string;
    albumCover: string;
    songURL: string;
    artistURL: string;
    userplaycount: string | number;
    error: string;
  }

  interface Track {
    artist: {
      name: string;
      url: string;
      mbid: string;
      ['#text']: string;
    };
    album: {
      mbid: string;
      ['#text']: string;
    };
    image: Image[];
    streamable: string;
    date: {
      uts: string;
      ['#text']: string;
    };
    url: string;
    name: string;
    playcount: string;
    mbid: string;
  }

  interface RecentTracks {
    tracks: Track[];
    error: string;
  }

  interface TopTracks {
    tracks: Track[];
    period: string;
    readablePeriod: string;
    error: string;
  }

  interface Artist {
    ['@attr']: {
      rank: string;
    };
    mbid: string;
    url: string;
    image: Image[];
    name: string;
    streamable: string;
    playcount: string;
  }

  interface TopArtists {
    artists: Artist[];
    period: string;
    readablePeriod: string;
    error: string;
  }

  interface AlbumInfo {
    formattedArtistName: string;
    albumURL: string;
    userplaycount: string;
    albumName: string;
    error: string;
  }

  interface Album {
    artist: {
      url: string;
      name: string;
      mbid: string;
    };
    ['@attr']: { rank: string };
    image: Image[];
    playcount: string;
    url: string;
    name: string;
    mbid: string;
  }

  interface TopAlbums {
    albums: Album[];
    artist: string;
    period: string;
    readablePeriod: string;
    error: string;
  }

  interface SearchedAlbum {
    name: string;
    artist: string;
    albumURL: string;
    albumCoverURL: string;
    error: string;
  }

  interface TopTracks {
    tracks: Track[];
    artist: string;
    error: string;
  }

  interface SimilarArtist {
    name: string;
    url: string;
    image: Image[];
  }

  interface ArtistInfo {
    formattedArtistName: string;
    artistURL: string;
    listeners: string;
    playcount: string;
    userplaycount: string;
    similarArtists: SimilarArtist[];
    summary: string;
    error: string;
    artist: string;
  }

  interface WeeklyScrobbles {
    songs: Track[];
  }

  interface WeeklyStatCronData {
    topArtists: string[];
    topAlbums: string[];
    topTracks: string[];
    lastFMAvatar: string;
    weeklyScrobbles: number;
    error: string;
  }
}
