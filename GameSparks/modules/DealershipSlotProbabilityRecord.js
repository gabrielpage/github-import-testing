/**
 * A class representing a record in the DealershipSlotProbability collection.
 * These are configured to determine how log car variants appear in the dealership for, and how long they take to regenerate
 * @constructor
 * @param {number} expiryTimeRangeStart The minimum random number of seconds until a slot should expire
 * @param {number} expiryTimeRangeEnd The maximum random number of seconds until a slot should expire
 * @param {number} timeToRefreshStart The minimum random number of seconds until a slot should refresh
 * @param {number} timeToRefreshEnd The minimum random number of seconds until a slot should refresh
 */
DealershipSlotProbabilityRecord = function (expiryTimeRangeStart, expiryTimeRangeEnd, timeToRefreshStart, timeToRefreshEnd) {
    
    /**
     * Gets a random number of seconds that the slot should be valid for
     * @return {number} The number of seconds the slot should be valid for
     */
    this.getRandomExpiry = function () {
        return Math.floor((Math.random() * (expiryTimeRangeEnd - expiryTimeRangeStart)) + expiryTimeRangeStart);
    }
    
    /**
     * Gets a random number of seconds that the slot will take to regenerate after it has expired or the variant has been purchased
     * @return {number} The number of seconds until the slot should be refreshed
     */
    this.getRandomTimeToRefresh = function () {
        return Math.floor((Math.random() * (timeToRefreshEnd - timeToRefreshStart)) + timeToRefreshStart);
    }    
};