// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("RaceUtilities");
requireOnce("SlamUtilities");
requireOnce("AtomicUtilities");

Schedule_EndRaceTimeout();

function Schedule_EndRaceTimeout(){
    var playerId = Spark.getData().playerId;
    var serverResultId = Spark.getData().serverResultId;
    var isSlam = Spark.getData().isSlam;
    var submittedTimestamp = Spark.getData().submittedTimestamp;

    EndRaceTimeout(playerId, serverResultId, isSlam, submittedTimestamp);

    function EndRaceTimeout(playerId, serverResultId, isSlam, submittedTimestamp){
        var collection = Spark.runtimeCollection("raceResults");
        var entry = ((isSlam)? RetrieveSlamData(serverResultId) : collection.findOne({"_id":{"$oid":serverResultId}}));
        if (entry === null){
            // If there is no entry then the race has finished, so just bail
            return;
        }
        else{
            if (!isSlam){
                var outputData = {};
                AtomicModify(ProcessNonSlam, [entry, serverResultId, outputData], serverResultId, "raceResults");

                if (outputData === null || outputData === undefined || outputData === {}){
                    ErrorMessage("We were expecting output data in \"Schedule_EndRaceTimeout_v00905\" Atomic Function \"ProcessNonSlam\"");
                    return;
                }

                if (outputData.opponentTime === -1) {
                    // Our opponent still hasn't finished yet, so we can safely say we've won
                    SendRaceResultAndUpdateBettingSeries(playerId, /*won*/true, outputData.ourRaceTime, /*opponentTime*/-1, /*opponentCornerAverage*/-1,
                        outputData.wager, outputData.eventName, serverResultId, /*isSlam*/false, /*botRace*/false, submittedTimestamp);
                    return;
                }
                else {
                    // Our opponent has finished, but the entry isn't null, so this is an edge case (probably due to race conditions)
                    // We'll send the results anyway and the client can deal with multiple messages of results (the results should be the same)
                    if (outputData.ourRaceTime <= outputData.opponentTime){
                        DecideResults(outputData.ourRaceTime, outputData.opponentTime, outputData.ourAverageCornerScore,
                            outputData.opponentAverageCornerScore, playerId, outputData.opponentId, outputData.wager,
                            outputData.eventName, serverResultId, /*botRace*/false, submittedTimestamp);
                    }
                }
            }
            else {
                AtomicModify(ProcessSlam, [entry, serverResultId], serverResultId, "slams");
            }
        }

        // ***********************************************************
        // * You should only be calling this from an ATOMIC FUNCTION *
        // ***********************************************************
        function ProcessNonSlam(entry, serverResultId, outputData){
            var wager = entry.wager;
            if (wager === null || wager === undefined){
                ErrorMessage("There is no \"wager\" data in the race results entry");
                return null;
            }
            outputData.wager = wager;

            // Get event name
            var eventName = entry.eventName;
            if (eventName === null || eventName === undefined){
                ErrorMessage("There is no \"eventName\" data in the race results entry");
                return null;
            }
            outputData.eventName = eventName;

            // Race hasn't finished yet, let's check our opponent race time just to be sure
            var raceEntries = entry.race;
            if (raceEntries === null || raceEntries === undefined){
                ErrorMessage("There is no \"race\" data in the race results entry");
                return null;
            }

            if (raceEntries.length !== 2){
                ErrorMessage("There should be 2 entries in the race results, but there is " + raceEntries.length +" instead");
                return null;
            }

            outputData.opponentTime = -1;
            outputData.opponentAverageCornerScore = -1;

            for (var i = 0; i < raceEntries.length; ++i){
                var playerEntry = raceEntries[i];
                if (playerEntry.playerId !== playerId){
                    // This entry belongs to our opponent
                    outputData.opponentTime = playerEntry.time;
                    outputData.opponentId = playerEntry.playerId;
                    outputData.opponentAverageCornerScore = playerEntry.averageCornerScore;
                }
                else{
                    outputData.ourRaceTime = playerEntry.time;
                    outputData.ourAverageCornerScore = playerEntry.averageCornerScore;
                }
            }

            return entry;
        }

        // ***********************************************************
        // * You should only be calling this from an ATOMIC FUNCTION *
        // ***********************************************************
        function ProcessSlam(entry, slamId){
            var currentRound = Spark.getData().round;
            var rounds = entry.Rounds;
            var matches = rounds[currentRound - 1].Matches;
            var result = GetPlayerAndOpponent(matches, playerId);
            if (result === null){
                return null;
            }
            var playerContender = result.player;
            var opponentContender = result.opponent;
            var match = result.match;
            if (!match.Finished){
                // Our opponent still hasn't finished, so we can declare we've won
                // Spark.getLog().debug(FormatString("EndRaceTimeout: {0} vs {1} - {1} is still racing, so {0} has won",
                //                                     playerContender.displayName, opponentContender.displayName));

                opponentContender.timeout = true;
                FinishSlamRace(entry, entry.EventName, slamId, playerContender.time, playerContender.id, false, false);
            }
            else{
                // Spark.getLog().debug(FormatString("EndRaceTimeout: {0} vs {1} - finished, so do nothing",
                //                                     playerContender.displayName, opponentContender.displayName));
            }
            return entry;
        }
    }
}