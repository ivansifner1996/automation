import { PetStatus } from "../model-builders/enums"

export interface PetModel {
    id?: number,
    category: {
        name: string
    },
    name: string,
    photoUrls: string[],
    tags: {name: string}[],
    status: PetStatus
  }
  