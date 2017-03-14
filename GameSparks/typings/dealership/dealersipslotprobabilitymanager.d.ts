/**
 * Callback invoked when the manager has located a random slot timing
 * @callback DealershipSlotProbabilityManager~onTimeLoaded
 * @param {DealershipSlotProbabilityRecord} record The DealershipSlotProbabilityRecord to use to generate expiry and refresh times
 */
declare interface onTimeLoaded {
    (record: DealershipSlotProbabilityRecord) : void;
}

declare class DealershipSlotProbabilityManager { 
    
        /**
         * A class for calculating the time to live and expiry times for dealership slots 
         * @constructor
         * @param {HutchGSMongoCollectionWrapper} slotProbabiltyCollection An object for interacting with a MongoDB collection containing scheduled matches.
         * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
         */
        constructor(slotProbabiltyCollection: HutchGSMongoCollectionWrapper);

        /**
         * Gets a random DealershipSlotProbabilityRecord
         * @param {onTimeLoaded} callback The callback to invoke when a random slot probability has been determined
         */
        getTimes(callback: onTimeLoaded): void;
}