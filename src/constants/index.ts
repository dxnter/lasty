export const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

export const PERIOD_PARAMS: { [key: string]: string } = {
  week: '7day',
  month: '1month',
  '90': '3month',
  '180': '6month',
  year: '12month',
  all: 'overall'
};

export const READABLE_PERIODS: { [key: string]: string } = {
  week: 'Week',
  month: 'Month',
  '90': '3 Months',
  '180': '6 Months',
  year: 'Year',
  all: 'Overall'
};

export const ERROR = 'ERROR';
export const SUCCESS = 'SUCCESS';
export const USER_UNDEFINED = 'USER_UNDEFINED';
export const USER_UNDEFINED_ARGS = 'USER_UNDEFINED_ARGS';
export const USER_UNDEFINED_ALBUM_ARGS = 'USER_UNDEFINED_ALBUM_ARGS';
export const USER_SET = 'USER_SET';
export const USER_EXISTS = 'USER_EXISTS';
export const USER_UPDATED = 'USER_UPDATED';
export const USER_DELETED = 'USER_DELETED';
export const USER_SUBSCRIBED = 'USER_SUBSCRIBED';
export const USER_UNSUBSCRIBED = 'USER_UNSUBSCRIBED';
export const USER_ALREADY_SUBSCRIBED = 'USER_ALREADY_SUBSCRIBED';
export const USER_ALREADY_UNSUBSCRIBED = 'USER_ALREADY_UNSUBSCRIBED';
export const USER_UNREGISTERED = 'USER_UNREGISTERED';
export const ARTIST_UNDEFINED = 'ARTIST_UNDEFINED';
export const ALBUM_UNDEFINED = 'ALBUM_UNDEFINED';
export const ALBUM_INVALID = 'ALBUM_INVALID';
export const ALBUM_NOT_FOUND = 'ALBUM_NOT_FOUND';
export const ARTIST_INVALID = 'ARTIST_INVALID';
export const ARTIST_NOT_FOUND = 'ARTIST_NOT_FOUND';
export const PERIOD_INVALID = 'PERIOD_INVALID';
export const EMPTY_LISTENING_DATA = 'EMPTY_LISTENING_DATA';
export const NOT_ENOUGH_LISTENERS = 'NOT_ENOUGH_LISTENERS';
export const TRACK_NOT_FOUND = 'TRACK_NOT_FOUND';
export const EMBED_SIZE_EXCEEDED_RECENT = 'EMBED_SIZE_EXCEEDED_RECENT';
export const PERMISSION_INVALID = 'PERMISSION_INVALID';
