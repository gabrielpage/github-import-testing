// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

function setPlayers(){
    
    var authRequest = new SparkRequests.AuthenticationRequest();
    var response = null;
    var leaderboardPlayers = [];
    var playerDetails = [
        {userName:"cloudUserName_1", password:"password", displayName:"cloudDisplayName_1"},
        {userName:"cloudUserName_2", password:"password", displayName:"cloudDisplayName_2"},
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

function issueChallenge(players){
    
    var createChallengeRequest = new SparkRequests.CreateChallengeRequest();
    createChallengeRequest.challengeShortCode = "CCC";
    createChallengeRequest.usersToChallenge = players[0].userId;
    createChallengeRequest.endTime = "2114-12-02T12:00Z";
    return Spark.sendRequestAs(createChallengeRequest, players[1].userId);
}

suite("Challenges basic tests", function(){
    
    test("getId, returns the challenge instance id", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getId(), is(challengeId));
    });
    
    test("getChallenge, with invalid id, Throws Illegal Argument Exception", function(){
        try{
            Spark.getChallenge("invalid_id");
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.IllegalArgumentException: invalid"));
        }
    });
    
    test("getChallenge, with null id, Throws Illegal Argument Exception", function(){
        try{
            Spark.getChallenge(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.IllegalArgumentException: invalid"));
        }
    });
    
    test("getShortCode, returns the challenge shortcode", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getShortCode(), is("CCC"));
    });
    
    test("getChallengedPlayerIds, returns the challenged player ids", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getChallengedPlayerIds(), contains(players[0].userId));
    });
    
    test("getAcceptedPlayerIds, returns the accepted player ids", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var acceptChallengeRequest = new SparkRequests.AcceptChallengeRequest();
        acceptChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(acceptChallengeRequest, players[0].userId);
        assertThat(challenge.getAcceptedPlayerIds(), contains(players[0].userId));
    });
    
    test("getDeclinedPlayerIds, returns the declined player ids", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var declineChallengeRequest = new SparkRequests.DeclineChallengeRequest();
        declineChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(declineChallengeRequest, players[0].userId);
        assertThat(challenge.getDeclinedPlayerIds(), contains(players[0].userId));
    });
    
    test("getChallengerId, returns the challenger id", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getChallengerId(), is(players[1].userId));
    });
    
    test("consumeTurn, returns true when the player consumes a turn", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var acceptChallengeRequest = new SparkRequests.AcceptChallengeRequest();
        acceptChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(acceptChallengeRequest, players[0].userId);
        
        var getChallengeRequest = new SparkRequests.GetChallengeRequest();
        getChallengeRequest.challengeInstanceId = challengeId;
        var getChallengeResponse = Spark.sendRequestAs(getChallengeRequest, players[0].userId);
        
        assertThat(challenge.consumeTurn(getChallengeResponse.challenge.nextPlayer), is(true));
    });
    
    test("drawChallenge, ends the game. Note: winChallegen is tested in state tests", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var acceptChallengeRequest = new SparkRequests.AcceptChallengeRequest();
        acceptChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(acceptChallengeRequest, players[0].userId);
        challenge.drawChallenge();
        assertThat(challenge.getRunState(), is("COMPLETE"));
    });
});

