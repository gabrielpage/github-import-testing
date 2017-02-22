// ====================================================================================================
//
// Cloud Code for highestScore, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var eventId = "theeventit";
var roomId = "evententryid"

Spark.getRedis().zadd(eventId, 0, roomId)

Spark.getRedis().zrand

Spark.getRedis().del(eventId)
Spark.getRedis().del(eventId + "_state")

Spark.getRedis().zadd(eventId + "_state", 0, "currentPage");
Spark.getRedis().zadd(eventId + "_state", 92, "pageSize");

Spark.getRedis().zincrby(eventId + "_state", 1, "currentPage");

var currentPage = Spark.getRedis().zscore(eventId + "_state", "currentPage");

var pageSize = Spark.getRedis().zscore(eventId + "_state", "pageSize");

var minEntry = pageSize * currentPage
var maxEntry = pageSize * (currentPage + 1)
var randomRooms = Spark.cachedRuntimeCollection("EventEntries").findOne({"_id" : {"$gte": minEntry, "$lt" : maxEntry}});

var randomRoom = Spark.runtimeCollection("EventEntries").findOne({"_id" : {"$oid" : randomEventEntryId}});