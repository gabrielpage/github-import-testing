// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

require("ASSERT");

// Clears leaderboard
function clearLeaderboard(leaderboard){
    Spark.getLeaderboards().getLeaderboard(leaderboard).drop();
    Spark.getLeaderboards().getLeaderboard(leaderboard).drop(true);
}

// Retrieves Current Date
function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    return year+"-";
}

// Clears and Sets leaderboard scores and returns an Array of displayNames and userIds
function setTeamLeaderboardData(leaderboard){
    
    clearLeaderboard(leaderboard);
    
    var logEventRequest = new SparkRequests.LogEventRequest();
    var players = setPlayers();
    joinTeams(players);

    for(i in players){
        logEventRequest.eventKey = leaderboard;
        logEventRequest.SCORE = 100+(i*100);
        var resp = logEventRequest.SendAs(players[i].userId);
        // TODO: validate the response was a success and blow up if not
    }
    return players;
}

// Registers or Authenticates players and returns an Array of displayNames and userIds
function setPlayers(){
    
    var authRequest = new SparkRequests.AuthenticationRequest();
    var response = null;
    var leaderboardPlayers = [];
    var playerDetails = [
        {userName:"cloudUserName_1", password:"password", displayName:"cloudDisplayName_1"},
        {userName:"cloudUserName_2", password:"password", displayName:"cloudDisplayName_2"},
        {userName:"cloudUserName_3", password:"password", displayName:"cloudDisplayName_3"},
        {userName:"cloudUserName_4", password:"password", displayName:"cloudDisplayName_4"},
        {userName:"cloudUserName_5", password:"password", displayName:"cloudDisplayName_5"},
        {userName:"cloudUserName_6", password:"password", displayName:"cloudDisplayName_6"},
    ];
    
    for(i in playerDetails){
        
        authRequest.userName = playerDetails[i].userName;
        authRequest.password = playerDetails[i].password;
        response = Spark.sendRequest(authRequest);
        
        if(response.error != null){
            
            var regRequest = new SparkRequests.RegistrationRequest();
            
            regRequest.userName = playerDetails[i].userName;
            regRequest.password = playerDetails[i].password;
            regRequest.displayName = playerDetails[i].displayName;
            response = Spark.sendRequest(regRequest);
        }
    
        leaderboardPlayers.push({userName:response.displayName, userId:response.userId});
    }

    return leaderboardPlayers;
}

// joins the teams with the players
function joinTeams(players){

    var dropTeamRequest = new SparkRequests.DropTeamRequest();
    var createTeamRequest = new SparkRequests.CreateTeamRequest();
    var joinTeamRequest = new SparkRequests.JoinTeamRequest();
    var teams = [
        {teamId:"10001", teamName:"cloud_team_1", teamType:"SOCIAL_SQUAD"},
        {teamId:"10002", teamName:"cloud_team_2", teamType:"SQUAD"},
        {teamId:"10003", teamName:"cloud_team_3", teamType:"SOCIAL_SQUAD"}];

    for(i in players){
        //The first player drops and creates the teams, becoming the Owner of the teams
        if(i == 0){
            // And there are 3 teams
            for(t in teams){
                
                dropTeamRequest.teamId = teams[t].teamId;
                Spark.sendRequestAs(dropTeamRequest, players[i].userId);
            
                createTeamRequest.teamId = teams[t].teamId;
                createTeamRequest.teamName = teams[t].teamName;
                createTeamRequest.teamType = teams[t].teamType;
                Spark.sendRequestAs(createTeamRequest, players[i].userId);
            }
        // player 2 and 3 join the first team
        } else if(i > 0 && i <= 2){
            
            joinTeamRequest.teamId = teams[0].teamId;
            Spark.sendRequestAs(joinTeamRequest, players[i].userId);
        // player 4 and 5 join the second team
        } else if(i > 2 && i <= 4){
            
            joinTeamRequest.teamId = teams[1].teamId;
            Spark.sendRequestAs(joinTeamRequest, players[i].userId);
        // finally player 5 joins the third team
        } else if(i == 5){
            
            joinTeamRequest.teamId = teams[2].teamId;
            Spark.sendRequestAs(joinTeamRequest, players[i].userId);
        }
    }
}

