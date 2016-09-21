var message = Spark.getData().message;
var delay = Spark.getData().delay;
var key = Spark.getData().key;

var scheduler = Spark.getScheduler();

if(key != "GS_NONE"){
    scheduler.inSeconds("ScheduledMessage", delay, {"message" : message, "playerId" : Spark.getPlayer().getPlayerId()}, key);
} else{
    scheduler.inSeconds("ScheduledMessage", delay, {"message" : message, "playerId" : Spark.getPlayer().getPlayerId()});
}