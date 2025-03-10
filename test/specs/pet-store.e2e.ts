import assert from "assert";
import { ApiData } from "../../models/helpers/http/apiData";
import {
  CategoryTypeEnum,
  PetStatus,
} from "../../models/prepare-data/model-builders/enums";
import { petCreateModel } from "../../models/prepare-data/model-builders/pet-builder";
import { Logger } from "../../models/helpers/logger";

let petId;
ApiData.getInstance();

describe("Pet Store -> CRUD Operations", () => {
  it("When Pet store is created, then resource should be returned correctly with 200 status code", async (t) => {
    console.log("1/1 Started");
    let resource = await ApiData.petStoreAPI.createNewPet();

    assert.strictEqual(resource.status, 200, "Status code should be 200");
    assert.ok(resource.data.category.name.includes("Hound"),"Category should include Hound");

    assert.strictEqual(resource.data.name,"Ivan test name","Name should match");
    assert.strictEqual(typeof resource.data.name,"string","Name should be a string");

    assert.strictEqual(resource.data.category.id, 0, "Category ID should be 0");
    assert.match(resource.data.status,/Available|Pending|Sold/,"Invalid pet status");
    assert.ok(!resource.data?.message,"Message should not exist for valid request");

    petId = resource.data.id;

    console.log("1/1 Finished");
  });

  it("When creating Pet store with invalid input, then incorrect response with proper message should be returned", async () => {
    console.log("1/2 Started");

    let resource = await ApiData.petStoreAPI.createNewPet({ model: [] });
    assert.ok(resource.data.message.toLowerCase().includes("something bad happened"));

    console.log("1/2 Finished");
  });

  it("When Pet store is updated, then correct and updated response is shown", async () => {
    console.log("2/1 Started");
    let pet = petCreateModel();
    //pet.id = petId; commented due to API flawed behavior
    pet.id = Math.floor(Math.random() * 9000 + 1000);


    let resource = await ApiData.petStoreAPI.createNewPet({ model: pet });
    const {
      name,
      status,
      id,
      category: { name: categoryName },
    } = resource.data;

    resource.data.name = "Changed random name";
    resource.data.status = PetStatus.Inactive;
    resource.data.category.name = CategoryTypeEnum.Doberman;

    const updatedResult = await ApiData.petStoreAPI.createNewPet(
      { model: resource.data },
      "put"
    );

    assert.ok(!resource.data.message,"Error message should be empty or undefined");
    assert.strictEqual(updatedResult.data.id, id, "Pet ID does not match");
    assert.notStrictEqual(updatedResult.data.name,name,"Pet name was not updated");
    assert.notStrictEqual(updatedResult.data.category.name,categoryName,
      "Pet category name was not updated"
    );

    assert.notStrictEqual(updatedResult.data.status,status,"Pet status was not updated");
    assert.ok(id, "Pet ID should be valid");

    assert.strictEqual(updatedResult.status, 200, "Expected 200 OK status");

    console.log("2/1 Finished");
  });

  it("[2/2] When Pet store is updated without supplying mandatory fields, then proper validation exceptions are thrown and record is not updated", async () => {
    console.log("2/2 Started");
    let pet = petCreateModel();
    //pet.id = petId; commented due to API flawed behavior
    pet.id = Math.floor(Math.random() * 9000 + 1000);


    let resource = await ApiData.petStoreAPI.createNewPet({ model: pet });

    const keyToRemove: string[] = ["name", "photoUrls"];

    //Removing mandatory fields to check api
    keyToRemove.forEach((key) => delete resource.data[key]);
    const updatedResult = await ApiData.petStoreAPI.createNewPet(
      { model: resource.data },
      "put"
    );

    /**
     * Logic below is not handled properly by api side
     */
    assert.strictEqual(updatedResult.status,405,"Mandatory fields validation error");
    assert.strictEqual(updatedResult.data.message,"Error while updating object",
      "Error message mismatch"
    );

    console.log("2/2 Finished");
  });

  it("[2/3] When updating Pet Store with non existing ID, then Pet not found message is shown", async () => {
    console.log("2/3 Started");
    let pet = petCreateModel();
    delete pet.id;

    const updatedResult = await ApiData.petStoreAPI.createNewPet({ model: pet },"put");

    /**
     * Logic below is not handled properly by api side
     */
    assert.strictEqual(updatedResult.status,400,"Expected 400 Bad Request status");
    assert.strictEqual(updatedResult.data.message?.toLowerCase(),"result is not correct",
      "Invalid ID supplied"
    );

    console.log("2/3 Finished");
  });

  it("[3/1] When correct ID has been supplied, then pet can be found successfully and response is not empty", async () => {
    console.log("3/1 Started");

    const id = petId || 5;
    Logger.info(`===CHECKING PET ID===${id}`)
    const petRecord = await ApiData.petStoreAPI.getPet(id);

    assert.ok(petRecord, "Response is null or undefined");
    assert.strictEqual(petRecord.status, 200, "Unexpected status code");
    assert(petRecord.data, "Response data is empty");
    assert.strictEqual(typeof petRecord.data, "object","Response data is not an object");

    assert.strictEqual(petRecord.data.id,id,`Expected pet ID ${id}, but got ${petRecord.data.id}`);
    assert.notStrictEqual(petRecord.data.id, 0, "Pet ID should not be 0");
    assert.strictEqual(typeof petRecord.data.id,"number",
      "Pet ID should be a number"
    );

    assert.ok(petRecord.data.name, "Pet name is missing");
    assert.strictEqual(typeof petRecord.data.name,"string","Pet name should be a string");

    /**
             * API ALWAYS RETURNS ARBITRARY DATA WITHOUT STATUS FIELD (WE'RE SUPPLYING
             * OUR NEWLY CREATED PET ID OR DEFAULT TO EXISTING ONE)
             * assert.ok(petRecord.data.status, "Pet status is missing");
               assert.strictEqual(typeof petRecord.data.status, "string", "Pet status should be a string");
             */
    console.log("3/1 Finished");
  });

  it("[3/2] When Pet store has non existing ID, then Pet not found message is displayed", async () => {
    console.log("3/2 Started");

    const nonExistingId = 999999;
    const petRecord = await ApiData.petStoreAPI.getPet(nonExistingId);

    assert.ok(petRecord, "Response is null");
    assert.strictEqual(petRecord.status, 404, "Expected 404 Not Found status");
    assert.ok(petRecord.data, "Response body should not be empty");
    assert.ok(petRecord.data.message, "Error message is missing");
    assert.ok(petRecord.data.message.toLowerCase().includes("pet not found"),
      "Expected 'not found' in error message"
    );

    console.log("3/2 Finished");
  });
});
