// ====================================================================================================
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");
requireOnce("MathUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("SlamUtilities");
requireOnce("GameStatsUtilities");
requireOnce("RaceTypeUtilities");

RaceFinished();

function RaceFinished(){
    var playerId = Spark.getPlayer().getPlayerId();
    // Strings

    var serverResultId = Spark.getData().serverResultId;
    var eventName = Spark.getData().eventName;
    var slamId = Spark.getData().slamID;
    var track = ((Spark.getData().track === "") ? null : Spark.getData().track);
    var carClass = ((Spark.getData().carClass === "") ? null : Spark.getData().carClass);
    var raceType = Spark.getData().raceType;

    // Booleans
    var playerWon = Spark.getData().playerWon === "True";
    // Floats
    var raceTime = ParseStringToFloat(Spark.getData().raceTime);
    var skillTime = ParseStringToFloat(Spark.getData().skillTime);
    var averageCornerScore = ParseStringToFloat(Spark.getData().averageCornerScore);
    // Ints
    var timestamp = Spark.getData().timestamp;

    // ladder winnings (only use if we won a ladder race)
    var ladderGold = Spark.getData().ladderGold;
    var ladderCash = Spark.getData().ladderCash;
    var ladderBlueprintCount = Spark.getData().ladderBlueprintCount;
    var ladderBlueprintVariant = Spark.getData().ladderBlueprintVariant;

    if (raceType === Ladder) {
        //LogMessage(FormatString("Ladder race RaceFinished()!"));

        // Credit winnings and advance the player's progress through the Ladder if they won.
        if (playerWon) {
            Credit(ladderGold, true, playerId);

            var versionedLadderProgressData = GetVersionedPlayerLadderProgressData(playerId);
            var successfullyWritten = false;

            while (!successfullyWritten) {
                var ladderProgressData = versionedLadderProgressData.GetData();
                var progress = ladderProgressData[eventName];
                if (progress === null || progress === undefined) {
                    ladderProgressData[eventName] = 1;
                }
                else {
                    ladderProgressData[eventName] += 1;
                }
                successfullyWritten = versionedLadderProgressData.SetData(ladderProgressData);
            }

            AddBalancesToResponse(playerId);
            AddLadderProgressToResponse(playerId);
        }

        // my work here is done ...
        // todo ... server stuff, one day, maybe
    }
    else if (raceType === PvP) {
        //LogMessage(FormatString("PvP race RaceFinished()!"));

        var event = GetRaceEventDataFromMetaCollection(eventName, false, playerId);

        if (event === null || event === undefined) {
            ErrorMessage("Event: {0} does not exist, bailing!", eventName);
            return;
        }

        if (event.IsSlam) {
            ErrorMessage("Slam races are not supported! Event: {0}", eventName);
            //FinishedSlamRace(slamId, raceTime, skillTime, playerId, false);
            return;
        }
        else {
            var isBotRace = false;
            FinishedRaceAndUpdateSkill(serverResultId, raceTime, skillTime, averageCornerScore, playerId, isBotRace, timestamp);
        }
    }
    else if (raceType === Bot) {
        //LogMessage(FormatString("Bot race RaceFinished()!"));
        if (playerWon !== null && playerWon !== undefined) {
            FinishedBotRaceAndUpdateSkill(serverResultId, raceTime, skillTime, averageCornerScore, playerId, playerWon, timestamp);
        }
        else {
            ErrorMessage(FormatString("For a bot race playerWon must be a boolean, but is: {0}", playerWon));
        }

    }
    else {
        ErrorMessage(FormatString("RaceFinished() Unrecognised race sync handler raceType: {0}", raceType));
    }

    AddSkillStatsToResponse(playerId, track, carClass);
}