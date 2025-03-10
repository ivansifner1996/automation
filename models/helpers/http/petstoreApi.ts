import HttpClient from "./http-client"
import { Logger } from "../logger";
import { PetModel } from "../../prepare-data/model/petModel";
import { UrlDomainHelper } from "../domains-url.helper";
import { petCreateModel } from "../../prepare-data/model-builders/pet-builder";

export type method = 'post' | 'put'

export class PetStoreApi {
    private service = new HttpClient();

    public async createNewPet(data: {model: PetModel | []} = null, type: method = 'post'){
        const postModel = data?.model ?? petCreateModel();
        Logger.info(`[Method] => ${type} | [Request model] => ${postModel} `)

        return type === 'put'
            ? this.service.put<any>(UrlDomainHelper.urlPets, postModel)
            : this.service.post<any>(UrlDomainHelper.urlPets, postModel)
    }

    public async getPet(id: number){
        let resource = this.service.get<any>(`${UrlDomainHelper.urlPets}/${id}`);
        return (await resource);
    }


}