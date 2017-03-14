// ====================================================================================================
//
// Cloud Code for GetCarName_v0100, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("CollectionUtilities");

GetCarName_v0100();

function GetCarName_v0100()
{
    var variantID = Spark.getData().variantID;
    var playerId = Spark.getPlayer().getPlayerId();
    var carCursor = GetCarInventoryCollection(playerId).find({ "CarVariantID": variantID });
    if (carCursor.count() == 1)
    {
        var carArray = carCursor.toArray(); // Cuz carCursor.curr just returns null for some reason...
        var carInventoryItem = carArray[0];
        var fullName = carInventoryItem.Manufacturer + " " + carInventoryItem.LongName;
        Spark.setScriptData("carName", fullName);
    }
    else
    {
        ErrorMessage(FormatString("ARG; the CarVariantID \"{0}\" wasn't found in the car database!", variantID));
        return;
    }
}