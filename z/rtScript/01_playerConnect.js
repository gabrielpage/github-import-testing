var d = new Date;
var myFirstSessionId = RTSession.getSessionId();

RTSession.onPlayerConnect(function(myPlayer){
    //should fail because the global is set out of scope of the session?
    RTSession.getLogger().debug("some logging data sent on " + d + " including session ID "+ myFirstSessionId);
    
    var myPlayerID = myPlayer.getPlayerId();
    
    RTSession.newPacket()
        .setOpCode(123)
        .setData(RTSession.newData().setString(1, "Player " + myPlayerID + " connected."))
        .setSender(0)
        .setReliable(true)
        .send();

});
// an empty session of the same onPlayerConnect method would overwrite the previous.
// RTSession.onPlayerConnect(function(player){
// });