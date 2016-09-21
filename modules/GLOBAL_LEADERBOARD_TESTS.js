// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

function clearLeaderboard(leaderboard){
    
    Spark.getLeaderboards().getLeaderboard(leaderboard).drop(true);
}

function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    return year+"-";
}

function setLeaderboardData(leaderboard){
    
    clearLeaderboard(leaderboard);
    
    var logEventRequest = new SparkRequests.LogEventRequest();
    var players = setPlayers();
    
    for(i in players){
        logEventRequest.eventKey = leaderboard;
        logEventRequest.SCORE = 100+(i*100);
        logEventRequest.SendAs(players[i].userId);
    }

    return players.reverse();
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

suite("Global Leaderboards basic tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getLeaderboard("CCL");
    
    test("getLeaderboard, returns the Leaderboard when it exists", function(){
        assertThat(leaderboard, is(not(null)));
    });

    test("getLeaderboard, returns null when a Leaderboard doesn't exist", function(){
        assertThat(Spark.getLeaderboards().getLeaderboard("invalid_shortcode"), is(null));
    });

    test("getShortCode, returns the shortCode for the leaderboard", function(){
        assertThat(leaderboard.getShortCode(), is("CCL"));
    });

    test("getEntryCount, returns 0 when no entries exist", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getEntryCount, returns the entries that exist", function(){
        setLeaderboardData("CCL");
        
        var c = leaderboard.getEntryCount();
        
        var x = "x";
        assertThat(leaderboard.getEntryCount(), is(6));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.getEntries().hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant", function(){
        setLeaderboardData("CCL");
        assertThat(leaderboard.getEntries().hasNext(), is(true));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant, using count & offset", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant, using count & offset", function(){
        setLeaderboardData("CCL");
        assertThat(leaderboard.getEntries(10, 0).hasNext(), is(true));
    });
    
    test("getEntries, with null count, Throws Method Not Found Error", function(){
        try{
        leaderboard.getEntries(null, 0);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkGlobalLeaderboard.getEntries(null,number)"));
        }
    });
    
    test("getEntries, with null offset, Throws Method Not Found Error", function(){
        try{
        leaderboard.getEntries(10, null);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkGlobalLeaderboard.getEntries(number,null)"));
        }
    });
    
    test("isPartitioned, returns false when the Leaderboard isn't partitioned", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.isPartitioned(), is(false));
    });
    
    test("isPartition, returns false when the Leaderboard isn't a partition of a parent leaderboard", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.isPartition(), is(false));
    });
    
    test("getPartitions, returns an empty array, when the leaderboard isn't partitioned", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.getPartitions().length, is(0));
    });
    
    test("drop, with deleteRunningTotalData set to true, drops all data linked to the leaderboard", function(){
        setLeaderboardData("CCL");
        assertThat(leaderboard.getEntryCount(), is(6));
        leaderboard.drop(true);
        assertThat(leaderboard.getEntryCount(), is(0));
    });
    
    test("getScoreFields, returns the number of score fields defined in the leaderboard", function(){
        clearLeaderboard("CCL");
        assertThat(leaderboard.getScoreFields().length, is(not(0)));
    });
    
    test("getEntriesFromPlayer, returns the cursor over the leaderboard entries from the supplied playerId", function(){
        var playerId = setLeaderboardData("CCL")[0].userId;
        
        var myData = leaderboard.getEntriesFromPlayer(playerId, 10).next();
        assertThat(myData.getAttribute("SCORE"), is(600));
        assertThat(myData.getRank(), is(1));
        assertThat(myData.getRankPercentage(), is(16));
        assertThat(myData.getUserId(), is(playerId));
        assertThat(myData.getUserName(), is("cloudDisplayName_6"));
        assertThat(myData.getWhen(), contains(getCurrentDate()));
    });
    
    test("deleteEntry, deletes an entry for a player in the leaderboard and running total", function(){
        var players = setLeaderboardData("CCL");
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
        setLeaderboardData("CCL");
        leaderboard.deleteEntry(null, true);
        assertThat(leaderboard.getEntryCount(), is(6));
    });
    
    test("deleteEntry, with null player id, Throws Mothod Not Found Error", function(){
        var players = setLeaderboardData("CCL");
        try{
        leaderboard.deleteEntry(players[0].userId, null);
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.leaderboard.impl.SparkLeaderboardImpl.deleteEntry(string,null)"));
        }
    });
});

suite("Global Leaderboards Cursor tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getLeaderboard("CCL");

    test("hasNext & next, returns true & returns next entry in a leaderboard", function(){
        setLeaderboardData("CCL");
        assertThat(leaderboard.getEntries().hasNext(), is(true));
        assertThat(leaderboard.getEntries().next(), is(not(null)));
    });
});

suite("Global Leaderboards Entry tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getLeaderboard("CCL");
    
    test("entry contains all of the required fields", function(){
        
        var players = setLeaderboardData("CCL");
        var entry = leaderboard.getEntries().next();
        var found = false;
        var playerName = entry.getUserName();
        var playerId = entry.getUserId();
        
        for(var i in players){
            if(players[i].userName === playerName && players[i].userId === playerId){
                found = true;
                break;
            }
        }
        
        assertThat(found, is(true));
        assertThat(entry.getRank(), is(1));
        assertThat(entry.getAttribute("SCORE"),is(600));
        assertThat(entry.getRankPercentage(), is(16));
        assertThat(entry.getWhen(), contains(getCurrentDate()));
    });
    
    test("getAttribute with null attribute, returns null", function(){
        setLeaderboardData("CCL");
        var entry = leaderboard.getEntries().next();
        assertThat(entry.getAttribute(null),is(null));
    });
});