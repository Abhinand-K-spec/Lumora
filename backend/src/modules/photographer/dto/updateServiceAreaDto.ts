import type { IGeoPoint } from "../../../shared/interfaces/IPhotographer";


export interface updateServiceAreaDto{
    serviceAreas:{
        name:string,
        center:IGeoPoint,
        radiusKm:number
    }
}