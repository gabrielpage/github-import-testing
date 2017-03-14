// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
require("GeneralUtilities");
require("VersionedDocumentUtilities");

//     sort out cohortSets -> ABTests and work out the format ... and use versioned document 2

// Return an AB test name if specified globally.
// Module: CohortUtilities
function GetBaseCurrentABTestName() {
    var ABTestProperty = Spark.getProperties().getProperty("ABTest");
    if (ABTestProperty === null || ABTestProperty === undefined) {
        return null;
    }
    var name = ABTestProperty.Name;
    if (name === null || name === undefined) {
        return null;
    }
    return name;
}

// Return name and cohort of the current AB test, or null if there isn't one.
// returns e.g. { ABTest : "name", Cohort : "A"}
// Module: CohortUtilities
function GetCurrentABTestDetails(playerId) {
    var player = Spark.loadPlayer(playerId);

    var ABTestName = player.getSegmentValue("ABTest");
    var cohort = player.getSegmentValue("Cohort");

    if (ABTestName !== null && ABTestName !== undefined &&
        cohort !== null && cohort !== undefined) {
        return { "ABTest" : ABTestName, "Cohort" : cohort };
    }

    return null;
}

function GetABTest(name) {
    var ABTestCollection = Spark.metaCollection("ABTests");
    if (ABTestCollection === null || ABTestCollection === undefined) {
        ErrorMessage("There is no 'ABTests' collection");
        return null;
    }
    var ABTest = ABTestCollection.findOne({"Name": name});
    if (ABTest === null || ABTest === undefined) {
        return null;
    }
    return ABTest;
}

function RemoveABTests(ABTests) {
    var ABTestCollection = Spark.metaCollection("ABTests");
    if (ABTestCollection === null || ABTestCollection === undefined) {
        ErrorMessage("There is no 'ABTests' collection");
        return false;
    }

    var names = [];

    for (var i = 0; i < ABTests.length; ++i) {
        var name = ABTests[i].Name;

        names.push(name);
    }

    var ok = ABTestCollection.remove({
        Name: {
            "$in": names
        }
    });

    return ok;
}

function UpdateABTests(cohortSets) {
    var ABTestCollection = Spark.metaCollection("ABTests");
    if (ABTestCollection === null || ABTestCollection === undefined) {
        ErrorMessage("There is no \"ABTests\" collection");
        return false;
    }

    var ok = true;

    for (var i = 0; i < cohortSets.length; ++i) {
        var name = cohortSets[i].Name;

        var done = ABTestCollection.update({
            "Name" : name
        },
        cohortSets[i],
        /* upsert */ true,
        /* multi */ false);

        if (!done) {
            ok = false;
        }
    }

    return ok;
}

function AddCollectionToABTest(ABTestName, collectionName) {
    var ABTestCollection = Spark.metaCollection("ABTests");
    if (ABTestCollection === null || ABTestCollection === undefined) {
        ErrorMessage("There is no \"ABTests\" collection");
        return false;
    }

    var ABTest = ABTestCollection.findOne({
        Name: ABTestName
    });

// put collectionName into OverrideCollections and CohortCollections
    ABTest.OverrideCollections[collectionName] = true;

    // not very efficient, but simplicity beats all in editing ...
    RebuildCohortCollections(ABTest);

    var ok = ABTestCollection.update({
        Name: ABTestName
    },
    ABTest);

    return ok;
}


function RebuildCohortCollections(ABTest) {
    ABTest.CohortCollections = {};

    for (cohortName in ABTest.Cohorts) {
        if (ABTest.Cohorts[cohortName].Baseline) {
            // baseline uses default everything
            ABTest.CohortCollections[cohortName] = {};
        }
        else {
            var postfix = FormatCohortSuffix(ABTest.Name, cohortName);

            ABTest.CohortCollections[cohortName] = {};
            var currentCohortCollections = ABTest.CohortCollections[cohortName];

            for (overrideCollectionName in ABTest.OverrideCollections) {
                 currentCohortCollections[overrideCollectionName] = overrideCollectionName + postfix;
            }
        }
    }
}

