// ====================================================================================================
//
// Cloud Code for EXEC_TESTS, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var results = {total: 0, passed : 0, failed: 0, failures:{}}
var scriptUnderTest = "";
var currentSuite = "";
var tests = Spark.data.run;
if(multipleTests(tests)){
    var length = tests.length;
    for(var i = 0; i < length; i++){
        execute(tests[i]);
    }
} else {
    execute(tests);    
}

Spark.setScriptData("results", results);

function execute(test){
    scriptUnderTest = test;
    require(test);
    scriptUnderTest = "";
}

function suite(name, suite) {
    currentSuite = name;
    suite();
    currentSuite = "";
}

function test(name, test){
    
    try{
      test(Spark.data.context);
      results.passed++;
    } catch(e){
     results.failed++;
     if(results.failures[scriptUnderTest] == null){
         results.failures[scriptUnderTest] = [];
     }
     results.failures[scriptUnderTest].push({suite: currentSuite, name: name, reason: '' + e});
    }
    results.total++;
}

function multipleTests(tests){
    if(tests.constructor == Array){
        return true;
    }
    return false;
}