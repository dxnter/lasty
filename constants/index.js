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
  week: 'Week',
  month: 'Month',
  '90': '3 Months',
  '180': '6 Months',
  year: 'Year'
};

export { LASTFM_API_URL, PERIOD_PARAMS, READABLE_PERIODS };
