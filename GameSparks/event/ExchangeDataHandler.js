// ====================================================================================================
//
// Cloud Code for ExchangeDataHandler, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var messageType = Spark.getData().messageType;
var targetID = Spark.getData().targetID;

switch (messageType)
{
    case "ExchangeData":
        {
            var senderID = Spark.getPlayer().getPlayerId();
            var exchangeData = Spark.getData().exchangeData;
            Spark.sendMessageByIdExt({"senderID": senderID, "exchangeData": exchangeData}, "ExchangeData", [targetID]);
        }
        break;
    case "ExchangeDataResponse":
        {
            var exchangeData = Spark.getData().exchangeData;
            Spark.sendMessageByIdExt({"exchangeData": exchangeData}, "ExchangeDataResponse", [targetID]);
        }
        break;
}