// SNIPPET 1
// Loading 4 letter words into redis, in this example we just define the words in script
// when you have the real list let us know as there is a pattern we can use to consume a JSON file

var theWords = ["like", "lake", "lame"];

for(var i=0 ; i<theWords.length ; i++){
    Spark.getRedis().sadd("fourletterwords", theWords[i]);
}

// SNIPPET 2 - Creating a document for each challenge
// This code can be executed in the global message script for "ChallengeStartedMessage"
// the global script will only run once for each challenge, so you do not need to worry about concurrency

var challengeId = Spark.getData().challenge.challengeId;

var challengeStateDocument = { _id : challengeId };

//Now we want to get an empty sub document in for each player in the challenge
var acceptedPlayers = Spark.getData().challenge.accepted;

for(var i=0 ; i<acceptedPlayers ; i++){
    var acceptedPlayer = acceptedPlayers[i];
    challengeStateDocument[acceptedPlayer.id] = { turns : [] }
}

//save the document
Spark.runtimeCollection("challengeState").insert(challengeStateDocument);

//So we end up with a document in the collection that looks like this :
// { 
//      _id : "challengeId", 
//      "playerId1" : { turns : [] },
//      "playerId2" : { turns : [] }
// }

// SNIPPET 3 - Atomically updating the document when a player takes their turn.
// This is a partial document update, where we just push a new turn into the players "turn" array.
// This code shoudl run on a "Challenge Event"

var challengeId = Spark.getData().challengeInstanceId;
var playerId = Spark.getPlayer().getPlayerId();

var theWord = Spark.getData().WORD // Assumed you have an event with the attribute "WORD" as a string

var theWordIsOk = Spark.getRedis().sismember("fourletterwords", theWord);

if(theWordIsOk){
    //Now we want to push it into the players "turns", in this example it's just a string array
    //But the array can be a more complex object if required.
    var keyToPushTo = playerId + ".turns";
    Spark.runtimeCollection("challengeState").findAndModify({ _id : challengeId }, { $push : [ keyToPushTo, theWord ] } );
} else {
    //Response with an error
    Spark.setScriptError("WORD", "NOT_OK")
}

// SNIPPET 4 - Getting the words a player has already used, we're going to just return the player turn elemtn for the current player
var playerId = Spark.getPlayer().getPlayerId();

//Javascript goodness to set a field by it's name
var fieldsToRetrieve = {};
fieldsToRetrieve[playerId] = 1;
var challengeId = Spark.getData().challengeInstanceId;
var documentReturned = Spark.runtimeCollection("challengeState").findOne({ _id : challengeId }, fieldsToRetrieve);
Spark.setScriptData("playerData", documentReturned);