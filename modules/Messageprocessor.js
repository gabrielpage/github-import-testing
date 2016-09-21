new MessageProcessor().execute();

// executes cleanup procedure, stores both localised and non localised messages
// in a message_queue runtime collection.
function MessageProcessor(){
    
    this.execute = function(){
        new MessageMaintenance().execute();
        new LocalisedProcessor().execute();
        new NonLocalisedProcessor().execute();
    }   
    
    // stores messages that are to be sent based on players TZ segment
    var LocalisedProcessor = function(){
    
        this.execute = function() {
            
            var currentDate = getCurrentDate();
            
            var lowerLimit = new Date(currentDate);
            var upperLimit = new Date(currentDate);
            
            // lower and upper boundries representing (UTC-12) & (UTC+13)
            lowerLimit.setHours(currentDate.getHours() - 12);
            upperLimit.setHours(currentDate.getHours() + 13);
            
            // finds all the messages within boundries, that have "sendAtLocalTime" set to true
            var applicableMessages = getApplicableMessages(currentDate, lowerLimit, upperLimit).toArray();
            for(var i = 0; i<applicableMessages.length; i++){
                var applicableMessage = applicableMessages[i];
                processMessage(applicableMessages[i], currentDate);
            }
        }
        
        // returns all applicable messages
        function getApplicableMessages(currentDate, lowerLimit, upperLimit){
            return  Spark.runtimeCollection("jsNewsFeed").find(
                {"$and" : [{"startAt" : {"$gte" : lowerLimit, "$lte" : upperLimit}, "sendAtLocalTime" : true, "$or" : [{"state" : "unprocessed"}, {"state" : "processing"}]}]});
        }
        
        // finds and returns a message that hasn't been processed already
        function getMessageToSend(id, timeZone){
            return  Spark.runtimeCollection("jsNewsFeed").findAndModify(
                {"$and" : [{"_id" : {"$oid" : id}, "processedTimeZones" : {"$nin" : [timeZone]}}]}, 
                {"$addToSet" : {"processedTimeZones" : timeZone}, "$set" : {"state" : "processing"}});
        }
        
        // processed and stores message in the message_queue
        function processMessage(messageToProcess, currentDate){
        
            var messageId = messageToProcess._id.$oid;
            // gets the timeZone offset, based on difference between current time and the time set on the message
            var timeZone = Math.floor((messageToProcess.startAt - currentDate)/1000/60/60);
            
            if(new Date(messageToProcess.startAt).getMinutes() == currentDate.getMinutes()){
                
                // gets the TZ attribute shortcode based on the timeZone offset
                var timeZoneStrings = Spark.metaCollection("timezone-offsets").find({offset : timeZone}, {"_id" : 1});

                messageToProcess = getMessageToSend(messageId, timeZone);

                if(messageToProcess != null){
                    
                    // process multiple time zones that have the same offset
                    while(timeZoneStrings.hasNext()){
                        var timeZoneString = timeZoneStrings.next();
                        var query = JSON.parse(messageToProcess.query);
                        query["segments.TZ"] = timeZoneString._id;
                        
                        // find all players that match the query/timeZone and return their playerIds and LANG segment value
                        var players = Spark.systemCollection("player").find(query, {"_id" : 1,"segments.LANG" : 1});
    
                        var messageQueue = [];
    
                        while(players.hasNext()){
                            
                            var player = players.next();
                            var playerSeg = "default";
                            // check if LANG segment can be applied to the player, otherwise use default message value
                            if( player.segments != null && player.segments.LANG != null && messageToProcess.translations[player.segments.LANG]){
                                playerSeg = player.segments.LANG;
                            }
                            messageQueue.push({"playerId" : player._id.$oid, "messageId" : messageToProcess._id.$oid, "translation" : playerSeg});
                            messageQueue = saveIfFull(messageQueue);
                        }
                        
                        if(messageQueue.length > 0){
                            saveIfFull(messageQueue, true);
                        }
                    }
                }
            }
        }
    }
    
    // stores messages that are to be sent to players at the given time, that are not based on TZ segment
    var NonLocalisedProcessor = function(){
     
        this.execute = function() {
            var currentDate = getCurrentDate();
            var messageToProcess = getMessageToSend(currentDate);
            while(messageToProcess != null){
                processMessage(messageToProcess);
                messageToProcess = getMessageToSend(currentDate);
            }
        }
        
        // returns a message that hasn't been processed yet
        function getMessageToSend(currentDate){
            return  Spark.runtimeCollection("jsNewsFeed").findAndModify(
                {"$and" : [{"startAt" : {"$lte" : currentDate}, "sendAtLocalTime" : false, "state" : "unprocessed"}]}, 
                {"$set" : {"state" : "processed"}});
        }
        
        function processMessage(messageToProcess){
            
            var query = JSON.parse(messageToProcess.query);
            
            // find all players that match the query and return their playerIds and LANG segment value
            var players = Spark.systemCollection("player").find(query, {"_id" : 1,"segments.LANG" : 1});
            
            var messageQueue = [];
            
            while(players.hasNext()){
                
                var player = players.next();
                var playerSeg = "default";
                // check if LANG segment can be applied to the player, otherwise use default message value
                if( player.segments != null && player.segments.LANG != null && messageToProcess.translations[player.segments.LANG]){
                        playerSeg = player.segments.LANG;
                }
                messageQueue.push({"playerId" : player._id.$oid, "messageId" : messageToProcess._id.$oid, "translation" : playerSeg});
                messageQueue = saveIfFull(messageQueue);
            }
            
            if(messageQueue.length > 0){
                saveIfFull(messageQueue, true);
            }
        }
    }
    
    // clears TZ based messages that are in the "processing" state and are older than 12 hours
    var MessageMaintenance = function(){
        
        this.execute = function() {
            var currentDate = getCurrentDate();
            var expiryDate = new Date(currentDate);
            expiryDate.setHours(currentDate.getHours() - 12);
            
            var expiredMessage = modifyExpired(expiryDate);
    
            while(expiredMessage != null){
                expiredMessage = modifyExpired(expiryDate);
            }
        }
    }
    
    // change the state of the matching messages
    function modifyExpired(expiryDate){
        return  Spark.runtimeCollection("jsNewsFeed").findAndModify({"startAt" :  {"$lt" : expiryDate}, "state" : "processing"}, {"$set" : {"state" : "processed"}});
    }
    
    // checks if message array is over 500 or is forcefully stored, then sends the messages to mongo
    // this will reduce the footprint of accessing mongo collection
    function saveIfFull(messages, force){
            if(messages.length > 500 || force){
                Spark.runtimeCollection("message_queue").insert(messages);
                return [];
            }
            return messages;
        }
    
    // returns the current date
    function getCurrentDate(){
        var currentDate = new Date();
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        return currentDate;
    }
}