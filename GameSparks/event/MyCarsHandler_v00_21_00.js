requireOnce("CarInventoryUtilities");
requireOnce("CurrencyUtilities");
requireOnce("GameStatsUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("VersionedDocumentUtilities2");

MyCarsHandler_v002100();

function MyCarsHandler_v002100(){
    var playerId = Spark.getPlayer().getPlayerId();
    var data = Spark.getData();
    var variantId = (data.variantId === "") ? null : data.variantId;
    var carId = data.carId;
    var expectedPrice = data.expectedPrice;

    switch (data.messageType){
        case "purchaseSlot":
            PurchaseSlot(playerId, variantId, carId, expectedPrice);
            break;

        case "payment":
            MakePayment(playerId, variantId, carId, expectedPrice);
            break;
    }
}

function PurchaseSlot(playerId, variantId, carId, expectedPrice) {
    var currentSlotCount = GetPlayerCarSlotsCount(playerId);
    var price = GetCostOfSlot(currentSlotCount + 1, playerId);
    var balance = GetBalance(true, playerId);

    if (price != expectedPrice) {
        // The Price Is Not Right. :P
        Spark.setScriptData("newPrice", price);
    }
    else if (Debit(price, true, playerId)){
        var newSlotCount = AddSlot(playerId, variantId, carId);
        Spark.setScriptData("slots", newSlotCount);
        // IncrementLifetimeGoldSpend(playerId, price); // TODO
    }
    else {
        Spark.getLog().warn("Not enough gold to buy this slot! (costs " + price + " but we only have " + balance + ")");
    }

    AddBalancesToResponse(playerId);
    // AddLifetimeSpendToResponse(playerId); // TODO
}


function AddSlot(playerId, variantId, carId) {
    var newSlotCount = 0;

    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var successfullyWritten = false;

    while (!successfullyWritten) {
        var versionedSlots = GetVersionedPlayerSlotsFromProfile(versionedProfile, playerId);
        carSlots = versionedSlots.GetData();

        if (variantId !== null) {
            var versionedCars = GetVersionedCarsFromProfile(versionedProfile);
            var carToMove = null;
            var index = 0;
            var cars = versionedCars.GetData();
            while (index < cars.length) {
                var car = cars[index];
                if ((car.CarVariantID === variantId) && (car.CarID === carId)) {
                    carToMove = car;
                    break;
                }
                ++index;
            }
            if (carToMove === null) {
                throw new Error(FormatString("Failed to find car \"{0}\" with id {1} in player's profile", variantId, carId));
            }
            var newIndex = carSlots.count;
            if (newIndex < index)
            {
                cars.splice(index, 1);
                cars.splice(newIndex, 0, carToMove);
            }
        }

        AdjustPlayerCarSlotsObject(carSlots, 1);
        newSlotCount = carSlots.count;

        successfullyWritten = versionedProfile.Save();
    }

    return newSlotCount;
}


function MakePayment(playerId, variantId, carId, expectedPrice){
    var playerCar = GetPlayerCar(variantId, carId, playerId);
    if (playerCar.Status.PercentageOwned >= 100){
        ErrorMessage("We are trying to make payments on a car that is already fully owned");
        return;
    }

    var carInventoryCar = GetCarInventoryEntry(variantId, playerId);
    var cost = Math.ceil(carInventoryCar.Value.Hard / 10);

    if (cost != expectedPrice) {
        Spark.setScriptData("newPrice", cost);
    }
    else if (Debit(cost, true, playerId)) {
        playerCar.Status.PercentageOwned += 10;
        if (playerCar.Status.PercentageOwned < 100) {
            playerCar = SetGhostCarRemovalTime(playerCar);
        }
        else {
            playerCar.Timers.GhostCarRemovalTime = 0;

            // if we fully own the car update the profile cache of maxOwnedCarClass
            var versionedProfile = MakeVersionedProfileDocument(playerId);
            var versionedMaxOwnedCarClass = GetVersionedMaxOwnedCarClassFromProfile(versionedProfile);
            var successfullyWritten = false;
            while (!successfullyWritten) {
                var maxOwnedCarClass = versionedMaxOwnedCarClass.GetData();
                maxOwnedCarClass = MaximumCarClass(maxOwnedCarClass, playerCar.Item.ModelData.Class);
                versionedMaxOwnedCarClass.SetData(maxOwnedCarClass);

                successfullyWritten = versionedProfile.Save();
            }
        }
    }
    else {
        var balance = GetBalance(true, playerId);
        Spark.getLog().warn("Not enough money to make this payment (costs " + cost + " but we only have " + balance + ")");
    }
    SetPlayerCar(playerCar.CarVariantID, playerCar.CarID, playerId, playerCar);
    AddBalancesToResponse(playerId);
    Spark.setScriptData("percentageOwned", playerCar.Status.PercentageOwned);
    Spark.setScriptData("removalTime", playerCar.Timers.GhostCarRemovalTime);
}
