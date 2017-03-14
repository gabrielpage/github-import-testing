// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("RaceEventUtilities");
requireOnce("GeneralUtilities");
requireOnce("VersionedDocumentUtilities2");

// Module: RaceEventUtilities2.
// This function accesses the legacy event data. It should only be used by the fixup code which move relevant old
// format data in the profile to the new format
function GetVersionedEventsFromProfile_(versionedProfile) {
    return versionedProfile.GetVersionedKey("events", null);
}

function MoveEventsToEvents2(versionedProfile, fixups) {
    if (fixups.hasMovedEventsToEvents2) {
        return false;
    }

    var versionedOldEvents = GetVersionedEventsFromProfile_(versionedProfile);

    var oldEvents = versionedOldEvents.GetData();

    if (oldEvents !== null && oldEvents !== undefined) {
        // do this direct so we know whether it already exists, rather than trying to tell if we get an empty object back
        var versionedNewEvents = versionedProfile.GetVersionedKey("events2", null);

        var newEvents = versionedNewEvents.GetData();

        if (newEvents) {
            // should not happen!
            Spark.getLog().error(FormatString("Moving events -> events2, but we already have events2. Wtf?!"));
        }
        else {
            newEvents = {};

            for (var key in oldEvents) {
                if (oldEvents.hasOwnProperty(key)) {
                    var eventData = oldEvents[key];

                    newEvents[key] = [eventData];
                }
            }

            versionedNewEvents.SetData(newEvents);
        }

        // empty the old events list now we have moved everything over
        // BulkJob_CullArchivedPrizes() will do stuff twice otherwise
        versionedOldEvents.SetData(null);
    }

    fixups.hasMovedEventsToEvents2 = true;

    // need to write back at least the fixup flag
    return true;
}


