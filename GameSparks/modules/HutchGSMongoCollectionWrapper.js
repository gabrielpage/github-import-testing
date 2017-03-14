requireOnce("GeneralUtilities");
/**
 * A wrapper around the GameSparks MongoDB Collection API
 * Implements the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 * @constructor
 * @param {Object} collection The SparkMongoCollectionReadWrite to wrap
 */
HutchGSMongoCollectionWrapper = function (collection) {

    /**
     * Creates a cursor for a query that can be used to iterate over results from MongoDB
     * @param {Object} query The cursor query object.
     * @return {HutchGSMongoCursorWrapper} A HutchGSMongoCursorWrapper
     */
    this.find = function (query) {
        var result = collection.find(query);

        // Log("find({0}) : {1}", JSON.stringify(query), JSON.stringify(result));

        return new HutchGSMongoCursorWrapper(result);
    };

    /**
     * The callback format for results
     * @callback HutchGSMongoWrapper~resultCallback
     * @param {MongoError} error An error instance representing the error during the execution.
     * @param {Object} result The result object if the command was executed successfully.
     */

    /**
     * Fetches the first document that matches the query
     * @param {Object} query Query for find Operation
     * @param {Object} options Optional settings. Supports "fields" key
     * @param {resultCallback} callback The callback invoked when the query has completed
     */
    this.findOne = function (query, options, callback) {
        var result = null;
        if (options !== null && options.hasOwnProperty("fields")) {
            result = collection.findOne(query, options.fields);
        }
        else {
            result = collection.findOne(query);
        }

        // Log("findOne({0}, {1}) : {2}", JSON.stringify(query), JSON.stringify(options), JSON.stringify(result));

        callback(null, result);
    };

    /**
     * The callback format for results
     * @callback HutchGSMongoWrapper~removeCallback
     * @param {MongoError} error An error instance representing the error during the execution.
     * @param {Object} result The result object if the command was executed successfully.
     */

    /**
     * Remove documents
     * @param {Object} query Query to select documents to remove
     * @param {Object} options Unsupported
     * @param {removeCallback} callback The callback invoked when the update has completed
     */
    this.remove = function (query, options, callback) {
        var result = collection.remove(query);

        // Log("remove({0}, {1}) : {2}", JSON.stringify(query), JSON.stringify(options), JSON.stringify(result));

        if (typeof callback !== "undefined" && callback !== null) {
            if (result) {
                callback(null, { "result" : { "ok" : 1 } });
            }
            else {
                callback(null, { "result" : { "ok" : 0 } });
            }
        }
    };

    /**
     * The callback format for inserts
     * @callback HutchGSMongoWrapper~insertCallback
     * @param {MongoError} error An error instance representing the error during the execution.
     * @param {Object} result The result object if the command was executed successfully.
     */

    /**
     * Inserts an array of documents into MongoDB. If documents passed in do not contain the _id field,
     * one will be added to each of the documents missing it by the driver, mutating the document.
     * @param {Array} docs Documents to insert.
     * @param {Object} options Not Supported
     * @param {insertCallback} callback The command result callback
     */
    this.insertMany = function (docs, options, callback) {
        var success = collection.insert(docs);

        // Log("insertMany({0}, {1}) : {2}", JSON.stringify(docs), JSON.stringify(options), success);

        if (success) {
            callback(null, { "ops" : docs, "result" : { "ok" : 1 } });
        }
        else {
            // ??? Dunno what docs will look like now
            callback(null, { "ops" : docs, "result" : { "ok" : 0 } });
        }
    };

    /**
     * The callback format for update
     * @callback HutchGSMongoWrapper~updateCallback
     * @param {MongoError} error An error instance representing the error during the execution.
     * @param {bool} result True if the operation executed successfully, else false
     */

    /**
     * Updates a single document
     * @param {Object} filter The Filter used to select the document to update
     * @param {Object} update The update operations to be applied to the document
     * @param {Object} options Optional settings. Supports "upsert" key
     * @param {updateCallback} callback The callback invoked when the update has completed
     */
    this.updateOne = function (filter, update, options, callback) {
        var upsert = false;
        if (options !== null && options.hasOwnProperty("upsert")) {
            upsert = options.upsert;
        }

        var result = collection.update(filter, update, upsert, false);

        if (typeof callback !== "undefined" && callback !== null) {

            // Log("updateOne({0}, {1}, {2}) : {3}", JSON.stringify(filter), JSON.stringify(update), JSON.stringify(options), JSON.stringify(result));

            if (result) {
                callback(null, { "result" : { "ok" : 1 } });
            }
            else {
                callback(null, { "result" : { "ok" : 0 } });
            }
        }
        else {
            // Log("updateOne #2({0}, {1}, {2}) : {3}", JSON.stringify(filter), JSON.stringify(update), JSON.stringify(options), JSON.stringify(result));
        }
    };
};