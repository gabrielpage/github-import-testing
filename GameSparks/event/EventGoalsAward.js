requireOnce("CurrencyUtilities");
requireOnce("EventPrizeUtilities");
requireOnce("GameStatsUtilities");
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");

// When you press "Collect" on the Goals screen, for example
EventGoalsAward();

function EventGoalsAward() {
    var now = Math.floor(GetNow() / 1000);

    var currentPlayer = Spark.getPlayer();
    var playerId = currentPlayer.getPlayerId();

    var prizes = Spark.getData().prizes;
    var eventName = Spark.getData().eventName;

    // Spark.getLog().info(FormatString("EventGoalsAward for event: {0}, json'ed prizes: {1}",
    //     eventName,
    //     JSON.stringify(prizes)));

    // GS JSON parameters can't be lists, so our list is packed into an object. Get it.
    // Oh yes they can!!!  So only unpack this if necessary (for older clients).
    if (!Array.isArray(prizes)) {
        prizes = prizes.prizes;
    }

    if (prizes === null || prizes === undefined) {
        ErrorMessage("No prizes list present in request");
        return;
    }

    var versionedProfile = MakeVersionedProfileDocument(playerId);
    var versionedEvents = GetVersionedEvents2FromProfile(versionedProfile);
    var playerEventData = versionedEvents.GetData();
    var currentPlayerRaceEvent = GetMostRecentEventData(playerEventData[eventName]);
    var challengeId = currentPlayerRaceEvent.challengeId;

    if (challengeId === null || challengeId === undefined) {
        ErrorMessage(FormatString("Event: {0} has a null challengeId!", eventName));
        return;
    }

    var prizesToAward;
    var prizeTypes;
    var versionedPrizes = GetVersionedEventPrizes(playerId);
    var successfullyWritten = false;
    while (!successfullyWritten) {
        var eventPrizes = versionedPrizes.GetData();

        prizesToAward = [];
        prizeTypes = {};

        for (var prizeToAwardIndex = 0; prizeToAwardIndex < prizes.length; ++prizeToAwardIndex) {
            var prizeToMatch = {
                AwardType : "EventGoal",
                EventName : eventName,
                ChallengeId : challengeId,
                PrizeBand : prizes[prizeToAwardIndex]
            };

            //LogMessage(FormatString("Trying to match: {0}", JSON.stringify(prizeToMatch)));

            if (eventPrizes.unawarded.length !== 0) {
                for (var i = eventPrizes.unawarded.length - 1; i >= 0; --i) {
                    var prizeToAward = eventPrizes.unawarded[i];
                    if (PrizesMatch(prizeToAward, prizeToMatch)) {
                        // Add timestamp of when it was awarded
                        prizeToAward.Time = now;

                        eventPrizes.archived.push(prizeToAward);

                        // LogMessage(FormatString("Adding prize for collection: {0} {1} {2} for {3} [{4}]",
                        //                         prizeToAward.AwardType,
                        //                         prizeToAward.PrizeBand.TargetPrizeValue,
                        //                         prizeToAward.PrizeBand.TargetPrizeType,
                        //                         prizeToAward.EventName,
                        //                         prizeToAward.ChallengeId));

                        prizesToAward.push(prizeToAward);

                        eventPrizes.unawarded.splice(i, 1);

                        if (prizeToAward.PrizeBand.Prizes !== null &&
                            prizeToAward.PrizeBand.Prizes !== undefined) {
                            for (var j = 0; j < prizeToAward.PrizeBand.Prizes.length; ++j) {
                                var prizeReward = prizeToAward.PrizeBand.Prizes[j];
                                prizeTypes[prizeReward.PrizeType] = true;
                            }
                        }
                        break;
                    }
                }
            }
        }

        successfullyWritten = versionedPrizes.SetData(eventPrizes);
    }

    AwardPrizes(playerId, prizesToAward);

    for (var key in prizeTypes) {
        if (prizeTypes.hasOwnProperty(key)) {
            switch (key){
                case "Cash":
                case "Gold":
                    AddBalancesToResponse(playerId);
                    break;

                case "XP":
                    // sent as messages
                    break;

                case "Car":
                    // err, need to send all of them
                    ReturnOwnedCarsInScriptData(playerId);
                    OwnerCarSlots(playerId);
                    break;

                case "BronzeKeys":
                case "SilverKeys":
                case "GoldKeys":
                    AddBankBoxKeysToResponse(playerId);
                    break;

                case "ProPack":
                    ProPacks(playerId);
                    break;

                case "Blueprint":
                    BlueprintPieces(playerId);
                    // err, need to send all of them, just in case
                    ReturnOwnedCarsInScriptData(playerId);
                    OwnerCarSlots(playerId);
                    break;

                default:
                    Spark.getLog().error(FormatString(
                        "Don't know what to return to the game to update the player profile when a prize of type: [{0}] is awarded",
                        key));
                    break;
            }
        }
    }

    if (prizesToAward.length !== prizes.length) {
        ErrorMessage(FormatString("Tried to award {0} prizes, but could only award {1}",
            prizes.length, prizesToAward.length));
        return;
    }

    AddLifetimeWinningsToResponse(playerId);
}
