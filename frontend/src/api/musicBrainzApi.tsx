import { MusicBrainzApi } from 'musicbrainz-api';

export const mbApi = new MusicBrainzApi({
    appName: 'concertjournal',
    appVersion: '0.1.0',
    appContactInfo: 'contact@example.com',
});