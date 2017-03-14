// ====================================================================================================
//
// Cloud Code for QueryRaceEvents_v0900, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("EventPrizeUtilities");
requireOnce("LeaderboardUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");
requireOnce("CollectionUtilities");
requireOnce("RaceEventScheduleUtilities");

// *** PANIC LEVERS ***
const TURN_OFF_LEADERBOARD_QUERIES = false;
const TURN_OFF_EXPIRED_EVENT_QUERIES = false;

QueryRaceEvents_v0900();

function QueryRaceEvents_v0900()
{
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();

    var eventInstanceCache = GetEventInstanceCacheCollection(playerId);
    if (eventInstanceCache === null || eventInstanceCache === undefined) {
        ErrorMessage("There is no event instance cache");
        return;
    }

    var output = {};
    var playerEvents = GetVersionedEvents2(playerId).GetData();
    var shouldGetDebugEvents = Spark.getData().getDebugEvents === 1;
    var ftueIsComplete = FtueIsComplete(playerId);
    var hasJoinedNewcomerLeague = JoinedNewcomerLeague(playerEvents, output);
    var newcomerLeagueIsActive = (hasJoinedNewcomerLeague) ? NewcomerLeagueIsActive(output.newcomerLeagueId) : false;
    var playerIsInAnActiveNewcomerLeague = (hasJoinedNewcomerLeague && newcomerLeagueIsActive);
    var tutorialRacesAreDone = TutorialRacesAreDone(playerId);

    var nowMs = Math.floor(GetNow() / 1000) * 1000;
    var nowPlusBufferMs = nowMs + (1000 * 60 * 65); // 65 minutes.
    var eventInstances = null;

    var nowMsDate = new Date(nowMs);
    var nowPlusBufferMsDate = new Date(nowPlusBufferMs);

    var conditionsList = [];
    // Event must be running within the next 65 minutes.
    conditionsList.push(
    {
        VisibilityStart: {
            $lt: nowPlusBufferMsDate
        },
        VisibilityEnd: {
            $gt: nowMsDate
        }
    });
    // If we don't want debug events then don't return them.
    if (!shouldGetDebugEvents) {
        var debugCondition = {
            DebugEvent: false
        };
        conditionsList.push(debugCondition);
    }
    // If we're in an active Newcomer League then return the one we're in
    // and no others.
    if (playerIsInAnActiveNewcomerLeague) {
        var newcomerLeagueCondition = {
            NewcomerLeague: true,
            EventName: output.newcomerLeagueName
        };
        var normalEventCondition = {
            NewcomerLeague: false
        };
        conditionsList.push(
        {
            $or: [
                newcomerLeagueCondition,
                normalEventCondition
            ]
        });
    }
    else {
        // If we're not in an active Newcomer League then don't return any.
        if (ftueIsComplete) {
            var newcomerLeagueCondition = {
                NewcomerLeague: false
            };
            conditionsList.push(newcomerLeagueCondition);
        }
    }
    // If we've finished the tutorial races then don't return any FTUE Opponent Race events.
    if (tutorialRacesAreDone) {
        var ftueCondition = {
            FtueEvent: false
        };
        conditionsList.push(ftueCondition);
    }

    // First query, get event instances that match all the conditions.
    eventInstances = eventInstanceCache.find(
    {
        $and: conditionsList
    });

    var newcomerLeagueStart = new Date(0);
    var newcomerLeagueToTake = null;
    var eventNamesDict = {};
    // Next, extract the event names for the second query.
    // We also determine which Newcomer League we will join if we need to join one at all.
    while (eventInstances.hasNext()) {
        var eventInstance = eventInstances.next();

        if (eventInstance === null || eventInstance === undefined) {
            continue;
        }

        if (!playerIsInAnActiveNewcomerLeague && !ftueIsComplete) {
            if (eventInstance.NewcomerLeague) {
                // Because the Newcomer Leagues overlap we need to find the 'youngest' of the two
                // that should have been returned.
                // The youngest is the one with the highest VisibilityStart.
                newcomerLeagueStart = Math.max(newcomerLeagueStart, eventInstance.VisibilityStart);
                if (newcomerLeagueStart === eventInstance.VisibilityStart && nowMs >= eventInstance.VisibilityStart) {
                    newcomerLeagueToTake = eventInstance;
                }
            }
            else {
                eventNamesDict[eventInstance.EventName] = true;
            }
        }
        else {
            eventNamesDict[eventInstance.EventName] = true;
        }
    }
    // Add the youngest Newcomer League if we need to.
    if (!playerIsInAnActiveNewcomerLeague && !ftueIsComplete && newcomerLeagueToTake !== null) {
        eventNamesDict[newcomerLeagueToTake.EventName] = true;
    }

    var raceEventsCollection = GetRaceEventsCollection(playerId);
    if (raceEventsCollection === null || raceEventsCollection === undefined) {
        ErrorMessage("There is no raceEvents meta collection");
        return;
    }
    // Extract the event names from the dictionary into a list, which can be used by the next query.
    var eventNames = [];
    for (var key in eventNamesDict) {
        if (eventNamesDict.hasOwnProperty(key)) {
            eventNames.push(key);
        }
    }
    // Second query, get the main race events info.
    var raceEvents = raceEventsCollection.find(
    {
        EventName: {
            $in: eventNames
        }
    });
    // Final loop through for the events to add the prize data and set the 'Participating' flag.
    var finalRaceEventsArray = [];
    while (raceEvents.hasNext()) {
        var raceEvent = raceEvents.next();

        if (raceEvent === null || raceEvent === undefined) {
            continue;
        }

        raceEvent = InsertAdditionalPrizeDataIntoRaceEvent(raceEvent, playerId);
        delete raceEvent._id;
        finalRaceEventsArray.push(raceEvent);
    }
    Spark.setScriptData("eventData", finalRaceEventsArray);

    if (!TURN_OFF_LEADERBOARD_QUERIES) {
        // Get leaderboard data for valid events
        var eventLeaderboardData = {};
        var now = Math.floor(GetNow() / 1000);
        for (var i = 0; i < finalRaceEventsArray.length; ++i) {
            var eventData = GetMostRecentEventDataFromName(playerId, finalRaceEventsArray[i].EventName);
            if (eventData === null){
                // We haven't entered this event yet
                continue;
            }
            // Extract the challengeId of the race event
            var challengeId = eventData.challengeId;
            if (challengeId === null || challengeId === undefined){
                continue;
            }

            var schedule = GetRaceEventScheduleWithChallengeId(challengeId, /*noErrorOnMissingChallenge*/false, playerId);
            if (schedule === null || schedule === undefined) {
                // This can be a valid case if the challenge instance hasn't actually started yet.
                continue;
            }

            if (schedule.EndDate < now) {
                continue;
            }

            var leaderboardData = QueryGetAroundMeEntries(playerId, challengeId);
            if (leaderboardData !== null && leaderboardData !== undefined) {
                eventLeaderboardData[finalRaceEventsArray[i].EventName] = leaderboardData;
            }
        }

        // Valid event leaderboards
        Spark.setScriptData("eventLeaderboardData", eventLeaderboardData);
    }

    if (!TURN_OFF_EXPIRED_EVENT_QUERIES) {
        // Get expired events we want to display at the top of the event feed
        var startOfDay = GetStartOfDayForUnixTimestamp(now);
        var weekAgoDate = new Date(AddDaysToUnixTimestamp(startOfDay, -7) * 1000); // Back to milliseconds
        var challengeCollection = Spark.systemCollection("challengeInstance");
        var expiredChallenges = challengeCollection.find(
        {
            "accepted": {
                "$in": [playerId]
            },
            "state": {
                "$in": GetFinishedRunStatesArray()
            },
            "endDate": {
                "$gte" : weekAgoDate
            }
        },
        {
            "_id" : 1,
            "challengeName" : 1,
            "endDate" : 1
        }).
        sort({"endDate":-1});

        var finalExpiredChallenges = [];
        var eventLimit = 6;
        var count = 0;
        while (expiredChallenges.hasNext() && count < eventLimit) {
            var expiredChallenge = expiredChallenges.next();
            var eventData = GetRaceEventDataFromMetaCollection(expiredChallenge.challengeName, true, playerId);
            if (eventData === null || eventData === undefined) {
                continue;
            }

            var schedule = GetRaceEventScheduleWithChallengeId(expiredChallenge._id.$oid, /*noErrorOnMissingChallenge*/false, playerId);

            var instance = {};
            instance.EventName = eventData.EventName;
            instance.LocalisedTextTag = eventData.LocalisedTextTag;
            instance.EventDescriptionLocTag = eventData.EventDescriptionLocTag;
            instance.Schedule = schedule;
            instance.PartitionSize = eventData.PartitionSize;
            instance.AssetBundle = eventData.AssetBundle;
            instance.TopPrizes = eventData.TopPrizes;
            instance.ChallengeID = expiredChallenge._id.$oid;
            instance.Leaderboard = QueryGetAroundMeEntries(playerId, expiredChallenge._id.$oid);
            instance = InsertAdditionalPrizeDataIntoRaceEvent(instance, playerId); // Add Class and Rarity data to Blueprint, Car and Pro Pack prizes.

            var leaderboardValid = true;

            if (instance.Leaderboard === null || instance.Leaderboard === undefined) {
                Spark.getLog().error(FormatString("{0}: Leaderboard is null/undefined for {1}", Spark.loadPlayer(playerId).getDisplayName(), instance.EventName));
                leaderboardValid = false;
            }
            if (instance.Leaderboard.Entries === null || instance.Leaderboard.Entries === undefined) {
                Spark.getLog().error(FormatString("{0}: Leaderboard.Entries is null/undefined for {1}", Spark.loadPlayer(playerId).getDisplayName(), instance.EventName));
                leaderboardValid = false;
            }
            if (instance.Leaderboard.Entries.length === 0) {
                //Spark.getLog().info(FormatString("{0}: No leaderboard entries for {1}", Spark.loadPlayer(playerId).getDisplayName(), instance.EventName));
                leaderboardValid = false;
            }

            if (instance.Schedule === null || instance.Schedule === undefined) {
                Spark.getLog().error(FormatString("{0}: No schedule for {1}", Spark.loadPlayer(playerId).getDisplayName(), instance.EventName));
                leaderboardValid = false;
            }

            if (leaderboardValid) {
                //Spark.getLog().info(FormatString("{0}: Adding {1} to event list", Spark.loadPlayer(playerId).getDisplayName(), instance.EventName));
                finalExpiredChallenges.push(instance);
                ++count;
            }
        }

        finalExpiredChallenges.sort(function(a, b) {
            a.Schedule.EndDate - b.Schedule.EndDate;
        });

        Spark.setScriptData("expiredEventData", finalExpiredChallenges);
    }

    function JoinedNewcomerLeague(events, output) {
        var newcomerLeagueId = null;
        var newcomerLeagueName = null;
        var latestEndDate = 0;
        for (var eventName in events) {
            if (eventName.indexOf("Newcomer League") > -1) {
                var eventData = GetMostRecentEventData(events[eventName]);
                // This is a newcomer league
                if (eventData === null || eventData === undefined ||
                    eventData.challengeId === null || eventData.challengeId === undefined) {
                    continue;
                }
                if (eventData.challengeEndDate === null || eventData.challengeEndDate === undefined) {
                    ErrorMessage(FormatString("No challenge end date for {0} ({1})", eventName, eventData.challengeId));
                    continue;
                }
                latestEndDate = Math.max(latestEndDate, eventData.challengeEndDate);
                if (latestEndDate == eventData.challengeEndDate) {
                    newcomerLeagueId = eventData.challengeId;
                    newcomerLeagueName = eventName;
                }
            }
        }
        
        if (newcomerLeagueId !== null && newcomerLeagueId !== undefined &&
            newcomerLeagueName !== null && newcomerLeagueName !== undefined) {
                
            output.newcomerLeagueId = newcomerLeagueId;
            output.newcomerLeagueName = newcomerLeagueName;
            return true;
        }

        // None of our current events were newcomer leagues
        return false;
    }

    function NewcomerLeagueIsActive(newcomerLeagueId){
        var challengeCollection = Spark.systemCollection("challengeInstance");
        var challenge = challengeCollection.findOne(
        {
            _id: {
                $oid: newcomerLeagueId
            }
        },
        {
            state: 1,
            endDate: 1
        });

        if (challenge === null || challenge === undefined){
            ErrorMessage(FormatString("Couldn't find challenge with id {0}", newcomerLeagueId));
            return false;
        }

        return ChallengeIsInProgress(challenge)/*ISSUED, WAITING, RUNNING*/;
    }

    function FtueIsComplete(playerId){
        return GetPlayerFTUEFlag("EventFeedExplained_2", playerId);
    }

    function TutorialRacesAreDone(playerId) {
        return GetPlayerFTUEFlag("PlayedSecondRace", playerId);
    }
}