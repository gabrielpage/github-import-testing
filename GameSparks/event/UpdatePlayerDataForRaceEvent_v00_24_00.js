// ====================================================================================================
//
// Cloud Code for UpdatePlayerDataForRaceEvent_v00_22_00, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("RaceEventUtilities");
requireOnce("SessionUtilities");
requireOnce("RaceEventScheduleUtilities");
requireOnce("EventPrizeUtilities");

UpdatePlayerDataForRaceEvent_v00_24_00();

function UpdatePlayerDataForRaceEvent_v00_24_00() {
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var eventName = Spark.getData().eventName;
    var track = Spark.getData().track;
    var carClass = Spark.getData().carClass;

    // LogMessage(track);

    UpdatePlayerDataForRaceEvent();

    if (!Spark.hasScriptErrors()) {
        EnterSessionAndSetupResponse(playerId, eventName);
        AddSkillStatsToResponse(playerId, track, carClass);

        // grab the unaward prizes for this event and return them
        var versionedProfile = MakeVersionedProfileDocument(playerId);
        SetUnawardedGoalsForEventInScriptData(playerId, versionedProfile, eventName);
    }

    // returns whether something was removed from the cache
    function RemoveEdgeForCarInOtherEvents() {
        var car = GetPlayerActiveCar(playerId);

        if (car === null || car === undefined) {
            return false;
        }

        // Spark.getLog().info(FormatString("Remove edge - car: {0}:{1}, keep event: {2}",
        //     car.CarVariantID, car.CarID, eventName));

        return RemoveSessionStateForCarInOtherEvents(playerId, car.CarVariantID, car.CarID, eventName);
    }

    function UpdatePlayerDataForRaceEvent() {
        var removedEdge = RemoveEdgeForCarInOtherEvents();

        if (removedEdge) {
            // better send back the updated session cache then!
            SetSessionStateInResponse(playerId);
        }

        // Get the challengeShortCode for this event
        var challengeShortCode = GetRaceEventChallengeShortCode(eventName);
        if (challengeShortCode === null){
            return;
        }
        // Get the data for this race event from the meta collection
        var currentPlayerRaceEventData = GetRaceEventDataFromMetaCollection(eventName, true, playerId);
        if (currentPlayerRaceEventData === null){
            return;
        }

        UpdatePlayerEventDataForPreviewChallenge(playerId, eventName);
        AddRestrictionStringsToResponse(currentPlayerRaceEventData);
    }

    function UpdatePlayerEventDataForPreviewChallenge(playerId, eventName) {
        var versionedEvents = GetVersionedEvents2(playerId);
        var playerEventData = versionedEvents.GetData();
        var currentPlayerRaceEvent = GetMostRecentEventData(playerEventData[eventName]);

        // We don't need a preview challenge if the current challenge is running
        var challengeCollection = Spark.systemCollection("challengeInstance");
        if (currentPlayerRaceEvent !== null && currentPlayerRaceEvent !== undefined) {
            var challengeId = currentPlayerRaceEvent.challengeId;
            if (challengeId !== null && challengeId !== undefined) {
                var challenge = challengeCollection.findOne({"_id": {"$oid": challengeId}}, {"state": 1, "endDate": 1});
                if (ChallengeIsInProgress(challenge)/*ISSUED, WAITING, RUNNING*/) {
                    return;
                }
            }
        }

        var cursor = challengeCollection.find({
            challengeName: eventName,
        },
        {
            _id: true,
            startDate: true,
            endDate: 1
        }).sort({
            startDate: -1 // Descending order, so most recent first
        }).limit(1); // Get the top result after the sort

        var previewChallengeId = null;
        var challengeEndDate = null;

        if (cursor.hasNext()) {
            var challengeInstance = cursor.next();
            previewChallengeId = challengeInstance._id.$oid;
            challengeEndDate = Math.floor(challengeInstance.endDate / 1000);
        }

        var successfullyWritten = false;
        while (!successfullyWritten) {
            playerEventData = versionedEvents.GetData();

            var raceEventDatas = playerEventData[eventName];

            //Log("raceEventDatas #1: {0}, typeof: {1}, JSON: {2}", raceEventDatas, typeof raceEventDatas, JSON.stringify(raceEventDatas));

            if (raceEventDatas === null || raceEventDatas === undefined) {
                playerEventData[eventName] = [];
                raceEventDatas = playerEventData[eventName];
            }

            //Log("raceEventDatas #2: {0}, typeof: {1}, JSON: {2}", raceEventDatas, typeof raceEventDatas, JSON.stringify(raceEventDatas));

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
            currentRaceEvent.challengeId = null;
            currentRaceEvent.previewChallengeId = previewChallengeId;
            currentRaceEvent.challengeEndDate = challengeEndDate;
            currentRaceEvent.topDownPrizesAddedToUnawarded = false;

            successfullyWritten = versionedEvents.SetData(playerEventData);
        }
    }
}