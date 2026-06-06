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
  eras: Record<string, EraData>;
}

export interface Era {
  id: string;
  label: string;
  years: string;
  description: string;
  mapStyle: string;
}
