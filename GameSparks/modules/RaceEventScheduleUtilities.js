// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("DateTimeUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");

function RaceEventIsAlwaysActive(raceEvent) {
    if (raceEvent.Schedule === null || raceEvent.Schedule === undefined){
        return raceEvent.AlwaysActive;
    }
    else {
        var repeatingDates = raceEvent.Schedule.RepeatingDates;
        if (repeatingDates === null || repeatingDates === undefined || repeatingDates.length === 0) {
            return false;
        }
        return raceEvent.Schedule.RepeatingDates[0].AlwaysActive;
    }
}

function RaceEventIsActive(playerId, raceEvent) {
    var alwaysActive = RaceEventIsAlwaysActive(raceEvent);
    if (alwaysActive) {
        return true;
    }

    if (raceEvent.Schedule === null || raceEvent.Schedule === undefined) {
        // BBA - Legacy
        // TODO: Remove this when safe
        var schedule = GetEventScheduleAndUpdateEventScheduleFields(raceEvent);
        var now = GetNow() / 1000;
        var visibleDate = schedule.StartDate;

        if (raceEvent.SecondsVisibleBeforeStartDate != null && !isNaN(raceEvent.SecondsVisibleBeforeStartDate)) {
            visibleDate -= raceEvent.SecondsVisibleBeforeStartDate;
        }

        if ((now > visibleDate && now < schedule.EndDate) &&
            (TutorialIsDone(playerId) || raceEvent.FTUEEvent || raceEvent.DebugEvent)) {
            return true;
        }
    }
    else {
        var now = GetNow() / 1000;
        // Get the current instance of the event
        var schedule = GetCurrentActiveInstanceOfEvent(raceEvent.Schedule, now);
        if (schedule === null) {
            // There is no active instance
            return false;
        }

        var visibleSecondsBefore = 0;
        if (raceEvent.SecondsVisibleBeforeStartDate !== null  &&
            raceEvent.SecondsVisibleBeforeStartDate !== undefined &&
            !isNaN(raceEvent.SecondsVisibleBeforeStartDate)) {

            visibleSecondsBefore = raceEvent.SecondsVisibleBeforeStartDate;
        }

        // Reduce the start time by SecondsVisibleBeforeStartDate
        var visibleDate = (schedule.StartDate - visibleSecondsBefore);
        if (now < visibleDate) {
            return false;
        }

        return (TutorialIsDone(playerId) || raceEvent.FTUEEvent || raceEvent.DebugEvent);
    }

    return false;
}

/**
  * Module: RaceEventScheduleUtilities.
  * Returns the schedule: i.e. start date, the end date and the league number of the given race event's
  * active/most recent occurence. For events which are AlwaysActive there may be multiple occurences of
  * an event. If there have been no iterations of an event then null is returned.
  */
function GetCurrentScheduleForRaceEvent(raceEvent) {
    var now = GetNow() / 1000;
    if (raceEvent.Schedule === null || raceEvent.Schedule === undefined){
        // Old style
        if (raceEvent.AlwaysActive){
            schedule = {};
            var elapsedSeconds = now - raceEvent.StartDate;

            var eventDurationSeconds = raceEvent.EndDate - raceEvent.StartDate;
            var iterationsPassed = Math.floor(elapsedSeconds / eventDurationSeconds);

            var currentIterationStartDate = raceEvent.StartDate + (iterationsPassed * eventDurationSeconds);
            var currentIterationEndDate = currentIterationStartDate + eventDurationSeconds;
            return CreateSchedule(currentIterationStartDate, currentIterationEndDate);
        }
        else{
            return CreateSchedule(raceEvent.StartDate, raceEvent.EndDate);
        }
    }
    else {
        var schedule = GetCurrentActiveInstanceOfEvent(raceEvent.Schedule, now);
        if (schedule === null || schedule === undefined) {
            // There is no current instance, so instead get the next instance
            schedule = GetNextInstanceOfEvent(raceEvent.Schedule, now);
        }
        return schedule;
    }

    return null;
}

/**
  * Module: RaceEventScheduleUtilities.
  * Returns the schedule: i.e. start date and the end date of the given race event's
  * specific occurence, which is tied to the challengeId. For events which are AlwaysActive there may  be
  * multiple occurences of an event. As the returned schedule is tied to the challengeId it may not be the
  * latest for that event.
  *
  * @param {string} challengeId - Maximum value accepted for trends.
  * @param {bool} noErrorOnMissingChallenge - don't mark the current request as having errors
  */
