"use strict";

requireOnce("Dealership");

describe("Dealership player level probability record", function () {

    it ("should return ClassC", function () {
        var record = new DealershipPlayerLevelProbabilityRecord(1, 0, 0, 0, 1);
        var result = record.getRandomClass();
        expect(result).toBe("ClassC");
    });

    it ("should return ClassB", function () {
        var record = new DealershipPlayerLevelProbabilityRecord(0, 1, 0, 0, 1);
        var result = record.getRandomClass();
        expect(result).toBe("ClassB");
    });

    it ("should return ClassA", function () {
        var record = new DealershipPlayerLevelProbabilityRecord(0, 0, 1, 0, 1);
        var result = record.getRandomClass();
        expect(result).toBe("ClassA");
    });

    it ("should return ClassS", function () {
        var record = new DealershipPlayerLevelProbabilityRecord(0, 0, 0, 1, 1);
        var result = record.getRandomClass();
        expect(result).toBe("ClassS");
    });
});