suite("Team Leaderboards basic tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getTeamLeaderboard("CCL", "10001","10002","10003");
    var leaderboardShortcode = "CCL";
    
    test("getLeaderboard, returns the Leaderboard when it exists", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard, is(not(null)));
    });

    test("getLeaderboard, returns null when a Leaderboard doesn't exist", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(Spark.getLeaderboards().getTeamLeaderboard("invalid_shortcode", "10001","10002","10003"), is(null));
    });
    
    test("getLeaderboard, returns an empty leaderboard, when teamIds are not valid", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(Spark.getLeaderboards().getTeamLeaderboard(leaderboardShortcode, "invalid_teamId").getEntryCount(), is(0));
    });
    
    test("getLeaderboard with null leaderboard, Throws Null Pointer Exception", function(){
        clearLeaderboard(leaderboardShortcode);
        try{
        Spark.getLeaderboards().getTeamLeaderboard(null, "10001","10002","10003");
        fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
        }
    });
    
    test("getLeaderboard with null teamIds", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(Spark.getLeaderboards().getTeamLeaderboard(leaderboardShortcode, null).getEntryCount(), is(0));
        
    });

    test("getShortCode, returns the shortCode for the leaderboard", function(){
        assertThat(leaderboard.getShortCode(), is(leaderboardShortcode));
    });

    test("getEntryCount, returns 0 when no entries exist", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getEntryCount, returns the entries that exist", function(){
        setTeamLeaderboardData(leaderboardShortcode);
        assertThat(leaderboard.getEntryCount(), is(6));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries().hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant", function(){
        setTeamLeaderboardData(leaderboardShortcode);
        assertThat(leaderboard.getEntries().hasNext(), is(true));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant, using count & offset", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant, using count & offset", function(){
        setTeamLeaderboardData(leaderboardShortcode);
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(true));
    });
    
    test("getEntries, with null count, Throws Method Not Found Error", function(){
        clearLeaderboard(leaderboardShortcode);
        try{
        leaderboard.getEntries(null, 0);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkSocialLeaderboard.getEntries(null,number)"));
        }
    });
    
    test("getEntries, with null offset, Throws Method Not Found Error", function(){
        clearLeaderboard(leaderboardShortcode);
        try{
        leaderboard.getEntries(10, null);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkSocialLeaderboard.getEntries(number,null)"));
        }
    });
    
    test("isPartitioned, returns false when the Leaderboard isn't partitioned", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.isPartitioned(), is(false));
    });
    
    test("isPartition, returns false when the Leaderboard isn't a partition of a parent leaderboard", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.isPartition(), is(false));
    });
    
    test("getPartitions, returns an empty array, when the leaderboard isn't partitioned", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getPartitions().length, is(0));
    });
    
    test("drop, with deleteRunningTotalData set to true, drops all data linked to the leaderboard", function(){
        setTeamLeaderboardData(leaderboardShortcode);
        assertThat(leaderboard.getEntryCount(), is(6));
        leaderboard.drop(true);
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getScoreFields, returns the number of score fields defined in the leaderboard", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getScoreFields().length, is(not(0)));
    });
    
    test("getEntriesFromPlayer, returns the cursor over the leaderboard entries from the supplied playerId", function(){
        var playerId = setTeamLeaderboardData(leaderboardShortcode).reverse()[0].userId;
        
        var myData = leaderboard.getEntriesFromPlayer(playerId, 10).next();
        assertThat(myData.getAttribute("SCORE"), is(600));
        assertThat(myData.getRank(), is(1));
        assertThat(myData.getRankPercentage(), is(16));
        assertThat(myData.getUserId(), is(playerId));
        assertThat(myData.getUserName(), is("cloudDisplayName_6"));
        assertThat(myData.getWhen(), contains(getCurrentDate()));
    });
    
    test("deleteEntry, deletes an entry for a player in the leaderboard and running total", function(){
        var players = setTeamLeaderboardData(leaderboardShortcode).reverse();
        var playerId = players[1].userId;
        leaderboard.deleteEntry(players[0].userId, true);
        
        var myData = leaderboard.getEntriesFromPlayer(playerId, 10).next();
        assertThat(myData.getAttribute("SCORE"), is(500));
        assertThat(myData.getRank(), is(1));
        assertThat(myData.getRankPercentage(), is(20));
        assertThat(myData.getUserId(), is(playerId));
        assertThat(myData.getUserName(), is("cloudDisplayName_5"));
        assertThat(myData.getWhen(), contains(getCurrentDate()));
    });
    
    test("deleteEntry, with null player id, doesn't delete any entries", function(){
        setTeamLeaderboardData(leaderboardShortcode);
        leaderboard.deleteEntry(null, true);
        assertThat(leaderboard.getEntryCount(), is(6));
    });
    
    test("deleteEntry, with null player id, Throws Mothod Not Found Error", function(){
        var players = setTeamLeaderboardData(leaderboardShortcode).reverse();
        try{
        leaderboard.deleteEntry(players[0].userId, null);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkLeaderboardImpl.deleteEntry(string,null)"));
        }
    });
    
    test("listLeaderboards, lists leaderboards configured for the game", function(){
        clearLeaderboard(leaderboardShortcode);
        assertThat(Spark.getLeaderboards().listLeaderboards(), is(not(null)));
    });
    
    test("getTeamLeaderboardAs, returns a leaderboard containing the player and the players in the given teams", function(){
        var players = setTeamLeaderboardData(leaderboardShortcode);
        // player 6
        var myPlayerId = players[players.length-1].userId;
        // and players 1,4,5
        var myLeaderboard = Spark.getLeaderboards().getTeamLeaderboardAs("CCL", myPlayerId, "10002");
        assertThat(myLeaderboard.getEntryCount(), is(4));
    });
});

