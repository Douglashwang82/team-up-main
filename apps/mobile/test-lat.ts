import { apis } from './lib/api';
apis.venues.searchVenues({ lat: 25.01, lng: 121.53, distance: 1000 }).then(res => {
  const v = res[0] && (res[0].venue || res[0]);
  console.log(v ? typeof v.latitude : 'no venues', v?.latitude);
}).catch(console.error);