function GetRaceEventScheduleWithChallengeId(challengeId, noErrorOnMissingChallenge, playerId) {
    var challenge = Spark.systemCollection("challengeInstance").findOne({
        "_id": {
            "$oid": challengeId
        }
    },
    {
        "challengeName": 1,
        "endDate": 1
    });

    if (challenge === null || challenge === undefined) {
        if (!noErrorOnMissingChallenge) {
            ErrorMessage(FormatString("Error finding challenge with id {0}", challengeId));
        }
        return null;
    }

    var raceEvent = GetRaceEventDataFromMetaCollection(challenge.challengeName, noErrorOnMissingChallenge, playerId);
    if (raceEvent === null || raceEvent === undefined){
        return null;
    }

    var endDate = Math.floor(challenge.endDate / 1000);

    if (raceEvent.Schedule === null || raceEvent.Schedule === undefined) {
        // Old style
        var elapsedSeconds = endDate - raceEvent.StartDate;

        var eventDurationSeconds = raceEvent.EndDate - raceEvent.StartDate;

        return CreateSchedule(endDate - eventDurationSeconds, endDate);
    }
    else {
        var specificDates = raceEvent.Schedule.SpecificDates;
        var repeatingDates = raceEvent.Schedule.RepeatingDates;

        if (specificDates.length === 0 && repeatingDates.length === 0) {
            return null;
        }

        var eventDuration = ((specificDates.length > 0) ?
                            (specificDates[0].End - specificDates[0].Start) :
                            (repeatingDates[0].TimeFramePerDay.End - repeatingDates[0].TimeFramePerDay.Start));
        var startDate = endDate - eventDuration;
        return GetCurrentActiveInstanceOfEvent(raceEvent.Schedule, startDate);
    }

    return null;
}

/**
  * Module: RaceEventScheduleUtilities.
  * Gets the current instance of an event that is running at 'runningHere'.
  * Will return null if there is no instance at that time.
  */
function GetCurrentActiveInstanceOfEvent(schedule, runningHere) {
    var specificDates = schedule.SpecificDates;
    var repeatingDates = schedule.RepeatingDates;

    if (specificDates.length > 0) {
        // Sort in ascending order of start dates
        specificDates = specificDates.sort(function(a, b) {
            return a.Start - b.Start;
        });

        // Iterate over the specific dates and find the first instance that running at 'runningHere'
        for (var i = 0; i < specificDates.length; ++i) {
            var specificDate = specificDates[i];
            if (specificDate.Start <= runningHere && specificDate.End > runningHere) {
                return CreateSchedule(specificDate.Start, specificDate.End);
            }
        }

        return null;
    }
    else {
        // Only works with 1 repeating date for now...
        var repeatingDate = repeatingDates[0];
        // Repeating time frame data
        var RTF = repeatingDate.RepeatingTimeFrame;
        var RTFStart = RTF.Start;
        var RTFEnd = RTF.End;
        var repeatingDays = repeatingDate.RepeatingDays;
        // Event instance time frame data
        var timeFramePerDay = repeatingDate.TimeFramePerDay;
        var instanceTimeOfDayStart = timeFramePerDay.Start; // Minutes
        var instanceTimeOfDayEnd = timeFramePerDay.End; //Minutes
        var durationSeconds = (instanceTimeOfDayEnd - instanceTimeOfDayStart) * 60;
        // If we're always active then we follow a simpler flow
        var alwaysActive = repeatingDate.AlwaysActive;
        if (alwaysActive) {
            return GetAlwaysActiveScheduleData(runningHere, RTFStart, durationSeconds);
        }
        // If there are no days of the week then there is no first instance
        if (repeatingDays.length === 0) {
            return null;
        }
        // We need to take RTFStart and reduce it by the event duration
        // so we can catch instances that start and end on different days
        var startTime = (RTFStart - durationSeconds);
        var currentSearchTime = GetStartOfDayForUnixTimestamp(startTime);
        while (true) {
            // Keep adding days until we find a day of the week that is a repeating day
            var currentSearchDoW = GetDayOfWeekForUnixTimestamp(currentSearchTime);
            if (!IsARepeatingDay(repeatingDays, currentSearchDoW)) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Reset currentSearchTime to start of the day
            currentSearchTime = GetStartOfDayForUnixTimestamp(currentSearchTime);
            // Check that we've not passed the RTF end
            if (currentSearchTime >= RTFEnd) {
                return null;
            }
            // Get the start time of the ITF
            var ITFStart = currentSearchTime + (instanceTimeOfDayStart * 60); // Seconds
            // Check that this start time isn't passed the RTF end
            if (ITFStart >= RTFEnd) {
                return null;
            }
            // Get the end time of the ITF
            var ITFEnd = ITFStart + durationSeconds;
            // Check that the end time isn't before (or at) the RTF start
            if (ITFEnd <= RTFStart) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Check the instance is currently running
            if (runningHere < ITFStart || runningHere >= ITFEnd) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Finalise the details of the next event instance
            var instanceStart = ITFStart;//Math.max(RTFStart, ITFStart);
            var instanceEnd = ITFEnd;//Math.min(RTFEnd, ITFEnd);
            return CreateSchedule(instanceStart, instanceEnd);
        }
    }
}

