// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================


// make sure global value is not used.
var myDouble = 666.666;
//myFloat is not defined
var myFloatArray = [1.123, 2.234, 3.345];

RTSession.onPlayerConnect(function(myPlayer){

    RTSession.newPacket()
        .setOpCode(202)
        .setData(RTSession.newData().setDouble(1, myDouble = 4.97542 / 2))
        .send();

    RTSession.newPacket()
        .setOpCode(203)
        //myFloat is not declared.  What will happen here?  
        .setData(RTSession.newData().setFloat(1, myFloat = 3.141 / 2))
        .send();
        
    RTSession.newPacket()
        .setOpCode(204)
        .setData(RTSession.newData().setFloatArray(1, myFloatArray))
        .send();
        
    RTSession.newPacket()
        .setOpCode(205)
        .setData(RTSession.newData().setNumber(2, 96))
        .send();
    
    // RTSession.newPacket()
    //     .setOpCode(206)
    //     .setData(RTSession.newData().setString(0, "!@£$%^&*()-=_+[]{};':|,./<>/?§±`~"))
    //     .send();
        
    
    //test to see the overwriting of the first and second line.
    RTSession.newPacket()
        .setOpCode(207)
        .setData(RTSession.newData().setString(1, "This is the FIRST line."))
        .setData(RTSession.newData().setString(1, "This is the SECOND line."))
        .setData(RTSession.newData().setString(1, "This is the THIRD line."))
        .send();
        
    //test to see the overwriting of the first and second line.
    RTSession.newPacket()
        .setOpCode(208)
        .setData(RTSession.newData().setData(1,
            RTSession.newData()
                .setString(2, "!@£$%^&*()-=_+[]{};':|,./<>/?§±`~")))
        .send();
        
    RTSession.newPacket()
        .setOpCode(209)
        .setData(RTSession.newData().setString(1, "??????????"))
        .send();
        
    //failing test. Only RTDataBuilder type can be used.    
     RTSession.newPacket()
        .setOpCode(210)
        .setData(RTSession.getPlayer(3))
        .send();
        
});