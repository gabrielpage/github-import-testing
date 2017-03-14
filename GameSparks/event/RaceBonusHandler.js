// ====================================================================================================
//
// Cloud Code for RaceBonusHandler, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("XPUtilities");
requireOnce("RaceUtilities");
requireOnce("CollectionUtilities");

RaceBonusHandler();

function RaceBonusHandler()
{
    var messageType = Spark.getData().messageType;
    var playerId = Spark.getPlayer().getPlayerId();

    switch(messageType) {
        case "getRaceBonusesAtLevel":
            var betDataCollection = GetBetDataCollection(playerId).find();
            var bonusDataList = [];

            while (betDataCollection.hasNext()){
                var betData = betDataCollection.next();
                var betAmount = betData.BetAmount;
                bonusData = {"BetAmount": betAmount, "RaceBonus": 0};
                bonusData.RaceBonus = CalculateRaceBonus(Spark.getPlayer().getPlayerId(), betAmount);
                bonusDataList.push(bonusData);
            }

            Spark.setScriptData("bonusData", bonusDataList);
            break;
    }
}