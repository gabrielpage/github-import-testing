requireOnce("TimeUtilities");

//Module: AtomicUtilities
/**
A wrapper for performing optimistic locking for atomic operations. The functionToExecute should return the newly updated data that you want
reinserting back into the collection entry (specified by the dataId and the collectionName), or 'null' if there was no modification.
(For examples of use see SlamUtilities and SlamHandler_v095)

@param functionToExecute   {function}  - The function that contains all the code you want to be atomic. If the function returns a null AtomicModify will end early.
@param functionParameters  {array}     - Pass arguments for functionToExecute as an array e.g. [arg1, arg2, arg3...].
@param dataId              {string}    - The ID for the collection entry you want to modify atomically.
@param collectionName      {string}    - The collection that contains the entry with ID of dataId.

@returns {boolean} whether the database was modified.
*/
function AtomicModify(functionToExecute, functionParameters, dataId, collectionName){
    var modified = false;

    if (dataId === null || dataId === undefined){
        return modified;
    }

    // assume we will modify
    modified = true;

    var player = Spark.getPlayer();
    var playerText = "";
    if (player !== null && player !== undefined){
        playerText = FormatString("[{0}]", player.getDisplayName());
    }
    //Spark.getLog().debug(FormatString("AtomicModify START {0}", playerText));
    var finished = false;
    var collection = Spark.runtimeCollection(collectionName);
    var startTime = GetNow();
    while (!finished){
        var uuid = null;
        var newData = null;
        var updateOkay = collection.update({"_id":{"$oid":dataId}, "UUID":{"$exists":false}}, {"$set":{"UUID":GetNewUUID()}});
        if (updateOkay){
            var entry = collection.findOne({"_id":{"$oid":dataId}});
            if (entry !== null && entry !== undefined){
                uuid = entry.UUID;
                newData = functionToExecute.apply(this, functionParameters);
            }
        }
        if (newData === null){
            modified = false;
            finished = true;
        }
        else{
            newData.UUID = GetNewUUID();
            var result = collection.findAndModify({"_id":{"$oid":dataId}, "UUID":{"$eq":uuid}}, newData);
            finished = (result !== null);
            if (finished){
                //Spark.getLog().debug(FormatString("{0} Data has been modified: {1}", playerText, JSON.stringify(newData)));
                //Spark.getLog().debug(FormatString("UUID: {0} -> {1}", uuid, newData.UUID));
            }
            else{
                Spark.getLog().warn(FormatString("{0} Data has changed since we started, trying again...", playerText));
            }
        }
    }
    var endTime = GetNow();
    var totalTime = endTime - startTime;

    if (totalTime > 100) {
        Spark.getLog().warn(FormatString("AtomicModify END (Time taken: {0}ms) {1}", totalTime, playerText));
    }

    return modified;
}

// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/2117523#2117523
/*
Module: AtomicUtilities

Generates a RFC4122 version 4 compliant UUID for use with AtomicModify
.
*/
function GetNewUUID(){
    var d = GetNow();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}