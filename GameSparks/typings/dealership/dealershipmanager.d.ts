/**
 * Callback invoked when the manager generated a new player dealership for a player going
 * through the First Time User Experience flow
 * @callback DealershipManager~onFTUEGenerated
 * @param {object[]} slots The slots generated in the new dealership
 */
declare interface onFTUEGenerated {
    (slots: object[]) : void;
}

/**
 * Callback invoked when the manager has loaded a specific car in the player's dealership
 * @callback DealershipManager~onCarLoaded
 * @param {object} car The car in the player's dealership
 */
declare interface onCarLoaded {
    (car: object) : void;
}

/**
 * Callback invoked when the manager has loaded the cars currently in the player's dealership
 * @callback DealershipManager~onCarsLoaded
 * @param {object[]} cars The cars in the player's dealership
 */
declare interface onCarsLoaded {
    (cars: object[]) : void;
}

/**
 * Callback invoked when the manager has loaded a slot in the player's dealership
 * @callback DealershipManager~onSlotLoaded
 * @param {object} slot The slot from the player's dealership
 */
declare interface onSlotLoaded {
    (slot: object) : void;
}

/**
 * Callback invoked when the manager has marked a slot as purchased
 * @callback DealershipManager~onSlotMarkedPurchased
 * @param {bool} result True if the slot was successfully marked as purchased, false if the slot cannot be purchased
 */
declare interface onSlotMarkedPurchased {
    (result: boolean) : void;
}

/**
 * Callback invoked when the manager has refreshed a slot in the player's dealership
 * @callback DealershipManager~onSlotRefreshed
 * @param {object} slot The newly refreshed slot
 */
declare interface onSlotRefreshed {
    (slot: object) : void;
}


declare class DealershipManager {
        /**
         * A class for managing the slots in a player's dealership
         * @constructor
         * @param {DealershipSlotProbabilityManager} slotProbabilityManager The manager object that loads and checks the probability of generating
         * different expiry times and times to refresh
         * @param {DealershipPlayerLevelProbabilityManager} playerLevelProbabilityManager The manager object that loads and checks the probability of seeing
         * different variants at different player levels
         * @param {HutchGSMongoCollectionWrapper} carInventoryCollection An object for interacting with a MongoDB collection containing scheduled matches.
         * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
         * @param {HutchGSMongoCollectionWrapper} playerDealershipCollection An object for interacting with a MongoDB collection containing scheduled matches.
         * This should implement the same API as collections returned by the node-mongodb-native project (https://github.com/mongodb/node-mongodb-native)
         * @param {HutchGSRedisWrapper} redis An object for interacting with a Redis cache.
         * This should implement the same API as the ioredis project (https://github.com/luin/ioredis)
         * @param {function():string} rarityGeneratorFn A function which when called, will generate a random rarity
         */
        constructor(slotProbabilityManager: DealershipSlotProbabilityManager, playerLevelProbabilityManager: DealershipPlayerLevelProbabilityManager, carInventoryCollection: HutchGSMongoCollectionWrapper, playerDealershipCollection: HutchGSMongoCollectionWrapper, redis: HutchGSRedisWrapper, rarityGeneratorFn: { (): string });

        /**
         * Clears a player's dealership. This is expected to be used as a debug option
         * @param {string} playerId The unique identifier of the player
         */
        clearDealership(playerId: string): void;

        /**
         * Generates a new PlayerDealership record for a new player going through the
         * First Time User Experience flow
         * @param {string} playerId The unique identifier of the player
         * @param {onFTUEGenerated} callback The callback invoked after the dealership has been generated
         */
        generateFTUE(playerId: string, playerLevel: number, starter: boolean, callback: onFTUEGenerated): void;

        /**
         * Gets a car in a specific slot index currently in the player's dealership
         * @param {string} playerId The unique identifier of the player
         * @param {number} slotIndex The slot index to get the car from
         * @param {onCarLoaded} callback The callback invoked when the cars have been loaded
         */
        getCarForPlayer(playerId: string, slotIndex: number, callback: onCarLoaded): void;

        /**
         * Gets an object mapping to the client's CarInventoryItem class from a slot
         * @param {object} slot The slot in the dealership
         * @return {object} An object mapping to the client's CarInventoryItem class
         */
        getCarFromSlot(slot: object): object;

        /**
         * Gets the cars currently in the player's dealership
         * Dynamically resizes the dealership if the global number of slots has changed
         * @param {string} playerId The unique identifier of the player
         * @param {number} playerLevel The player's XPLevel
         * @param {onCarsLoaded} callback The callback invoked when the cars have been loaded
         */
        getCarsForPlayer(playerId: string, playerLevel: number, callback: onCarsLoaded): void;

        /**
         * Gets a slot in the player's dealership
         * @param {string} playerId The unique identifier of the player
         * @param {number} slotIndex The index of the slot to get
         * @param {onSlotLoaded} callback The callback invoked when the slot is loaded
         */
        getSlotForPlayer(playerId: string, slotIndex: number, callback: onSlotLoaded): void;

        /**
         * Marks a slot as purchased. The slot will still not be refreshed until a further amount of time has expired
         * (the TimeToRefresh setting), but the client can show the slot as finished.
         * @param {string} playerId The unqiue identifier of the player purchasing the car in the slot
         * @param {number} slotIndex The index of the slot containing the car being purchased
         * @param {onSlotMarkedPurchased} callback The callback invoked when the slot has been marked as purchased
         */
        markSlotAsPurchased(playerId: string, slotIndex: number, callback: onSlotMarkedPurchased): void;

        /**
         * Refreshes a slot in a player's dealership
         * @param {string} playerId The unique identifier of the player to generate the slot for
         * @param {number} slotIndex The index of the slot to generate in the player's dealership
         * @param {number} playerLevel The player's level
         * @param {onSlotRefreshed} callback The callback invoked when the slot has been refreshed
         */
        refreshSlot(playerId: string, slotIndex: number, playerLevel: number, callback: onSlotRefreshed): void;
}