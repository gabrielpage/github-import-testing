// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("basic logging tests", function(){
    
    var logger = Spark.getLog();
    var myLog = Spark.runtimeCollection("log");
    
    test("getLog, is not null", function(){
        assertThat(logger, is(not(null)));
    });
    
    test("debug, records value into the spark.log table with the level set to debug", function(){
        logger.debug({testMessage: "debug message"});
        assertThat(myLog.remove({log: {testMessage: "debug message"}}), is(true));
    });
    
    test("info, records value into the spark.log table with the level set to debug", function(){
        logger.info({testMessage: "info message"});
        assertThat(myLog.remove({log: {testMessage: "info message"}}), is(true));
    });
    
    test("warn, records value into the spark.log table with the level set to debug", function(){
        logger.warn({testMessage: "warn message"});
        assertThat(myLog.remove({log: {testMessage: "warn message"}}), is(true));
    });
    
    test("error, records value into the spark.log table with the level set to debug", function(){
        logger.error({testMessage: "error message"});
        assertThat(myLog.remove({log: {testMessage: "error message"}}), is(true));
    });
});