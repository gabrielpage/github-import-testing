// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic Property tests", function(){
    
    var properties = Spark.getProperties();
    
    test("getProperties, returns the properties for the game", function(){
        
        assertThat(properties, is(not(null)));
    });
    
    test("getProperty, returns a property set for the game", function(){
        var property = properties.getProperty("CC_PROP");
        
        assertThat(property["StrKey"], is("StrVal"));
        assertThat(property["NumKey"], is(1));
        assertThat(property["BoolKey"], is(true));
        
        assertThat(property["ObjectKey"]["ObjectStr"], is("StrVal"));
        assertThat(property["ObjectKey"]["ObjectNum"], is(1));
        assertThat(property["ObjectKey"]["ObjectBool"], is(true));
        assertThat(typeof property["ObjectKey"]["ObjectObject"], is("object"));
        assertThat(property["ObjectKey"]["ObjectArray"].length, is(0));
        
        assertThat(property["ArrayKey"][0], is("StrVal"));
        assertThat(property["ArrayKey"][1], is(1));
        assertThat(property["ArrayKey"][2], is(true));
        assertThat(typeof property["ArrayKey"][3], is("object"));
        assertThat(property["ArrayKey"][4].length, is(0));
    });
    
    test("getProperty, with invalid shortCode, returns null", function(){
        
        assertThat(properties.getProperty("invalid_shortcode"), is(null));
    });
    
    test("getProperty, with null shortCode, returns null", function(){
        
        assertThat(properties.getProperty(null), is(null));
    });
});

suite("Basic Property Set tests", function(){
    
    var properties = Spark.getProperties();

    test("getPropertySet, returns the Property Set that's set for the game", function(){
        
        assertThat(properties.getPropertySet("CC_PROP_SET")["CCP"]["StrKey"], is("StrVal"));
    });
    
    test("getPropertySet, with invalid shortCode, returns null", function(){
        
        assertThat(properties.getPropertySet("invalid_shortcode"), is(null));
    });
    
    test("getPropertySet, with null shortCode, returns null", function(){
        
        assertThat(properties.getPropertySet(null), is(null));
    });
});

suite("Basic Leaderboard, Virtual Good & Achievement Property Set tests", function(){
    
    var propertySet = Spark.getProperties().getPropertySet("CC_PROP_SET");
    
    test("Leaderboard getPropertySet, returns property set for the leaderboard", function(){
        assertThat(Spark.getLeaderboards().getLeaderboard("CC_PROP_LD").getPropertySet(), is(propertySet));
    });
    
    test("Virtual Good getPropertySet, returns property set for the leaderboard", function(){
        assertThat(Spark.getConfig().getVirtualGood("CC_PROP_VG").getPropertySet(), is(propertySet));
    });
    
    test("Achievement getPropertySet, returns property set for the leaderboard", function(){
        assertThat(Spark.getConfig().getAchievement("CC_PROP_ACH").getPropertySet(), is(propertySet));
    });
});