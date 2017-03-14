requireOnce("CollectionUtilities");
requireOnce("CohortUtilities");
requireOnce("GeneralUtilities");
requireOnce("RaceEventScheduleUtilities");


PostProcessEventChange();

function PostProcessEventChange() {
    // "Single" | "All" | "Remove" | "ShutdownABTest" | "CopyBaselineToBranched"
    var mode = Spark.getData().mode;

    var abTest = Spark.getData().abTest;
    var cohort = Spark.getData().cohort;

    if (mode === "Remove") {
        var currentEventName = Spark.getData().eventName;

        // handles a single event
        var ok = PostProcessRemoveEventChange(currentEventName);

        if (ok) {
            ExitOk();
        }
    }
    else if (mode === "CopyBaselineToBranched") {
        var currentEventName = Spark.getData().eventName;

        var ok = CopyBaselineToBranched(currentEventName);

        if (ok) {
            ExitOk();
        }
    }
    else if (mode === "DeleteBaselineFromBranched") {
        var currentEventName = Spark.getData().eventName;

        var ok = DeleteBaselineFromBranched(currentEventName);

        if (ok) {
            ExitOk();
        }
    }
    else if (mode === "Single") {
        var currentEventName = Spark.getData().eventName;

        Log("PostProcessSingleEventChange for event: {0} on {1}:{2}", currentEventName, abTest ? abTest : "Baseline", cohort);

        // handles a single event
        var ok = PostProcessSingleEventChange(currentEventName);

        if (ok) {
            ExitOk();
        }
    }
    else if (mode === "All") {
        var dealershipCalendarCollection = GetBranchedCollection("dealershipCalendar", abTest, cohort);
        var eventInstanceCacheCollection = GetBranchedCollection("eventInstanceCache", abTest, cohort);

        // remove the whole event instance cache
        dealershipCalendarCollection.remove({});
        eventInstanceCacheCollection.remove({});

        var raceEventsCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var raceEvents = raceEventsCollection.find({}, { EventName: true }).sort({ EventName : 1 }).toArray();

        var ok = true;

        for (var i = 0; i < raceEvents.length; ++i) {
            var currentEventName = raceEvents[i].EventName;
            var thisEventOk = PostProcessSingleEventChange(currentEventName);

            if (!thisEventOk) {
                ok = false;
            }
        }

        if (ok) {
            ExitOk();
        }
    }
    else if (mode === "ShutdownABTest") {
        var inABTest = AreWeInABTest();

        if (!inABTest) {
            ErrorMessage(FormatString("Trying to run {0}, but we are not in an AB test! abTest: {1}, cohort: {2}",
                mode, abTest, cohort));
            return;
        }

        // TODO: start shutdown at time in the future
        // TODO - pass up from Unity
        var shutdownStartTime = Math.floor(Date.now() / 1000);

        var params = {
            ShutdownStartTime : shutdownStartTime,
            ShutdownCompleteTime : shutdownStartTime
        };

        // find events marked as Branched or Separate, logic is the same for both as in both cases we have 2 EventNames
        // for something the player perceives as a single event. In fact, find events labelled "Base", and get the
        // Branched or Separate versions by string manipulation from there.

        var raceEventsCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var query = { Branched : "Base" };

        var baseRaceEvents = raceEventsCollection.find(query, { EventName: true }).sort({ EventName : 1 }).toArray();

        var ok = true;

        for (var i = 0; i < baseRaceEvents.length; ++i) {
            var baseName = baseRaceEvents[i].EventName;

            var thisEventOk = PostProcessBranchedEventShutdown(params, baseName);

            if (!thisEventOk) {
                ok = false;
            }
        }

        if (ok) {
            Spark.setScriptData("shutdownCompleteTime", params.ShutdownCompleteTime);

            ExitOk();
        }
    }
    else {
        var error = FormatString("postProcessEventChange() : unknown mode: {0}, for eventName: {1}, abTest: {2}, cohort: {3}",
            mode,
            Spark.getData().eventName,
            abTest,
            cohort);
        ErrorMessage(error);
    }

    function DeleteBaselineFromBranched(eventName) {
        if (eventName === null || eventName === undefined || eventName === "") {
            ErrorMessage("'eventName' cannot be null, undefined or empty");
            return false;
        }

        Log("DeleteBaselineFromBranched for event: {0} to {1}:{2}", eventName, abTest, cohort);

        // event should already be gone from the baseline collection

        // get the event from the branched collection
        var raceEventsBranchedCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var baselineEventInBranchedCollection = raceEventsBranchedCollection.findOne({"EventName": eventName});

        var branchedOk = true;

        // If the event in the branched collection is Base, nuke the branched event also
        if (baselineEventInBranchedCollection.Branched === "Base") {
            var branchedEventName = eventName + FormatCohortSuffix(abTest, cohort);

            raceEventsBranchedCollection.remove({"EventName": branchedEventName});

            branchedOk = PostProcessRemoveEventChange(branchedEventName);
        }

        // finally remove the baseline event from the branched collection
        raceEventsBranchedCollection.remove({"EventName": eventName});

        var baseOk = PostProcessRemoveEventChange(eventName);

        return baseOk && branchedOk;
    }

    function CopyBaselineToBranched(eventName) {
        if (eventName === null || eventName === undefined || eventName === "") {
            ErrorMessage("'eventName' cannot be null, undefined or empty");
            return false;
        }

        Log("CopyBaselineToBranched for event: {0} to {1}:{2}", eventName, abTest, cohort);

        // Get the event from BaselineCollection
        var raceEventsBaselineCollection = GetBranchedCollection("raceEvents");

        var baselineEventInBaselineCollection = raceEventsBaselineCollection.findOne({"EventName": eventName});

        /////////////////////////////////////////////////////////////////////////
        // Copy the event from the Baseline collection to the Branched collection

        // Get the event from BranchedCollection
        var raceEventsBranchedCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var baselineEventInBranchedCollection = raceEventsBranchedCollection.findOne({"EventName": eventName});

        // don't take the _id across
        delete baselineEventInBaselineCollection._id;

        // we should maintain the Branched state from the branched collection
        if (baselineEventInBranchedCollection !== null && baselineEventInBranchedCollection !== undefined) {
            baselineEventInBaselineCollection.Branched = baselineEventInBranchedCollection.Branched;
            baselineEventInBaselineCollection._id = baselineEventInBranchedCollection._id;
        }

        var query = CreateUpsertQueryForEvent(baselineEventInBaselineCollection);

        var upsert = true;
        var multi = false;
        raceEventsBranchedCollection.update(query, baselineEventInBaselineCollection, upsert, multi);

        var baseOk = PostProcessSingleEventChange(currentEventName);
        var branchedOk = true;

        /////////////////////////////////////////////////////////////////////////
        // If the event in the branched collection is Base and it's branched event is Separate copy over that also
        if (baselineEventInBaselineCollection.Branched === "Base") {
            var branchedEventName = eventName + FormatCohortSuffix(abTest, cohort);

            var branchedEventInBranchedCollection = raceEventsBranchedCollection.findOne({"EventName": branchedEventName});

            // if the event is separate we need to copy over this too
            if (branchedEventInBranchedCollection.Branched === "Separate") {
                // don't take the _id across
                delete baselineEventInBaselineCollection._id;

                baselineEventInBaselineCollection.Branched = branchedEventInBranchedCollection.Branched;
                baselineEventInBaselineCollection._id = branchedEventInBranchedCollection._id;

                // set the correct branched event name
                baselineEventInBaselineCollection.EventName = branchedEventInBranchedCollection.EventName;

                var query = CreateUpsertQueryForEvent(baselineEventInBaselineCollection);

                var upsert = true;
                var multi = false;
                raceEventsBranchedCollection.update(query, baselineEventInBaselineCollection, upsert, multi);

                branchedOk = PostProcessSingleEventChange(branchedEventName);
            }
        }

        return baseOk && branchedOk;
    }

    function PostProcessBranchedEventShutdown(params, baseName) {
        var inABTest = AreWeInABTest();

        Log("PostProcessBranchedEventShutdown() event: {0}, abTest: {1}, cohort: {2}, inABTest: {3}",
            baseName, abTest, cohort, inABTest);

        if (!inABTest) {
            // error, but warn at higher level
            return false;
        }

        if (baseName === null || baseName === undefined || baseName === "") {
            ErrorMessage("'eventName' cannot be null, undefined or empty");
            return false;
        }

        var raceEventsCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var dealershipCalendarCollection = GetBranchedCollection("dealershipCalendar", abTest, cohort);
        var eventInstanceCacheCollection = GetBranchedCollection("eventInstanceCache", abTest, cohort);

        // remove the previous entries for this event
        dealershipCalendarCollection.remove({"EventName": baseName});
        eventInstanceCacheCollection.remove({"EventName": baseName});

        var baseEvent = raceEventsCollection.findOne({"EventName": baseName});

        if (baseEvent === null || baseEvent === undefined) {
            ErrorMessage(FormatString("Could not find event: {0}", baseName));
            return false;
        }

        if (baseEvent.Schedule === null || baseEvent.Schedule === undefined) {
            ErrorMessage(FormatString("Event [{0}] is an old-school event, and does not use the repeating event system." +
                "We don't handle this.",
                baseEvent.EventName));
            return false;
        }

        // handle the branched event
        /////////////////////////////

        var branchedName = baseName + FormatCohortSuffix(abTest, cohort);

        // remove the previous entries for this event
        dealershipCalendarCollection.remove({"EventName": branchedName});
        eventInstanceCacheCollection.remove({"EventName": branchedName});

        var branchedEvent = raceEventsCollection.findOne({"EventName": branchedName});

        if (branchedEvent === null || branchedEvent === undefined) {
            ErrorMessage(FormatString("Could not find event: {0}", branchedName));
            return false;
        }

        if (branchedEvent.Schedule === null || branchedEvent.Schedule === undefined) {
            ErrorMessage(FormatString("Event [{0}] is an old-school event, and does not use the repeating event system." +
                "We don't handle this.",
                branchedEvent.EventName));
            return false;
        }

        ////////////////////////////////////////////////////////////////////

        var calendarEntries = [];
        var eventInstanceEntries = [];

        // don't use GetNow() here - if we are shifting time we don't want our calendar shifted!
        var now = Math.floor(Date.now() / 1000);
        var sixMonths = 60 * 60 * 24 * (365 / 2);

        // populate the dealership calendar/event instance cache until this point in time
        var limitTime = now + sixMonths;

        var usingBaseEvent = false;
        var eventToUse = branchedEvent;
        var nextInstanceSearchTime = now;

        // handle events which are running now
        var schedule = GetCurrentActiveInstanceOfEvent(eventToUse.Schedule, now);

        if (schedule !== null && schedule !== undefined) {
            AddToDealershipCalendarList(calendarEntries, eventToUse, schedule);
            AddToEventInstanceCacheList(eventInstanceEntries, eventToUse, schedule);

            // We have to wait until all the branched events complete their instances before the AB test can be
            // shutdown
            if (!usingBaseEvent) {
                params.ShutdownCompleteTime = Math.max(params.ShutdownCompleteTime, schedule.EndDate);
            }

            // the branched event instance ends after we start shutdown, so we switch back to the base event
            if (!usingBaseEvent && schedule.EndDate > params.ShutdownStartTime) {
                // switch to using the base event schedule
                usingBaseEvent = true;
                eventToUse = baseEvent;
                // -1 so we don't miss 'touching' events
                nextInstanceSearchTime = schedule.EndDate - 1;
            }
        }

        // start loop
        schedule = GetNextInstanceOfEvent(eventToUse.Schedule, nextInstanceSearchTime);

        while (schedule !== null && schedule !== undefined && schedule.StartDate < limitTime) {
            AddToDealershipCalendarList(calendarEntries, eventToUse, schedule);
            AddToEventInstanceCacheList(eventInstanceEntries, eventToUse, schedule);

            // We have to wait until all the branched events complete their instances before the AB test can be
            // shutdown
            if (!usingBaseEvent) {
                params.ShutdownCompleteTime = Math.max(params.ShutdownCompleteTime, schedule.EndDate);
            }

            if (!usingBaseEvent && schedule.EndDate > params.ShutdownStartTime) {
                // switch to using the base event schedule
                usingBaseEvent = true;
                eventToUse = baseEvent;
                // -1 so we don't miss 'touching' events
                nextInstanceSearchTime = schedule.EndDate - 1;
            }
            else {
                nextInstanceSearchTime = schedule.StartDate;
            }

            // loop until schedule is null, or for fixed time
            schedule = GetNextInstanceOfEvent(eventToUse.Schedule, nextInstanceSearchTime);
        }

        var ok = true;
        if (calendarEntries.length > 0) {
            ok = dealershipCalendarCollection.insert(calendarEntries);
        }

        if (!ok) {
            ErrorMessage(FormatString("Failed to add dealership calendar entries in event [{0}]", baseEvent.EventName));
        }

        ok = true;
        if (eventInstanceEntries.length > 0) {
            ok = eventInstanceCacheCollection.insert(eventInstanceEntries);
        }

        if (!ok) {
            ErrorMessage(FormatString("Failed to add event instance entries in event cache for event [{0}]", baseEvent.EventName));
        }

        Log("PostProcessBranchedEventShutdown: END: {0}", baseName);

        return true;
    }

    function PostProcessRemoveEventChange(eventName) {
        if (eventName === null || eventName === undefined || eventName === "") {
            ErrorMessage("'eventName' cannot be null, undefined or empty");
            return false;
        }
        Spark.getLog().info(FormatString("PostProcessRemoveEventChange: {0}", eventName));

        var raceEventsCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var dealershipCalendarCollection = GetBranchedCollection("dealershipCalendar", abTest, cohort);
        var eventInstanceCacheCollection = GetBranchedCollection("eventInstanceCache", abTest, cohort);

        // remove the previous entries for this event
        dealershipCalendarCollection.remove({"EventName": eventName});
        eventInstanceCacheCollection.remove({"EventName": eventName});

        var event = raceEventsCollection.findOne({"EventName": eventName});

        if (event !== null && event !== undefined) {
            ErrorMessage(FormatString("Found event: [{0}], but it should have been removed!", eventName));
            return false;
        }

        return true;
    }

    function PostProcessSingleEventChange(eventName) {
        if (eventName === null || eventName === undefined || eventName === "") {
            ErrorMessage("'eventName' cannot be null, undefined or empty");
            return false;
        }

        var raceEventsCollection = GetBranchedCollection("raceEvents", abTest, cohort);

        var dealershipCalendarCollection = GetBranchedCollection("dealershipCalendar", abTest, cohort);
        var eventInstanceCacheCollection = GetBranchedCollection("eventInstanceCache", abTest, cohort);

        // remove the previous entries for this event
        dealershipCalendarCollection.remove({"EventName": eventName});
        eventInstanceCacheCollection.remove({"EventName": eventName});

        var event = raceEventsCollection.findOne({"EventName": eventName});

        if (event === null || event === undefined) {
            ErrorMessage(FormatString("Could not find event: {0}", eventName));
            return false;
        }

        if (event.Schedule === null || event.Schedule === undefined) {
            ErrorMessage(FormatString("Event [{0}] is an old-school event, and does not use the repeating event system." +
                "We don't handle this.",
                event.EventName));
            return false;
        }

        var inABTest = AreWeInABTest();

        Log("event: {0}, abTest: {1}, cohort: {2}, inABTest: {3}", eventName, abTest, cohort, inABTest);

        if (inABTest) {
            // in an A/B test we don't use the Base event for branched events
            if (event.Branched === "Base") {
                return true;
            }
        }
        else {
            // when not in a A/B test we show all events, but there should not be any Base or Branched events.
            // warn on those ...
            if (event.Branched === "Branched" ||
                event.Branched === "Separate" ||
                event.Branched === "Base") {
                Log("Event: {0} is marked as: {1}, but we are not in an A/B test. WTF?!",
                    event.EventName,
                    event.Branched);
            }
        }

        var calendarEntries = [];
        var eventInstanceEntries = [];

        // don't use GetNow() here - if we are shifting time we don't want our calendar shifted!
        var now = Math.floor(Date.now() / 1000);
        var sixMonths = 60 * 60 * 24 * (365 / 2);

        // populate the dealership calendar/event instance cache until this point in time
        var limitTime = now + sixMonths;

        // handle events which are running now
        var schedule = GetCurrentActiveInstanceOfEvent(event.Schedule, now);

        if (schedule !== null && schedule !== undefined) {
            AddToDealershipCalendarList(calendarEntries, event, schedule);
            AddToEventInstanceCacheList(eventInstanceEntries, event, schedule);
        }

        // start loop
        schedule = GetNextInstanceOfEvent(event.Schedule, now);

        while (schedule !== null && schedule !== undefined && schedule.StartDate < limitTime) {
            AddToDealershipCalendarList(calendarEntries, event, schedule);
            AddToEventInstanceCacheList(eventInstanceEntries, event, schedule);
            // loop until schedule is null, or for fixed time
            schedule = GetNextInstanceOfEvent(event.Schedule, schedule.StartDate);
        }

        var ok = true;
        if (calendarEntries.length > 0) {
            ok = dealershipCalendarCollection.insert(calendarEntries);
        }

        if (!ok) {
            ErrorMessage(FormatString("Failed to add dealership calendar entries in event [{0}]", event.EventName));
        }

        ok = true;
        if (eventInstanceEntries.length > 0) {
            ok = eventInstanceCacheCollection.insert(eventInstanceEntries);
        }

        if (!ok) {
            ErrorMessage(FormatString("Failed to add event instance entries in event cache for event [{0}]", event.EventName));
        }

        Log("PostProcessSingleEventChange: END: {0}", eventName);

        return true;
    }

    function AreWeInABTest() {
        return abTest !== null && abTest !== undefined && abTest !== "" &&
            cohort !== null && cohort !== undefined && cohort !== "";
    }

    function ExitOk() {
        // hmm - this is a bit lame - the client (UnityEditor/WebClient) can't seem to work out whether this call
        // succeeded, so we write something (anything) to show we got to the end ok :()
        Spark.setScriptData("ok", true);
    }

    function CreateUpsertQueryForEvent(event) {
        // use the id if we have it to avoid renaming causing duplicates, otherwise the EventName. Both are unique.
        if (event._id) {
            return {
                "_id" : event._id
            };
        }
        else {
            return {
                "EventName" : event.EventName
            };
        }
    }

    function AddToDealershipCalendarList(calendarEntries, event, schedule) {
        if (event.Restrictions === null || event.Restrictions === undefined) {
            return;
        }

        for (var i = 0; i < event.Restrictions.length; ++i) {
            var restriction = event.Restrictions[i];

            if (restriction.Type === "CarModel") {
                calendarEntries.push({
                    EventName : event.EventName,
                    Model : restriction.Condition1,
                    StartDate : new Date(schedule.StartDate * 1000),
                    EndDate : new Date(schedule.EndDate * 1000)
                });
            }
        }
    }

    function AddToEventInstanceCacheList(eventInstanceEntries, event, schedule) {
        eventInstanceEntries.push({
            EventName: event.EventName,
            VisibilityStart: GetVisibilityStart(eventInstanceEntries, event, schedule),
            VisibilityEnd: new Date(schedule.EndDate * 1000),
            DebugEvent: event.DebugEvent,
            NewcomerLeague: (event.EventName.indexOf("Newcomer") !== -1),
            FtueEvent: event.FTUEEvent
        });

        function GetVisibilityStart(eventInstanceEntries, event, schedule) {
            if (RaceEventIsAlwaysActive(event)) {
                return new Date(schedule.StartDate * 1000);
            }
            else
            {
                if (eventInstanceEntries.length === 0) {
                    // This is the first entry, so we don't need to worry about the 'Visible Before'
                    // conflicting with another instance.
                    return new Date((schedule.StartDate - event.SecondsVisibleBeforeStartDate) * 1000);
                }
                // We need to be careful as 'Visible Before' might conflict with previous instances
                // and we only want one instance visible at any one time.
                // First off, order the current entries by their VisibililtyStart.
                eventInstanceEntries.sort(function(a, b)
                {
                    // Ascending order
                    return (a.VisibilityStart - b.VisibilityStart);
                });
                // Get the last entry's VisibilityEnd so we don't start this next instance
                // before the previous instance has ended.
                var lastEntry = eventInstanceEntries[eventInstanceEntries.length - 1];
                var startDate = new Date((schedule.StartDate - event.SecondsVisibleBeforeStartDate) * 1000);
                startDate = new Date(Math.max(startDate, lastEntry.VisibilityEnd));
                return startDate;
            }
        }
    }
}
