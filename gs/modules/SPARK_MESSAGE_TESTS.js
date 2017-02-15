require("ASSERT");

suite("Basic Spark Message tests", function(){
    
    var message = Spark.message("SMT");
    
    test("Spark.message with valid shortCode returns the message", function(){
        
        assertThat(message, is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with invalid shortCode", function(){
        
        var invalidMessage = Spark.message("invalid_shortCode");
        assertThat(invalidMessage, is(not(null)));
        invalidMessage.setPlayerIds(Spark.getPlayer().getPlayerId());
        invalidMessage.send();
    });

    test("Spark.message with null shortCode", function(){
        
        var nullMessage = Spark.message(null);
        assertThat(nullMessage, is(not(null)));
        nullMessage.setPlayerIds(Spark.getPlayer().getPlayerId());
        nullMessage.send();
    });
    
    test("Spark.message with valid setDeviceTypes", function(){
        
        assertThat(message.setDeviceTypes("IOS"), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with invalid setDeviceTypes", function(){
        
        assertThat(message.setDeviceTypes("invalid_device"), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setDeviceTypes", function(){
        assertThat(message.setDeviceTypes(null), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with valid setExpireAfterHours", function(){
        
        assertThat(message.setExpireAfterHours(1), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with negative setExpireAfterHours", function(){
        
        assertThat(message.setExpireAfterHours(-1), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with invalid setExpireAfterHours", function(){
        
        assertThat(message.setDeviceTypes("invalid_hours"), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setExpireAfterHours", function(){
        
        assertThat(message.setDeviceTypes(null), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with true setIncludeInPushCount", function(){
        
        assertThat(message.setIncludeInPushCount(true), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with false setIncludeInPushCount", function(){
        
        assertThat(message.setIncludeInPushCount(false), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setIncludeInPushCount, throws MethodNotFound Exception", function(){
        
        try{
            message.setIncludeInPushCount(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.messages.impl.SparkMessageImpl.setIncludeInPushCount(null)."));
        }
    });
    
    test("Spark.message with valid setMessageData", function(){
        
        assertThat(message.setMessageData({"someData" : "someData"}), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with invalid setMessageDat, throws ClassCast Exception", function(){
        try{
            message.setMessageData("invalid");
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.ClassCastException: java.lang.String cannot be cast to com.mongodb.DBObject"));
        }
    });
    
    test("Spark.message with null setMessageData", function(){
        
        assertThat(message.setMessageData(null), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with invalid setPlayerIds", function(){
        
        assertThat(message.setPlayerIds("invalid_ID"), is(not(null)));
        message.send();
    });
    
    test("Spark.message with null setPlayerIds", function(){
        
        assertThat(message.setPlayerIds(null), is(not(null)));
        message.send();
    });
    
    test("Spark.message with true setSendAsPush", function(){
        
        assertThat(message.setSendAsPush(true), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with false setSendAsPush", function(){
        
        assertThat(message.setSendAsPush(false), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setSendAsPush, throws MethodNotFound Exception", function(){
        
        try{
            message.setSendAsPush(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.messages.impl.SparkMessageImpl.setSendAsPush(null)."));
        }
    });
    
    test("Spark.message with true setSendViaSocket", function(){
        
        assertThat(message.setSendViaSocket(true), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with false setSendViaSocket", function(){
        
        assertThat(message.setSendViaSocket(false), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setSendViaSocket, throws MethodNotFound Exception", function(){
        
        try{
            message.setSendViaSocket(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.messages.impl.SparkMessageImpl.setSendViaSocket(null)."));
        }
    });
    
    test("Spark.message with true setSupressPushOnSocketSend", function(){
        
        assertThat(message.setSupressPushOnSocketSend(true), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with false setSupressPushOnSocketSend", function(){
        
        assertThat(message.setSupressPushOnSocketSend(false), is(not(null)));
        message.setPlayerIds(Spark.getPlayer().getPlayerId());
        message.send();
    });
    
    test("Spark.message with null setSupressPushOnSocketSend, throws MethodNotFound Exception", function(){
        
        try{
            message.setSupressPushOnSocketSend(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.messages.impl.SparkMessageImpl.setSupressPushOnSocketSend(null)."));
        }
    });
});