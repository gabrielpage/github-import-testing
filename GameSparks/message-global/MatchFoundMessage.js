// ====================================================================================================
//
// Cloud Code for MatchFoundMessage, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("RaceEventUtilities");
requireOnce("SlamUtilities");

GlobalMatchFoundMessage();

function GlobalMatchFoundMessage(){
    var data = Spark.getData();
    if (data.matchShortCode !== null && data.matchShortCode !== undefined){
        if (data.matchShortCode.indexOf("SlamMatching") > -1){
            SlamMatchmakingGlobal(data);
        }
    }

    function SlamMatchmakingGlobal(data){
        //Spark.getLog().debug("MatchFoundMessage started");
        var participants = data.participants;
        if (participants.length % 2 !== 0){
            // Odd number of participants
            ErrorMessage(FormatString("There are {0} participants in the slam, but there should be an even number", participants.length));
            return;
        }
        var shortCode = data.matchShortCode;
        var split = shortCode.split("_");
        if (split.length !== 3){
            ErrorMessage("Split length is not equal to 3");
            return;
        }
        var eventName = split[1]; // [0] = SlamMatching, [1] = eventName, [2] = version
        if (eventName === null || eventName === undefined){
            ErrorMessage("No \"eventName\" data sent to the server for slam matchmaking");
            return;
        }
        var event = GetRaceEventDataFromMetaCollection(eventName, true, participants[0].id);
        if (event === null || event === undefined){
            ErrorMessage(FormatString("Couldn't find \"{0}\" event in meta collection", eventName));
            return;
        }
        var expectedSize = event.PartitionSize;
        if (expectedSize !== participants.length){
            ErrorMessage(FormatString("{0} participants, but we're expecting {1} for slam matchmaking", participants.length, expectedSize));
            return;
        }

        Spark.getLog().error("**** NEW SLAM ****");

        var slamData = CreateInitialSlamData(participants, eventName, event.PartitionSize, slamData);
        var slamId = slamData._id.$oid;
        for (var i = 0; i < participants.length; ++i){
            var versionedCurrentSlamId = GetVersionedCurrentSlamId(participants[i].id);

            var successfullyWritten = false;
            while (!successfullyWritten) {
                versionedCurrentSlamId.GetData();
                successfullyWritten = versionedCurrentSlamId.SetData(slamId);
            }
        }

        Spark.setScriptData("slamData", slamData);
        Spark.setScriptData("slamId", slamId);
    }
}