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
requireOnce("DebugSettingsUtilities");

UserMatchFoundMessage();

function UserMatchFoundMessage(){
    var data = Spark.getData();
    if (data.matchShortCode !== null && data.matchShortCode !== undefined){
        if (data.matchShortCode.indexOf("SlamMatching") > -1){
            SlamMatchmakingUser(data);
        }
    }

    function SlamMatchmakingUser(data){
        var settings = GetDebugSettings("Slam");
        if (settings === null || settings === undefined){
            return;
        }
        // Add the specific debug settings for this contender to their script data
        var data = Spark.getData();
        var player = Spark.getPlayer();
        var participants = data.participants;
        for (var i = 0; i < participants.length; ++i){
            if (participants[i].id === player.getPlayerId()){
                Spark.setScriptData("debugSettings", settings.ParticipantSettings[i]);
            }
        }
    }
}