/**
  * Module: RaceEventScheduleUtilities.
  * Gets the last instance of an event, based on the schedule supplied,
  * that started before 'lastBeforeHere'.
  * Note: It will NOT return the current active instance.
  */
function GetLastActiveInstanceOfEvent(schedule, lastBeforeHere) {
    var specificDates = schedule.SpecificDates;
    var repeatingDates = schedule.RepeatingDates;

    if (specificDates.length > 0) {
        // Sort in descending order of start dates
        specificDates = specificDates.sort(function(a, b) {
            return b.Start - a.Start;
        });

        // Iterate over the specific dates and find the first instance that finished before 'lastBeforeHere'
        for (var i = 0; i < specificDates.length; ++i) {
            var specificDate = specificDates[i];
            if (specificDate.End < lastBeforeHere) {
                return CreateSchedule(specificDate.Start, specificDate.End);
            }
        }

        return null;
    }
    else {
        // Only works with 1 repeating date for now...
        var repeatingDate = repeatingDates[0];
        // Repeating time frame data
        var RTF = repeatingDate.RepeatingTimeFrame;
        var RTFStart = RTF.Start;
        var RTFEnd = RTF.End;
        var repeatingDays = repeatingDate.RepeatingDays;
        // Event instance time frame data
        var timeFramePerDay = repeatingDate.TimeFramePerDay;
        var instanceTimeOfDayStart = timeFramePerDay.Start; // Minutes
        var instanceTimeOfDayEnd = timeFramePerDay.End; //Minutes
        var durationSeconds = (instanceTimeOfDayEnd - instanceTimeOfDayStart) * 60;
        // If we're always active then we follow a simpler flow
        var alwaysActive = repeatingDate.AlwaysActive;
        if (alwaysActive) {
            return GetAlwaysActiveScheduleData(lastBeforeHere, RTFStart, durationSeconds);
        }
        // If there are no days of the week then there is no first instance
        if (repeatingDays.length === 0) {
            return null;
        }
        // We need to take the 'lastBeforeHere' value and reduce it by the event duration
        // so we can catch instances that start and end on different days
        var startTime = (lastBeforeHere - durationSeconds);
        var currentSearchTime = GetEndOfDayForUnixTimestamp(startTime);
        while (true) {
            // Keep removing days until we find a day of the week that is a repeating day
            var currentSearchDoW = GetDayOfWeekForUnixTimestamp(currentSearchTime);
            if (!IsARepeatingDay(repeatingDays, currentSearchDoW)) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, -1);
                continue;
            }
            // Reset currentSearchTime to end of the day
            currentSearchTime = GetEndOfDayForUnixTimestamp(currentSearchTime);
            // Get the end time of the ITF
            var ITFEnd = currentSearchTime - (GetOneFullDayInSeconds() - (instanceTimeOfDayEnd * 60)) + 1; // Seconds
            // Get the start time of the ITF
            var ITFStart = ITFEnd - durationSeconds;
            // Check that the instance isn't running as of 'fromHere'
            if (lastBeforeHere >= ITFStart && lastBeforeHere < ITFEnd) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, -1);
                continue;
            }
            // Check that the end time isn't ahead of 'lastBeforeHere'
            if (ITFEnd >= lastBeforeHere) {
                // Remove another day for next iteration of loop
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, -1);
                continue;
            }
            // Check that the end time isn't before (or at) the RTF start
            if (ITFEnd <= RTFStart) {
                return null;
            }

            // Finalise the details of the last event instance
            var lastInstanceStart = ITFStart;//Math.max(RTFStart, ITFStart);
            var lastInstanceEnd = ITFEnd;//Math.min(RTFEnd, ITFEnd);
            return CreateSchedule(lastInstanceStart, lastInstanceEnd);
        }
    }
}

/**
  * Module: RaceEventScheduleUtilities.
  * Finds the next instance of the event according to the supplied 'schedule'.
  * The search begins from the time passed in 'fromHere'.
  * Note: It will NOT return the current active instance.
  */
