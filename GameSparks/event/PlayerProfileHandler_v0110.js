requireOnce("PlayerDataUtilities");
requireOnce("CurrencyUtilities");
requireOnce("AchievementUtilties");
requireOnce("VersionedDocumentUtilities2");
requireOnce("XPUtilities");

PlayerProfileHandler_v0110();

function PlayerProfileHandler_v0110(){
    var messageType = Spark.getData().messageType;
    if (messageType === undefined || messageType === null){
        return;
    }
    var options = messageType.split("|");
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    for (var  i = 0; i < options.length; ++i){
        var option = options[i];
        switch (option){
            case "All":
                ActiveIndex(playerId);
                OwnerCarSlots(playerId);
                ReturnOwnedCarsInScriptData(playerId);
                FTUEFlags(playerId);
                AddBankBoxKeysToResponse(playerId);
                ProPacks(playerId);
                BlueprintPieces(playerId);
                FreeBets(playerId);
                SetSessionStateInResponse(playerId);
                AddLadderProgressToScriptData(playerId);
                SetEventGoalProgressDataInResponse(playerId);
                SetDisplayNameInResponse();
                AddAchievementsToResponse(playerId);
                AddLevelUpShownToResponse(playerId);
                break;
            case "ActiveCarIndex":
                ActiveIndex(playerId);
                break;
            case "OwnedCarSlots":
                OwnerCarSlots(playerId);
                break;
            case "OwnedCars":
                ReturnOwnedCarsInScriptData(playerId);
                break;
            case "FTUEFlags":
                FTUEFlags(playerId);
                break;
            case "BankBoxKeys":
                AddBankBoxKeysToResponse(playerId);
                break;
            case "ProPacks":
                ProPacks(playerId);
                break;
            case "BlueprintPieces":
                BlueprintPieces(playerId);
                break;
            case "FreeBets":
                FreeBets(playerId);
                break;
            case "SessionState":
                SetSessionStateInResponse(playerId);
                break;
            case "EventGoalProgressData":
                SetEventGoalProgressDataInResponse(playerId);
                break;
            case "LadderProgressData":
                AddLadderProgressToScriptData(playerId);
                break;
            case "DisplayName":
                SetDisplayNameInResponse();
                break;
            case "Balance":
                AddBalancesToResponse(playerId);
                break;
            case "PlayerLevel":
                var info = GetXPInfo(player);
                Spark.setScriptData("level", info.Level);
                Spark.setScriptData("xp", info.TotalXP);
                break;
            case "setActiveIndex":
                var indexStr = Spark.getData().params1;
                var index = parseInt(indexStr);
                if (index !== NaN){
                    var versionedProfile = MakeVersionedProfileDocument(playerId);

                    var successfullyWritten = false;
                    while (!successfullyWritten) {
                        SetPlayerActiveIndex(versionedProfile, playerId, index);

                        successfullyWritten = versionedProfile.Save();
                    }
                }
                break;
            case "getPlayerCar":
                var variantId = Spark.getData().params1;
                var carIdStr = Spark.getData().params2;
                var carId = parseInt(carIdStr);
                if (carId !== NaN){
                    var car = GetPlayerCar(variantId, carId, playerId);
                    if (car !== null){
                        Spark.setScriptData("playerCar", car);
                    }
                }
                break;
            case "deleteCarAtIndex":
                var indexStr = Spark.getData().params1;
                var index = parseInt(indexStr);
                if (index !== NaN){
                    DeletePlayerCarAtIndex(index, playerId);
                    // Send new list back, after deleting.
                    ReturnOwnedCarsInScriptData(playerId);
                }
                break;
            case "sellCarAtIndex":
                var indexStr = Spark.getData().params1;
                var index = parseInt(indexStr);
                if (index !== NaN){
                    SellPlayerCarAtIndex(index, playerId);
                    ActiveIndex(playerId);
                    ReturnOwnedCarsInScriptData(playerId);
                    AddBalancesToResponse(playerId);
                }
                break;
            case "setFTUEFlag":
                var flagName = Spark.getData().params1;
                SetPlayerFTUEFlag(flagName, playerId);
                FTUEFlags(playerId);
                break;
            case "unsetFTUEFlag":
                var flagName = Spark.getData().params1;
                UnsetPlayerFTUEFlag(flagName, playerId);
                FTUEFlags(playerId);
                break;
            case "nukeProfile":
                NukePlayerProfile();
                break;
            case "nukeProfileSkipFtue":
                NukePlayerProfile();
                player.credit1(1000);
                SetPlayerFTUEFlag("PlayedFirstRace", playerId);
                SetPlayerFTUEFlag("PlayedSecondRace", playerId);
                SetPlayerFTUEFlag("ChosenName", playerId);
                break;
            case "ChangeDisplayName":
                ChangeDisplayName(Spark.getData().params1, playerId);
                SetDisplayNameInResponse();
                break;
            case "Achievements":
                AddAchievementsToResponse(playerId);
                break;
            case "setLevelUpShown":
                var level = parseInt(Spark.getData().params1);
                if (carId !== NaN) {
                    SetPlayerLevelUpShown(playerId, level);
                }
                break;
            default:
                ErrorMessage("Unknown PlayerProfileHandler message type \"" + option + "\"");
                return;
        }
    }

    function SetDisplayNameInResponse() {
        var displayName = player.getDisplayName();
        var unfilteredDisplayName = GetUnfilteredDisplayName();

        Spark.setScriptData("displayName", displayName);
        Spark.setScriptData("unfilteredDisplayName", unfilteredDisplayName);
    }
}
