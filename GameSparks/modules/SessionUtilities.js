requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceUtilities");
requireOnce("TimeUtilities");
requireOnce("RaceEventScheduleUtilities");

// Module: SessionUtilities
function CurrentTrackData(eventData, time) {
    if (eventData.TrackData.length === 0) {
        return null;
    }
    var schedule = GetCurrentScheduleForRaceEvent(eventData);
    if (schedule === null) {
        ErrorMessage(FormatString("GetCurrentSessionNumber: schedule is null for event {0} : {1}",
            eventData.EventName, JSON.stringify(eventData)));
        return null;
    }
    var sessionsRemaining = NumSessionsRemaining(schedule, time, eventData.SessionDurationSeconds);
    if (sessionsRemaining < 0) {
        return null;
    }
    // mod for track index
    var invTrackIndex = sessionsRemaining % eventData.TrackData.length;
    return eventData.TrackData[eventData.TrackData.length - 1 - invTrackIndex];

    function NumSessionsRemaining(schedule, time, sessionDurationMinutes) {
        if (schedule === null || schedule === undefined || time < 0) {
            return -1;
        }
        var minutesUntilEventEnd = (schedule.EndDate - time) / 60;
        var sessionDurationMinutes = sessionDurationMinutes / 60;
        return Math.floor(minutesUntilEventEnd / sessionDurationMinutes);
    }
}

// Module: SessionUtilities
// Get the end time of the session which is used as it's Id.
function GetSessionEndTime(/*string*/ event, playerId) {
    var now = GetNow() / 1000;

    var eventObject = GetRaceEventDataFromMetaCollection(event, true, playerId);

    if (eventObject === null || eventObject === undefined) {
        // ErrorMessage should already be called in GetRaceEventDataFromMetaCollection()
        return 0;
    }
    var schedule = GetCurrentScheduleForRaceEvent(eventObject);
    if (schedule === null) {
        ErrorMessage(FormatString("GetSessionEndTime: schedule is null for event {0} : {1}",
            event, JSON.stringify(eventObject)));
        return 0;
    }

	if (now >= schedule.EndDate) {
		return schedule.EndDate;
	}

	var secondsUntilEnd = schedule.EndDate - now;

	// cut off partial sessions to get the end of this session
	var numWholeSessions = Math.floor(secondsUntilEnd / eventObject.SessionDurationSeconds);
	var wholeSessionSeconds = numWholeSessions * eventObject.SessionDurationSeconds;
	var currentSessionEnd = schedule.EndDate - wholeSessionSeconds;

	return currentSessionEnd;
}

// Module: SessionUtilities
function EnterSessionAndSetupResponse(/*string*/ playerId, /*string*/ event, /* string */ carClass) {
    var sessionSkill = EnterSessionAndGetSkill(playerId, event, carClass);

    if (sessionSkill < 0) {
        ErrorMessage(FormatString("EnterSessionAndSetupResponse: failed to enter session for event {0}, got skill: {1}",
            event, sessionSkill));
        return sessionSkill;
    }

    Spark.setScriptData("sessionSkill", sessionSkill);

    var sessionEndTime = GetSessionEndTime(event, playerId);

    Spark.setScriptData("sessionEndTime", sessionEndTime);

    return sessionSkill;
}

// Module: SessionUtilities
function EnterSessionAndGetSkill(/*string*/ playerId, /*string*/ eventName, /* string */ carClass) {
    var currentSession = GetSessionEndTime(eventName, playerId);

    var versionedEvents = GetVersionedEvents2(playerId);

    var done = false;
    var eventData;
    while (!done) {
        var events = versionedEvents.GetData();

        eventData = GetMostRecentEventData(events[eventName]);

        if (eventData !== null && eventData !== undefined) {
            if (eventData.eventLastSession !== null &&
                eventData.eventLastSession !== undefined &&
                eventData.eventLastSession === currentSession) {

                done = true;
            }
            else {
                var stats = GetPlayerStats(playerId);
                var trackName = GetEventCurrentTrack(eventName, playerId);

                eventData.eventLastSession = currentSession;

                var skillObject = GetSkillObject(stats, trackName, carClass);
                eventData.eventLastSessionSkill = skillObject.skill;

                //Spark.getLog().info("Skill : " + eventData.eventLastSessionSkill);

                done = versionedEvents.SetData(events);
            }
        }
        else {
            ErrorMessage(FormatString("You have not entered event: [{0}] yet",
                eventName));
            return -1;
        }
    }

    return eventData.eventLastSessionSkill;
}

// Module: SessionUtilities
function GetVersionedSessionState(playerId) {
    return MakeVersionedProfile(playerId, "sessionState", {});
}

