// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var connectedPlayers = 0;

RTSession.onPlayerConnect(function(player){

    connectedPlayers++;
    
//    if(connectedPlayers == 4){

        var myPlayer = RTSession.getPlayer(1);    
        
        //Send opcode 301 to everyone
        RTSession.newPacket()
            .setOpCode(301)
            .setReliable(true)
            .send()
        
        //Send opcode 302 to peer 3 and 4 only
        RTSession.newPacket()
            .setOpCode(302)
            .setSender(myPlayer.getPeerId())
            .setTargetPeers([3,4])
            .send();
        
 //   }

})