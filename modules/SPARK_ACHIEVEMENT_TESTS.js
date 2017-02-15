// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic Achievement tests", function(){
    
    var achievement = Spark.getConfig().getAchievement("LOADS");
    
    test("getAchievment does not return null with valid shortCode", function(){
        assertThat(achievement, is(not(null)));
    });
    
    test("getAchievment returns null with invalid shortCode", function(){
        var invalidAchievement = Spark.getConfig().getAchievement("invalid_shortCode");
        assertThat(invalidAchievement, is(null));
    });
    
    test("getAchievment with null shortCode returns null", function(){
        var nullAchievement = Spark.getConfig().getAchievement(null);
        assertThat(nullAchievement, is(null));
    });
    
    test("getName, returns the name of the achievement", function(){
        assertThat(achievement.getName(), is("Loads of Money"));
    });
    
    test("getDescription, returns the description of the achievement", function(){
        assertThat(achievement.getDescription(), is("give the player 1000 of each currency"));
    });
    
    test("getShortcode, returns the shortCode of the achievement", function(){
        assertThat(achievement.getShortCode(), is("LOADS"));
    });
    
    test("getCurrency1Award, returns the currency 1 award of the achievement", function(){
        assertThat(achievement.getCurrency1Award(), is(1000));
    });
    
    test("getCurrency2Award, returns the currency 2 award of the achievement", function(){
        assertThat(achievement.getCurrency2Award(), is(1000));
    });
    
    test("getCurrency3Award, returns the currency 3 award of the achievement", function(){
        assertThat(achievement.getCurrency3Award(), is(1000));
    });
    
    test("getCurrency4Award, returns the currency 4 award of the achievement", function(){
        assertThat(achievement.getCurrency4Award(), is(1000));
    });
    
    test("getCurrency5Award, returns the currency 5 award of the achievement", function(){
        assertThat(achievement.getCurrency5Award(), is(1000));
    });
    
    test("getCurrency6Award, returns the currency 6 award of the achievement", function(){
        assertThat(achievement.getCurrency6Award(), is(1000));
    });
    
    test("getVirtualGoodAward, returns null when nothing is awarded", function(){
        assertThat(achievement.getVirtualGoodAward(), is(null));
    });
});