// This function is internal to CohortUtilities.
// Note that contrary to our convention it takes a player rather than a playerId for performance
// reasons.
// returns e.g. { ABTest : "name", Cohort : "A"}
// Module: CohortUtilities
function GetOrEnterABTest_(player, isNewPlayer) {

    var ABTestName = GetBaseCurrentABTestName();
    if (ABTestName === null || ABTestName === undefined) {
        // No AB test is enabled
        // Remove player's segment values
        player.setSegmentValue("ABTest", null);
        player.setSegmentValue("Cohort", null);
        return null;
    }

    var ABTest = GetABTest(ABTestName);
    if (ABTest === null || ABTest === undefined) {
        // no such AB test exists
        // Remove player's segment values
        player.setSegmentValue("ABTest", null);
        player.setSegmentValue("Cohort", null);
        return null;
    }

    var abTestName = player.getSegmentValue("ABTest");
    var cohort = player.getSegmentValue("Cohort");

    if (abTestName !== null && abTestName !== undefined &&
        abTestName === ABTestName) {
        // Already in this test...
        if (cohort !== null && cohort !== undefined) {
            // ok we're in a cohort, just return that
            return {
                "ABTest" : abTestName,
                "Cohort" : cohort
            };
        }
    }

    if (ABTest.AffectNewUsersOnly && !isNewPlayer) {
        // Test is only for new players, and we're not a new player
        return null;
    }

    // Ok. We need to chose a cohort for ourselves and store it
    var ABTestsRuntimeCollection = Spark.runtimeCollection("ABTestsRuntimeData");

    // now increment the participant count, inserting if required and return it to us!
    var query = { "Name" : ABTestName };
    var fields = { "ParticipantCount" : 1 };
    var sort = {}; // don't care, Name is uniquely indexed
    var remove = false;
    // if ParticipantCount is not present it's considered to be 0
    var update = {
        $inc: { "ParticipantCount" : 1 },
    };
    var returnNew = true; // need to return the new value, otherwise we get nothing on insert
    var upsert = true; // need to insert if it isn't there!
	var ABTestRuntimeData = ABTestsRuntimeCollection.findAndModify(query, fields, sort, remove, update, returnNew, upsert);

    if (ABTestRuntimeData === null || ABTestRuntimeData === undefined) {
        // shouldn't happen unless we've effed up the params to findAndModify
        Spark.getLog().error(FormatString(
            "ABTestsRuntimeCollection.findAndModify() returned null. Wtf?! query: '{0}', update: '{1}'",
            query,
            update));

        return null;
    }

    // we get the document after insert / update, so the first count value we see is 1
    // alway subtract 1 from this so we get a sequence of numbers starting at 0 and give out
    // cohorts starting with the one which is alphabetically first
    var participantCount = ABTestRuntimeData.ParticipantCount - 1;

    if (participantCount < 0) {
        Spark.getLog().error(FormatString(
            "participantCount is < 0. Wtf?! Value: {0}",
            participantCount));

        return null;
    }

    // sort to ensure stability of order, otherwise who knows?
    var sortedCohortNames = Object.keys(ABTest.Cohorts).sort();


    var cohortIndex = participantCount % sortedCohortNames.length;

    var cohort = sortedCohortNames[cohortIndex];

    player.setSegmentValue("Cohort", cohort);
    player.setSegmentValue("ABTest", ABTestName);

    return {
        "ABTest" : ABTestName,
        "Cohort" : cohort
    };
}

// should only be called from AuthenticationResponse!
// Module: CohortUtilities
function UpdateABTestSetup(playerId, isNewPlayer) {
    var player = Spark.loadPlayer(playerId);

    // Sort out a cohort for us (if we don't have one already and we need one)
    var testDetails = GetOrEnterABTest_(player, isNewPlayer);

    if (testDetails !== null && testDetails !== undefined) {
        Spark.setScriptData("ABTest", testDetails.ABTest);
        Spark.setScriptData("Cohort", testDetails.Cohort);
    }
}

// Global variable to store the mapping table so we only fetch it once per request.
// Small optimisation, not as significant as GS keeping the meta collection results and
// hopefully segmentValues in memory while you are logged in.
// This should only be used by GetCollectionName()
var CohortCollections = null;

function GetCollectionName(playerId, baseCollectionName) {
    // CohortCollections is global
    if (CohortCollections === null || CohortCollections === undefined) {
        var details =  GetCurrentABTestDetails(playerId);

        if (details === null || details === undefined) {
            CohortCollections = {};
        }
        else {
            var ABTest = Spark.metaCollection("ABTests").findOne({"Name" : details.ABTest});

            if (ABTest === null || ABTest === undefined) {
                CohortCollections = {};
            }
            else {
                CohortCollections = ABTest.CohortCollections[details.Cohort];

                if (CohortCollections === null || CohortCollections === undefined) {
                    CohortCollections = {};
                }
            }
        }
    }

    var overriddenName = CohortCollections[baseCollectionName];

    if (overriddenName !== null && overriddenName !== undefined) {
        return overriddenName;
    }

    return baseCollectionName;
}

function FormatCohortSuffix(ABTestName, cohortName) {
    return "_" + ABTestName + "_" + cohortName;
}