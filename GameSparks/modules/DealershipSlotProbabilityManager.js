/**
 * A class for calculating the time to live and expiry times for dealership slots 
 * @constructor
 * @param {HutchGSMongoCollectionWrapper} slotProbabiltyCollection An object for interacting with a MongoDB collection containing scheduled matches.
 * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 */
DealershipSlotProbabilityManager = function (slotProbabiltyCollection) {
    var times; 
    var totalWeight = 0;
        
    /**
     * Callback invoked when the manager has located a random slot timing
     * @callback DealershipSlotProbabilityManager~onTimeLoaded
     * @param {DealershipSlotProbabilityRecord} record The DealershipSlotProbabilityRecord to use to generate expiry and refresh times
     */
    
    /**
     * Gets a random DealershipSlotProbabilityRecord
     * @param {onTimeLoaded} callback The callback to invoke when a random slot probability has been determined
     */
    this.getTimes = function (callback) {
        if (typeof times === "undefined") {
            slotProbabiltyCollection.find({}).toArray(function (error, result) {
                if (error !== null) {
                    callback(null);
                }
                
                if (result === null) {
                    callback(null);
                }
                
                times = {};
                for (var i = 0; i < result.length; i++) {
                    for (var j = totalWeight + 1; j <= totalWeight + result[i].Weight; j++) {
                        times[j] = new DealershipSlotProbabilityRecord(
                            result[i].ExpiryRangeStart,
                            result[i].ExpiryRangeEnd,
                            result[i].TimeToRefreshRangeStart,
                            result[i].TimeToRefreshRangeEnd);
                    }
                    
                    totalWeight += result[i].Weight;
                }
                
                return callback(times[Math.floor((Math.random() * totalWeight) + 1)]);   
            });   
        }
        else {
            return callback(times[Math.floor((Math.random() * totalWeight) + 1)]);   
        }
    };
};