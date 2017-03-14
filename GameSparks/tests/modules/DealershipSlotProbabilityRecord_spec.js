"use strict";

requireOnce("Dealership");

describe("Dealership slot probability record", function () {

    it ("should return correct expiry", function () {
        var record = new DealershipSlotProbabilityRecord(100, 100, 50, 50);
        var result = record.getRandomExpiry();
        expect(result).toBe(100);
    });

    it ("should return correct time to refrest", function () {
        var record = new DealershipSlotProbabilityRecord(100, 100, 50, 50);
        var result = record.getRandomTimeToRefresh();
        expect(result).toBe(50);
    });
});