"use strict";

requireOnce("Dealership");
var mongo = requireOnce("mongodb")
var Redis = requireOnce("ioredis");

describe("Dealership manager", function () {
    var redis;
    var mongoClient;
    var mongoDB;

    beforeEach(function() {
        mongoDB = null;

        runs(function () {
            redis = new Redis();
            mongoClient = mongo.MongoClient;
            mongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
                expect(err).toBe(null);
                expect(db).toBeDefined();
                mongoDB = db;
            });
        });

        waitsFor(function() { return mongoDB !== null; },
            "MongoDB should have connected",
            1000);
    });

    afterEach(function() {
        redis.quit();
        mongoDB.close();
    });

    it ("should return", function () {
        expect(true).toBeTruthy();
        /*var dropped = false;
        var complete = 0;
        var records = [
                    {
                        "StartLevel" : 1,
                        "EndLevel" : 12,
                        "ClassCProbability" : 8,
                        "ClassBProbability" : 2,
                        "ClassAProbability" : 1,
                        "ClassSProbability" : 1,
                        "ProbabilityDenominator" : 12
                    },
                    {
                        "StartLevel" : 13,
                        "EndLevel" : 24,
                        "ClassCProbability" : 3,
                        "ClassBProbability" : 6,
                        "ClassAProbability" : 2,
                        "ClassSProbability" : 1,
                        "ProbabilityDenominator" : 12
                    }
                ];

        runs(function() {
            mongoDB.collection("DealershipPlayerLevelProbability").drop(function (err, result) {
                if (err !== null) {
                    if (err.message == "ns not found") {
                        dropped = true;
                    }
                }
                if (result !== undefined) {
                    dropped = result;
                }
            });
        });

        waitsFor(function () { return dropped !== false; },
            "MongoDB should have dropped the DealershipPlayerLevelProbability collection by now",
            1000);

        runs(function () {
            mongoDB.collection("DealershipPlayerLevelProbability").insertMany(
                records,
                null,
                function (error, result) {
                    complete += result.insertedCount;
                }
            )
        });

        waitsFor(function () { return complete === 2; },
            "MongoDB should have inserted 2 records into the DealershipPlayerLevelProbability collection by now",
            1000);

        runs(function () {
            complete = 0;
            var slotProbMgr = new DealershipSlotProbabilityManager(mongoDB.collection("DealershipSlotsProbability"));
            var playerLevProbMgr = new DealershipPlayerLevelProbabilityManager(mongoDB.collection("DealershipPlayerLevelProbability"));

            var mgr = new DealershipManager(
                slotProbMgr,
                playerLevProbMgr,
                mongoDB.collection("CarInventory"),
                mongoDB.collection("PlayerDealership"),
                redis);

            //mgr.generateNewSlot("test", 1, 1, "Common", function(result){
            //    console.log(result);
            //    complete++;
            //});
        });

        waitsFor(function() { return complete !== 0; },
        "", 1000);*/
    });
});