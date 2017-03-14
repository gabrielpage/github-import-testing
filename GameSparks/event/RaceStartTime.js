// ====================================================================================================
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");
requireOnce("MathUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("GameStatsUtilities");
requireOnce("RaceTypeUtilities");

// N.B. this is only called for the host
RaceStartTime();

function RaceStartTime() {
    var playerId = Spark.getPlayer().getPlayerId();

    // params!

    // Strings
    var targetId = Spark.getData().targetId;
    var eventName = Spark.getData().eventName;

    var raceType = Spark.getData().raceType;

    // Booleans
    var newBettingSeries = Spark.getData().newBettingSeries === "True";

    // Ints / Longs
    var wager = Spark.getData().wager;
    var timestamp = Spark.getData().timestamp;
    var startTimeTicks = Spark.getData().startTimeTicks;

    var ladderLaps = Spark.getData().ladderLaps;

    if (raceType === Ladder) {
        //LogMessage(FormatString("Ladder race RaceStartTime()!"));

        var playerDurabilityOk = ReduceDurabilityOfCurrentCarByAmount(playerId, ladderLaps);
        if (!playerDurabilityOk) {
            ErrorMessage(FormatString("{0}'s current car ({1}) does not have enough durability to race",
                Spark.loadPlayer(playerId).getDisplayName(),
                GetPlayerActiveCar(playerId).CarVariantID));
            return;
        }
    }
    else if (raceType === Bot || raceType === PvP) {
        //LogMessage(FormatString("RaceStartTime() : {0}!", raceType));
        var event = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
        if (event === null || event === undefined) {
            return;
        }

        if (event.IsSlam) {
            Spark.getLog().error("RaceStartTime() - Slams are not supported");
            // Spark.sendMessageByIdExt({"startTime": startTimeTicks, "serverResultId":"BLANK"}, "RaceStartTime", [targetId]);
            // Spark.setScriptData("serverResultId", serverResultId);
        }
        else {
            var isBotRace = raceType === Bot;
            var result = CreateBlankRaceResultsEntryAndChargeForRace(playerId, targetId, wager, eventName, isBotRace, newBettingSeries, timestamp);
            if (result === null || result === undefined) {
                return;
            }
            var serverResultId = result.entryId;
            if (newBettingSeries) {
                timestamp = result.timestamp;
            }

            if (raceType === PvP) {
                Spark.sendMessageByIdExt({
                    "startTime": startTimeTicks, 
                    "serverResultId":serverResultId, 
                    "timestamp":timestamp,
                    "enteredEvent":result.opponentEnteredEvent
                    },
                    "RaceStartTime", [targetId]
                );
            }
            else {
                //LogMessage(FormatString("Got RaceStartTime for: [{0}] type race", raceType));
            }

            Spark.setScriptData("serverResultId", serverResultId);
            Spark.setScriptData("timestamp", timestamp);
            Spark.setScriptData("enteredEvent", result.playerEnteredEvent);
        }
    }
    else {
        ErrorMessage(FormatString("RaceStartTime() : unrecognised race sync handler raceType: {0}", raceType));
    }

    AddLifetimeSpendToResponse(playerId);
    AddBalancesToResponse(playerId);
    AddActiveCarDurabilityToResponse(playerId);
}