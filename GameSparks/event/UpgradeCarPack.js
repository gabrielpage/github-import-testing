// ====================================================================================================
//
// Cloud Code for UpgradeCarPack, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CarInventoryUtilities");
requireOnce("CurrencyUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("ServiceUtilities");
requireOnce("SessionUtilities");
requireOnce("CollectionUtilities");
requireOnce("UpgradePricesUtilities");
requireOnce("VersionedDocumentUtilities2");

UpgradeCarPack();

function UpgradeCarPack(){
    var carVariant = Spark.getData().carVariant;
    var carVariantDiscriminator = Spark.getData().carVariantDiscriminator;
    var packRequested = Spark.getData().packRequested;
    var costOnClient = Spark.getData().cost;

    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    var car = GetPlayerCar(carVariant, carVariantDiscriminator, playerId);
    if (car === null){
        ErrorMessage(FormatString("Couldn't get car with variantId {0} in player's collection", carVariant));
        return;
    }

    var costOnServer = GetPackUpgradeCost(car, packRequested, playerId);
    if (costOnServer === null){
        ErrorMessage("Failed to calculate pack upgrade cost");
    }
    else if (costOnClient !== costOnServer){
        // We have a discrepancy here between what the server wants to charge and the client
        // Send a message back saying the new price and whatnot.
        Spark.getLog().warn(FormatString("Cost of pro pack on server is {0} but the client thinks its {1}",
            costOnServer, costOnClient));

        ReturnCorrectCostInScriptData(costOnServer);
    }
    else{
        var variantId = car.CarVariantID;
        var carData = GetCarInventoryCollection(playerId).findOne({"CarVariantID":variantId});
        if (carData === null || carData === undefined){
            ErrorMessage(FormatString("Failed to find car {0}", variantId));
            return;
        }
        var modelData = GetCarModelsCollection(playerId).findOne({"Model":carData.Model});
        if (modelData === null || modelData === undefined){
            ErrorMessage(FormatString("Failed to find car model [{0}]", carData.Model));
            return;
        }
        var carClass = modelData.ClientData.Class;
        var carManufacturer = modelData.ClientData.Manufacturer;
        if (carClass === null || carClass === undefined){
            ErrorMessage(FormatString("{0} has no \"Class\" field", car.CarVariantID));
            return;
        }

        if (carManufacturer === null || carManufacturer === undefined){
            ErrorMessage(FormatString("{0} has no \"Manufacturer\" field", car.CarVariantID));
            return;
        }

        // Check the player has a pro pack token for this car class and manufacturer
        if (!PlayerHasProPackToken(playerId, carClass, carManufacturer)) {
            ErrorMessage(FormatString("Player does not have ProPack token"));
            return;
        }

        if (!IsEligibleForPack(car, packRequested)) {
            ErrorMessage(FormatString("Car is not eligible for ProPack"));
            return;
        }

        if (!Debit(costOnServer, false, playerId)) {
            ErrorMessage(FormatString("Player does not have enough money"));
            return;
        }

        // LogMessage(FormatString("Cost of pro pack: {0}", costOnServer));
        UsePlayerProPackToken(playerId, carClass, carManufacturer);
        UpgradeCar(car, packRequested);

        if (packRequested === ProPack) {
            // are we servicing? this shouldn't happen, if it does that's potentially a bit of a waste, but it'll work
            // here we get a free service, basically, but we never downgrade ...
            ServiceCarAfterProPackFit(car, modelData);

            // We remove the players edge, otherwise it goes negative and weird as ProPacks are a step down
            RemovePlayerSessionStateForAllEvents(playerId, carVariant, carVariantDiscriminator);

            // Return the session state in this case
            SetSessionStateInResponse(playerId);

            // if we pro-pack the car it increases it's class ...
            var versionedProfile = MakeVersionedProfileDocument(playerId);
            var versionedMaxOwnedCarClass = GetVersionedMaxOwnedCarClassFromProfile(versionedProfile);
            var successfullyWritten = false;
            while (!successfullyWritten) {
                var maxOwnedCarClass = versionedMaxOwnedCarClass.GetData();
                maxOwnedCarClass = MaximumCarClass(maxOwnedCarClass, ClassWithProPack(car.Item.ModelData.Class));
                versionedMaxOwnedCarClass.SetData(maxOwnedCarClass);

                successfullyWritten = versionedProfile.Save();
            }
        }
        // LogMessage(FormatString("carVariant {0} discriminator {1} applied pack (index:){2}", carVariant, carVariantDiscriminator, packRequested));

        SetPlayerCar(carVariant, carVariantDiscriminator, playerId, car);
    }

    ReturnOwnedCarInScriptData(playerId, carVariant, carVariantDiscriminator);
    ProPacks(playerId);
    AddBalancesToResponse(playerId);

    function IsEligibleForPack(car, pack) {
        if (pack === ProPack){
            var isBasic = (car.Status.CarUpgradeStatus.PackFitted === BasePack);
            return (isBasic && IsMaxedOut(car));
        }
        else if (pack === HandlingPack || pack === PowerPack) {
            var isPro = (car.Status.CarUpgradeStatus.PackFitted === ProPack);
            return (isPro && IsMaxedOut(car));
        }
        else {
            ErrorMessage(FormatString("Unrecognised pack index {0} to upgrade to", pack));
            return false;
        }
    }

    function IsMaxedOut(car) {
        var stages = 0;
        switch (car.Status.CarUpgradeStatus.PackFitted) {
            case BasePack:
                stages = BaseStageCount;
                break;

            case ProPack:
                stages = ProPackStageCount;
                break;

            case PowerPack:
            case HandlingPack:
                stages = TuningPackStageCount;
                break;
        }
        return (car.Status.CarUpgradeStatus.PowerStage === stages &&
            car.Status.CarUpgradeStatus.WeightStage === stages &&
            car.Status.CarUpgradeStatus.HandlingStage === stages &&
            car.Status.CarUpgradeStatus.BrakingStage === stages &&

            (car.Status.CarUpgradeStatus.PowerLevel === MaxUpgradeLevel ||
                car.Status.CarUpgradeStatus.PowerLevel === OldMaxUpgradeLevel) &&

            (car.Status.CarUpgradeStatus.WeightLevel === MaxUpgradeLevel ||
                car.Status.CarUpgradeStatus.WeightLevel === OldMaxUpgradeLevel) &&

            (car.Status.CarUpgradeStatus.HandlingLevel === MaxUpgradeLevel ||
                car.Status.CarUpgradeStatus.HandlingLevel === OldMaxUpgradeLevel) &&

            (car.Status.CarUpgradeStatus.BrakingLevel === MaxUpgradeLevel ||
                car.Status.CarUpgradeStatus.BrakingLevel === OldMaxUpgradeLevel)
        );
    }

    function UpgradeCar(car, pack){
        car.Status.CarUpgradeStatus.PackFitted = pack;

        if (pack === HandlingPack) {
            car.Status.CarUpgradeStatus.PowerStage = 1;
            car.Status.CarUpgradeStatus.PowerLevel = MaxUpgradeLevel;
        }
        else {
            car.Status.CarUpgradeStatus.PowerStage = 1;
            car.Status.CarUpgradeStatus.PowerLevel = 0;
        }

        if (pack === PowerPack) {
            car.Status.CarUpgradeStatus.HandlingStage = 1;
            car.Status.CarUpgradeStatus.HandlingLevel = MaxUpgradeLevel;
        }
        else {
            car.Status.CarUpgradeStatus.HandlingStage = 1;
            car.Status.CarUpgradeStatus.HandlingLevel = 0;
        }

        car.Status.CarUpgradeStatus.WeightStage = 1;
        car.Status.CarUpgradeStatus.WeightLevel = 0;
        car.Status.CarUpgradeStatus.BrakingStage = 1;
        car.Status.CarUpgradeStatus.BrakingLevel = 0;
    }
}