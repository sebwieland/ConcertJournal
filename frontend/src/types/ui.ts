// src/types/ui.ts

export interface SortOrder {
  column: string;
  order: 'asc' | 'desc';
}

export interface ArtistTag {
  count: number;
  name: string;
}

export interface ArtistDetails {
  type?: string;
  genre?: string;
  formationYear?: string;
  country?: string;
  tags?: ArtistTag[];
}