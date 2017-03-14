// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PrizeUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");
requireOnce("RaceEventUtilities");

// Module: LeaderboardUtilities
// Posts a score to a challenge's leaderboard.
function PostToLeagueLeaderboard(playerId, challengeId, score, victoriesToAdd, racesToAdd){
    // Spark.getLog().debug("PostToLeagueLeaderboard");
    // Spark.getLog().debug("racesToAdd: " + racesToAdd);

    if (challengeId === undefined || challengeId === null){
        ErrorMessage("PostToLeagueLeaderboard: challengeId is null/undefined");
        return;
    }
    if (playerId === undefined || playerId === null){
        ErrorMessage("PostToLeagueLeaderboard: playerId is null/undefined");
        return;
    }

    var challengeInstance = Spark.systemCollection("challengeInstance").findOne({
        "_id" : {
            "$oid": challengeId
        }
    },
    {
        "endDate" : 1,
        "challengeName" : 1,
        "state" : 1
    });

    // Don't do anything to the leaderboards if the event has ended!
    var endDate = challengeInstance.endDate;

    var now = GetNow();
    //Spark.getLog().info(FormatString("Event ends at {0}, time now is {1}", endDate, now));
    if (now >= endDate) {
        //Spark.getLog().info("Event has ended so not posting anything to leaderboard");
        return;
    }

    if (ChallengeInstanceIsWaitingToStart(challengeInstance)/*ISSUED, WAITING*/){
        // Challenge isn't running yet so we can't post to it, instead we need to store the current score value
        // into the player's private data, so that we can send something back to the client for fake leaderboards/prize awarding etc.
        UpdatePlayerFakeData(challengeId, playerId, score, victoriesToAdd, racesToAdd);
    }
    else
    {
        //Spark.getLog().info(FormatString("{0} calling PostToEventEarnings [{1}]: score {2} victories {3} races {4}",
        //                                    Spark.loadPlayer(playerId).getDisplayName(),
        //                                    challengeId,
        //                                    score, victoriesToAdd, racesToAdd));

        if (score === undefined || score === null || isNaN(score)){
            // don't ErrorMessage here due to PSIX-2264
            Spark.getLog().error(
                FormatString("PostToLeagueLeaderboard_v01500 score is null/undefined/NaN: {0} for player: {1}",
                score,
                playerId));
            return;
        }
        if (victoriesToAdd === undefined || victoriesToAdd === null || isNaN(victoriesToAdd)){
            ErrorMessage("PostToLeagueLeaderboard_v01500 victoriesToAdd is null/undefined/NaN");
            return;
        }
        if (racesToAdd === undefined || racesToAdd === null || isNaN(racesToAdd)){
            ErrorMessage("PostToLeagueLeaderboard_v01500 racesToAdd is null/undefined/NaN");
            return;
        }

        var success = PostToEventEarningsAndReturnSuccess(playerId, challengeId, score, victoriesToAdd, racesToAdd);
        if (!success) {
            return;
        }
    }

    CheckIfPlayerWonAnEventGoalPrize(playerId, challengeId, score, victoriesToAdd, racesToAdd);
}

function PostToEventEarningsAndReturnSuccess(playerId, challengeId, score, victoriesToAdd, racesToAdd) {
    var response = Spark.sendRequestAs({
        "@class": ".LogChallengeEventRequest",
        "challengeInstanceId": challengeId,
        "eventKey": "PostToEventEarnings",
        "score": score,
        "victories": victoriesToAdd,
        "races": racesToAdd
    },
        playerId
    );

    if (response !== null){
        if (response.error !== undefined && response.error !== null){
            ErrorMessage(FormatString("PostToEventEarnings failed for player {0} challengeId {1}: ", playerId, challengeId), response);
            return false;
        }
    }

    return true;
}

// Module: LeaderboardUtilities.
// Retrieves a specified number of leaderboard entries from the given challenge leaderboard.
// playerId, challengeId and entryCount are all essential, offset is optional
function QueryGetEntries(playerId, challengeId, entryCount, offset){
    //var displayName = Spark.loadPlayer(playerId).getDisplayName();
    //Spark.getLog().info(FormatString("{0}: QueryGetEntries, challengeId {1}, entryCount {2}, offset {3}",
    //    displayName, challengeId, entryCount, offset));

    var leaderboardData = [];
    var totalCount = 0;

    if (offset === null || offset === undefined) {
        offset = 0;
    }

    var challengeLeaderboardInstance = Spark.getLeaderboards().getChallengeLeaderboard(challengeId);
    if (challengeLeaderboardInstance === null || challengeLeaderboardInstance === undefined) {
        totalCount = SetupFakeLeaderboardDataAndReturnTotalCount(leaderboardData, challengeId, playerId);
    }
    else {
        var entriesCursor = challengeLeaderboardInstance.getEntries(entryCount, offset);
        if (ChallengeHasLeaderboardFromCursor(entriesCursor)) {
            totalCount = ExtractLeaderboardDataFromCursorAndReturnTotalCount(leaderboardData, entriesCursor);
        }
        else {
            totalCount = SetupFakeLeaderboardDataAndReturnTotalCount(leaderboardData, challengeId, playerId);
        }
    }

    //Spark.getLog().info(FormatString("{0}: total leaderboard entry count {1}", displayName, totalCount));

    var result = {
        Entries: leaderboardData,
        TotalCount: totalCount
    };
    return result;
}