// Module: SessionUtilities
// Adds to the specified player's session state.
function AddPlayerSessionState(playerId,
    /*string*/ carVariant,
    /*string*/ carVariantDiscriminator,
    /*string*/ eventName,
    /*object*/ sessionData) {

    // LogMessage(FormatString("carVariant [{0}] \ncarVariantDiscriminator [{1}] \neventName [{2}] \nsessionData [{3}]",
    //     carVariant,
    //     carVariantDiscriminator,
    //     eventName,
    //     JSON.stringify(sessionData)));

    var versionedSessionState = GetVersionedSessionState(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var sessionState = versionedSessionState.GetData();

        DiscardOldSessionState(sessionState);

        var carKey = carVariant + carVariantDiscriminator;

        // LogMessage(FormatString("initialState: {0}", JSON.stringify(sessionState)));

        if (typeof sessionState[carKey] !== "object") {
            //LogMessage(FormatString("#1: {0}", typeof sessionState[carKey]));

            sessionState[carKey] = {};

            //LogMessage(FormatString("#1a: {0}", typeof sessionState[carKey]));
        }

        var eventDict = sessionState[carKey];

        eventDict[eventName] = sessionData;

        //LogMessage(FormatString("eventDict: {0}", JSON.stringify(eventDict)));
        //LogMessage(FormatString("sessionState: {0}", JSON.stringify(sessionState)));

        successfullyWritten = versionedSessionState.SetData(sessionState);
    }
}

// Module: SessionUtilities
// Removes the session state (edge) from the specified car for all events. For e.g. ProPacking when you'll
// otherwise get a negative edge.
function RemovePlayerSessionStateForAllEvents(playerId,
    /*string*/ carVariant,
    /*string*/ carVariantDiscriminator) {
    // LogMessage(FormatString("carVariant [{0}] \ncarVariantDiscriminator [{1}] \neventName [{2}] \nsessionData [{3}]",
    //     carVariant,
    //     carVariantDiscriminator,
    //     eventName,
    //     JSON.stringify(sessionData)));

    var versionedSessionState = GetVersionedSessionState(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var sessionState = versionedSessionState.GetData();

        DiscardOldSessionState(sessionState);

        var carKey = carVariant + carVariantDiscriminator;

        // LogMessage(FormatString("initialState: {0}", JSON.stringify(sessionState)));

        if (typeof sessionState[carKey] !== "object") {
            //LogMessage(FormatString("#1: Could not find [{0}]. Nothing to remove.", carKey));
            return;
        }

        delete sessionState[carKey]

        successfullyWritten = versionedSessionState.SetData(sessionState);
    }
}


// Module: SessionUtilities
// Removes the session state (edge) from the specified car for all events except the current one specified.
// E.g. when you enter an event your car has it's upgrades (edge) removed for all other events.
// Returns whether anything was removed.
function RemoveSessionStateForCarInOtherEvents(playerId,
    /*string*/ carVariant,
    /*string*/ carVariantDiscriminator,
    /*string*/ keepEventName) {

    var removedSomething = false;

    var versionedSessionState = GetVersionedSessionState(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        removedSomething = false;

        var sessionState = versionedSessionState.GetData();

        DiscardOldSessionState(sessionState);

        var carKey = carVariant + carVariantDiscriminator;

        // LogMessage(FormatString("initialState: {0}", JSON.stringify(sessionState)));

        if (typeof sessionState[carKey] !== "object") {
            //LogMessage(FormatString("#2: Could not find [{0}]. Nothing to remove.", carKey));
            return removedSomething;
        }

        var eventDict = sessionState[carKey];

        var allEventsDiscarded = true;
        for (var event in eventDict) {
            if (eventDict.hasOwnProperty(event)) {
                if (event !== keepEventName) {
                    // Spark.getLog().info(FormatString("Removing edge - car: {0}:{1}, event: {2}, keep event: {3}",
                    //     carVariant, carVariantDiscriminator, event, keepEventName));

                    delete eventDict[event];
                    removedSomething = true;
                }
                else {
                    allEventsDiscarded = false;
                }
            }
        }

        if (allEventsDiscarded) {
            delete sessionState[carKey];
        }

        successfullyWritten = versionedSessionState.SetData(sessionState);
    }

    return removedSomething;
}

// Module: SessionUtilities
function DiscardOldSessionState(sessionState) {
    var now = GetNow() / 1000;

    // kill sessions more than 6 hours ended (for now)
    // can make this quicker
    var limit = now - 60 * 60 * 6;

    for (var carKey in sessionState) {
        if (sessionState.hasOwnProperty(carKey)) {
            var eventDict = sessionState[carKey];
            var allEventsDiscarded = true;
            for (var event in eventDict) {
                if (eventDict.hasOwnProperty(event)) {
                    var sessionData = eventDict[event];

                    if (sessionData.CurrentSessionId < limit) {
                        delete eventDict[event];
                    }
                    else {
                        allEventsDiscarded = false;
                    }
                }
            }

            if (allEventsDiscarded) {
                delete sessionState[carKey];
            }
        }
    }
}