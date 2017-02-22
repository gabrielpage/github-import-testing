// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

RTSession.onPacket(420, function(myPacket){
   
    var myPlayerID = "570b6f09c0b49f04a48da4ff";
  
    RTSession.newRequest().createAccountDetailsRequest()
        .setPlayerId(myPlayerID)
        .send(function(accountDetailsResponse){
            
            RTSession.getLogger().info(JSON.stringify(accountDetailsResponse));
        
            RTSession.newPacket()
                .setOpCode(421)
                .setData(RTSession.newData())
                .setString(1, JSON.stringify(accountDetailsResponse))
                .send();
        });
        return true;
   });
   

RTSession.onPacket(422, function(myPacket){
   
   var myPlayerID = "570b6f09c0b49f04a48da4ff";
  
   RTSession.newRequest().createCreateChallengeRequest()
       .setPlayerId(myPlayerID)
       .setChallengeMessage("100_CHAL")
       .setEndTime("2016-04-13T12:30Z")
       .setExpiryTime("2016-04-13T12:10Z")
       .setStartTime("2016-04-13T12:20Z")
       .setUsersToChallenge(["570b6f11c0b49f04a48dbd78","570b6f17c0b49f04a48dd28b","570b6f1dc0b49f04a48ddffa"])
       .setChallengeShortCode("100_CHAL")
       .send(function(challengeResponse){
            
            RTSession.getLogger().info(JSON.stringify(challengeResponse));
            
            RTSession.newRequest().createAcceptChallengeRequest()
                .setChallengeInstanceId(challengeResponse.challengeInstanceId)
                .setPlayerId("570b6f11c0b49f04a48dbd78")
                .send(function(acceptChallengeResponse){
                    RTSession.getLogger().warn(JSON.stringify(acceptChallengeResponse));
            });
                
            RTSession.newRequest().createDeclineChallengeRequest()
                .setChallengeInstanceId(challengeResponse.challengeInstanceId)
                .setPlayerId("570b6f17c0b49f04a48dd28b")
                .send(function(declineChallengeResponse){
                    RTSession.getLogger().warn(JSON.stringify(declineChallengeResponse));
            });
            
        });
    
    return true;
    
});