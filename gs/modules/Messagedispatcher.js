new Messagedispatcher().execute();

function Messagedispatcher(){
    
    this.execute = function(){
        var messageToSend = getMessageFromQueue();
        while(messageToSend != null){
            sendMessage(messageToSend);
            messageToSend = getMessageFromQueue();
        }
    }
    
    function getMessageFromQueue(){
        return  Spark.runtimeCollection("message_queue").findAndRemove({});
    }
    
    function sendMessage(messageToSend){
        var messageDetails = Spark.runtimeCollection("jsNewsFeed").find({"_id" : {"$oid" : messageToSend.messageId}});
        if(messageDetails.hasNext()){
            var message = messageDetails.next();
            var messageData = message.translations[messageToSend.translation];
            messageData["command"] = message.command;
            Spark.sendMessageByIdExt(messageData, message.messageType, messageToSend.playerId);
            Spark.runtimeCollection("jsNewsFeed").update({"_id" : {"$oid" : messageToSend.messageId}}, {"$inc" : {"playersReceived" : 1}});
        }
    }
}