suite("Team Leaderboards Entry tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getTeamLeaderboard("CCL", "10001","10002","10003");
    var leaderboardShortcode = "CCL";
    
    test("Test Leaderboard Entry returns the correct data", function(){
        
        var players = setTeamLeaderboardData(leaderboardShortcode).reverse();
        var entry = leaderboard.getEntries().next();
        var playerFound = false;
        var playerName = entry.getUserName();
        var playerId = entry.getUserId();
        
        for(var i in players){
            if(players[i].userName === playerName && players[i].userId === playerId){
                playerFound = true;
                break;
            }
        }
        
        assertThat(playerFound, is(true));
        assertThat(entry.getRank(), is(1));
        assertThat(entry.getAttribute("SCORE"),is(600));
        assertThat(entry.getRankPercentage(), is(16));
        assertThat(entry.getWhen(), contains(getCurrentDate()));
    });
    
    test("getAttribute with null attribute, returns null", function(){
        
        setTeamLeaderboardData(leaderboardShortcode);
        var entry = leaderboard.getEntries().next();
        assertThat(entry.getAttribute(null),is(null));
    });
});

suite("Team Leaderboards union/intersection/difference tests", function(){
    
    var leaderboardShortcode = "CCL";
    var players = setTeamLeaderboardData(leaderboardShortcode);
    var leaderboard1 = Spark.getLeaderboards().getTeamLeaderboard("CCL", "10001");
    var leaderboard2 = Spark.getLeaderboards().getTeamLeaderboard("CCL", "10002");
    var leaderboard3 = Spark.getLeaderboards().getTeamLeaderboard("CCL", "10003");
    // need to log in with cloudUserName_1 to get consistent tests
    var authenticationRequest = new SparkRequests.AuthenticationRequest();
    authenticationRequest.userName = "cloudUserName_1";
    authenticationRequest.password = "password";
    Spark.sendRequest(authenticationRequest);
    
    test("JSON Test of Arrays", function(){
        
        var union = Spark.getLeaderboards().union(leaderboard1, leaderboard2).union(leaderboard3).evaluate();
        assertThat(union.length, is(6));
        
        for(var i = 0; i<union.length; i++){
            assertThat(union.indexOf(players[i].userId), is(not(-1)));
        }
    });
    
    test("test union with null lhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().union(null, leaderboard2);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test union with null rhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().union(leaderboard1, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test union with null rhs leaderboard on operations, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().union(leaderboard1, leaderboard2).union(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });

    test("test intersection of three leaderboards returns One entry", function(){
        
        var intersection = Spark.getLeaderboards().intersection(leaderboard1, leaderboard2).intersection(leaderboard3).evaluate();
        assertThat(intersection.length, is(1));
        assertThat(intersection.indexOf(players[0].userId), is(not(-1)));
    });
    
    test("test intersection with null lhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().intersection(null, leaderboard2);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test intersection with null rhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().intersection(leaderboard1, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test intersection with null rhs leaderboard on operations, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().intersection(leaderboard1, leaderboard2).intersection(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    // needs reviewing
    test("test difference of three leaderboards Two entries", function(){
        
        var difference = Spark.getLeaderboards().difference(leaderboard1, leaderboard2).difference(leaderboard3).evaluate();
        assertThat(difference.length, is(2));
    });
    
    test("test difference with null lhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().difference(null, leaderboard2);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test difference with null rhs leaderboard, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().difference(leaderboard1, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
    
    test("test difference with null rhs leaderboard on operations, Throws Ambiguity Error", function(){
        
        try{
            Spark.getLeaderboards().difference(leaderboard1, leaderboard2).difference(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("is ambiguous; candidate methods are:"));
        }
    });
});