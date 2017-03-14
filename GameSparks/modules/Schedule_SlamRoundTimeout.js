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

Schedule_SlamRoundTimeout();

function Schedule_SlamRoundTimeout(){
    var slamId = Spark.getData().slamId;
    var currentRound = Spark.getData().currentRound;

    var entry = RetrieveSlamData(slamId);
    AtomicModify(SlamRoundTimeout, [entry, slamId, currentRound], slamId, "slams");

    function SlamRoundTimeout(entry, slamId, currentRound){
        var rounds = entry.Rounds;
        var matches = rounds[currentRound - 1].Matches;
        for (var i = 0; i < matches.length; ++i){
            if (matches[i].Finished){
                Spark.getLog().debug(FormatString("SlamRoundTimeout: {0} vs {1} - match has finished, so do nothing",
                                                    (matches[i].Contender1 !== null) ? matches[i].Contender1.displayName : "NULL",
                                                    (matches[i].Contender2 !== null) ? matches[i].Contender2.displayName : "NULL"));
                continue;
            }
            // The contender must have started, but not finished, and their opponent must not have disconnected
            if (matches[i].Contender1 !== null && matches[i].Contender1.started && !matches[i].Contender1.finished && !matches[i].Contender2.disconnected){
                FinishSlamRace(entry, entry.EventName, slamId, matches[i].Contender1.time, matches[i].Contender1.id, false, true);
            }
            if (matches[i].Contender2 !== null && matches[i].Contender2.started && !matches[i].Contender2.finished && !matches[i].Contender1.disconnected){
                FinishSlamRace(entry, entry.EventName, slamId, matches[i].Contender2.time, matches[i].Contender2.id, false, true);
            }
        }
        return entry;
    }
}