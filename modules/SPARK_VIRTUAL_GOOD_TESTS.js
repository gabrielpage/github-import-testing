// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic Virtual Goods tests", function(){
    
    var virtualGood = Spark.getConfig().getVirtualGood("CCVG");
    
    test("getVirtualGood does not return null with valid shortCode", function(){
        assertThat(virtualGood, is(not(null)));
    });
    
    test("getName, gets the name of the virtual good", function(){
        assertThat(virtualGood.getName(), is("Cloud Code Virtual Good"));
    });
    
    test("getDescription, gets the description of the virtual good", function(){
        assertThat(virtualGood.getDescription(), is("Virtual Good used in Cloud Code Testing"));
    });
    
    test("getCurrency1Cost, gets the cost of the currency 1", function(){
        assertThat(virtualGood.getCurrency1Cost(), is(1));
    });
    
    test("getCurrency2Cost, gets the cost of the currency 2", function(){
        assertThat(virtualGood.getCurrency2Cost(), is(2));
    });
    
    test("getCurrency3Cost, gets the cost of the currency 3", function(){
        assertThat(virtualGood.getCurrency3Cost(), is(3));
    });
    
    test("getCurrency4Cost, gets the cost of the currency 4", function(){
        assertThat(virtualGood.getCurrency4Cost(), is(4));
    });
    
    test("getCurrency5Cost, gets the cost of the currency 5", function(){
        assertThat(virtualGood.getCurrency5Cost(), is(5));
    });
    
    test("getCurrency6Cost, gets the cost of the currency 6", function(){
        assertThat(virtualGood.getCurrency6Cost(), is(null));
    });
    
    test("getShortCode, gets the shortCode of the virtual good", function(){
        assertThat(virtualGood.getShortCode(), is("CCVG"));
    });
    
    test("getGooglePlayProductId, gets the Google Play product ID of the virtual good", function(){
        assertThat(virtualGood.getGooglePlayProductId(), is("2"));
    });
    
    test("getIosAppStoreProductId, gets the IOS App Store product ID of the virtual good", function(){
        assertThat(virtualGood.getIosAppStoreProductId(), is("1"));
    });
    
    test("getWP8StoreProductId, gets the WP8 Store product ID of the virtual good", function(){
        assertThat(virtualGood.getWP8StoreProductId(), is("3"));
    });
    
    test("getW8StoreProductId, gets the W8 Store product ID of the virtual good", function(){
        assertThat(virtualGood.getW8StoreProductId(), is("4"));
    });
    
    test("getAmazonProductId, gets the Amazon product ID of the virtual good", function(){
        assertThat(virtualGood.getAmazonStoreProductId(), is(null));
    });

    test("getType, gets the type of the virtual good", function(){
        assertThat(virtualGood.getType(), is("CURRENCY"));
    });
    
    test("getTags, gets the tags of the virtual good", function(){
        assertThat(virtualGood.getTags()[0], is("Cloud Tag"));
    });
    
    test("getMaxQuantity, gets the Max Qty of the virtual good", function(){
        assertThat(virtualGood.getMaxQuantity(), is(10));
    });
});