function GetNextInstanceOfEvent(schedule, fromHere) {
    var specificDates = schedule.SpecificDates;
    var repeatingDates = schedule.RepeatingDates;

    if (specificDates.length > 0) {
        // Sort in ascending order of start dates
        specificDates = specificDates.sort(function(a, b) {
            return a.Start - b.Start;
        });

        // Iterate over the specific dates and find the first instance that is after 'fromHere'
        for (var i = 0; i < specificDates.length; ++i) {
            var specificDate = specificDates[i];
            if (specificDate.Start > fromHere) {
                return CreateSchedule(specificDate.Start, specificDate.End);
            }
        }

        return null;
    }
    else {
        // Only works with 1 repeating date for now...
        var repeatingDate = repeatingDates[0];
        // Repeating time frame data
        var RTF = repeatingDate.RepeatingTimeFrame;
        var RTFStart = RTF.Start;
        var RTFEnd = RTF.End;
        var repeatingDays = repeatingDate.RepeatingDays;
        // Event instance time frame data
        var timeFramePerDay = repeatingDate.TimeFramePerDay;
        var instanceTimeOfDayStart = timeFramePerDay.Start; // Minutes
        var instanceTimeOfDayEnd = timeFramePerDay.End; //Minutes
        var durationSeconds = (instanceTimeOfDayEnd - instanceTimeOfDayStart) * 60;
        // If we're always active then we follow a simpler flow
        var alwaysActive = repeatingDate.AlwaysActive;
        if (alwaysActive) {
            // GetAlwaysActiveScheduleData will return the current instance for 'fromHere'
            var currentRunningSchedule = GetAlwaysActiveScheduleData(fromHere, RTFStart, durationSeconds);
            // Get the next one after that, seems this function is suppose to not return the current running instance
            return GetAlwaysActiveScheduleData(currentRunningSchedule.EndDate, RTFStart, durationSeconds);
        }
        // If there are no days of the week then there is no first instance
        if (repeatingDays.length === 0) {
            return null;
        }

        var currentSearchTime = GetStartOfDayForUnixTimestamp(fromHere);
        while (true) {
            // Keep adding days until we find a day of the week that is a repeating day
            var currentSearchDoW = GetDayOfWeekForUnixTimestamp(currentSearchTime);
            if (!IsARepeatingDay(repeatingDays, currentSearchDoW)) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Reset currentSearchTime to start of the day
            currentSearchTime = GetStartOfDayForUnixTimestamp(currentSearchTime);
            // Check that we've not passed the RTF end
            if (currentSearchTime >= RTFEnd) {
                return null;
            }
            // Get the start time of the ITF
            var ITFStart = currentSearchTime + (instanceTimeOfDayStart * 60); // Seconds
            // Check that the start time isn't before 'fromHere'
            if (ITFStart < fromHere) {
                // Add another day for next iteration of loop
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Get the end time of the ITF
            var ITFEnd = ITFStart + durationSeconds;
            // Check that the instance isn't running as of 'fromHere'
            if (fromHere >= ITFStart && fromHere < ITFEnd) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Check that the end time is after the RTF start
            if (ITFEnd < RTFStart) {
                currentSearchTime = AddDaysToUnixTimestamp(currentSearchTime, 1);
                continue;
            }
            // Check again that this start time isn't passed the RTF end
            if (ITFStart >= RTFEnd) {
                return null;
            }
            // Finalise the details of the next event instance
            var nextInstanceStart = ITFStart;//Math.max(RTFStart, ITFStart);
            var nextInstanceEnd = ITFEnd;//Math.min(RTFEnd, ITFEnd);
            return CreateSchedule(nextInstanceStart, nextInstanceEnd);
        }
    }

    return null;
}

function IsARepeatingDay(repeatingDays, dayToCheck) {
    return (repeatingDays.indexOf(dayToCheck) !== -1);
}

function GetAlwaysActiveScheduleData(now, repeatingTimeFrameStart, durationSeconds) {
    var elapsedSeconds = now - repeatingTimeFrameStart;
    var currentIteration = Math.floor(elapsedSeconds / durationSeconds);
    var currentIterationStartDate = repeatingTimeFrameStart + (currentIteration * durationSeconds);
    var currentIterationEndDate = currentIterationStartDate + durationSeconds;

    return CreateSchedule(currentIterationStartDate, currentIterationEndDate);
}

function CreateSchedule(startDate, endDate) {
    schedule = {};
    schedule.StartDate = startDate;
    schedule.EndDate = endDate;

    return schedule;
}

function TutorialIsDone(playerId){
    return GetPlayerFTUEFlag("EventFeedEnabled", playerId);
}