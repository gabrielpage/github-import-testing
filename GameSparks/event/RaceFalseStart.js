// ====================================================================================================
//
// Cloud Code for RaceSyncHandler_0.22.1, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("RaceTypeUtilities");

RaceFalseStart();

function RaceFalseStart() {
    var playerId = Spark.getPlayer().getPlayerId();

    // Strings
    var raceType = Spark.getData().raceType;
    var targetId = Spark.getData().targetId;
    var serverResultId = Spark.getData().serverResultId;
    var eventName = Spark.getData().eventName;

    // Booleans
    var botFalseStart = Spark.getData().botFalseStart === "True";

    // Ints / Longs
    var timestamp = Spark.getData().timestamp;

    if (raceType === Ladder) {
        //LogMessage(FormatString("Ladder race RacePlayerFalseStart()!"));

        // my work here is done ...
        // todo ... server stuff, one day, maybe
    }
    else if (raceType === Bot || raceType === PvP) {
        var event = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
        if (event === null || event === undefined) {
            return;
        }

        if (event.IsSlam) {
            Spark.getLog().error("RacePlayerFalseStart() - Slams are not supported");

            // Spark.sendMessageByIdExt({"serverResultId":slamId}, "FalseStart", [targetId]);
            // FinishedSlamRace(slamId, -1, -1, playerId, true);
        }
        else {
            var isBotRace = (raceType === Bot);

            // proto: FinishedRaceFalseStart(serverResultId, falseStarterId, nonFalseStarterId, botRace, submittedTimestamp)

            if (botFalseStart) {
                FinishedRaceFalseStart(serverResultId, null, playerId, isBotRace, timestamp);
            }
            else {
                FinishedRaceFalseStart(serverResultId, playerId, targetId, isBotRace, timestamp);
            }

            //LogMessage(FormatString("False start: Player? {0} Bot Race: {1}", !botFalseStart, isBotRace));
        }
    }
    else {
        ErrorMessage(FormatString("RaceStartTime() : unrecognised race sync handler raceType: {0}", raceType));
    }
}