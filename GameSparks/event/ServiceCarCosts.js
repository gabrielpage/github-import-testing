// ====================================================================================================
//
// Cloud Code for ServiceCarCosts, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");
requireOnce("ServiceUtilities");
requireOnce("CollectionUtilities");

UpgradeCarCostsRequest();

function UpgradeCarCostsRequest() {
    var carModelName = Spark.getData().carModel;
    var wantModelCosts = (Spark.getData().wantModelCosts === "True");
    var wantGlobalCosts = (Spark.getData().wantGlobalCosts === "True");

    var servicingGlobalCosts = null;
    var playerId = Spark.getPlayer().getPlayerId();

    if (wantModelCosts || wantGlobalCosts) {
        var servicingGlobalSetupCollection = GetServicingGlobalSetupCollection(playerId);
        servicingGlobalCosts = servicingGlobalSetupCollection.findOne();

        Spark.setScriptData("globalCosts", servicingGlobalCosts.ClientData);
    }

    if (wantModelCosts) {
        var carModelsCollection = GetCarModelsCollection(playerId);

        var model = carModelsCollection.findOne({"Model": carModelName});

        var carClass = model.ClientData.Class;

        var servicingSetupByClassCollection = GetServicingSetupByClassCollection(playerId);

        var classBaseCosts = servicingSetupByClassCollection.findOne({"Class": carClass});

        var modelCosts = {
            CarModel : carModelName,
            LapsGainedFromWatchingVideo : classBaseCosts.LapsGainedFromWatchingVideo,
            MinutesBetweenVideoWatch : classBaseCosts.MinutesBetweenVideoWatch
        };

        modelCosts.LapsBeforeService = CalculateLapsBeforeService(model, classBaseCosts, servicingGlobalCosts);

        // laps with pro pack
        var classWithProPack = ClassWithProPackForCosts(carClass);

        var classProPackCosts = servicingSetupByClassCollection.findOne({"Class": classWithProPack});

        modelCosts.LapsBeforeServiceProPack = CalculateLapsBeforeService(model, classProPackCosts, servicingGlobalCosts);

        // costs
        modelCosts.ServicingCostsS1 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classBaseCosts.ServiceCosts[0]);

        modelCosts.ServicingCostsS2 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classBaseCosts.ServiceCosts[1]);

        modelCosts.ServicingCostsS3 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classBaseCosts.ServiceCosts[2]);

        // costs with pro pack
        modelCosts.ServicingCostsProPackS1 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classProPackCosts.ServiceCosts[0]);

        modelCosts.ServicingCostsProPackS2 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classProPackCosts.ServiceCosts[1]);

        modelCosts.ServicingCostsProPackS3 = CalculateServicingCosts(servicingGlobalCosts.ServerData.ServiceCostMultiplier,
            model.ServiceCostMultiplier,
            classProPackCosts.ServiceCosts[2]);

        modelCosts.ServicingTimes = CalculateServicingTimes(model, classBaseCosts);
        modelCosts.ServicingTimesProPack = CalculateServicingTimes(model, classProPackCosts);

        Spark.setScriptData("modelCosts", modelCosts);
    }
}