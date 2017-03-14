"use strict";

requireOnce("Dealership");
var mongo = requireOnce("mongodb");

describe("Dealership slot probability manager", function () {
    var mongoClient;
    var mongoDB;

    beforeEach(function() {
        mongoDB = null;

        runs(function () {
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
        mongoDB.close();
    });

    it ("should return random expiry and refresh times within configured probability ranges", function () {
        var mgr = null;
        var complete = 0;
        var dropped = false;
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var expiryRanges =
        {
            "LessThan300" : 0,
            "LessThan3600" : 0,
            "LessThan7200" : 0,
            "LessThan10800" : 0,
            "LessThan14400" : 0,
            "LessThan28800" : 0,
            "LessThan36000" : 0,
            "LessThan43200" : 0,
            "LessThan50400" : 0,
            "LessThan72000" : 0,
            "LessThan86400" : 0,
            "LessThan144000" : 0,
            "LessThan172801" : 0
        };

        // Do not change these without recalculating the probabilities!
        var records = [
                    {
                        "ExpiryRangeStart" : 300,
                        "ExpiryRangeEnd" : 3600,
                        "TimeToRefreshRangeStart" : 150,
                        "TimeToRefreshRangeEnd" : 1800,
                        "Weight" : 3
                    },
                    {
                        "ExpiryRangeStart" : 3600,
                        "ExpiryRangeEnd" : 28800,
                        "TimeToRefreshRangeStart" : 1800,
                        "TimeToRefreshRangeEnd" : 14400,
                        "Weight" : 3
                    },
                    {
                        "ExpiryRangeStart" : 7200,
                        "ExpiryRangeEnd" : 36000,
                        "TimeToRefreshRangeStart" : 3600,
                        "TimeToRefreshRangeEnd" : 18000,
                        "Weight" : 1
                    },
                    {
                        "ExpiryRangeStart" : 10800,
                        "ExpiryRangeEnd" : 43200,
                        "TimeToRefreshRangeStart" : 5400,
                        "TimeToRefreshRangeEnd" : 21600,
                        "Weight" : 1
                    },
                    {
                        "ExpiryRangeStart" : 14400,
                        "ExpiryRangeEnd" : 50400,
                        "TimeToRefreshRangeStart" : 7200,
                        "TimeToRefreshRangeEnd" : 25200,
                        "Weight" : 1
                    },
                    {
                        "ExpiryRangeStart" : 72000,
                        "ExpiryRangeEnd" : 86400,
                        "TimeToRefreshRangeStart" : 36000,
                        "TimeToRefreshRangeEnd" : 43200,
                        "Weight" : 2
                    },
                    {
                        "ExpiryRangeStart" : 144000,
                        "ExpiryRangeEnd" : 172800,
                        "TimeToRefreshRangeStart" : 72000,
                        "TimeToRefreshRangeEnd" : 86400,
                        "Weight" : 1
                    }
                ];

        runs(function() {
            mongoDB.collection("DealershipSlotProbability").drop(function (err, result) {
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
            "MongoDB should have dropped the DealershipSlotProbability collection by now",
            1000);

        runs(function () {
            mongoDB.collection("DealershipSlotProbability").insertMany(
                records,
                null,
                function (error, result) {
                    complete += result.insertedCount;
                }
            )
        });

        waitsFor(function () { return complete === 7; },
            "MongoDB should have inserted 7 records into the DealershipSlotProbability collection by now",
            1000);

        runs(function () {
            complete = 0;
            mgr = new DealershipSlotProbabilityManager(mongoDB.collection("DealershipSlotProbability"));
            // Load from the database
            mgr.getTimes(function (result) {
                complete++;
            });
        });

        waitsFor(function () { return complete === 1; },
            "Manager should be set",
            100);

        runs(function () {
            complete = 0;

            for (var i = 0; i < 100000; i++)
            {
                mgr.getTimes(function(result) {
                    var expiry = result.getRandomExpiry();
                    if (expiry < min) {
                        min = expiry;
                    }

                    if (expiry > max) {
                        max = expiry;
                    }

                    if (expiry < 300) {
                        expiryRanges.LessThan300++;
                    }

                    if (expiry < 3600) {
                        expiryRanges.LessThan3600++;
                    }

                    if (expiry < 28800) {
                        expiryRanges.LessThan28800++;
                    }

                    if (expiry < 7200) {
                        expiryRanges.LessThan7200++;
                    }

                    if (expiry < 36000) {
                        expiryRanges.LessThan36000++;
                    }

                    if (expiry < 10800) {
                        expiryRanges.LessThan10800++;
                    }

                    if (expiry < 43200) {
                        expiryRanges.LessThan43200++;
                    }

                    if (expiry < 14400) {
                        expiryRanges.LessThan14400++;
                    }

                    if (expiry < 50400) {
                        expiryRanges.LessThan50400++;
                    }

                    if (expiry < 72000) {
                        expiryRanges.LessThan72000++;
                    }

                    if (expiry < 86400) {
                        expiryRanges.LessThan86400++;
                    }

                    if (expiry < 144000) {
                        expiryRanges.LessThan144000++;
                    }

                    if (expiry <= 172800) {
                        expiryRanges.LessThan172801++;
                    }

                    complete++;
                });
            }
        });

        waitsFor(function () { return complete === 100000; },
            "Should have calculated 100000 random expiry times by now",
            3000);

        runs(function() {
            expect(min).not.toBeLessThan(300);
            expect(max).not.toBeGreaterThan(172800);
            expect(expiryRanges.LessThan300).toBe(0);
            expect(expiryRanges.LessThan172801).toBe(100000);

            var lessThan3600Probability = (3 / 12) * 100000;

            var lessThan7200Probability = ( (3 / 12) * 100000 )
                                            + ( ( (7200 - 3600) / (28800 - 3600) ) * ( (3/12) * 100000 ) );

            var lessThan10800Probability = ( (3 / 12) * 100000)
                                            + ( ( (10800 - 3600) / (28800 - 3600) ) * ( (3/12) * 100000 ) )
                                            + ( ( (10800 - 7200) / (36000 - 7200) ) * ( (1 / 12) * 100000 ) );

            var lessThan14400Probability = ( (3 / 12) * 100000)
                                            + ( ( (14400 - 3600) / (28800 - 3600) ) * ( (3/12) * 100000 ) )
                                            + ( ( (14400 - 7200) / (36000 - 7200) ) * ( (1 / 12) * 100000 ) )
                                            + ( ( (14400 - 10800) / (43200 - 10800) ) * ( (1 / 12) * 100000 ) );

            var lessThan28800Probability = ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( ( (28800 - 7200) / (36000 - 7200) ) * ( (1 / 12) * 100000 ) )
                                            + ( ( (28800 - 10800) / (43200 - 10800) ) * ( (1 / 12) * 100000 ) )
                                            + ( ( (28800 - 14400) / (50400 - 10800) ) * ( (1 / 12) * 100000 ) );

            var lessThan36000Probability =  ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( ( (36000 - 10800) / (43200 - 10800) ) * ( (1/12) * 100000 ) )
                                            + ( ( (36000 - 14400) / (50400 - 14400) ) * ( (1/12) * 100000 ) );

            var lessThan43200Probability = ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( ( (43200 - 14400) / (50400 - 10800) ) * ( (1 / 12) * 100000 ) );

            var lessThan50400Probability =  ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 );

            var lessThan72000Probability = ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 );

            var lessThan86400Probability = ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (2 / 12) * 100000 );

            var lessThan144000Probability = ( (3 / 12) * 100000)
                                            + ( (3 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (1 / 12) * 100000 )
                                            + ( (2 / 12) * 100000 );

            expect(expiryRanges.LessThan3600).toBeGreaterThan(lessThan3600Probability * 0.95, "Expected <3600 to be > " + (lessThan3600Probability * 0.95) + " but was " + expiryRanges.LessThan3600);
            expect(expiryRanges.LessThan3600).toBeLessThan(lessThan3600Probability * 1.05, "Expected <3600 to be < " + (lessThan3600Probability * 1.05) + " but was " + expiryRanges.LessThan3600);

            expect(expiryRanges.LessThan7200).toBeGreaterThan(lessThan7200Probability * 0.95, "Expected <7200 to be > " + (lessThan7200Probability * 0.95) + " but was " + expiryRanges.LessThan7200);
            expect(expiryRanges.LessThan7200).toBeLessThan(lessThan7200Probability * 1.05, "Expected <7200 to be < " + (lessThan7200Probability * 1.05) + " but was " + expiryRanges.LessThan7200);

            expect(expiryRanges.LessThan10800).toBeGreaterThan(lessThan10800Probability * 0.95, "Expected <10800 to be > " + (lessThan10800Probability * 0.95) + " but was " + expiryRanges.LessThan10800);
            expect(expiryRanges.LessThan10800).toBeLessThan(lessThan10800Probability * 1.05, "Expected <10800 to be < " + (lessThan10800Probability * 1.05) + " but was " + expiryRanges.LessThan10800);

            expect(expiryRanges.LessThan14400).toBeGreaterThan(lessThan14400Probability * 0.95, "Expected <14400 to be > " + (lessThan14400Probability * 0.95) + " but was " + expiryRanges.LessThan14400);
            expect(expiryRanges.LessThan14400).toBeLessThan(lessThan14400Probability * 1.05, "Expected <14400 to be < " + (lessThan14400Probability * 1.05) + " but was " + expiryRanges.LessThan14400);

            expect(expiryRanges.LessThan28800).toBeGreaterThan(lessThan28800Probability * 0.95, "Expected <28800 to be > " + (lessThan28800Probability * 0.95) + " but was " + expiryRanges.LessThan28800);
            expect(expiryRanges.LessThan28800).toBeLessThan(lessThan28800Probability * 1.05, "Expected <28800 to be < " + (lessThan28800Probability * 1.05) + " but was " + expiryRanges.LessThan28800);

            expect(expiryRanges.LessThan36000).toBeGreaterThan(lessThan36000Probability * 0.95, "Expected <36000 to be > " + (lessThan36000Probability * 0.95) + " but was " + expiryRanges.LessThan36000);
            expect(expiryRanges.LessThan36000).toBeLessThan(lessThan36000Probability * 1.05, "Expected <36000 to be < " + (lessThan36000Probability * 1.05) + " but was " + expiryRanges.LessThan36000);

            expect(expiryRanges.LessThan43200).toBeGreaterThan(lessThan43200Probability * 0.95, "Expected <43200 to be > " + (lessThan43200Probability * 0.95) + " but was " + expiryRanges.LessThan43200);
            expect(expiryRanges.LessThan43200).toBeLessThan(lessThan43200Probability * 1.05, "Expected <43200 to be < " + (lessThan43200Probability * 1.05) + " but was " + expiryRanges.LessThan43200);

            expect(expiryRanges.LessThan50400).toBeGreaterThan(lessThan50400Probability * 0.95, "Expected <50400 to be > " + (lessThan50400Probability * 0.95) + " but was " + expiryRanges.LessThan50400);
            expect(expiryRanges.LessThan50400).toBeLessThan(lessThan50400Probability * 1.05, "Expected <50400 to be < " + (lessThan50400Probability * 1.05) + " but was " + expiryRanges.LessThan50400);

            expect(expiryRanges.LessThan72000).toBeGreaterThan(lessThan72000Probability * 0.95, "Expected <72000 to be > " + (lessThan72000Probability * 0.95) + " but was " + expiryRanges.LessThan72000);
            expect(expiryRanges.LessThan72000).toBeLessThan(lessThan72000Probability * 1.05, "Expected <72000 to be < " + (lessThan72000Probability * 1.05) + " but was " + expiryRanges.LessThan72000);

            expect(expiryRanges.LessThan86400).toBeGreaterThan(lessThan86400Probability * 0.95, "Expected <86400 to be > " + (lessThan86400Probability * 0.95) + " but was " + expiryRanges.LessThan86400);
            expect(expiryRanges.LessThan86400).toBeLessThan(lessThan86400Probability * 1.05, "Expected <86400 to be < " + (lessThan86400Probability * 1.05) + " but was " + expiryRanges.LessThan86400);

            expect(expiryRanges.LessThan144000).toBeGreaterThan(lessThan144000Probability * 0.95, "Expected <144000 to be > " + (lessThan144000Probability * 0.95) + " but was " + expiryRanges.LessThan144000);
            expect(expiryRanges.LessThan144000).toBeLessThan(lessThan144000Probability * 1.05, "Expected <144000 to be < " + (lessThan144000Probability * 1.05) + " but was " + expiryRanges.LessThan144000);

            //console.log("Min: " + min);
            //console.log("Max: " + max);
            //for (var prop in expiryRanges) {
            //    console.log(prop + ": " + (expiryRanges[prop] / 1000).toFixed(2) + "%");
            //}
        });
    });
});