// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("AchievementUtilities");
requireOnce("RaceEventUtilities");
requireOnce("TimeUtilities");

function UpdateEventGoalProgress(playerId, eventName, trackName, lapTime, raceTime, perfectCorners, corners, opponentRaceTime) {
    Info("UpdateEventGoalProgress START");

    var challengeId = GetChallengeIdForEvent(playerId, eventName);
    if (challengeId === null || challengeId === undefined) {
        return;
    }

    var displayName = Spark.loadPlayer(playerId).getDisplayName();

    var eventGoalProgressData = null;
    var raceEventData = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
    var versionedPlayerEventGoalProgressData = GetVersionedPlayerEventGoalProgressData(playerId);
    var successfullyWritten = false;
    while (!successfullyWritten) {
        eventGoalProgressData = versionedPlayerEventGoalProgressData.GetData();
        // Get the event data (with the event name as the key)
        var eventData = eventGoalProgressData[eventName];
        var dataChallengeId = null;
        if (eventData !== null && eventData !== undefined) {
            dataChallengeId = eventData.challengeId;
        }

        if (eventData === null || eventData === undefined ||
            dataChallengeId === null || dataChallengeId === undefined ||
            (dataChallengeId !== challengeId)) {
            // If the event data is null/undefined OR
            // if the challenge id is null/undefined OR
            // the data's challenge id doesn't match the challenge id we've passed through
            // refresh the data and start anew
            Info(FormatString("{0}: Creating fresh event goal progress data for event {1} with challengeId {2}",
                displayName, eventName, challengeId));
            eventData = {
                "challengeId": challengeId,
                "timestamp": Math.floor(GetNow() / 1000)
            };
        }
        // Remove any legacy data from the old format
        RemoveLegacyData(eventData);
        // Get the track data (with the track name as the key)
        var tracksData = eventData.TracksData;
        if (tracksData === null || tracksData === undefined) {
            tracksData = {};
        }
        var trackData = tracksData[trackName];
        if (trackData === null || trackData === undefined) {
            // We haven't raced on this track yet so create some fresh data
            Info(FormatString("{0}: Initialising fresh track data for event {1}", displayName, eventName));
            trackData = InitialiseFreshTrackData(trackName, lapTime, raceTime, perfectCorners, corners, opponentRaceTime, raceEventData);
        }
        else {
            Info(FormatString("{0}: Updating track data for event {1}", displayName, eventName));
            // Update the data as appropriate
            UpdateBestLapTime(trackData, lapTime);
            UpdatePerfectCorners(trackData, perfectCorners);
            UpdateTotalCorners(trackData, corners);
            UpdateTimeUnderCount(trackData, trackName, raceTime, raceEventData);
            UpdateCloseRaceCount(trackData, trackName, raceTime, opponentRaceTime, raceEventData);
        }
        // Save the data
        tracksData[trackName] = trackData;
        eventData.TracksData = tracksData;
        eventGoalProgressData[eventName] = eventData;
        successfullyWritten = versionedPlayerEventGoalProgressData.SetData(eventGoalProgressData);
        // Achievements
        if (successfullyWritten) {
            Info(FormatString("{0}: Data saved for event {1} [{2}]", displayName, eventName, JSON.stringify(eventData)));
            Info(FormatString("{0}: EventGoalData [{1}]", displayName, JSON.stringify(eventGoalProgressData)));
            // Use the stats from the current race to determine the state of the achieve
            if (corners !== null && corners !== undefined &&
                perfectCorners !== null && perfectCorners !== undefined) {

                AchievementCornerData(playerId, corners, perfectCorners);
            }
        }
    }

    Info("UpdateEventGoalProgress END");

    return eventGoalProgressData;

    function InitialiseFreshTrackData(trackName, lapTime, raceTime, perfectCorners, corners, opponentRaceTime, raceEventData) {
        trackData = {};
        if (lapTime !== null && lapTime !== undefined && !isNaN(lapTime) && lapTime > 0) {
            trackData.bestLapTime = lapTime;
        }
        if (perfectCorners !== null && perfectCorners !== undefined && !isNaN(perfectCorners) && perfectCorners > 0) {
            trackData.bestPerfectCorners = perfectCorners;
        }
        if (corners !== null && corners !== undefined && !isNaN(corners) && corners > 0) {
            trackData.totalCorners = corners;
        }

        if (raceEventData === null || raceEventData === undefined) {
            Error("SetFreshTrackData: \"raceEventData\" is null/undefined");
            return;
        }
        var eventGoals = raceEventData.EventGoals;
        if (eventGoals === null || eventGoals === undefined) {
            Error("SetFreshTrackData: \"EventGoals\" is null/undefined");
            return;
        }
        // Loop over the event goal (bottom up) data for this race event
        for (var i = 0; i < eventGoals.length; ++i) {
            var eventGoal = eventGoals[i];
            // Initialise any data that requires info from the event goals array in the race event data
            InitialseTimeUnderData(trackData, eventGoal, raceTime, trackName);
            InitialiseCloseRaceData(trackData, eventGoal, raceTime, opponentRaceTime, trackName);
        }
        return trackData;
    }

    function UpdateBestLapTime(trackData, newLapTime) {
        var newBestLapTime = UpdateTimedStat(trackData.bestLapTime, newLapTime, "bestLapTime");
        if (newBestLapTime !== null) {
            trackData.bestLapTime = newBestLapTime;
        }
    }

    function UpdatePerfectCorners(trackData, newPerfectCorners) {
        trackData.bestPerfectCorners = IncrementValue(trackData.bestPerfectCorners, newPerfectCorners, "bestPerfectCorners");
    }

    function UpdateTotalCorners(trackData, newTotalCorners) {
        trackData.totalCorners = IncrementValue(trackData.totalCorners, newTotalCorners, "totalCorners");
    }

    function UpdateTimeUnderCount(trackData, trackName, raceTime, raceEventData) {
        // False start/cheating
        if (raceTime <= 0){
            return;
        }

        if (raceEventData === null || raceEventData === undefined) {
            Error("SetFreshTrackData: \"raceEventData\" is null/undefined");
            return;
        }
        var eventGoals = raceEventData.EventGoals;
        if (eventGoals === null || eventGoals === undefined) {
            Error("SetFreshTrackData: \"EventGoals\" is null/undefined");
            return;
        }

        var array = trackData.timeUnder;
        if (array === null || array === undefined) {
            for (var i = 0; i < eventGoals.length; ++i) {
                var eventGoal = eventGoals[i];
                InitialseTimeUnderData(trackData, eventGoal, raceTime, trackName);
            }
        }
        else {
            for (var i = 0; i < eventGoals.length; ++i) {
                var eventGoal = eventGoals[i];
                if (eventGoal.TrackName !== trackName) {
                    continue;
                }
                if (eventGoal.Goal === GetTimeUnderGoalName()) {
                    array = trackData.timeUnder;
                    var timeUnder = parseFloat(eventGoal.GoalTarget);
                    var found = false;
                    for (var j = 0; j < array.length; ++j) {
                        if (FloatsEqual(array[j].time, timeUnder)) {
                            if (raceTime < timeUnder) {
                                ++array[j].count;
                                trackData.timeUnder = array;
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        InitialseTimeUnderData(trackData, eventGoal, raceTime, trackName);
                        trackData.timeUnder = array;
                    }
                }
            }
        }
    }

    function UpdateCloseRaceCount(trackData, trackName, raceTime, opponentRaceTime, raceEventData) {
        // False start/cheating
        if (raceTime <= 0 || opponentRaceTime <= 0) {
            return;
        }

        if (raceEventData === null || raceEventData === undefined) {
            Error("SetFreshTrackData: \"raceEventData\" is null/undefined");
            return;
        }
        var eventGoals = raceEventData.EventGoals;
        if (eventGoals === null || eventGoals === undefined) {
            Error("SetFreshTrackData: \"EventGoals\" is null/undefined");
            return;
        }

        var array = trackData.closeRace;
        if (array === null || array === undefined) {
            for (var i = 0; i < eventGoals.length; ++i) {
                var eventGoal = eventGoals[i];
                InitialiseCloseRaceData(trackData, eventGoal, raceTime, opponentRaceTime, trackName);
            }
        }
        else {
            for (var i = 0; i < eventGoals.length; ++i) {
                var eventGoal = eventGoals[i];
                if (eventGoal.TrackName !== trackName) {
                    continue;
                }
                if (eventGoal.Goal === GetCloseRaceGoalName()) {
                    array = trackData.closeRace;
                    var maximumDifference = parseFloat(eventGoal.GoalTarget);
                    var playerWon = (raceTime < opponentRaceTime);
                    var wasCloseRace = ((opponentRaceTime - raceTime) < maximumDifference);
                    var found = false;
                    for (var j = 0; j < array.length; ++j) {
                        if (FloatsEqual(array[j].time, maximumDifference)) {
                            found = true;
                            if (playerWon && wasCloseRace) {
                                ++array[j].count;
                                trackData.closeRace = array;
                            }
                            break;
                        }
                    }
                    if (!found) {
                        InitialiseCloseRaceData(trackData, eventGoal, raceTime, opponentRaceTime, trackName);
                        trackData.closeRace = array;
                    }
                }
            }
        }
    }

    function UpdateTimedStat(originalTime, newTime, statName) {
        // False start/cheating
        if (newTime <= 0) {
            return null;
        }

        var displayName = Spark.getPlayer().getDisplayName();
        var newBestTime = GetFastestTime(originalTime, newTime);
        if (newBestTime !== null) {
            if (newTime === newBestTime) {
                if (originalTime !== null && originalTime !== undefined) {
                    Info(FormatString("{0}: New \"{1}\" of {2} (changed from {3})",
                        displayName, statName, newBestTime, originalTime));
                }
                else {
                    Info(FormatString("{0}: New \"{1}\" of {2}",
                        displayName, statName, newBestTime));
                }
            }
        }
        return newBestTime;
    }

    function GetFastestTime(oldTime, newTime) {
        if (oldTime === null || oldTime === undefined || isNaN(oldTime)) {
            oldTime = Number.MAX_VALUE;
        }
        if (newTime === null || newTime === undefined || isNaN(newTime)) {
            newTime = Number.MAX_VALUE;
        }
        if (oldTime === Number.MAX_VALUE && newTime === Number.MAX_VALUE) {
            return null;
        }
        return Math.min(oldTime, newTime);
    }

    function IncrementValue(originalValue, increment, statName) {
        if (originalValue === null || originalValue === undefined || isNaN(originalValue) || originalValue < 0) {
            originalValue = 0;
        }
        if (increment === null || increment === undefined || isNaN(increment) || increment < 0) {
            increment = 0;
        }
        var displayName = Spark.getPlayer().getDisplayName();
        var newValue = (originalValue + increment);
        Info(FormatString("{0}: Incremented \"{1}\" to {2} (changed from {3})",
            displayName, statName, newValue, originalValue));
        return newValue;
    }

    function InitialseTimeUnderData(trackData, eventGoal, raceTime, trackName) {
        if (eventGoal.TrackName !== trackName) {
            return;
        }
        // False start/cheating
        if (raceTime <= 0) {
            return;
        }
        var goal = eventGoal.Goal;
        var timeUnderStr = eventGoal.GoalTarget;
        // Finish N races under time T
        if (goal === GetTimeUnderGoalName()) {
            var timeUnder = parseFloat(timeUnderStr); // string -> float
            if (raceTime < timeUnder) {
                if (trackData.timeUnder === null || trackData.timeUnder === undefined) {
                    trackData.timeUnder = [];
                }
                var data = {};
                data.time = timeUnder;
                data.count = 1;
                trackData.timeUnder.push(data);
                // Sort in descending order (highest to lowest)
                trackData.timeUnder.sort(function (a, b) {
                    b.time - a.time;
                });
            }
        }
    }

    function InitialiseCloseRaceData(trackData, eventGoal, raceTime, opponentRaceTime, trackName) {
        if (eventGoal.TrackName !== trackName) {
            return;
        }
        // False start/cheating
        if (raceTime <= 0 || opponentRaceTime <= 0) {
            return;
        }
        var goal = eventGoal.Goal;
        var differenceStr = eventGoal.GoalTarget;
        // Win N races by less than X Seconds
        if (goal === GetCloseRaceGoalName()) {
            var difference = parseFloat(differenceStr); // string -> float
            var playerWon = (raceTime < opponentRaceTime);
            var wasCloseRace = ((opponentRaceTime - raceTime) < difference);
            if (playerWon && wasCloseRace) {
                if (trackData.closeRace === null || trackData.closeRace === undefined) {
                    trackData.closeRace = [];
                }
                var data = {};
                data.time = difference;
                data.count = 1;
                trackData.closeRace.push(data);
                // Sort in descending order (highest to lowest)
                trackData.closeRace.sort(function (a, b) {
                    b.time - a.time;
                });
            }
        }
    }

    function RemoveLegacyData(eventData) {
        if (eventData.leagueNumber !== null && eventData.leagueNumber !== undefined) {
            delete eventData.leagueNumber;
        }
        if (eventData.bestLapTime !== null && eventData.bestLapTime !== undefined) {
            delete eventData.bestLapTime;
        }
        if (eventData.bestRaceTime !== null && eventData.bestRaceTime !== undefined) {
            delete eventData.bestRaceTime;
        }
        if (eventData.bestPerfectCorners !== null && eventData.bestPerfectCorners !== undefined) {
            delete eventData.bestPerfectCorners;
        }
        if (eventData.totalCorners !== null && eventData.totalCorners !== undefined) {
            delete eventData.totalCorners;
        }
    }

    function GetTimeUnderGoalName() {
        return "TimeUnder";
    }

    function GetCloseRaceGoalName() {
        return "CloseRace";
    }

    function GetChallengeIdForEvent(playerId, eventName) {
        var playerRaceEvents = GetVersionedEvents2(playerId).GetData();

        if (playerRaceEvents === null || playerRaceEvents === undefined) {
            var displayName = Spark.loadPlayer(playerId).getDisplayName();
            Error(FormatString("{0}: Player has no race events!", displayName));
            return null;
        }

        var currentRaceEvent = GetMostRecentEventData(playerRaceEvents[eventName]);
        if (currentRaceEvent === null || currentRaceEvent === undefined) {
            var displayName = Spark.loadPlayer(playerId).getDisplayName();
            Error(FormatString("{0}: We're trying to update goal progress data for event {1} but it isn't in our event data",
                displayName, eventName));
            return null;
        }

        var challengeId = currentRaceEvent.challengeId;
        if (challengeId === null || challengeId === undefined) {
            var displayName = Spark.loadPlayer(playerId).getDisplayName();
            Error(FormatString("{0}: We're trying to update goal progress data for event {1} but it has no challenge id in our event data",
                displayName, eventName));
            return null;
        }

        return challengeId;
    }

    function Info(message) {
        //Spark.getLog().info(message);
    }

    function Error(message) {
        Spark.getLog().error(message);
    }
}