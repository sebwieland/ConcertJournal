import { MusicBrainzApi } from "musicbrainz-api";

export const mbApi = new MusicBrainzApi({
  appName: "concertjournal",
  appVersion: "0.1.0",
  // MusicBrainz asks API clients for a real contact; a URL is accepted
  appContactInfo: "https://concertjournal.de",
});
