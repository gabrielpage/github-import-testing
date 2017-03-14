// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce ("GameStatsUtilities");

function AchievementCarPurchased(playerId, carIndex) {
    SetAchievementComplete(playerId, "SweetRide");

    var allPlayerCars = GetAllPlayerCars(playerId);
    //LogMessage("Class = " + allPlayerCars[carIndex].Item.ModelData.Class);
    if (allPlayerCars[carIndex].Item.ModelData.Class == "B") {
        SetAchievementComplete(playerId, "WelcomeToClassB");
    }
}

function AchievementBottomUpGoal(playerId) {
    if (GetLifetimeBottomUpGoals(playerId) >= 3) {
        SetAchievementComplete(playerId, "PromisingRookie");
    }
}

function AchievementTopDownGoal(playerId) {

}

function AchievementCornerData(playerId, totalCorners, perfectCorners) {
    if (perfectCorners == totalCorners) {
        SetAchievementComplete(playerId, "DriftMaster");
    }
}

function AchievementWonRace(playerId) {
    if (GetPlayerFTUEFlag("ChosenCar", playerId)) {
        SetAchievementComplete(playerId, "PointsOnTheBoard");
    }
}

function GetVersionedAchievements(playerId) {
    return MakeVersionedProfile(playerId, "achievements", {});
}


function GetAchievements(playerId) {
    var data = GetVersionedAchievements(playerId).GetData();

    if (data.completed === undefined)
    {
        data.completed = {};
    }

    return data;
}

function SetAchievementComplete(playerId, achievement) {
    var versionedAchievements = GetVersionedAchievements(playerId);

    // Early out if we already have the achievement.
    var data = versionedAchievements.GetData();
    if (data.completed === undefined) {
        data.completed = {};
    }
    if (data.completed[achievement] !== undefined) return;

    var successfullyWritten = false;
    while (!successfullyWritten) {
        data = versionedAchievements.GetData();

        if (data.completed === undefined) {
            data.completed = {};
        }

        data.completed[achievement] = true;
        successfullyWritten = versionedAchievements.SetData(data);
    }
}

function AddAchievementsToResponse(playerId) {
    Spark.setScriptData("achievements", GetAchievements(playerId).completed);
}