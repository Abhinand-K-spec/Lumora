export interface IGeoPoint {
    type: "Point";
    coordinates: [number, number];
  }
  
  export interface IServiceArea {
    _id?: string;
    name: string;
    center: IGeoPoint;
    radiusKm: number;
  }