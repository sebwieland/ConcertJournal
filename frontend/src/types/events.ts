// src/types/events.ts

import { ApiErrorType } from '../types/api';

export interface ConcertEvent {
  id: number;
  bandName: string;
  place: string;
  date: string | number[];  // Support both string and array format
  comment: string;
  rating: number;
  appUser?: {  // Make appUser optional
    firstName: string;
    lastName: string;
    username: string;
  };
}

export interface CreateEventData {
  bandName: string;
  place: string;
  date: string | number[];
  rating: number;
  comment: string;
}

export interface UpdateEventData {
  bandName?: string;
  place?: string;
  date?: string | number[];
  rating?: number;
  comment?: string;
}