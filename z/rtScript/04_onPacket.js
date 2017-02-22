// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var fourResponse = false;
var fourResponseTimeout = "";
var turnCounts = [];

var intervalCount = 0;

RTSession.onPacket(401, function(myPacket){
     
     RTSession.setTimeout(function(){
        RTSession.newPacket().setOpCode(1401).setTargetPeers(myPacket.getSender().getPeerId()).send();
     }, 1000);
     
     return false;
     
});

RTSession.onPacket(402, function(myPacket){
    
    RTSession.newPacket()
        .setOpCode(1402)
        .setData(
            RTSession.newData()
                .setData(12, myPacket.getData().getData(2))
                .setDouble(11, myPacket.getData().getDouble(1))
                .setFloat(13, myPacket.getData().getFloat(3))
                .setFloatArray(14, myPacket.getData().getFloatArray(4))
                .setNumber(16, myPacket.getData().getNumber(6))
                .setString(15, myPacket.getData().getString(5))
        )
        .send();
});

 RTSession.onPacket(412, function(myPacket){
    RTSession.getLogger().debug(myPacket.getData().getData(1).getData(1).getDouble(1));
    return false;
});

 RTSession.onPacket(413, function(myPacket){
    var myInterval = RTSession.setInterval(function(){
       
       intervalCount++;
       
       if(intervalCount > 5){
           RTSession.getLogger().info("The interval count is now " + intervalCount + " and interval " + myInterval + " was cleared");
           RTSession.clearInterval(myInterval)
       } else {
           RTSession.getLogger().info("The interval count is now " + intervalCount + " and interval " + myInterval + " was executed");
       }
       
    }, 500);
    
    RTSession.getLogger().info("The interval was created " + myInterval);
    
    return false;
    
});


RTSession.onPacket(414, function(myPacket){
   
     turnCounts[myPacket.getSender().getPeerId()] = 1;
   
      RTSession
        .newRequest()
        .createLogEventRequest()
        .setEventKey("TEST")
        .setPlayerId(myPacket.getSender().getPlayerId())
        .send(function(myResponse){
            RTSession.getLogger().debug(JSON.stringify(myResponse));
            RTSession.newPacket()
                .setOpCode(1414)
                .setTargetPeers(myPacket.getSender().getPeerId())
                .setData(RTSession.newData().setString(1, JSON.stringify(myResponse)))
                .send();
      });
   
   return false;
    
});