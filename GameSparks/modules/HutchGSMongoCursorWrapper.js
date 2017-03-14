/**
 * A wrapper around the GameSparks MongoDB Cursor API
 * Implements the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 * @constructor
 * @param {object} cursor The SparkMongoCursor to wrap
 */
HutchGSMongoCursorWrapper = function (cursor) {
    
    /**
     * The callback format for results
     * @callback HutchGSMongoCursorWrapper~toArrayResultCallback
     * @param {MongoError} error An error instance representing the error during the execution
     * @param {Array} documents All the documents the satisfy the cursor 
     */
    
    /**
     * Returns an array of documents. The caller is responsible for making sure that there is enough memory to store the results.
     * @param {toArrayResultCallback} callback The result callback
     */
    this.toArray = function (callback) {
        var ret = cursor.toArray();
        callback(null, ret);    
    };    
};