// Module: LeaderboardUtilities.
// Retrieves a specified number of leaderboard entries around the player from the given challenge leaderboard.
// Both playerId and challengeId are essential, entryCount is optional
function QueryGetAroundMeEntries(playerId, challengeId, entryCount) {
    //var displayName = Spark.loadPlayer(playerId).getDisplayName();
    //Spark.getLog().info(FormatString("{0}: QueryGetEntries, challengeId {1}, entryCount {2}",
    //    displayName, challengeId, entryCount));

    var challenge = Spark.getChallenge(challengeId);
    // Have we entered the challenge?
    var acceptedPlayers = challenge.getAcceptedPlayerIds();
    var found = (acceptedPlayers.indexOf(playerId) !== -1);
    if (!found) {
        //Spark.getLog().info(FormatString("{0}: this player hasn't entered the challenge {1} so cannot perform an 'aroundMe' query",
        //    displayName, challengeId));
        return;
    }

    if (entryCount === null || entryCount === undefined) {
        // Get all the entries
        entryCount = acceptedPlayers.length;
    }

    var response = Spark.sendRequestAs({
        "@class": ".AroundMeLeaderboardRequest",
        challengeInstanceId: challengeId,
        entryCount: entryCount
    }, playerId);

    var totalCount = 0;
    var leaderboardData = [];

    if (!ChallengeHasLeaderboardFromResponse(response)) {
        totalCount = SetupFakeLeaderboardDataAndReturnTotalCount(leaderboardData, challengeId, playerId);
    }
    else {
        leaderboardData = response.data;
        totalCount = leaderboardData.length;
    }

    var result = {
        Entries: leaderboardData,
        TotalCount: totalCount
    };
    return result;
}

// ST: TEMPORARY FIX TO ADD USER EXTERNALIDS TO EACH LEADERBOARD ENTRY UNTIL GAMESPARKS FIX THIS PROPERLY.
function AddEntryExternalIds(leaderboardEntries){
	if(leaderboardEntries != null)
	{
		for(var i=0; i<leaderboardEntries.length; i++)
		{
			var entry = leaderboardEntries[i];
			if( (entry["userId"] != null) && (entry["externalIds"] == null) )
			{
				// Get user info for this entry
				var user = Spark.loadPlayer(entry["userId"]);
				if(user != null)
				{
					var externalIds = user.getExternalIds();
					if(externalIds != null)
					{
						// Add externalIds to leaderboard entry
						entry["externalIds"] = externalIds;
					}
				}
			}
		}
	}
}

// Module: LeaderboardUtilities
// Returns whether a given challenge has a leaderboard.
function ChallengeHasLeaderboardFromCursor(cursor) {
    if (cursor === null || cursor === undefined) {
        return false;
    }
    if (!cursor.hasNext()) {
        return false;
    }

    return true;
}

// Module: LeaderboardUtilities
// Returns whether a given challenge has a leaderboard.
function ChallengeHasLeaderboardFromResponse(response) {
    if (response === null || response === undefined) {
        return false;
    }
    if (response.error !== null && response.error !== undefined) {
        return false;
    }
    if (response.data === null || response.data === undefined || response.data.length === 0) {
        return false;
    }

    return true;
}

// Module: LeaderboardUtilities
// Sets up fake leaderboard data for the given player.
function SetupFakeLeaderboardDataAndReturnTotalCount(leaderboardData, challengeId, playerId){
    var player = Spark.loadPlayer(playerId);
    var count = 0;
    var entry = {};
    var fakeData = GetAllPlayerFakeData(challengeId, playerId);
    // Don't return anything if we have zero scores
    if (fakeData.score === 0) {
        return count;
    }
    count = 1;
    entry.rank = 1;
    entry.userName = player.getDisplayName();
    entry.userId = playerId;
    entry.score = fakeData.score;
    entry.victories = fakeData.victories;
    entry.races = fakeData.races;
    leaderboardData.push(entry);
    return count;
}

function ExtractLeaderboardDataFromCursorAndReturnTotalCount(leaderboardData, cursor) {
    var count = 0;
    while (cursor.hasNext()) {
        var entry = {};
        var cursorEntry = cursor.next();
        entry.score = cursorEntry.getAttribute("score");
        entry.rank = cursorEntry.getRank();
        entry.userName = cursorEntry.getUserName();
        entry.userId = cursorEntry.getUserId();
        entry.victories = cursorEntry.getAttribute("victories");
        leaderboardData.push(entry);
        ++count;
    }
    return count;
}
