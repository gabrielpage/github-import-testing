// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("basic scheduler tests", function(){
    
    var scheduler = Spark.getScheduler();
    
    test("getScheduler, is not null", function(){
        
        assertThat(scheduler, is(not(null)));
    });
    
    test("inSeconds, schedules a run for the given module in seconds and assigns Script Data", function(){
        
        assertThat(scheduler.inSeconds("some_module", 60, {myData : "myData"}), is(true));
        assertThat(scheduler.inSeconds("some_other_module", 0, {myData : "myData"}), is(true));
    });
    
    test("inSeconds with null key, schedules a run for null?/no module", function(){
        
        assertThat(scheduler.inSeconds(null, 60, {myData : "myData"}), is(true));
    });
    
    test("inSeconds with null time, Throws Method Not Found Error", function(){
        
        try{
        scheduler.inSeconds("some_module", null, {myData : "myData"});
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.schedule.impl.SparkSchedulerImpl.inSeconds(string,null,object"));
        }
    });
    
    test("inSeconds, with null data, schedules a run for with null?/no Script Data", function(){
        
        assertThat(scheduler.inSeconds("some_module", 60, null), is(true));
    });
    
    test("inSeconds, with a key id, schedules a run for the given module in seconds and assigns Script Data", function(){
        
        assertThat(scheduler.inSeconds("some_module", 60, {myData : "myData"}, "simpleKey"), is(true));
    });
    
    test("inSeconds, with a key id, with null key, schedules a run for null?/no module", function(){
        
        assertThat(scheduler.inSeconds(null, 60, {myData : "myData"}, "simpleKey"), is(true));
    });
    
    test("inSeconds, with a key id, with null time, Throws Method Not Found Error", function(){
        
        try{
        scheduler.inSeconds("some_module", null, {myData : "myData"}, "simpleKey");
        fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.schedule.impl.SparkSchedulerImpl.inSeconds(string,null,object,string"));
        }
    });
    
    test("inSeconds, with a key id, with null data, schedules a run for with null?/no Script Data", function(){
        
        assertThat(scheduler.inSeconds("some_module", 60, null, "simpleKey"), is(true));
    });
    
    test("inSeconds, with a key id, with null key id, shcedules a run with of the module with a null?/no key id", function(){
        
        assertThat(scheduler.inSeconds("some_module", 60, {myData : "myData"}, null), is(true));
    });
    
    test("cancel, cancels the execution of a module", function(){
        
        scheduler.cancel("simpleKey");
    });
    
    test("cancel, with a null key id, cancels the execution of a module", function(){
        
        scheduler.cancel(null);
    });
});