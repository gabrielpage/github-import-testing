// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CurrencyUtilities");
requireOnce("CarInventoryUtilities");
requireOnce("XPUtilities");
requireOnce("ServiceUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");
requireOnce("VersionedDocumentUtilities2");
requireOnce("CollectionUtilities");

// Module: CarInventoryUtilities
// Returns true if purchasing the car and adding it to the player's private data was completely successful.
function PurchaseCarFromCarInventory(variantId, playerId) {
    var carDetails = GetCarInventoryEntry(variantId);
    if (carDetails === null){
        return null;
    }
    // Check we have enough money to buy it
    var player = Spark.loadPlayer(playerId);
    var values = carDetails.Value;
    if (values === undefined || values === null){
        ErrorMessage("There is no \"Value\" data in the car inventory entry");
        return null;
    }
    var cost = values.Hard;
    var currentBalance = GetBalance(true, playerId);

    // Allow us to buy a car for free if we've not done the onboarding yet.
    if (!GetPlayerFTUEFlag("ChosenCar", playerId)) {
        cost = 0;
    }

    if (currentBalance < cost){
        ErrorMessage("Not enough money to purchase " + variantId + " (car costs " + cost + " but we only have " + currentBalance + ")");
        return null;
    }
    // Debit the cost
    var success = Debit(cost, true, playerId);
    if (!success){
        return null;
    }

    var car = AddNewCarToInventory(variantId, playerId, 100);
    if (car == null || car == undefined) {
        // Whoa, if it fails here, we should refund what we debited.
        Credit(cost, true, playerId);
        return null;
    }

    // Remove the car from the player's dealership list and get a replacement
    return car;
}

// Module: CarInventoryUtilities
// Returns true if reserving the car and adding it to the player's private data was completely successful.
function ReserveCarFromCarInventory(variantId, playerId) {
    var carDetails = GetCarInventoryEntry(variantId);
    if (carDetails === null){
        return null;
    }
    // Check we have enough money to buy it
    var player = Spark.loadPlayer(playerId);
    var values = carDetails.Value;
    if (values === undefined || values === null){
        ErrorMessage("There is no \"Value\" data in the car inventory entry");
        return null;
    }
    // The cost for reserving is 10% of the full cost (subject to change)
    var cost = Math.ceil(values.Hard * 0.10);
    var currentBalance = GetBalance(true, playerId);
    if (currentBalance < cost){
        ErrorMessage("Not enough money to purchase " + variantId + " (car costs " + cost + " but we only have " + currentBalance + ")");
        return null;
    }
    // Debit the cost
    var success = Debit(cost, true, playerId);

    if (!success) {
        return null;
    }

    var car = AddNewCarToInventory(variantId, playerId, 10);

    return car;
}

// Module: CarInventoryUtilities
function GetVersionedCars(playerId) {
    return MakeVersionedProfile(playerId, "cars");
}

function GetVersionedCarsFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("cars");
}

function GetVersionedMaxOwnedCarClassFromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("maxOwnedCarClass", "C");
}

// Module: CarInventoryUtilities
function GetCars(playerId){
    var versionedProfile = GetVersionedCars(playerId);

    var data = versionedProfile.GetData();

    return data;
}

