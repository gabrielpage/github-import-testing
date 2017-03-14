// ====================================================================================================
// This helps with tracking a player's net winnings over the course of a "betting series", a chain of
// bets made in the betting screen after several races. A betting series ends when a player drops or
// passes.
//
// The client will send up a timestamp and keep hold of it throughout the series. Any requests sent
// with the same timestamp add to the net winnings total. When the series ends, we are told as such,
// and we credit the player's leaderboard entry with the total winnings we accumulated. If the net
// winnings are below zero, nothing is posted.
//
// This guards against crashes and connection drops. For example, if we get a different timestamp than
// we expected, we do the above. If we're left hanging for about ten minutes, we assume the player lost
// connection or crashed/killed the app and never re-opened the game, so we also do the above.
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("BettingUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("EventPrizeUtilities");

BettingSeriesWinningsTracker_v0100();

function BettingSeriesWinningsTracker_v0100(){
    var currentPlayer = Spark.getPlayer();
    var playerId = currentPlayer.getPlayerId();

    var timestamp = Spark.getData().timestamp;
    var eventName = Spark.getData().raceEvent;

    SubmitAndResetBettingSeriesData(playerId, timestamp, eventName);
    SetEventGoalProgressDataInResponse(playerId);

    // grab the unaward prizes for this event and return them
    var versionedProfile = MakeVersionedProfileDocument(playerId);
    SetUnawardedGoalsForEventInScriptData(playerId, versionedProfile, eventName);
    
    AddBalancesToResponse(playerId);
}
