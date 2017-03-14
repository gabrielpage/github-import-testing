// ====================================================================================================
//
// Cloud Code for FTUEInitialisePlayerSkill, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("PlayerDataUtilities");
requireOnce("GeneralUtilities");
requireOnce("MathUtilities");
requireOnce("RaceUtilities");
requireOnce("VersionedDocumentUtilities");

FTUEInitialisePlayerSkill();

function FTUEInitialisePlayerSkill() {
    var initialSkillText = Spark.getData().initialSkill;

    var initialSkill = ParseStringToFloat(initialSkillText);

    if (initialSkill === null || initialSkillText === undefined) {
        ErrorMessage(FormatString("Could not parse skill of {0}", initialSkillText));
        return;
    }

    if (initialSkill < 1.0 || initialSkill > GetWorstSkill()) {
        ErrorMessage(FormatString("InitialSkill is outside of the acceptable range {0}", initialSkill));
        return;
    }

    var playerId = Spark.getPlayer().getPlayerId();

    if (GetPlayerFTUEFlag("PlayedSecondRace", playerId)) {
        ErrorMessage("Trying to set initialSkill on the server, but you have already completed the first opponent race");
        return;
    }

    var versionedStats = GetVersionedPlayerStats(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var stats = versionedStats.GetData();

        stats.skill = initialSkill;
        stats.trackSkills = {};

        // LogMessage(FormatString("Setting skill to {0}", stats.skill));

        successfullyWritten = versionedStats.SetData(stats);
    }

    AddSkillStatsToResponse(playerId);
}