suite("Challenge State tests", function(){

    test("Challenge ISSUED state", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getRunState(), is("ISSUED"));
    });
     
    test("Challenge RUNNING state", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var acceptChallengeRequest = new SparkRequests.AcceptChallengeRequest();
        acceptChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(acceptChallengeRequest, players[0].userId);
        assertThat(challenge.getRunState(), is("RUNNING"));
    });
    
    test("Challenge DECLINED state", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var declineChallengeRequest = new SparkRequests.DeclineChallengeRequest();
        declineChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(declineChallengeRequest, players[0].userId);
        assertThat(challenge.getRunState(), is("DECLINED"));
    });
    
    test("Challenge WITHDRAWN state", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var withdrawChallengeRequest = new SparkRequests.WithdrawChallengeRequest();
        withdrawChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(withdrawChallengeRequest, players[1].userId);
        assertThat(challenge.getRunState(), is("WITHDRAWN"));
    });
    
    test("Challenge COMPLETE state", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        var acceptChallengeRequest = new SparkRequests.AcceptChallengeRequest();
        acceptChallengeRequest.challengeInstanceId = challengeId;
        Spark.sendRequestAs(acceptChallengeRequest, players[0].userId);
        challenge.winChallenge(Spark.loadPlayer(players[0].userId));
        assertThat(challenge.getRunState(), is("COMPLETE"));
    });
    
    test("Challenge state doesn't change when starting a challenge, where nobody accepted", function(){
        var players = setPlayers();
        var challengeId = issueChallenge(players).challengeInstanceId;
        var challenge = Spark.getChallenge(challengeId);
        assertThat(challenge.getRunState(), is("ISSUED"));
        challenge.startChallenge();
        assertThat(challenge.getRunState(), is("ISSUED"));
    });
});

suite("Challenge Private Data tests", function(){
    
    var players = setPlayers();
    var challengeId = issueChallenge(players).challengeInstanceId;
    var challenge = Spark.getChallenge(challengeId);
    
    test("getPrivateData returns null for non-existant name in a name/value pair", function(){
        assertThat(challenge.getPrivateData("invalid_name"), is(null));
    });
     
    test("getPrivateData returns null when a null is passed as name in a name/value pair", function(){
        assertThat(challenge.getPrivateData(null), is(null));
    });
     
    test("setPrivateData sets private data for the Player", function(){
        if(challenge.getPrivateData("test_data") != null) {
            challenge.removePrivateData("test_data");
            assertThat(challenge.getPrivateData("test_data"), is(null));
        }
        challenge.setPrivateData("test_data", "test_value");
        assertThat(challenge.getPrivateData("test_data"), is("test_value"));
    });
     
    test("setPrivateData with Scriptable value sets private data for the Player", function(){
        if(challenge.getPrivateData("test_data") != null) {
            challenge.removePrivateData("test_data");
            assertThat(challenge.getPrivateData("test_data"), is(null));
        }
        challenge.setPrivateData("test_data", ["test_value", "test_value2"]);
        assertThat(challenge.getPrivateData("test_data"), is(["test_value", "test_value2"]));
    });
     
    test("removePrivateData removes private data from the Player", function(){
        if(challenge.getPrivateData("test_data") == null) {
            challenge.setPrivateData("test_data", "test_value");
            assertThat(challenge.getPrivateData("test_data"), is("test_value"));
        }
        challenge.removePrivateData("test_data");
        assertThat(challenge.getPrivateData("test_data"), is(null));
    });
});

suite("Challenge Script Data tests", function(){
    
    var players = setPlayers();
    var challengeId = issueChallenge(players).challengeInstanceId;
    var challenge = Spark.getChallenge(challengeId);

    test("getScriptData returns null for non-existant name in a name/value pair", function(){
        assertThat(challenge.getScriptData("invalid_name"), is(null));
    });

    test("setScriptData sets script data for the Player", function(){
        if(challenge.getScriptData("test_data") != null) {
            challenge.removeScriptData("test_data");
            assertThat(challenge.getScriptData("test_data"), is(null));
        }
        challenge.setScriptData("test_data", "test_value");
        assertThat(challenge.getScriptData("test_data"), is("test_value"));
    });
     
    test("setScriptData with Scriptable value sets private data for the Player", function(){
        if(challenge.getScriptData("test_data") != null) {
            challenge.removeScriptData("test_data");
            assertThat(challenge.getScriptData("test_data"), is(null));
        }
        challenge.setScriptData("test_data", ["test_value", "test_value2"]);
        assertThat(challenge.getScriptData("test_data"), is(["test_value", "test_value2"]));
    });
     
    test("removeScriptData removes private data from the Player", function(){
        if(challenge.getScriptData("test_data") == null) {
            challenge.setScriptData("test_data", "test_value");
            assertThat(challenge.getScriptData("test_data"), is("test_value"));
        }
        challenge.removeScriptData("test_data");
        assertThat(challenge.getScriptData("test_data"), is(null));
    });
});