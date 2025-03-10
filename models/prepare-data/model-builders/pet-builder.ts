import { PetModel } from "../model/petModel"
import { CategoryTypeEnum, PetStatus } from "./enums"

export function petCreateModel(): PetModel{
    return {
        id: 0,
        category: {
            name: CategoryTypeEnum.Hound
        },
        name:"Ivan test name",
        photoUrls: [
            "test1", "test2", "test3", "test4"
        ],
        tags: [
            {name: "tag1"},
            {name: "tag2"},
            {name: "tag3"}
        ] ,
        status: PetStatus.Available
    }
}