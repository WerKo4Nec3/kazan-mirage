export interface EraData {
  panoramaImage: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  shortDescription: string;
  coverImage?: string;
  eras: Record<string, EraData>;
}

export interface Era {
  id: string;
  label: string;
  years: string;
  description: string;
  mapStyle: string;
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  dishIds: string[];
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  emoji: string;
  shortDescription: string;
  description: string;
  ingredients: string[];
  coverImage?: string;
  gallery?: string[];
}
