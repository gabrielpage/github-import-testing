// ====================================================================================================
//
// Cloud Code for GS_MINUTE, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("TimeUtilities");

GSMinute();

function GSMinute() {
    var now = GetNow();

    // NORMAL RACES
    var raceResultsCollection = Spark.runtimeCollection("raceResults");

    var durationMilliseconds = 1000 * 60 * 5; // 5 minutes (milliseconds)
    var expiryTime = now - durationMilliseconds;
    raceResultsCollection.remove({
        eventName: {
            "$ne": "FTUE Opponent Race"
        },
        startTime:{
            "$lte": expiryTime
        }
    });

    // FTUE RACES
    durationMilliseconds = 1000 * 60 * 60 * 24; // 24 hours (milliseconds)
    expiryTime = now - durationMilliseconds;
    raceResultsCollection.remove({
        eventName: {
            "$eq": "FTUE Opponent Race"
        },
        startTime:{
            "$lte": expiryTime
        }
    });

    // SLAMS
    var durationSeconds = 60 * 15; // 15 minutes (seconds)
    expiryTime = (now / 1000) - durationSeconds;
    Spark.runtimeCollection("slams").remove({
        SlamStartTime:{
            "$lte": expiryTime
        }
    });
}