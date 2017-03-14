"use strict";

requireOnce("Dealership");
var mongo = requireOnce("mongodb");

describe("Dealership player level probability manager", function () {
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

    it ("should return correct probabilities per player level", function () {
        var mgr = null;
        var complete = 0;
        var dropped = false;
        var classes = { "ClassC" : 0, "ClassB" : 0, "ClassA" : 0, "ClassS" : 0 };
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
            mgr = new DealershipPlayerLevelProbabilityManager(mongoDB.collection("DealershipPlayerLevelProbability"));
            // Load from the database
            mgr.getLevel(0, function (result) {
                complete++;
            });
        });

        waitsFor(function () { return complete === 1; },
            "Manager should be set",
            100);

        runs(function () {
            complete = 0;
            classes = { "ClassC" : 0, "ClassB" : 0, "ClassA" : 0, "ClassS" : 0 };

            for (var i = 0; i < 10000; i++)
            {
                for (var j = 1; j < 13; j++) {
                    mgr.getLevel(j, function (result) {
                        expect(result).not.toBeNull();
                        classes[result.getRandomClass()]++;
                        complete++;
                    });
                }
            }
        });

        waitsFor(function () { return complete === 120000; },
            "Should have calculated 14400 random classes for levels in the range 1 - 12 by now",
            3000);

        runs(function() {
            var classCProbability = (8 / 12) * 120000;
            var classBProbability = (2 / 12) * 120000;
            var classAProbability = (1 / 12) * 120000;
            var classSProbability = (1 / 12) * 120000;

            expect(classes.ClassC).toBeGreaterThan(classCProbability * 0.95, "Expected ClassC to be > " + (classCProbability * 0.95) + " but was " + classes.ClassC);
            expect(classes.ClassC).toBeLessThan(classCProbability * 1.05, "Expected ClassC to be < " + (classCProbability * 1.05) + " but was " + classes.ClassC);

            expect(classes.ClassB).toBeGreaterThan(classBProbability * 0.95, "Expected ClassB to be > " + (classBProbability * 0.95) + " but was " + classes.ClassB);
            expect(classes.ClassB).toBeLessThan(classBProbability * 1.05, "Expected ClassB to be < " + (classBProbability * 1.05) + " but was " + classes.ClassB);

            expect(classes.ClassA).toBeGreaterThan(classAProbability * 0.95, "Expected ClassA to be > " + (classAProbability * 0.95) + " but was " + classes.ClassA);
            expect(classes.ClassA).toBeLessThan(classAProbability * 1.05, "Expected ClassA to be < " + (classAProbability * 1.05) + " but was " + classes.ClassA);

            expect(classes.ClassS).toBeGreaterThan(classSProbability * 0.95, "Expected ClassS to be > " + (classSProbability * 0.95) + " but was " + classes.ClassS);
            expect(classes.ClassS).toBeLessThan(classSProbability * 1.05, "Expected ClassS to be < " + (classSProbability * 1.05) + " but was " + classes.ClassS);

            complete = 0;
            classes = { "ClassC" : 0, "ClassB" : 0, "ClassA" : 0, "ClassS" : 0 };

            for (var i = 0; i < 10000; i++)
            {
                for (var j = 13; j < 25; j++) {
                    mgr.getLevel(j, function (result) {
                        expect(result).not.toBeNull();
                        classes[result.getRandomClass()]++;
                        complete++;
                    });
                }
            }
        });

        waitsFor(function () { return complete == 120000; },
            "Should have calculated 14400 random classes for levels in the range 13 - 24 by now",
            3000);

        runs(function() {
            var classCProbability = (3 / 12) * 120000;
            var classBProbability = (6 / 12) * 120000;
            var classAProbability = (2 / 12) * 120000;
            var classSProbability = (1 / 12) * 120000;

            expect(classes.ClassC).toBeGreaterThan(classCProbability * 0.95, "Expected ClassC to be > " + (classCProbability * 0.95) + " but was " + classes.ClassC);
            expect(classes.ClassC).toBeLessThan(classCProbability * 1.05, "Expected ClassC to be < " + (classCProbability * 1.05) + " but was " + classes.ClassC);

            expect(classes.ClassB).toBeGreaterThan(classBProbability * 0.95, "Expected ClassB to be > " + (classBProbability * 0.95) + " but was " + classes.ClassB);
            expect(classes.ClassB).toBeLessThan(classBProbability * 1.05, "Expected ClassB to be < " + (classBProbability * 1.05) + " but was " + classes.ClassB);

            expect(classes.ClassA).toBeGreaterThan(classAProbability * 0.95, "Expected ClassA to be > " + (classAProbability * 0.95) + " but was " + classes.ClassA);
            expect(classes.ClassA).toBeLessThan(classAProbability * 1.05, "Expected ClassA to be < " + (classAProbability * 1.05) + " but was " + classes.ClassA);

            expect(classes.ClassS).toBeGreaterThan(classSProbability * 0.95, "Expected ClassS to be > " + (classSProbability * 0.95) + " but was " + classes.ClassS);
            expect(classes.ClassS).toBeLessThan(classSProbability * 1.05, "Expected ClassS to be < " + (classSProbability * 1.05) + " but was " + classes.ClassS);
        });
    });

    it ("should return undefined for a non-configured player level", function () {
        var mgr = null;
        var dropped = false;
        var level = null;
        var complete = 0;
        runs( function () {
            mongoDB.collection("DealershipPlayerLevelProbability").drop(function (err, result) {
                dropped = result;
            });
        });

        waitsFor(function () { return dropped !== false; },
            "MongoDB should have returned by now",
            1000);

        runs(function () {
            mgr = new DealershipPlayerLevelProbabilityManager(mongoDB.collection("dealershipPlayerLevelProbability"))
            mgr.getLevel(0, function(result) {
                level = result;
                complete++;
            });
        });

        waitsFor(function () { return complete === 1; },
            "MongoDB should have returned by now",
            1000);

        runs(function () {
            expect(level).toBeUndefined();
        });
    });
});