/**
 * DealershipHandler_v0170
 *
 * Handles requests to purchase, reserve or replace cars in the player's dealership
 */
requireOnce("CarInventoryUtilities");
requireOnce("CurrencyUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("DealershipUtilities");
requireOnce("XPUtilities");
requireOnce("CollectionUtilities");
requireOnce("TimeUtilities");

requireOnce("HutchGSMongoCursorWrapper");
requireOnce("HutchGSMongoCollectionWrapper");

requireOnce("DealershipPlayerLevelProbabilityRecord");
requireOnce("DealershipPlayerLevelProbabilityManager");
requireOnce("DealershipSlotProbabilityRecord");
requireOnce("DealershipSlotProbabilityManager");
requireOnce("DealershipManager");
requireOnce("AchievementUtilties");

var playerId = Spark.getPlayer().getPlayerId();

var dealershipPlayerLevelProbabilityCollection = GetDealershipPlayerLevelProbabilityCollection(playerId);
var dealershipSlotProbabilityCollection = GetDealershipSlotProbabilityCollection(playerId);
var carInventoryCollection = GetCarInventoryCollection(playerId);
var playerDealershipCollection = Spark.runtimeCollection("PlayerDealership");
var carModelCollection = GetCarModelsCollection(playerId);
var dealershipCalendarGSCollection = GetDealershipCalendarCollection(playerId);

var dealershipPlayerLevelProbabilityWrapper = new HutchGSMongoCollectionWrapper(dealershipPlayerLevelProbabilityCollection);
var dealershipSlotProbabilityWrapper = new HutchGSMongoCollectionWrapper(dealershipSlotProbabilityCollection);
var playerDealershipWrapper = new HutchGSMongoCollectionWrapper(playerDealershipCollection);

var dealershipPlayerLevelProbabilityManager = new DealershipPlayerLevelProbabilityManager(dealershipPlayerLevelProbabilityWrapper);
var dealershipSlotProbabilityManager = new DealershipSlotProbabilityManager(dealershipSlotProbabilityWrapper);

var dealershipManager = new DealershipManager(
    dealershipSlotProbabilityManager,
    dealershipPlayerLevelProbabilityManager,
    carInventoryCollection,
    carModelCollection,
    dealershipCalendarGSCollection,
    playerDealershipWrapper,
    GetRandomRarity);

var messageType = Spark.getData().messageType;
var slotIndexes = Spark.getData().slotIndexes;

// handle old clients which (pointlessly) serialised the int list to JSON
// NOTE: if it's later than August 2016 then remove this!!!
if (typeof slotIndexes === 'string') {
    slotIndexes = JSON.parse(slotIndexes);
}

if (slotIndexes.length === 0) {
    ErrorMessage("No slot indexes were supplied");
}
else {
    switch (messageType) {
        case "purchase":
            if (PurchaseSlotIfRequired()) {
                PurchaseCar(slotIndexes[0], playerId, dealershipManager);
            }
            break;
        case "reserve":
            if (PurchaseSlotIfRequired()) {
                ReserveCar(slotIndexes[0], playerId, dealershipManager);
            }
            break;
        case "replace":
            ReplaceCars(slotIndexes, playerId, dealershipManager);
            break;
        default:
            ErrorMessage("Unrecognised \"messageType\" " + messageType);
            break;
    }
}

function PurchaseSlotIfRequired() {
    var currentSlotCount = GetPlayerCarSlotsCount(playerId);
    var currentCarCount = GetAllPlayerCars(playerId).length;

    if (currentSlotCount > currentCarCount) {
        // No need for a slot!
        return true;
    }

    var price = GetCostOfSlot(currentSlotCount + 1, playerId);
    var balance = GetBalance(true, playerId);

    if (Debit(price, true, playerId)){
        var newCount = AdjustPlayerCarSlots(playerId, 1);
        Spark.setScriptData("slots", newCount);
        // IncrementLifetimeGoldSpend(playerId, price); // TODO
        return true;
    }
    else {
        ErrorMessage("Not enough gold to buy a car slot! (costs " + price + " but we only have " + balance + ")");
        return false;
    }
}

function PurchaseCar(slotIndex, playerId, dealershipManager) {
    // Check it is in the player's dealership
    if (!CarIsValid(slotIndex, playerId, dealershipManager)) {
        return;
    }

    // Purchase it
    dealershipManager.getCarForPlayer(playerId, slotIndex, function(car) {
        var purchasedCar = PurchaseCarFromCarInventory(car.CarVariantID, playerId);
        if (purchasedCar === null || purchasedCar === undefined) {
            ErrorMessage("Failed to purchase car");
            return;
        }

        // Add to response
        AddBalancesToResponse(playerId);

        ReturnOwnedCarInScriptData(playerId, purchasedCar.CarVariantID, purchasedCar.CarID);

        var playerCars = GetAllPlayerCarsNoInventoryItems(playerId);
        var carIndex = Math.min(GetPlayerCarSlotsCount(playerId), playerCars.length) - 1;

        Spark.setScriptData("carActiveIndex", carIndex);

        var versionedProfile = MakeVersionedProfileDocument(playerId);
        var successfullyWritten = false;
        while (!successfullyWritten) {
            SetPlayerActiveIndex(versionedProfile, playerId, carIndex);

            successfullyWritten = versionedProfile.Save();
        }

        // Make sure we have the purchased achievement.
        AchievementCarPurchased(playerId, carIndex);

        dealershipManager.markSlotAsPurchased(playerId, slotIndex, function(result) {
            if (result) {
                dealershipManager.getSlotForPlayer(playerId, slotIndex, function(car) {
                    //Spark.getLog().debug(car);
                    Spark.setScriptData("replacementCars", [dealershipManager.prepareCarSlot(car.Slots[0])]);
                });
            }
        });

        AddAchievementsToResponse(playerId);
    });
}

function ReserveCar(slotIndex, playerId, dealershipManager) {
    // Check it is in the player's dealership
    if (!CarIsValid(slotIndex, playerId, dealershipManager)) {
        return;
    }

    // Purchase it
    dealershipManager.getCarForPlayer(playerId, slotIndex, function(car) {
        var reservedCar = ReserveCarFromCarInventory(car.CarVariantID, playerId);

        if (reservedCar === null || reservedCar === undefined) {
            ErrorMessage("Failed to purchase car");
            return;
        }

        // Add to response
        AddBalancesToResponse(playerId);

        ReturnOwnedCarInScriptData(playerId, reservedCar.CarVariantID, reservedCar.CarID);

        dealershipManager.markSlotAsPurchased(playerId, slotIndex, function(result) {
            if (result) {
                dealershipManager.getSlotForPlayer(playerId, slotIndex, function(car) {
                    Spark.setScriptData("replacementCars", [dealershipManager.prepareCarSlot(car.Slots[0])]);
                });
            }
        });
    });
}

function CarIsValid(slotIndex, playerId, dealershipManager) {
    var valid = false;
    dealershipManager.getSlotForPlayer(playerId, slotIndex, function(slot) {
        if (slot === null) {
            ErrorMessage("Attempting to purchase non-existant slot " + slotIndex + " which isn't in the player's dealership");
            return;
        }

        var carDetails = slot.Slots[0];

        // Check the car is still on sale
        var expiryDateTime = carDetails["ExpiryDateTime"];
        var now = Math.floor(GetNow() / 1000);
        if (now > expiryDateTime) {
            var diff = now - expiryDateTime;
            ErrorMessage("Sale period has expired (finished " + diff + " seconds ago) for slotIndex " + slotIndex);
            return;
        }

        valid = true;
    });

    return valid;
}

function ReplaceCars(slotIndexes, playerId, dealershipManager) {
    var playerLevel = GetXPInfo(Spark.loadPlayer(playerId)).Level;
    if (playerLevel === null) {
         ErrorMessage("PlayerId " + playerId + " does not have a Level?!");
         return;
    }

    var replacementCars = [];
    for (var i = 0; i < slotIndexes.length; i++) {
        dealershipManager.refreshSlot(playerId, slotIndexes[i], playerLevel, function(slotRefreshResult) {
            if (slotRefreshResult !== null) {
                var car = dealershipManager.prepareCarSlot(slotRefreshResult);
                replacementCars.push(car);
            }
        });
    }

    Spark.setScriptData("replacementCars", replacementCars);
}