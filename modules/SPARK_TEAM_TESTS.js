// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic Team tests", function(){
    
    var team = Spark.getConfig().getTeam("SOCIAL_SQUAD");
    
    test("getTeam does not return null with valid shortCode", function(){
        assertThat(team, is(not(null)));
    });
    
    test("getTeam returns null with invalid shortCode", function(){
        var invalidTeam = Spark.getConfig().getTeam("invalid_shortCode");
        assertThat(invalidTeam, is(null));
    });
    
    test("getTeam with null shortCode returns null", function(){
        var nullTeam = Spark.getConfig().getTeam(null);
        assertThat(nullTeam, is(null));
    });
    
    test("getShortCode, returns the shortCode of the team", function(){
        assertThat(team.getShortCode(), is("SOCIAL_SQUAD"));
    });
    
    test("getName, returns the name of the team", function(){
        assertThat(team.getName(), is("Social Squad"));
    });
    
    test("getSocial, returns true when team is social", function(){
        assertThat(team.getSocial(), is(true));
    });
    
    test("getExtendedSocial, returns true when team is getExtendedSocial", function(){
        assertThat(team.getExtendedSocial(), is(true));
    });
    
    test("getSocial, returns false when team isn't social", function(){
        assertThat(Spark.getConfig().getTeam("ST").getSocial(), is(false));
    });
    
    test("getExtendedSocial, returns false when team isn't getExtendedSocial", function(){
        assertThat(Spark.getConfig().getTeam("ST").getExtendedSocial(), is(false));
    });
    
    test("getMaxMembers, returns max members for the team", function(){
        assertThat(team.getMaxMembers(), is(1000));
    });
    
    test("getMaxMembershipPerUser, returns the max membership per user", function(){
        assertThat(team.getMaxMembershipPerUser(), is(1000));
    });
    
    test("getMaxOwnershipPerUser, returns the max ownership per user", function(){
        assertThat(team.getMaxOwnershipPerUser(), is(0));
    });
    
    test("getMaxOwnershipPerUser, returns -1 on mandatory ownership", function(){
        assertThat(Spark.getConfig().getTeam("MO").getMaxOwnershipPerUser(), is(-1));
    });
    
    test("getMaxOwnershipPerUser, returns 1 on singular ownership", function(){
        assertThat(Spark.getConfig().getTeam("1T").getMaxOwnershipPerUser(), is(1));
    });
    
    test("getMaxOwnershipPerUser, returns 2 on non-singular ownership", function(){
        assertThat(Spark.getConfig().getTeam("NST").getMaxOwnershipPerUser(), is(2));
    });
});