// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
requireOnce("GeneralUtilities");

BulkJob_DisconnectIfWrongVersion();

function BulkJob_DisconnectIfWrongVersion() {
    var player = Spark.getPlayer();
    var playerId = player.getPlayerId();
    var displayName = player.getDisplayName();
    
    var clientVersion = player.getSegmentValue("VERSION");
    var platform = player.getSegmentValue("PLATFORM");
    if (clientVersion === null || clientVersion === undefined ||
        platform === null || platform === undefined) {
        
        Spark.getLog().error(FormatString("{0}: Version or Platform (or both) are null/undefined!", displayName));
        return;
    }

    var minVersion = (GetMinimumVersion(platform) === null) ? "0.0.0" : GetMinimumVersion(platform);
    if (VersionIsOlder(clientVersion, minVersion)) {
        Spark.setScriptData("minimumVersion", minVersion);
        player.disconnect(false);
        return;
    }
    
    var maxVersion = (GetMaximumVersion(platform) === null) ? "0.0.0" : GetMaximumVersion(platform);
    if (VersionIsOlder(maxVersion, clientVersion)) {
        Spark.setScriptData("maximumVersion", maxVersion);
        player.disconnect(false);
        return;
    }
}