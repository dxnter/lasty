const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/?method=';

const PERIOD_PARAMS = {
  week: '7day',
  month: '1month',
  '90': '3month',
  '180': '6month',
  year: '12month',
  all: 'overall'
};

const READABLE_PERIODS = {
  week: 'of the last week',
  month: 'of the last month',
  '90': 'of the last 3 months',
  '180': 'of the last 6 months',
  year: 'of the last year'
};

export { LASTFM_API_URL, PERIOD_PARAMS, READABLE_PERIODS };
