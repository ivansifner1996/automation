import { PetStoreApi } from "./petstoreApi";
export class ApiData {
  public static petStoreAPI: PetStoreApi;
  private static instance: ApiData = null;
  private constructor() {

  }

  public static getInstance() {
    if (!ApiData.instance) {
      ApiData.instance = new ApiData();
      this.petStoreAPI = new PetStoreApi();
    }

    return ApiData.instance;
  }
}
