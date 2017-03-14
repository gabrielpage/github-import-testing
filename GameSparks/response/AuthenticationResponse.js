requireOnce("BlueprintUtilities");
requireOnce("CohortUtilities");
requireOnce("CollectionUtilities");
requireOnce("CurrencyExchangeUtilities");
requireOnce("CurrencyUtilities");
requireOnce("GeneralUtilities");
requireOnce("MOTDUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("RaceEventScheduleUtilities");
requireOnce("RaceEventUtilities");
requireOnce("RaceEventUtilities2");
requireOnce("RaceUtilities");
requireOnce("SkillConfigUtilities");
requireOnce("TimeUtilities");
requireOnce("ProfileFixupUtilities");
requireOnce("VersionedDocumentUtilities");
requireOnce("XPUtilities");

AuthenticationResponse();

function AuthenticationResponse() {
    var error = Spark.getData().error;

    if (error === null || error === undefined)
    {
        // assign a really old version if the game doesn't send one
        var version = "0.3.6";
        var platform = "Android";

        var data = Spark.getData().scriptData;
        if (data !== undefined && data !== null){
            if (data["VERSION"] !== undefined && data["VERSION"] !== null){
                version = data.VERSION;

                if (data.PLATFORM !== null && data.PLATFORM !== undefined) {
                    platform = data.PLATFORM;
                }

                if (!OnPreviewStack()) {
                    if (VersionIsKickbackToPreview(version)) {
                        var logAsWarning = true;

                        var message = FormatString("Version {0} is for kickback to preview as it's in the kickback list: [{1}]",
                            version,
                            GetKickbackVersions());

                        ErrorMessage(message, null, logAsWarning);
                        Spark.setScriptData("kickbackToPreview", true);
                        return;
                    }
                }

                var minVersion = GetMinimumVersion(platform);
                if (minVersion === null) {
                    // need to set this to get the client to display an error message rather than timing out
                    Spark.setScriptData("maximumVersion", "0.0.0");
                    return;
                }
                if (VersionIsOlder(version, minVersion)) {
                    var logAsWarning = true;
                    var message = FormatString("Version {0} is too old - minimum version for {1} is {2}",
                                               version, platform, minVersion);
                    ErrorMessage(message, null, logAsWarning);
                    Spark.setScriptData("minimumVersion", minVersion);
                    return;
                }

                var maxVersion = GetMaximumVersion(platform);
                if (maxVersion === null) {
                    // need to set this to get the client to display an error message rather than timing out
                    Spark.setScriptData("maximumVersion", "0.0.0");
                    return;
                }
                if (VersionIsOlder(maxVersion, version)) {
                    var message = FormatString("Version {0} is too new - maximum version for {1} is {2}",
                                               version, platform, maxVersion);
                    ErrorMessage(message, null, logAsWarning);
                    Spark.setScriptData("maximumVersion", maxVersion);
                    return;
                }
            }
        }

        if (version !== undefined){
            Spark.getPlayer().setSegmentValue("VERSION", version);
        }
        if (platform !== null && platform !== undefined) {
            Spark.getPlayer().setSegmentValue("PLATFORM", platform);
        }

        if (OnPreviewStack()) {
            if (data !== undefined && data !== null){
                var userName = Spark.getData().scriptData.userName;
                var isDevice = data["DEVICE"];
                if (!isDevice){
                    var collection = Spark.runtimeCollection("DEBUG_loggedIn");
                    collection.insert({"userName":userName});
                }
            }
        }

        var player = Spark.getPlayer();
        var playerId = player.getPlayerId();

        // ST: Disconnect any devices currently connected to this account (except this one).
        // A SessionTerminatedMessage will be sent to the socket, and the socket will be unauthenticated
        player.disconnect(true);

        // apply misc profile format changes e.g. old-style upgrades
        FixupOldDataInProfile(playerId);

        RemoveCompletedOrRenamedEventsFromProfile(playerId);

        // In the real world we won't remove cars, so don't need this ...
        // Update all cars in the player's private data to match up with the CarInventory
        UpdateAllCarsToMatchCarInventory(playerId);

        // Update Pro Pack Token structures
        // This isn't the type of thing we should be doing during the login. Really the rest of the code should
        // add the data when required, with a lack of information being taken as '0' packs.
        // LETS NOT ADD ANY MORE STUFF LIKE THIS
        UpdateProPackTokenStructure(playerId);

        // return extra information to the player
        AddSkillStatsToResponse(playerId, null);
        AddXPToResponse(playerId);
        AddBlueprintPercentageRequiredForPurchaseToResponse(playerId);

        // maybe there's a message of the day
        Spark.setScriptData("MOTD", MOTD());
        Spark.setScriptData("MOTDTitle", MOTDTitle());
        Spark.setScriptData("MOTDVersion", MOTDVersion());

        // there is a skillConfig
        Spark.setScriptData("skillConfig", GetSkillConfig());

        // remove the old perfect time stuff
        var versionedPerfectTime = GetVersionedPerfectTime(playerId);
        var successfullyWritten = false;
        while (!successfullyWritten) {
            versionedPerfectTime.GetData();
            successfullyWritten = versionedPerfectTime.DeleteData();
        }

        // update name censorship
        var lastTime = GetUnfilteredDisplayNameTime();
        var diff = GetNow() - lastTime;

        if (diff > (1000 * 60 * 60 * 24)) {
            ChangeDisplayName(GetUnfilteredDisplayName(), playerId);
        }

        const AILadderKillKey = "AILadderKill";

        var ladderKill = GetGameSettingEntry(AILadderKillKey);

        // only send data if we are going to kill to save bandwidth
        if (AILadderKillKey) {
            Spark.setScriptData(AILadderKillKey, ladderKill);
        }

        // Send back the current upgrade speed multipliers.
        var deliveryMultiplierData = GetDeliverySpeedMultiplierCollection(playerId).find({}, { "_id": 0 }).limit(4).toArray();
        Spark.setScriptData("DeliveryMultipliers", deliveryMultiplierData);

        // Extra extra
        var news = [
            "TEXT_NEWSTICKER_1",
            "TEXT_NEWSTICKER_2",
            "TEXT_NEWSTICKER_3",
            "TEXT_NEWSTICKER_4",
            "TEXT_NEWSTICKER_5",
            "TEXT_NEWSTICKER_6",
            "TEXT_NEWSTICKER_7",
            "TEXT_NEWSTICKER_8",
            "TEXT_NEWSTICKER_9",
            "TEXT_NEWSTICKER_10",
            "TEXT_NEWSTICKER_11"
        ];
        Spark.setScriptData("News", news);
        
        // Panic levers
        var panicLevers = Spark.getProperties().getProperty("Property_PanicLevers");
        if (panicLevers === null || panicLevers === undefined) {
            Spark.getLog().warn("The GameSettings (Shortcode: 'Property_PanicLevers') doesn't exist!");
        }
        else {
            Spark.setScriptData("PanicLevers", panicLevers);
        }

        AddBalancesToResponse(playerId);

        UpdateABTestSetup(playerId, Spark.getData().newPlayer);

        // keep last!!
        AddServerTimeToResponse();
    }
}

function RemoveCompletedOrRenamedEventsFromProfile(playerId) {
    var versionedEvents = GetVersionedEvents2(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var events = versionedEvents.GetData();

        for (var eventName in events) {
            var eventDatas = events[eventName];

            var allEventsDiscarded = true;

            for (var i = eventDatas.length - 1; i >= 0; --i) {
                var eventData = eventDatas[i];

                var challengeId = eventData.challengeId;
                if (challengeId === null || challengeId === undefined) {
                    // ok, use the preview id, if there is one
                    challengeId = eventData.previewChallengeId;

                    if (challengeId === null || challengeId === undefined) {
                        allEventsDiscarded = false;
                        continue;
                    }
                }

                var info = GetRaceEventScheduleWithChallengeId(challengeId, /*noErrorOnMissingChallenge*/true, playerId);
                if (info === null || info === undefined) {
                    Spark.getLog().error(FormatString("For event: {0} removed entry for eventData {1} as it's schedule is missing (rename?)",
                        eventName,
                        JSON.stringify(eventData)));

                    eventDatas.splice(i, 1);
                }
                else {
                    allEventsDiscarded = false;
                }
            }

            if (allEventsDiscarded) {
                Spark.getLog().error(FormatString("Removed list for event {0} as no entries!", eventName));
                delete events[eventName];
            }
        }
        successfullyWritten = versionedEvents.SetData(events);
    }
}