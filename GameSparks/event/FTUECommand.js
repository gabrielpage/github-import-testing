// ====================================================================================================
//
// Cloud Code for FTUECommand, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("CurrencyUtilities");
requireOnce("XPUtilities");
requireOnce("CollectionUtilities");

requireOnce("DealershipUtilities");

requireOnce("HutchGSMongoCursorWrapper");
requireOnce("HutchGSMongoCollectionWrapper");

requireOnce("DealershipPlayerLevelProbabilityRecord");
requireOnce("DealershipPlayerLevelProbabilityManager");
requireOnce("DealershipSlotProbabilityRecord");
requireOnce("DealershipSlotProbabilityManager");
requireOnce("DealershipManager");
requireOnce("PlayerDataUtilities");


var playerId = Spark.getPlayer().getPlayerId();
var playerVersion = Spark.getPlayer().getSegmentValue("VERSION");
var command = Spark.getData().command;

FTUECommandHandler_v001500();

function FTUECommandHandler_v001500() {
    var dealershipPlayerLevelProbabilityCollection = GetDealershipPlayerLevelProbabilityCollection(playerId);
    var dealershipSlotProbabilityCollection = GetDealershipSlotProbabilityCollection(playerId);
    var carInventoryCollection = GetCarInventoryCollection(playerId);
    var carModelsCollection = GetCarModelsCollection(playerId);
    var playerDealershipCollection = Spark.runtimeCollection("PlayerDealership");
    var dealershipCalendarGSCollection = GetDealershipCalendarCollection(playerId);

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

    switch(command)
    {
        case "setUpInitialStarterDealership":
            var slots = null;
            mgr.generateFTUE(playerId, function(result) {
                slots = result;
            });
            break;

        case "givePlayerInitialGrant":

            if (!GetPlayerFTUEFlag("ChosenCar", playerId)) {

                // Give the player some cash to start off with
                var cash = GetBalance(false, playerId);
                if (cash < 1000) {
                    Credit(1000 - cash, false, playerId);
                }
            }
            AddBalancesToResponse(playerId);

            break;
        case "clearDealership":
            mgr.clearDealership(playerId);
            break;
        default:
            Spark.setScriptError("unknown_FTUE_command", command);
            break;
    }
}
