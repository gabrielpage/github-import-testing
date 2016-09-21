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
function setLeaderboardData(leaderboard){
    
    clearLeaderboard(leaderboard);
    
    var logEventRequest = new SparkRequests.LogEventRequest();
    var players = setPlayers();
    joinTeams(players);

    for(i in players){
        logEventRequest.eventKey = leaderboard;
        logEventRequest.SCORE = 100+(i*100);
        var resp = logEventRequest.SendAs(players[i].userId);
        var pott ="asd";
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


suite("Inverse social Leaderboards basic tests", function(){
    
    var leaderboardShortcode = "SCCL";
    var myPlayerId = setLeaderboardData(leaderboardShortcode)[0].userId;
    
    test("getInverseSocialLeaderboard, returns the Leaderboard when it exists", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard, is(not(null)));
    });

    test("getInverseSocialLeaderboardAs, with null leaderboard shortcode, Throws Null Pointer Exception", function(){
        clearLeaderboard(leaderboardShortcode);
        try{
        Spark.getLeaderboards().getInverseSocialLeaderboardAs(null, myPlayerId);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
        }
    });

    test("getShortCode, returns the shortCode for the leaderboard", function(){
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getShortCode(), is(leaderboardShortcode));
    });

    test("getEntryCount, returns 0 when no entries exist", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getEntryCount, returns the entries that exist", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboardAs(leaderboardShortcode, myPlayerId);
        assertThat(leaderboard.getEntryCount(), is(3));
    });
    
    test("getEntries hasNext, return false when no leaderboard Entries are presant", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries().hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries().hasNext(), is(true));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant, using count & offset", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant, using count & offset", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(true));
    });
    
    test("getEntries, with null count, Throws Method Not Found Error", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        try{
        leaderboard.getEntries(null, 0);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkSocialLeaderboard.getEntries(null,number)"));
        }
    });
    
    test("getEntries, with null offset, Throws Method Not Found Error", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        try{
        leaderboard.getEntries(10, null);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkSocialLeaderboard.getEntries(number,null)"));
        }
    });
    
    test("isPartitioned, returns false when the Leaderboard isn't partitioned", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.isPartitioned(), is(false));
    });
    
    test("isPartition, returns false when the Leaderboard isn't a partition of a parent leaderboard", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.isPartition(), is(false));
    });
    
    test("getPartitions, returns an empty array, when the leaderboard isn't partitioned", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getPartitions().length, is(0));
    });
    
    test("drop, with deleteRunningTotalData set to true, drops all data linked to the leaderboard", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getEntryCount(), is(3));
        leaderboard.drop(true);
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getScoreFields, returns the number of score fields defined in the leaderboard", function(){
        clearLeaderboard(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        assertThat(leaderboard.getScoreFields().length, is(not(0)));
    });
    
    test("getEntriesFromPlayer, returns the cursor over the leaderboard entries from the supplied playerId", function(){
        var playerId = setLeaderboardData(leaderboardShortcode).reverse()[2].userId;
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        
        var entry = leaderboard.getEntriesFromPlayer(playerId, 10).next();
        assertThat(entry.getAttribute("SCORE"), is(400));
        assertThat(entry.getRank(), is(2));
        assertThat(entry.getRankPercentage(), is(66));
        assertThat(entry.getUserName(), is("cloudDisplayName_4"));
        assertThat(entry.getWhen(), contains(getCurrentDate()));
    });
    
    test("deleteEntry, deletes an entry for a player in the leaderboard and running total", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        
        assertThat(leaderboard.getEntryCount(), is(3));
        
        var cursor = leaderboard.getEntries();
        var first = cursor.next();
        assertThat(first.getAttribute("SCORE"), is(500));
        assertThat(first.getRank(), is(1));
        assertThat(first.getRankPercentage(), is(33));
        assertThat(first.getUserName(), is("cloudDisplayName_5"));
        assertThat(first.getWhen(), contains(getCurrentDate()));
        var second = cursor.next();
        assertThat(second.getAttribute("SCORE"), is(400));
        assertThat(second.getRank(), is(2));
        assertThat(second.getRankPercentage(), is(66));
        assertThat(second.getUserName(), is("cloudDisplayName_4"));
        assertThat(second.getWhen(), contains(getCurrentDate()));
        var third = cursor.next();
        assertThat(third.getAttribute("SCORE"), is(100));
        assertThat(third.getRank(), is(3));
        assertThat(third.getRankPercentage(), is(100));
        assertThat(third.getUserName(), is("cloudDisplayName_1"));
        assertThat(third.getWhen(), contains(getCurrentDate()));
        
        leaderboard.deleteEntry(first.getUserId() , true);
        
        assertThat(leaderboard.getEntryCount(), is(2));
        var newCursor =leaderboard.getEntries();
        var newFirst = newCursor.next();
        assertThat(newFirst.getAttribute("SCORE"), is(400));
        assertThat(newFirst.getRank(), is(1));
        assertThat(newFirst.getRankPercentage(), is(50));
        assertThat(newFirst.getUserName(), is("cloudDisplayName_4"));
        assertThat(newFirst.getWhen(), contains(getCurrentDate()));
        var newSecond = newCursor.next();
        assertThat(newSecond.getAttribute("SCORE"), is(100));
        assertThat(newSecond.getRank(), is(2));
        assertThat(newSecond.getRankPercentage(), is(100));
        assertThat(newSecond.getUserName(), is("cloudDisplayName_1"));
        assertThat(newSecond.getWhen(), contains(getCurrentDate()));
        assertThat(cursor.next(), is(null));
    });
    
    test("deleteEntry, with null player id, doesn't delete any entries", function(){
        setLeaderboardData(leaderboardShortcode);
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        leaderboard.deleteEntry(null, true);
        assertThat(leaderboard.getEntryCount(), is(3));
    });
    
    test("deleteEntry, with null player id, Throws Mothod Not Found Error", function(){
        var players = setLeaderboardData(leaderboardShortcode).reverse();
        var leaderboard = Spark.getLeaderboards().getInverseSocialLeaderboard(leaderboardShortcode);
        try{
            leaderboard.deleteEntry(players[0].userId, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkLeaderboardImpl.deleteEntry(string,null)"));
        }
    });
});