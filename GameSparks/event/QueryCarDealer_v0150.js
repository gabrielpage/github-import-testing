/**
 * QueryCarDealer_v0150
 *
 * Queries the player's car dealership
 */
requireOnce("DealershipUtilities");

requireOnce("XPUtilities");
requireOnce("CollectionUtilities");

requireOnce("HutchGSMongoCursorWrapper");
requireOnce("HutchGSMongoCollectionWrapper");

requireOnce("DealershipPlayerLevelProbabilityRecord");
requireOnce("DealershipPlayerLevelProbabilityManager");
requireOnce("DealershipSlotProbabilityRecord");
requireOnce("DealershipSlotProbabilityManager");
requireOnce("DealershipManager");

QueryCarDealer_v0150();

function QueryCarDealer_v0150() {
    var playerId = Spark.getPlayer().getPlayerId();
    var dealershipPlayerLevelProbabilityCollection = GetDealershipPlayerLevelProbabilityCollection(playerId);
	var dealershipSlotProbabilityCollection = GetDealershipSlotProbabilityCollection(playerId);
	var carInventoryCollection = GetCarInventoryCollection(playerId);
	var carModelsCollection = GetCarModelsCollection(playerId);
    var dealershipCalendarGSCollection = GetDealershipCalendarCollection(playerId);

    var playerDealershipCollection = Spark.runtimeCollection("PlayerDealership");

    var dealershipPlayerLevelProbabilityWrapper = new HutchGSMongoCollectionWrapper(dealershipPlayerLevelProbabilityCollection);
    var dealershipSlotProbabilityWrapper = new HutchGSMongoCollectionWrapper(dealershipSlotProbabilityCollection);
    var playerDealershipWrapper = new HutchGSMongoCollectionWrapper(playerDealershipCollection);

    var dealershipPlayerLevelProbabilityManager = new DealershipPlayerLevelProbabilityManager(dealershipPlayerLevelProbabilityWrapper);
    var dealershipSlotProbabilityManager = new DealershipSlotProbabilityManager(dealershipSlotProbabilityWrapper);

    var mgr = new DealershipManager(
        dealershipSlotProbabilityManager,
        dealershipPlayerLevelProbabilityManager,
        carInventoryCollection,
        carModelsCollection,
        dealershipCalendarGSCollection,
        playerDealershipWrapper,
        GetRandomRarity);

    var cars = null;
    var numNewCars = 0;
    mgr.getCarsForPlayer(Spark.getPlayer().getPlayerId(), GetXPInfo(Spark.getPlayer()).Level, function (cars_, numNewCars_) {
        cars = cars_;
        numNewCars = numNewCars_;
    });

    if (cars !== null && cars !== undefined) {
        // reverse iteration so it's easy to remove stuff
        for(var i = cars.length -1; i >= 0 ; i--) {
            if (!cars[i].Car.InCarPool) {
                // Yikes this car isn't available, how could we be returning it?!
                Spark.getLog().error(FormatString(
                    "#3 Dealership is trying to return a car [{0}] which isn't enabled! Removing.",
                    cars[i].Car.CarVariantID));

                // remove from list
                cars.splice(i, 1);
            }
        }
    }

    // cars is a list
    Spark.setScriptData("carList", cars);
    Spark.setScriptData("numNewCars", numNewCars);
}