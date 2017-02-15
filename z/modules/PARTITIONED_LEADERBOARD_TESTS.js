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
    
    Spark.getLeaderboards().getLeaderboard(leaderboard).drop(true);
    var partitions = Spark.getLeaderboards().getLeaderboard(leaderboard).getPartitions();
    if(partitions.length > 0){
        for(i in partitions){
            partitions[i].drop(true);
        }
    }
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
    
    var playerScores = [
        {userName:"cloudDisplayName_1", score:100, country:"UK"},
        {userName:"cloudDisplayName_2", score:200, country:"UK"},
        {userName:"cloudDisplayName_3", score:300, country:"UK"},
        {userName:"cloudDisplayName_4", score:400, country:"US"},
        {userName:"cloudDisplayName_5", score:500, country:"US"},
        {userName:"cloudDisplayName_6", score:600, country:"US"},
    ];
    
    for(i in playerScores){
        
        logEventRequest.eventKey = leaderboard;
        
        if(players[i].userName == playerScores[i].userName){
            logEventRequest.SCORE = playerScores[i].score;
            logEventRequest.COUNTRY = playerScores[i].country;
            logEventRequest.SendAs(players[i].userId);
        }
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

suite("Partitioned Leaderboards basic tests", function(){
    
    var leaderboard = Spark.getLeaderboards().getLeaderboard("CCPL");
    var UKleaderboard = Spark.getLeaderboards().getLeaderboard("CCPL.COUNTRY.UK");
    var USleaderboard = Spark.getLeaderboards().getLeaderboard("CCPL.COUNTRY.US");
    
    test("getLeaderboard, returns the Leaderboard when it exists", function(){
        assertThat(leaderboard, is(not(null)));
    });

    test("getLeaderboard, returns null when a Leaderboard doesn't exist", function(){
        assertThat(Spark.getLeaderboards().getLeaderboard("invalid_shortcode"), is(null));
    });

    test("getShortCode, returns the shortCode for the leaderboard", function(){
        assertThat(leaderboard.getShortCode(), is("CCPL"));
    });

    test("getEntryCount, returns 0 when no entries exist", function(){
        clearLeaderboard("CCPL");
        assertThat(UKleaderboard.getEntryCount(), is(0));
        assertThat(USleaderboard.getEntryCount(), is(0));
    });
    
    test("getEntryCount, returns the entries that exist", function(){
        setLeaderboardData("CCPL");
        assertThat(UKleaderboard.getEntryCount(), is(3));
        assertThat(USleaderboard.getEntryCount(), is(3));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant", function(){
        clearLeaderboard("CCPL");
        assertThat(UKleaderboard.getEntries().hasNext(), is(false));
        assertThat(USleaderboard.getEntries().hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant", function(){
        setLeaderboardData("CCPL");
        assertThat(UKleaderboard.getEntries().hasNext(), is(true));
        assertThat(USleaderboard.getEntries().hasNext(), is(true));
    });
    
    test("getEntries, return false when no leaderboard Entries are presant, using count & offset", function(){
        clearLeaderboard("CCPL");
        assertThat(UKleaderboard.getEntries(10, 0).hasNext(), is(false));
        assertThat(USleaderboard.getEntries(10, 0).hasNext(), is(false));
    });
    
    test("getEntries, return true when leaderboard Entries are presant, using count & offset", function(){
        setLeaderboardData("CCPL");
        assertThat(UKleaderboard.getEntries(10, 0).hasNext(), is(true));
        assertThat(USleaderboard.getEntries(10, 0).hasNext(), is(true));
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
    
    test("isPartitioned, returns true when the Leaderboard is partitioned", function(){
        setLeaderboardData("CCPL");
        assertThat(leaderboard.isPartitioned(), is(true));
    });
    
    test("isPartition, returns false when the Leaderboard isn't a partition of a parent leaderboard", function(){
        clearLeaderboard("CCPL");
        assertThat(leaderboard.isPartition(), is(false));
    });
    
    test("getPartitions, returns an empty array, when the leaderboard isn't partitioned", function(){
        clearLeaderboard("CCPL");
        assertThat(leaderboard.getPartitions().length, is(0));
    });
});

suite("Partitioned Leaderboards Partitions tests", function(){
    
    var leaderboardShortcode = "CCPL";
    var players = setLeaderboardData(leaderboardShortcode);
    var leaderboard = Spark.getLeaderboards().getLeaderboard(leaderboardShortcode);
    
    test("test Leaderboard Partitions", function(){
        var partitions = leaderboard.getPartitions();
        assertThat(partitions.length, is(2));
        
        // UK partition
        assertThat(partitions[0].getShortCode(), is("CCPL.COUNTRY.UK"));
        assertThat(partitions[0].getEntries().hasNext(), is(true));
        var entry = partitions[0].getEntries().next();
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
        assertThat(entry.getAttribute("SCORE"),is(300));
        assertThat(entry.getRankPercentage(), is(33));
        assertThat(entry.getWhen(), contains(getCurrentDate()));
        
        // US partition
        assertThat(partitions[1].getShortCode(), is("CCPL.COUNTRY.US"));
        assertThat(partitions[1].getEntries().hasNext(), is(true));
        entry = partitions[1].getEntries().next();
        found = false;
        playerName = entry.getUserName();
        playerId = entry.getUserId();
        
        for(var i in players){
            if(players[i].userName === playerName && players[i].userId === playerId){
                found = true;
                break;
            }
        }
        
        assertThat(found, is(true));
        assertThat(entry.getRank(), is(1));
        assertThat(entry.getAttribute("SCORE"),is(600));
        assertThat(entry.getRankPercentage(), is(33));
        assertThat(entry.getWhen(), contains(getCurrentDate()));
    });
});