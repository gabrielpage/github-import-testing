// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceEventUtilities2");
requireOnce("TimeUtilities");
requireOnce("VersionedDocumentUtilities");

BulkJob_CullArchivedPrizes();

function BulkJob_CullArchivedPrizes() {
    var playerId = Spark.getPlayer().getPlayerId();
    var displayName = Spark.getPlayer().getDisplayName();

    var now = Math.floor(GetNow() / 1000);
    var weekDuration = 60 * 60 * 24 * 7;
    var successfullyWritten = false;
    var versionedPrizes = GetVersionedEventPrizes(playerId);
    var eventsThatHaveHadPrizesAwarded;
    var count;
    while (!successfullyWritten) {
        count = 0;
        eventsThatHaveHadPrizesAwarded = {};
        var eventPrizes = versionedPrizes.GetData();
        var archivedPrizes = eventPrizes.archived;

        for (var i = archivedPrizes.length - 1; i >= 0; --i) {
            var prize = archivedPrizes[i];
            var ts = prize.Time;
            if (now - ts >= weekDuration) {
                eventsThatHaveHadPrizesAwarded[prize.ChallengeId] = true;
                archivedPrizes.splice(i, 1);
                ++count;
            }
        }

        successfullyWritten = versionedPrizes.SetData(eventPrizes);
    }

    // handle if events are in the old format
    successfullyWritten = false;
    var versionedEvents = GetVersionedEvents_(playerId);
    while (!successfullyWritten) {
        var playerEvents = versionedEvents.GetData();

        if (playerEvents !== null && playerEvents !== undefined) {
            for (var key in playerEvents) {
                var event = playerEvents[key];
                var eventChallengeId = event.challengeId;
                if (eventChallengeId === null || eventChallengeId === undefined) {
                    continue;
                }
                if (eventsThatHaveHadPrizesAwarded[eventChallengeId]) {
                    event.topDownPrizesAddedToUnawarded = true;
                }
            }
        }

        successfullyWritten = versionedEvents.SetData(playerEvents);
    }

    // handle if events are in the new format
    successfullyWritten = false;
    var versionedEvents = GetVersionedEvents2(playerId);
    while (!successfullyWritten) {
        var playerEvents = versionedEvents.GetData();

        for (var key in playerEvents) {
            var eventDatas = playerEvents[key];

            for (var i = eventDatas.length - 1; i >= 0; --i) {
                var event = eventDatas[i];
                var eventChallengeId = event.challengeId;
                if (eventChallengeId === null || eventChallengeId === undefined) {
                    continue;
                }
                if (eventsThatHaveHadPrizesAwarded[eventChallengeId]) {
                    event.topDownPrizesAddedToUnawarded = true;
                }
            }
        }

        successfullyWritten = versionedEvents.SetData(playerEvents);
    }

    Spark.getLog().info(FormatString("{0} [{1}] - culled {2} archived prizes", displayName, playerId, count));
}

function GetVersionedEventPrizes(playerId) {
    return MakeVersionedPrizeProfile(playerId, "eventPrizes", {
        unawarded : [],
        archived : []
    });
}

// local copy of old function to access old "events" in the profile
function GetVersionedEvents_(playerId) {
    return MakeVersionedProfile(playerId, "events");
}