// Module: CarInventoryUtilities
// Adds the specified variant ID to the player's profile. Returns true if successful.
function AddNewCarToInventory(variantId, playerId, percentageOwned, prizeCar){
    var carDetails = GetCarInventoryEntry(variantId, playerId);
    if (carDetails === null){
        return null;
    }

    if (prizeCar === null || prizeCar === undefined) {
        prizeCar = false;
    }

    // pre-load our database lookups
    var carModelsCollection = GetCarModelsCollection(playerId);
    var model = carModelsCollection.findOne({"Model": carDetails.Model});

    var carClass = model.ClientData.Class;

    // Cars are not sold with upgrades, so no pro-pack here.
    var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);
    var classCosts = servicingSetupByClassCollection.findOne({"Class": carClass});

    var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
    var servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedCars = GetVersionedCarsFromProfile(versionedProfile);
    var versionedMaxOwnedCarClass = GetVersionedMaxOwnedCarClassFromProfile(versionedProfile);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var carPrivateData = versionedCars.GetData();

        // Look to see if we have any other cars with the same variantId
        var carId = 0;
        if (carPrivateData !== null && carPrivateData !== undefined) {
            for (var i = 0; i < carPrivateData.length; ++i){
                var entry = carPrivateData[i];
                if (entry.CarVariantID === variantId){
                    carId = entry.CarID
                    if (carId === undefined || carId === null){
                        ErrorMessage("Entry does not have a \"CarID\" in the player's car inventory");
                        return null;
                    }
                    carId = Math.max(carId, entry.CarID) + 1;
                }
            }
        }

        // We don't copy the whole car information in any more.
        var newCarDetails = {};
        newCarDetails.CarID = carId;
        newCarDetails.CarVariantID = variantId;
        newCarDetails.Timers = {};
        newCarDetails.Status = {};
        newCarDetails.Status.RacingWithWTELaps = false;
        newCarDetails.Status.LastWTELapTime = 0;
        newCarDetails.Status.NumServicesDone = 0;

        var lapsBeforeService = GetLapsBeforeService(model, classCosts, servicingGlobalCosts,
            newCarDetails.Status.NumServicesDone);
        newCarDetails.Status.Durability = lapsBeforeService;
        newCarDetails.Status.MaxDurability = lapsBeforeService;

        newCarDetails.Status.IsGhosted = false;
        var UpgradeStatus = {}
        UpgradeStatus.PackFitted = 0;
        UpgradeStatus.PowerStage = 1;
        UpgradeStatus.PowerLevel = 0;
        UpgradeStatus.WeightStage = 1;
        UpgradeStatus.WeightLevel = 0;
        UpgradeStatus.HandlingStage = 1;
        UpgradeStatus.HandlingLevel = 0;
        UpgradeStatus.BrakingStage = 1;
        UpgradeStatus.BrakingLevel = 0;
        newCarDetails.Status.CarUpgradeStatus = UpgradeStatus;
        newCarDetails.Status.CarUpgradeStatusDeliveries = {};
        newCarDetails.Status.PercentageOwned = percentageOwned;
        if (percentageOwned < 100){
            // If we don't fully own this car then set a removal time
            newCarDetails = SetGhostCarRemovalTime(newCarDetails);
        }

        if (carPrivateData !== null && carPrivateData !== undefined){
            var numSlots = GetPlayerCarSlotsCount(playerId);
            if (prizeCar || (carPrivateData.length < numSlots)) {
                carPrivateData.push(newCarDetails);
            } else {
                carPrivateData.splice(numSlots - 1, 0, newCarDetails);
            }
        }
        else {
            var newList = [newCarDetails];
            // set is required here as newList is a new object we need to insert, and not a reference
            versionedCars.SetData(newList);
        }

        if (percentageOwned >= 100) {
            // if we fully own the car update the profile cache of maxOwnedCarClass
            var maxOwnedCarClass = versionedMaxOwnedCarClass.GetData();

            maxOwnedCarClass = MaximumCarClass(maxOwnedCarClass, carClass);

            versionedMaxOwnedCarClass.SetData(maxOwnedCarClass);
        }

        successfullyWritten = versionedProfile.Save();
    }

    return newCarDetails;
}

// Module: CarInventoryUtilities
// Which car class is higher?
function MaximumCarClass(lhs, rhs) {
    var lookup = {
        "CC" : "C",
        "CB" : "B",
        "CA" : "A",
        "CS" : "S",

        "BC" : "B",
        "BB" : "B",
        "BA" : "A",
        "BS" : "S",

        "AC" : "A",
        "AB" : "A",
        "AA" : "A",
        "AS" : "S",

        "SC" : "S",
        "SB" : "S",
        "SA" : "S",
        "SS" : "S"
    };

    var result = lookup[lhs+rhs];

    if (!result) {
        result = "C";
    }

    return result;
}

// Module: CarInventoryUtilities
// Once we apply a pro-pack what class are we?
function ClassWithProPack(/*enum-string*/ carClass) {
    if (carClass === "C") {
        return "B";
    }
    if (carClass === "B") {
        return "A";
    }
    if (carClass === "A") {
        return "S";
    }
    if (carClass === "S") {
        return "S";
    }

    return "C";
}

// Module: CarInventoryUtilities
// Retrieves a car from the Car Inventory by Variant ID.
function GetCarInventoryEntry(variantId, playerId) {
    if (variantId === null || variantId === undefined || variantId === "") {
        Spark.getLog().error("null/undefined/'' is not a valid name for a car inventory item");
        return null;
    }

    var collection = GetCarInventoryCollection(playerId);
    if (collection === null || collection === undefined){
        Spark.getLog().error("\"CarInventory\" collection doesn't exist");
        return null;
    }

    var query = collection.findOne({"CarVariantID":{"$eq":variantId}});
    if (query === null || query === undefined){
        Spark.getLog().error("Car with variant id " + variantId + " doesn't exist in the server car inventory");
        return null;
    }

    var modelData = GetModelInventoryEntry(query.Model, playerId);
    if (modelData !== null) {
        query.ModelData = modelData;
    }
    else
    {
        delete query.ModelData;
    }

    return query;
}

function GetModelInventoryEntry(modelId, playerId) {
    var carModels = GetCarModelsCollection(playerId);
    if (carModels === null || carModels === undefined){
        Spark.getLog().error("\"CarModels\" collection doesn't exist");
        return null;
    }

    var query = carModels.findOne({"Model":{"$eq":modelId}});
    if (query === null || query === undefined){
        Spark.getLog().error("Model with id " + modelId + " doesn't exist in the server model inventory");
        return null;
    }

    return query.ClientData;
}

function GetAllModelInventoryEntries(playerId)
{
    return GetCarModelsCollection(playerId);
}

// Module: CarInventoryUtilities
// Sets the expiration on a car in a ghost slot to a week from now.
function SetGhostCarRemovalTime(car){
    car.Timers.GhostCarRemovalTime = Math.ceil((GetNow() / 1000) + (60 * 60 * 24 * 7)); // A week from now (in seconds)
    return car;
}
