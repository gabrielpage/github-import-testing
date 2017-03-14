// ====================================================================================================
//
// Cloud Code for BankBoxHandler_v01003, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("GachaPrizeUtilities");

BankBoxHandler();

function BankBoxHandler()
{
    var messageType = Spark.getData().messageType;
    var boxType = Spark.getData().boxType;
    var quantity = Spark.getData().quantity;
    var player = Spark.getPlayer();
    switch(messageType)
    {
        case "openBox":
            var prize = OpenBankBox(player, boxType);
            if (prize != null)
                Spark.setScriptData("prize", prize);
            break;
        case "keyCount":
            break;
        case "addKey":
            GiveBankBoxKeys(player, boxType, quantity);
            break;
        case "hourlyBonus":
            CheckForHourlyBonus(player);
            break;
    }

    AddBankBoxKeysToResponse(player.getPlayerId());
}