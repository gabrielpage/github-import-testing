// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

// Registers or Authenticates players and returns an Array of displayNames and userIds
function setPlayers(){
    
    var authRequest = new SparkRequests.AuthenticationRequest();
    var response = null;
    var teamPlayers = [];
    var playerDetails = [
        {userName:"teamUserName_1", password:"password", displayName:"teamDisplayName_1"},
        {userName:"teamUserName_2", password:"password", displayName:"teamDisplayName_2"},
        {userName:"teamUserName_3", password:"password", displayName:"teamDisplayName_3"},
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
    
        teamPlayers.push({userName:response.displayName, userId:response.userId});
    }

    return teamPlayers;
}

function createTeam(ownerId){
    var createTeamRequest = new SparkRequests.CreateTeamRequest();
    createTeamRequest.teamId = "cloud_code_team_id";
    createTeamRequest.teamName = "cloud_code_team_name";
    createTeamRequest.teamType = "CCT";
    Spark.sendRequestAs(createTeamRequest, ownerId);
}

suite("Teams basic tests", function(){
    
    var players = setPlayers();
    var ownerId = players[0].userId;
    createTeam(ownerId);
    var team = Spark.getTeams().getTeam("cloud_code_team_id");
    
    test("getTeam is not null", function(){
        assertThat(team, is(not(null)));
    });
    
    test("getTeam, with null teamId returns null", function(){
        var nullTeam = Spark.getTeams().getTeam(null);
        assertThat(nullTeam, is(null));
    });
    
    test("getTeam, with invalid teamId returns null", function(){
        var nullTeam = Spark.getTeams().getTeam("invalid_teamId");
        assertThat(nullTeam, is(null));
    });
    
    test("getOwnerId returns the id of the owner", function(){
        assertThat(team.getOwnerId(), is(ownerId));
    });
    
    test("getTeamByOwnerIdAndTeamType is not null ", function(){
        var ownerTeam = Spark.getTeams().getTeamByOwnerIdAndTeamType(ownerId, "CCT");
        assertThat(ownerTeam.length, is(1));
        assertThat(ownerTeam[0].getOwnerId(), is(ownerId));
    });
    
    test("getTeamId returns the id of the team", function(){
        assertThat(team.getTeamId(), is("cloud_code_team_id"));
    });
    
    test("getTeamType returns the type of the team", function(){
        assertThat(team.getTeamType(), is("CCT"));
    });
    
    test("getMemberIds returns the Ids of the players in this team", function(){
        assertThat(team.getMemberIds(), contains(ownerId));
    });
    
    test("addMembers, adds more members to the team", function(){
        team.addMembers(players[1].userId, players[2].userId);
        assertThat(team.getMemberIds().length, is(3));
    });

    test("addMembers, with null id does nothing", function(){
        team.addMembers(null);
        assertThat(team.getMemberIds().length, is(3));
    });
    
    test("removeMembers, remove members from the team", function(){
        team.removeMembers(players[2].userId);
        assertThat(team.getMemberIds().length, is(2));
    });
    
    test("removeMembers, with null id does nothing", function(){
        team.removeMembers(null);
        assertThat(team.getMemberIds().length, is(2));
    });
    
    test("listChatMessages, lists the chat messages for the team", function(){
        
        var sendTeamChatMessageRequest = new SparkRequests.SendTeamChatMessageRequest();
        sendTeamChatMessageRequest.message = "Team Message Test!";
        sendTeamChatMessageRequest.ownerId = ownerId;
        sendTeamChatMessageRequest.teamId = team.getTeamId();
        sendTeamChatMessageRequest.teamType = team.getTeamType();
        var res = Spark.sendRequestAs(sendTeamChatMessageRequest, ownerId);
        Spark.getLog().debug(res);
        var myMessages = team.listChatMessages(50, 0);
        assertThat(myMessages.length, is(not(0)));
    });
    
    test("setOwnerId, sets new team owner", function(){
        team.setOwnerId(players[1].userId);
        assertThat(team.getOwnerId(), is(players[1].userId));
    });
    
    test("setOwnerId, with null id doesn't change owner", function(){
        team.setOwnerId(null);
        assertThat(team.getOwnerId(), is(players[1].userId));
    });
    
    test("drop, drops the team", function(){
        team.drop();
        assertThat(Spark.getTeams().getTeam("cloud_code_team_id"), is(null));
    });
});