/**
 * A class for maintaining the probability of receiving different class cars at different player levels
 * @constructor
 * @param {HutchGSMongoCollectionWrapper} playerLevelProbabiltyCollection An object for interacting with a MongoDB collection containing scheduled matches.
 * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
 */
DealershipPlayerLevelProbabilityManager = function (playerLevelProbabiltyCollection) {
    var levels; 
        
    /**
     * Callback invoked when the manager has located the DealershipPlayerLevelProbabilityRecord for a player level
     * @callback DealershipPlayerLevelProbabilityManager~onRecordLoaded
     * @param {DealershipPlayerLevelProbabilityRecord} record The DealershipPlayerLevelProbabilityRecord to use to generate variant classes
     */
    
    /**
     * Gets the DealershipPlayerLevelProbabilityRecord corresponding to the player level
     * @param {number} level The player level to use to locate the DealershipPlayerLevelProbabilityRecord
     * @param {onRecordLoaded} callback The callback invoked when the DealershipPlayerLevelProbabilityRecord has been located
     */
    this.getLevel = function (level, callback) {
        if (typeof levels === "undefined") {
            playerLevelProbabiltyCollection.find({}).toArray(function (error, result) {
                if (error !== null) {
                    callback(null);
                }
                
                if (result === null) {
                    callback(null);
                }
                
                levels = {};
                for (var i = 0; i < result.length; i++) {
                    for (var j = result[i].StartLevel; j <= result[i].EndLevel; j++) {
                        levels[j] = new DealershipPlayerLevelProbabilityRecord(
                            result[i].ClassCProbability,
                            result[i].ClassBProbability,
                            result[i].ClassAProbability,
                            result[i].ClassSProbability,
                            result[i].ProbabilityDenominator);
                    }
                }
                
                return callback(levels[level]);   
            });   
        }
        else {
            return callback(levels[level]);   
        }
    };
};