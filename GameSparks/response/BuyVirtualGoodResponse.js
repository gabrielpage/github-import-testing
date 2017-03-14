// ====================================================================================================
// Cloud Code for BuyVirtualGoodResponse. Here, we handle purchases of non-currency VGoods, such as
// key packs.	
// ====================================================================================================
require("GeneralUtilities");
require("GachaPrizeUtilities");

BuyVirtualGoodResponse();

function BuyVirtualGoodResponse() {
    var player = Spark.getPlayer();
    var boughtItems = Spark.getData().boughtItems;
    
    if (boughtItems === null || boughtItems === undefined) {
        Spark.getLog().warn(FormatString("Player {0} (DN: {1}) tried to purchase a VGood, but boughtItems was empty in BuyVirtualGoodResponse. This is very likely a dirty hacker!",
            player.getPlayerId(), player.getDisplayName()));
    }
    else {
        for (var i = 0; i < boughtItems.length; i++) {
            var item = boughtItems[i];
            
            switch (item.shortCode) {
                // Crediting bank box keys adds the player's key counts to the response automatically.
                case "SilverKeyPack1": {
                    GiveBankBoxKeys(player, "Silver", 5);
                    break;
                }
                case "SilverKeyPack2": {
                    GiveBankBoxKeys(player, "Silver", 25);
                    break;
                }
                case "GoldKeyPack1": {
                    GiveBankBoxKeys(player, "Gold", 5);
                    break;
                }
                case "GoldKeyPack2": {
                    GiveBankBoxKeys(player, "Gold", 25);
                    break;
                }
                case "GoldPack1":
                case "GoldPack2":
                case "GoldPack3":
                case "GoldPack4":
                case "GoldPack5": {
                    // Gold purchases are already handled internally. This just prevents logging the error in the default case.
                    break;
                }
                default: {
                    Spark.getLog().error(FormatString("Player {0} (DN: {1}) purchased a '{2}' VGood, but it was unhandled in BuyVirtualGoodResponse!!",
                        player.getPlayerId(), player.getDisplayName(), item.shortCode));
                    break;
                }
            }
        }
    }
}