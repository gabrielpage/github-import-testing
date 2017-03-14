// ====================================================================================================
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("SessionUtilities");

SessionStatusUpdateRequest();

function SessionStatusUpdateRequest() {
    var playerId = Spark.getPlayer().getPlayerId();

    AddPlayerSessionState(playerId,
        Spark.getData().carVariant,
        Spark.getData().carVariantDiscriminator,
        Spark.getData().eventName,
        Spark.getData().sessionData);
}
