// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("CarInventoryUtilities");
requireOnce("CollectionUtilities");
requireOnce("DateTimeUtilities");
requireOnce("GameStatsUtilities");
requireOnce("GeneralUtilities");
requireOnce("LeaderboardUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("RaceEventUtilities2");
requireOnce("RaceEventScheduleUtilities");
requireOnce("SessionUtilities");
requireOnce("TimeUtilities");
requireOnce("XPUtilities");

// Module: RaceEventUtilities.
// This function accesses version 2 event data.
function GetVersionedEvents2(playerId) {
    return MakeVersionedProfile(playerId, "events2", {});
}

// Module: RaceEventUtilities.
// This function accesses version 2 event data.
function GetVersionedEvents2FromProfile(versionedProfile) {
    return versionedProfile.GetVersionedKey("events2", {});
}

// Module: RaceEventUtilities.
function GetMostRecentEventData(eventDatas) {
    if (eventDatas === undefined || eventDatas === null || eventDatas.length < 1) {
        return null;
    }

    return eventDatas[eventDatas.length - 1];
}

// Module: RaceEventUtilities.
// Returns the player's data for the specified event.
function GetMostRecentEventDataFromName(playerId, eventName) {
    var events = GetVersionedEvents2(playerId).GetData();

    return GetMostRecentEventData(events[eventName]);
}

// Module: RaceEventUtilities.
// Enters the player in the given challenge.
function EnterRaceEvent(playerId, eventName){
    // Get the data for this race event from the meta collection
    var eventData = GetRaceEventDataFromMetaCollection(eventName, false, playerId);
    if (eventData === null){
        return false;
    }

    if (!RaceEventIsActive(playerId, eventData)) {
        // The race event isn't active, so don't enter it.
        return false;
    }

    var playerEventData = GetVersionedEvents2(playerId).GetData();

    // Do we have the current event in our data?
    var currentPlayerRaceEvent = GetMostRecentEventData(playerEventData[eventName]);
    if (currentPlayerRaceEvent !== null && currentPlayerRaceEvent !== undefined) {
        var challengeId = currentPlayerRaceEvent.challengeId;
        // Is the challenge id valid?
        if (challengeId !== null) {
            var challengeCollection = Spark.systemCollection("challengeInstance");
            var challenge = challengeCollection.findOne({"_id": {"$oid": challengeId}}, {"state": 1, "endDate": 1});
            // Is the challenge valid?
            if (challenge !== null && challenge !== undefined) {
                // Is the challenge still in progress?
                if (ChallengeIsInProgress(challenge)/*ISSUED, WAITING, RUNNING*/) {
                    // Don't enter again while it is still running.
                    return false;
                }
            }
        }
    }

    // Get the challengeShortCode for this event
    var challengeShortCode = GetRaceEventChallengeShortCode(eventName);
    if (challengeShortCode === null){
        return false;
    }

    //Spark.getLog().info(FormatString("EnterRaceEvent() START {0}", Spark.loadPlayer(playerId).getDisplayName()));

    var now = GetNow();
    //Spark.getLog().info(FormatString("{0}: Trying to find a challenge instance that ends after now [{1}]",
    //        Spark.loadPlayer(playerId).getDisplayName(), now));

    var query = {
        "challengeShortCode": challengeShortCode,
        "state": {
            "$nin": GetFinishedRunStatesArray()
        },
        "privateData.full" : {
            "$ne" : true
        },
         "endDate": {
             "$gte": new Date(now)
        }
    };

    var projection = {
        "_id": 1,
        "maxPlayers": 1,
        "state": 1,
        "endDate": 1
    };

    var challengeDocs = Spark.systemCollection("challengeInstance").find(query, projection);
    var joinedChallenge = false;
    if (challengeDocs === null || challengeDocs === undefined || challengeDocs.count() === 0) {
        //Spark.getLog().info(FormatString("{0}: Failed to find any valid challenge instances, creating a new one",
        //    Spark.loadPlayer(playerId).getDisplayName()));
        joinedChallenge = CreateRaceEvent(playerId, challengeShortCode, eventData);
    }
    else {
        if (challengeDocs.count() > 1) {
            Spark.getLog().error(FormatString("EnterRaceEvent(challengeShortCode : {0}) : more RESULTS than expected: {1}",
                challengeShortCode, challengeDocs.count()));
        }

        var challengeInstance = null;
        var count = 0;
        while (challengeDocs.hasNext() && !joinedChallenge) {
            count++;

            challengeInstance = challengeDocs.next();
            var challengeId = challengeInstance._id.$oid;
            //Spark.getLog().debug(FormatString("Attempting to join challenge with id {0}", challengeId));
            var response = Spark.sendRequestAs({"@class":".JoinChallengeRequest", "challengeInstanceId": challengeId}, playerId);
            if (response.error !== null && response.error !== undefined) {
                // Got an error, bail!
                ErrorMessage("Error sending JoinChallengeRequest: ", response);
                return false;
            }
            else {
                // this should contain join information ... soon
                // format: { "@class": ".JoinChallengeResponse", "joined": true }
                //Spark.getLog().info(FormatString("response from JoinChallengeRequest: {0}", JSON.stringify(response)));

                var challengeToTest = null;

                if (response.joined !== undefined) {
                    // new style response
                    if (response.joined === true) {
                        joinedChallenge = true;
                        //Spark.getLog().info(FormatString("NEW style join"));
                    }
                }
                else {
                    // old style, gotta see if we joined the hard way
                    challengeToTest = Spark.getChallenge(challengeId);

                    // crappy test to see if we have joined!
                    if (challengeToTest.getAcceptedPlayerIds().indexOf(playerId, 0) !== -1) {
                        // We're in the accepted list, so we joined!
                        Spark.getLog().warn(FormatString("OLD style join (more expensive)"));
                        joinedChallenge = true;
                    }
                }

                if (!joinedChallenge) {
                    // if we have not joined the challenge, it should be full, and we are the first person to see that
                    // so make sure we have the challenge, see if it's full and mark it for our query, if so.

                    if (!challengeToTest) {
                        challengeToTest = Spark.getChallenge(challengeId);
                    }

                    var acceptedlength = challengeToTest.getAcceptedPlayerIds().length;
                    var challengedLength = challengeToTest.getChallengedPlayerIds().length;

                    // max players is only in the raw database, so get it out of the challengeInstance, bah!
                    // not atomic, but the worst that can happen is a couple of players both set "full" to true
                    if (challengeToTest.getPrivateData("full") !== true) {
                        if (acceptedlength >= challengeInstance.maxPlayers) {
                            Spark.getLog().info(FormatString("Could not join {0}:{1} - marked as full (accepted: {2}, max: {3}, challenged: {4}), state: {5}",
                                challengeShortCode, challengeId, acceptedlength, challengeInstance.maxPlayers, challengedLength, challengeToTest.getRunState()));

                            challengeToTest.setPrivateData("full", true);
                        }
                        else {
                            Spark.getLog().error(FormatString("Could not join {0}:{1} - NOT FULL WTF? (accepted: {2}, max: {3}, challenged: {4}), state: {5}",
                                challengeShortCode, challengeId, acceptedlength, challengeInstance.maxPlayers, challengedLength, challengeToTest.getRunState()));
                        }
                    }
                    else {
                        Spark.getLog().error(FormatString("WTF? Query has returned a challenge already marked as full! {0}:{1} - (accepted: {2}, max: {3}, challenged: {4}), state: {5}",
                                challengeShortCode, challengeId, acceptedlength, challengeInstance.maxPlayers, challengedLength, challengeToTest.getRunState()));
                    }
                }
            }
        }

        if (count > 1) {
            Spark.getLog().error(FormatString("EnterRaceEvent(challengeShortCode : {0}) : more LOOPS (attempted joins) than expected: {1}",
                challengeShortCode, count));
        }

        if (joinedChallenge) {
            if (ChallengeInstanceIsWaitingToStart(challengeInstance)/*ISSUED/WAITING*/) {
                var challengeId = challengeInstance._id.$oid
                var challenge = Spark.getChallenge(challengeId);
                //Spark.getLog().info(FormatString("{0}: starting challenge {1}",
                //                                Spark.loadPlayer(playerId).getDisplayName(),
                //                                challengeId));
                challenge.startChallenge();
                // At this point we also need to add any scores of contenders with
                // fake leaderboard data who haven't submitted yet.
                var acceptedPlayers = challenge.getAcceptedPlayerIds();
                var leaderboard = Spark.getLeaderboards().getChallengeLeaderboard(challengeId);
                for (var i = 0; i < acceptedPlayers.length; ++i) {
                    // If the score is 0 then we don't need to post
                    var fakeData = GetAllPlayerFakeData(challengeId, acceptedPlayers[i]);
                    if (fakeData.score <= 0) {
                        continue;
                    }
                    // If the leaderboard doesn't exist yet or the player is no in the leaderboard yet then post to it
                    if ((leaderboard === null || leaderboard === undefined) ||
                        leaderboard.getEntryCountForIdentifier(acceptedPlayers[i]) === 0) {
                        //Spark.getLog().info(FormatString("{0} hasn't submitted their fake leaderboard data for {1} yet," +
                        //                                " submitting score {2} victories {3} races {4}",
                        //                                Spark.loadPlayer(acceptedPlayers[i]).getDisplayName(),
                        //                                challengeId,
                        //                                fakeData.score, fakeData.victories, fakeData.races));

                        var success = PostToEventEarningsAndReturnSuccess(acceptedPlayers[i], challengeId, fakeData.score, fakeData.victories, fakeData.races);
                        if (success) {
                            RemovePlayerFakeDataFromPlayerId(acceptedPlayers[i], challengeId);
                        }
                    }
                }
            }
            UpdatePlayerEventDataForNewChallenge(playerId, eventName, challengeId, Math.floor(challengeInstance.endDate / 1000));
        }
        else {
            joinedChallenge = CreateRaceEvent(playerId, challengeShortCode, eventData);
        }
    }

    IncrementLifetimeEvents(playerId);
    AddLifetimeEventsToResponse(playerId);
    AddRestrictionStringsToResponse(eventData, playerId);

    return joinedChallenge;
}

// Module: RaceEventUtilities
// Adds a race event challenge ID to response
function AddChallengeIDToResponse(playerId, challengeID){
    Spark.setScriptData("challengeID", challengeID);
}

// Module: RaceEventUtilities
function AddRestrictionStringsToResponse(eventData, playerId) {
    if (eventData === null || eventData === undefined) {
        return;
    }

    var restrictions = eventData.Restrictions;
    if (restrictions === null || restrictions === undefined) {
        return;
    }

    var strings = [];
    for (var i = 0; i < restrictions.length; ++i){
        var restriction = restrictions[i];

        switch (restriction.Type) {
            case "CarModel":
                var carModel = restriction.Condition1;
                var modelEntry = GetModelInventoryEntry(carModel, playerId);
                if (modelEntry === null) {
                    return;
                }
                strings.push(FormatString("{0},{1}", modelEntry.LongName, modelEntry.ManufacturerName));
                break;
        }
    }

    if (Spark.hasScriptErrors()) {
        Spark.setScriptError("RestrictionsInfoStrings", strings);
    }
    else {
        Spark.setScriptData("RestrictionsInfoStrings", strings);
    }
}

// Module: RaceEventUtilities.
// Creates a new challenge for the given race event.
function CreateRaceEvent(playerId, challengeShortCode, eventData) {
    var info = GetCurrentScheduleForRaceEvent(eventData);
    if (info === null){
        ErrorMessage(FormatString("CreateRaceEvent: schedule is null for event {0}", eventData.EventName));
        return false;
    }

    var endDate = EpochToGameSparksDate(info.EndDate);
    var maxPlayers = eventData.PartitionSize;
    //Spark.getLog().info(FormatString("CreateRaceEvent START {0}", Spark.loadPlayer(playerId).getDisplayName()));
    var response = null;
    if (maxPlayers <= 0){
        // There is no limit
        response = Spark.sendRequestAs({"@class":".CreateChallengeRequest", "accessType":"PUBLIC", "challengeShortCode":challengeShortCode, "endTime":endDate}, playerId);
    }
    else{
        response = Spark.sendRequestAs({"@class":".CreateChallengeRequest", "accessType":"PUBLIC", "challengeShortCode":challengeShortCode, "endTime":endDate, "maxPlayers":eventData.PartitionSize}, playerId);
    }
    // Error checking
    if (response.error !== undefined){
        ErrorMessage("CreateChallengeRequest error: ", response);
        return false;
    }
    if (response.challengeInstanceId === null){
        ErrorMessage("The challengeInstanceId in CreateChallengeRequest response is null");
        return false;
    }

    var challengeId = response.challengeInstanceId;
    var eventName = eventData.EventName;

    // Spark.getLog().info(FormatString("CreateRaceEvent(challengeShortCode: {0}) : id: {1}",
    //     challengeShortCode,
    //     challengeId));

    UpdatePlayerEventDataForNewChallenge(playerId, eventData.EventName, challengeId, info.EndDate);
    return true;
}

// Module: RaceEventUtilities.
// Retrieves the event object for the given event name from the raceEvents metadata collection.
// @param {string} eventName
// @param {bool} noErrorOnMissingChallenge - don't mark the current request as having errors. Optional - will
// default to undefined, which is 'false' in an if statement.
function GetRaceEventDataFromMetaCollection(/*string*/ eventName, /*bool*/ noErrorOnMissingChallenge, playerId) {
    // Get the event data from the runtime collection
    var allRaceEvents = GetRaceEventsCollection(playerId);
    if (allRaceEvents === null){
        ErrorMessage("There are no race events");
        return null;
    }
    var query = allRaceEvents.find({"EventName":{"$eq":eventName}});
    if (query.size() === 0) {
        var errorMessage = FormatString("Couldn't find race event [{0}]", eventName);

        if (!noErrorOnMissingChallenge) {
            ErrorMessage(errorMessage);
        }
        else {
            Spark.getLog().error(errorMessage);
        }
        return null;
    }
    var raceEventData = query.next();
    return raceEventData;
}

// Module: RaceEventUtilities.
function UpdatePlayerEventDataForNewChallenge(playerId, eventName, challengeId, challengeEndDate) {
    var versionedEvents = GetVersionedEvents2(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var playerEventData = versionedEvents.GetData();

        var raceEventDatas = playerEventData[eventName];

        //Log("raceEventDatas #3: {0}, typeof: {1}, JSON: {2}", raceEventDatas, typeof raceEventDatas, JSON.stringify(raceEventDatas));

        if (raceEventDatas === null || raceEventDatas === undefined) {
            playerEventData[eventName] = [];
            raceEventDatas = playerEventData[eventName];
        }

        //Log("raceEventDatas #4: {0}, typeof: {1}, JSON: {2}", raceEventDatas, typeof raceEventDatas, JSON.stringify(raceEventDatas));

        if (raceEventDatas.length > 0 &&
            (raceEventDatas[raceEventDatas.length - 1].challengeId === null ||
             raceEventDatas[raceEventDatas.length - 1].challengeId === undefined)) {

            // last entry is a 'preview' entry, we should overwrite
        }
        else {
            // push a new entry
            raceEventDatas.push({});
        }

        // setup whatever we have
        var currentRaceEvent = raceEventDatas[raceEventDatas.length - 1];
        currentRaceEvent.challengeId = challengeId;
        currentRaceEvent.challengeEndDate = challengeEndDate;
        currentRaceEvent.topDownPrizesAddedToUnawarded = false;

        successfullyWritten = versionedEvents.SetData(playerEventData);
    }
}

// Module: RaceEventUtilities
// Pass through a challenge instance that has been received through a direct systemCollection query
// Returns true if the run state is ISSUED, WAITING or RUNNING
function ChallengeIsInProgress(challenge) {
    var data = {};
    var hasInProgressRunState = ChallengeMatchesRunStates(
        GetRunStateFromCollectionQueryChallenge(challenge, data),
        GetInProgressRunStatesArray());
    var challengeEndDateHasPassed = EndDateOfChallengeHasPassedFromCollectionQueryChallenge(challenge, data);
    if (hasInProgressRunState && !challengeEndDateHasPassed) {
        return true;
    }
    else if (!hasInProgressRunState && !challengeEndDateHasPassed) {
        return false;
    }
    else if (!hasInProgressRunState && challengeEndDateHasPassed) {
        return false;
    }
    else {
        // hasInProgressRunState && challengeEndDateHasPassed
        // Mismatch of state and end date
        Spark.getLog().warn(FormatString("Challenge In Progress?: challenge {0} has a mismatched state ({1}), end date ({2}, now is {3}) has passed," +
            " return false",
            challenge._id.$oid, data.state, data.endDate, data.now));
        return false;
    }
}

// Module: RaceEventUtilities
// Pass through a challenge instance that has been received through a direct systemCollection query
// Returns true if the run state is ISSUED or WAITING
function ChallengeInstanceIsWaitingToStart(challenge) {
    var data = {};
    var hasWaitingRunState = ChallengeMatchesRunStates(
        GetRunStateFromCollectionQueryChallenge(challenge, data),
        GetInstanceWaitingToStartRunStatesArray());
    var challengeEndDateHasPassed = EndDateOfChallengeHasPassedFromCollectionQueryChallenge(challenge, data);
    if (hasWaitingRunState && !challengeEndDateHasPassed) {
        return true;
    }
    else if (!hasWaitingRunState && challengeEndDateHasPassed) {
        return false;
    }
    else if (!hasWaitingRunState && !challengeEndDateHasPassed) {
        return false;
    }
    else {
        // hasWaitingRunState && challengeEndDateHasPassed
        // Mismatch of state and end date
        Spark.getLog().warn(FormatString("Challenge Instance Waiting To Start?: challenge {0} has a mismatched state ({1}), end date ({2}, now is {3})" +
            " has passed, return true",
            challenge._id.$oid, data.state, data.endDate, data.now));
        return true;
    }
}

// Module: RaceEventUtilities
// Pass through a challenge instance that has been received through a direct systemCollection query
// Returns true if the run state is EXPIRED or LAPSED
function ChallengeInstanceExpiredAndNeverStarted(challenge) {
    var data = {};
    var hasNeverStartedRunState = ChallengeMatchesRunStates(
        GetRunStateFromCollectionQueryChallenge(challenge, data),
        GetInstanceNeverStartedRunStatesArray());
    var challengeEndDateHasPassed = EndDateOfChallengeHasPassedFromCollectionQueryChallenge(challenge, data);
    if (hasNeverStartedRunState && challengeEndDateHasPassed) {
        return true;
    }
    else if (!hasNeverStartedRunState && !challengeEndDateHasPassed) {
        return false;
    }
    else if (!hasNeverStartedRunState && challengeEndDateHasPassed) {
        return false;
    }
    else {
        // hasNeverStartedRunState && !challengeEndDateHasPassed
        // Mismatch of state and end date
        Spark.getLog().warn(FormatString("Challenge Instance Never Started?: challenge {0} has a mismatched state ({1}), end date ({2}, now is {3})" +
            " has passed, returning false",
            challenge._id.$oid, data.state, data.endDate, data.now));
        return false;
    }
}

// Module: RaceEventUtilities
// Pass through a challenge instance that has been received through a direct systemCollection query
// Returns true if the run state is COMPLETE, EXPIRED, LAPSED or CHALLENGE_TEMPLATE_DELETED
function ChallengeHasFinished(challenge) {
    var data = {};
    var hasFinishedRaceState = ChallengeMatchesRunStates(
        GetRunStateFromCollectionQueryChallenge(challenge, data),
        GetFinishedRunStatesArray());
    var challengeEndDateHasPassed = EndDateOfChallengeHasPassedFromCollectionQueryChallenge(challenge, data);
    if (hasFinishedRaceState && challengeEndDateHasPassed) {
        return true;
    }
    else if (!hasFinishedRaceState && !challengeEndDateHasPassed) {
        return false;
    }
    else {
        // Mismatch of state and end date
        Spark.getLog().warn(FormatString("Challenge Finished?: challenge {0} has a mismatched state ({1}), end date ({2}, now is {3}) {4} passed, returning {5}",
            challenge._id.$oid, data.state, data.endDate, data.now, challengeEndDateHasPassed ? "has" : "hasn't", challengeEndDateHasPassed));
        return challengeEndDateHasPassed;
    }
}

function ChallengeMatchesRunStates(challengeRunState, runStatesToCheck) {
    if (challengeRunState === null || challengeRunState === undefined) {
        Spark.getLog().error("ChallengeMatchesRunStates: trying to compare run states but challengeRunState is null/undefined");
        return false;
    }
    if (runStatesToCheck === null || runStatesToCheck === undefined || runStatesToCheck.length === 0) {
        Spark.getLog().error("ChallengeMatchesRunStates: trying to compare run states but runStatesToCheck is null/undefined/empty");
        return false;
    }
    return (runStatesToCheck.indexOf(challengeRunState) !== -1);
}

function GetRunStateFromCollectionQueryChallenge(challenge, data) {
    if (challenge === undefined || challenge === null) {
        return null;
    }
    if (data !== null) {
        data.state = challenge.state;
    }
    return challenge.state;
}

function EndDateOfChallengeHasPassedFromCollectionQueryChallenge(challenge, data) {
    if (challenge === null || challenge === undefined) {
        Spark.getLog().error("EndDateOfChallengeHasPassed: challenge is null/undefined");
        return false;
    }
    var endDate = challenge.endDate;
    var now = GetNow();
    if (data !== null && data !== undefined) {
        data.endDate = endDate;
        data.now = now;
    }
    return (endDate < now);
}

function GetInProgressRunStatesArray() {
    return ["RUNNING", "ISSUED", "WAITING"];
}

function GetFinishedRunStatesArray(){
    return ["COMPLETE", "LAPSED", "EXPIRED", "CHALLENGE_TEMPLATE_DELETED"];
}

function GetInstanceWaitingToStartRunStatesArray() {
    return ["ISSUED", "WAITING"];
}

function GetInstanceNeverStartedRunStatesArray() {
    return ["EXPIRED", "LAPSED"];
}

function GetEventCurrentTrack(eventName, playerId) {
    var raceEventCollection = GetRaceEventsCollection(playerId);
    var raceEvent = raceEventCollection.findOne({"EventName":eventName});
    if (raceEvent === null || raceEvent === undefined){
        var msg = FormatString("No event called '{0}'", eventName);
        ErrorMessage(msg);
        Spark.getLog().debug(msg);
        return null;
    }

    var now = Math.floor(GetNow() / 1000);
    var currentTrack = CurrentTrackData(raceEvent, now);
    if (currentTrack === null || currentTrack === undefined) {
        var msg = FormatString("currentTrack is null/undefined for {0}", eventName);
        ErrorMessage(msg);
        Spark.getLog().debug(msg);
        return null;
    }

    return currentTrack.TrackName;
}

// Module: RaceEventUtilities.
// Returns the challenge shortcode for the given event.
function GetRaceEventChallengeShortCode(eventName){
    var response = Spark.sendRequest({"@class":".ListChallengeTypeRequest"});
    var templates = response.challengeTemplates;
    for (var challengeType in templates){
        if (templates.hasOwnProperty(challengeType)){
            var template = templates[challengeType];
            if (template.name === eventName){
                return template.challengeShortCode;
            }
        }
    }
    ErrorMessage("Couldn't find race event challenge template");
    return null;
}