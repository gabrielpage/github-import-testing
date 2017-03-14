/**
 * Callback invoked when the manager has located the DealershipPlayerLevelProbabilityRecord for a player level
 * @callback DealershipPlayerLevelProbabilityManager~onRecordLoaded
 * @param {DealershipPlayerLevelProbabilityRecord} record The DealershipPlayerLevelProbabilityRecord to use to generate variant classes
 */
declare interface onRecordLoaded {
    (record: DealershipPlayerLevelProbabilityRecord) : void;
}    

declare class DealershipPlayerLevelProbabilityManager { 
    
        /**
         * A class for maintaining the probability of receiving different class cars at different player levels
         * @constructor
         * @param {HutchGSMongoCollectionWrapper} playerLevelProbabiltyCollection An object for interacting with a MongoDB collection containing scheduled matches.
         * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
         */
        constructor(playerLevelProbabiltyCollection: HutchGSMongoCollectionWrapper);

        /**
         * Gets the DealershipPlayerLevelProbabilityRecord corresponding to the player level
         * @param {number} level The player level to use to locate the DealershipPlayerLevelProbabilityRecord
         * @param {onRecordLoaded} callback The callback invoked when the DealershipPlayerLevelProbabilityRecord has been located
         */
        getLevel(level: number, callback: onRecordLoaded): void;
}