// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic Message tests", function(){
    
    var player = Spark.getPlayer();
    var listMessageRequest = new SparkRequests.ListMessageRequest();
    listMessageRequest.entryCount = 1;
    
    test("sendMessage, sends a message to the player", function(){
        Spark.sendMessage({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
    });
    
    test("sendMessageById, sends a message to the player", function(){
        Spark.sendMessageById({"data" : "This is a test Data!"}, player.getPlayerId());
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
    });
    
    test("sendMessageWithoutPush, sends a message to the player", function(){
        Spark.sendMessageWithoutPush({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
    });
    
    test("sendMessageByIdWithoutPush, sends a message to the player", function(){
        Spark.sendMessageByIdWithoutPush({"data" : "This is a test Data!"}, player.getPlayerId());
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
    });
    
    test("sendMessageByIdExt, sends a message to the player", function(){
        Spark.sendMessageExt({"data" : "This is a test Data!"}, "CCM", player);
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].summary, is("Summary"));
        assertThat(response.messageList[0].title, is("Title"));
        assertThat(response.messageList[0].subTitle, is("SubTitle"));
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
        assertThat(response.messageList[0].extCode, is("CCM"));
    });
    
    test("sendMessageByIdExt, sends a message to the player", function(){
        Spark.sendMessageByIdExt({"data" : "This is a test Data!"}, "CCM", player.getPlayerId());
        var response = listMessageRequest.Send();
        assertThat(response.messageList[0].summary, is("Summary"));
        assertThat(response.messageList[0].title, is("Title"));
        assertThat(response.messageList[0].subTitle, is("SubTitle"));
        assertThat(response.messageList[0].data.data, is("This is a test Data!"));
        assertThat(response.messageList[0].extCode, is("CCM"));
    });
    
    test("dismissMessage, dismisses a message when one exists", function(){
        Spark.sendMessage({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(Spark.dismissMessage(response.messageList[0].messageId), is(true));
    });
    
    test("dismissMessage, returns false when a message doesn't exist", function(){
        Spark.sendMessage({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(Spark.dismissMessage("invalid_id"), is(false));
    });    
});