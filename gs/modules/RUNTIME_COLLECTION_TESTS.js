// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

function runtimeSetup(){
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    runtime.drop();
    runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1});
    runtime.insert({fieldA: "fieldA_2", fieldB: "fieldB_2", numericValue: 2});
    runtime.insert({fieldA: "fieldA_3", fieldB: "fieldB_3", numericValue: 3});
    runtime.insert({fieldA: "fieldA_4", fieldB: "fieldB_4", numericValue: 4});
    runtime.insert({fieldA: "fieldA_5", fieldB: "fieldB_5", numericValue: 5});
}

suite("Simple Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    runtimeSetup();
    test("Loading a collection that doesn't exist returns an empty collection", function(){
        assertThat(Spark.runtimeCollection("invalid_name"), is(not(null)));
        assertThat(Spark.runtimeCollection("invalid_name").count(), is(0));
    });
    
    test("Loading a collection that exists returns that collection", function(){
        assertThat(runtime, is(not(null)));
        assertThat(runtime.count(), is(greaterThanOrEqualTo(0)));
    });
    
     test("count returns 1 when given one document query", function(){
         var documentCount = runtime.count({fieldA: "fieldA_1"});
         assertThat(documentCount, is(1));
     });
    
    test("count without params returns all Documents", function(){
        var documentCount = runtime.count();
        assertThat(documentCount, is(greaterThan(1)));
    });
    
    test("count with empty params returns all Documents", function(){
        var documentCount = runtime.count({});
        assertThat(documentCount, is(greaterThan(1)));
    });
    
    test("count with null params returns all Documents", function(){
        var documentCount = runtime.count(null);
        assertThat(documentCount, is(greaterThan(1)));
    });
    
    test("getLastError contains some data", function(){
        
        assertThat(JSON.stringify(runtime.getLastError()), contains("serverUsed"));
    });
});

suite("findOne Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    runtimeSetup();
    test("findOne with query returns that Document", function(){
        var firstDocument = runtime.findOne({fieldA: "fieldA_4"});
        assertThat(firstDocument.fieldB, is("fieldB_4"));
    });
    
    test("findOne without params returns the first Document", function(){
        var firstDocument = runtime.findOne();
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with empty query param returns the first Document", function(){
        var firstDocument = runtime.findOne({});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null query param returns the first Document", function(){
        var firstDocument = runtime.findOne(null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with query and field remove returns that Document without the specified field", function(){
        var theDocument = runtime.findOne({fieldA: "fieldA_4"},{numericValue:0});
        assertThat(theDocument.fieldB, is("fieldB_4"));
        assertThat(theDocument.numericValue, is(notDefined()));
    });
    
    test("findOne with empty query and remove value params returns the first Document", function(){
        var firstDocument = runtime.findOne({},{});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null query and remove value params returns the first Document", function(){
        var firstDocument = runtime.findOne(null,null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with empty params returns the first Document", function(){
        var firstDocument = runtime.findOne({},{},{});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null params returns the first Document", function(){
        var firstDocument = runtime.findOne(null,null,null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with sort -1 returns the last Document", function(){
        var lastDocument = runtime.findOne({}, {}, {_id: -1});
        var findLast = runtime.find().sort({_id: -1}).limit(1).toArray();
        assertThat(lastDocument.fieldA, is(findLast[0].fieldA));
    });
    
    test("findOne with a query returns that Document", function(){
        var theDocument = runtime.findOne({fieldA:"fieldA_3"}, {}, {});
        assertThat(theDocument.fieldB, is("fieldB_3"));
    });
    
    test("findOne requesting a field be removed does not return that field", function(){
        var theDocument = runtime.findOne({}, {numericValue:1}, {});
        assertThat(theDocument.numericValue, is(not(null)));
        
        var theDocument = runtime.findOne({}, {numericValue:0}, {});
        assertThat(theDocument.numericValue, is(notDefined()));
    });
});

suite("distinct Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
   
    runtimeSetup();
    test("distinct returns distinct values for the given key", function(){
        var distinctValues = runtime.distinct("fieldA");
        assertThat(distinctValues[0], is("fieldA_1"));
        assertThat(distinctValues[1], is("fieldA_2"));
        assertThat(distinctValues[2], is("fieldA_3"));
    });
    
    test("distinct with a null key, returns an empty object array", function(){
        var distinctValues = runtime.distinct(null);
        assertThat(distinctValues, is([]));
    });
    
    test("distinct with an empty key, returns an empty object array", function(){
        var distinctValues = runtime.distinct({});
        assertThat(distinctValues, is([]));
    });
});

suite("find Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    runtimeSetup();
    test("find with query returns that Document", function(){
        var theDocument = runtime.find({fieldA: "fieldA_4"});
        assertThat(theDocument.count(), is(1));
    });
    
    test("find without params returns the Documents", function(){
        var theDocument = runtime.find();
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with empty query param returns the Documents", function(){
        var theDocument = runtime.find({});
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with null query param returns the Documents", function(){
        var theDocument = runtime.find(null);
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with query and field remove returns that Document without the specified field", function(){
        var theDocument = runtime.find({fieldA: "fieldA_4"},{numericValue:0});
        assertThat(JSON.stringify(theDocument.toArray()), contains("fieldB_4"));
        assertThat(JSON.stringify(theDocument.toArray()), not(contains("numericValue")));
        assertThat(theDocument.count(), is(1));
    });
    
    test("find with empty query and remove value params returns the Documents", function(){
        var theDocument = runtime.find({},{});
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with null query and remove value params returns the Documents", function(){
        var theDocument = runtime.find(null,null);
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with sort set to -1 returns reversed order of Documents", function(){
        var x = runtime.find().sort({_id: -1}).toArray();
        var y = runtime.find().sort({_id: 1}).toArray();
        
        assertThat(y.reverse(), is(x));
    });
    
    test("find with sort set to -1 and skip 1 returns reversed order of Documents", function(){
        var x = runtime.find().sort({_id: -1}).skip(1).toArray();
        var y = runtime.find().sort({_id: 1}).limit(x.length).toArray();
        
        assertThat(y.reverse(), is(x));
    });
    
    test("find with sort set to -1 and limit 2 returns reversed order of Documents", function(){
        var x = runtime.find().sort({_id: -1}).limit(2).toArray();
        var ySize = runtime.find().size();
        var y = runtime.find().sort({_id: 1}).skip(ySize-x.length).toArray();
        
        assertThat(y.reverse(), is(x));
    });
    
    test("find with sort set to -1, limit 2 and skip 1 returns reversed order of Documents", function(){
        var x = runtime.find().sort({_id: -1}).skip(1).limit(2).toArray();
        var ySkip = runtime.find().skip(1).size()-x.length;
        var y = runtime.find().sort({_id: 1}).skip(ySkip).limit(2).toArray();
        
        assertThat(y.reverse(), is(x));
     });
    
    test("find, order of sort, limit and skip shouldn't matter", function(){
         var a = runtime.find().sort({_id: -1}).skip(1).limit(2).toArray();
         var b = runtime.find().sort({_id: -1}).limit(2).skip(1).toArray();
         var c = runtime.find().skip(1).sort({_id: -1}).limit(2).toArray();
         var d = runtime.find().skip(1).limit(2).sort({_id: -1}).toArray();
         var e = runtime.find().limit(2).sort({_id: -1}).skip(1).toArray();
         var f = runtime.find().limit(2).skip(1).sort({_id: -1}).toArray();
         
         assertThat(a, is(b));
         assertThat(a, is(c));
         assertThat(a, is(d));
         assertThat(a, is(e));
         assertThat(a, is(f));
     });
    
    // this cannot be tested using count or size due to an existing bug in mongo
    // where the size should be respecting the limit, however it doesn't do this
    // for limit values that are negative
    test("find with a limit of -1 returns 1 entry", function(){
        var runtimeDocuments = runtime.find().limit(-1);
        var count = 0;
        while(runtimeDocuments.hasNext()){
            runtimeDocuments.next();
            count++;
        }
        assertThat(count, is(1));
    });
    
    test("find with a limit of 1 returns 1 entry", function(){
        var runtimeDocuments = runtime.find().limit(1);
        assertThat(runtimeDocuments.size(), is(1));
    });
    
    test("find with a limit of 0 returns all entries", function(){
        var runtimeDocuments = runtime.find().limit(0);
        assertThat(runtimeDocuments.size(), is(greaterThan(0)));
    });
    
    test("find with a limit of null throws a Method Not Found Error", function(){
        try{
            runtime.find().limit(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCursorImpl.limit(null)"));
        }
    });
    
    test("find with a skip of 1 returns 1 less entry", function(){
        var runtimeDocuments = runtime.find().skip(1);
        assertThat(runtimeDocuments.size(), is(runtime.find().size()-1));
    });
    
    test("find with a skip of 0 returns all entries", function(){
        var runtimeDocuments = runtime.find().skip(0);
        assertThat(runtimeDocuments.size(), is(runtime.find().size()));
    });
    
    test("find with a skip of -1 returns all entries", function(){
        var runtimeDocuments = runtime.find().skip(-1);
        assertThat(runtimeDocuments.size(), is(greaterThan(0)));
    });
    
    test("find with a skip of null throws a Method Not Found Error", function(){
        try{
            runtime.find().skip(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCursorImpl.skip(null)"));
        }
    });
    
    test("find with a curr and skip 1 returns the 2nd value in the cursor ", function(){
        var cursor = runtime.find().skip(1);
        if(cursor.hasNext()) {
            var obj = cursor.next();
            }
        assertThat(obj.fieldA, is("fieldA_2"));
    });
    
    test("find with a toArray builds and array of ", function(){
        var runtimeDocuments = runtime.find().toArray();
        assertThat(runtimeDocuments[0].fieldA, is("fieldA_1"));
        assertThat(runtimeDocuments[1].fieldA, is("fieldA_2"));
        assertThat(runtimeDocuments[2].fieldA, is("fieldA_3"));
    });
});

suite("findAndModify Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("findAndModify an entry", function(){
        runtimeSetup();
        runtime.findAndModify({fieldA : "fieldA_1"},{fieldA : "update_fieldA_1"});
        assertThat(runtime.findOne().fieldA, is("update_fieldA_1"));
    });
    
    test("findAndModify last entry out of multiple matches", function(){
        runtimeSetup();
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 6});
        runtime.findAndModify({fieldA : "fieldA_1"},{_id:-1},{fieldA : "update_fieldA_1", fieldB: "update_fieldB_1", numericValue: 7});
        assertThat(runtime.findOne({}, {}, {_id:-1}).fieldA, is("update_fieldA_1"));
        assertThat(runtime.findOne({}, {}, {_id:-1}).numericValue, is(7));
        assertThat(runtime.findOne({fieldA: "fieldA_1"}).fieldB, is("fieldB_1"));
    });
    
    test("findAndModify remove first entry", function(){
        runtimeSetup();
        runtime.findAndModify({fieldA : "fieldA_1"}, {}, {}, true, {},false,false);
        assertThat(runtime.findOne().fieldA, is("fieldA_2"));
        assertThat(runtime.count(), is(4));
    });
    
    test("findAndModify upsert inserts a new entry", function(){
        runtimeSetup();
        runtime.findAndModify({fieldA : "fieldA_6"}, {}, {}, false, {fieldA : "fieldA_6", fieldB: "fieldB_6", numericValue: 6},false, true);
        assertThat(runtime.findOne({numericValue:6}).fieldA, is("fieldA_6"));
        assertThat(runtime.count(), is(6));
    });
    
    test("findAndModify upsert updates an entry", function(){
        runtimeSetup();
        runtime.findAndModify({fieldA : "fieldA_1"}, {}, {}, false, {fieldA : "fieldA_6", fieldB: "fieldB_6", numericValue: 6},false, true);
        assertThat(runtime.findOne({numericValue:6}).fieldA, is("fieldA_6"));
        assertThat(runtime.count(), is(5));
        assertThat(runtime.findOne({numericValue:1}), is(null));
        
    });
    
    test("findAndModify upsert inserts a new entry with a returnNew set to false returns starting Document", function(){
        runtimeSetup();
        var returned = runtime.findAndModify({fieldA : "fieldA_1"}, {}, {}, false, {fieldA : "fieldA_6", fieldB: "fieldB_6", numericValue: 6},false, true);
        assertThat(JSON.stringify(returned), contains("fieldB_1"));
    });
    
    test("findAndModify upsert inserts a new entry with a returnNew set to true returns new Document", function(){
        runtimeSetup();
        var returned = runtime.findAndModify({fieldA : "fieldA_1"}, {}, {}, false, {fieldA : "fieldA_6", fieldB: "fieldB_6", numericValue: 6},true, true);
        assertThat(JSON.stringify(returned), contains("fieldB_6"));
    });
    
    test("findAndModify with no params throws a Method Not Found Error", function(){
        runtimeSetup();
        try{
            runtime.findAndModify();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.findAndModify()"));
        }
    });

    test("findAndModify with null params throws a Method Not Found Error", function(){
        runtimeSetup();
        try{
            runtime.findAndModify(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.findAndModify(null)"));
        }
    });
});

suite("findAndRemove Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("findAndRemove an entry", function(){
        runtimeSetup();
        runtime.findAndRemove({fieldA : "fieldA_1"});
        assertThat(runtime.findOne().fieldA, is("fieldA_2"));
        assertThat(runtime.count(), is(4));
    });
    
    test("findAndRemove with a {} query, removes the first Document", function(){
        runtimeSetup();
        assertThat(runtime.findOne({}).fieldA, is("fieldA_1"));
        runtime.findAndRemove({});
        assertThat(runtime.count(), is(4));
        assertThat(runtime.findOne({fieldA:"fieldA_1"}), is(null));
    });
    
    test("findAndRemove with no params throws a Method Not Found Error", function(){
        runtimeSetup();
        try{
            runtime.findAndRemove();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.findAndRemove()"));
        }
    });
    
    // This test shouldn't pass
    // test("findAndRemove with null params throws a Method Not Found Error", function(){
    //     runtimeSetup();
    //     try{
    //         runtime.findAndRemove(null);
    //         fail();
    //      } catch(e){
    //          assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.findAndRemove(null)"));
    //     }
    // });
});

suite("insert Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
   
    test("insert, inserts a Document into the collection", function(){
        
        runtimeSetup();
        var success = runtime.insert({fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6});
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).fieldB, is("fieldB_6"));
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).numericValue, is(6));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("insert, insert multiple Documents into the collection", function(){
        
        runtimeSetup();
        var success = runtime.insert({fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6},{fieldA: "fieldA_7", fieldB: "fieldB_7", numericValue: 7});
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).fieldB, is("fieldB_6"));
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).numericValue, is(6));
        assertThat(runtime.findOne({fieldA: "fieldA_7"}).fieldB, is("fieldB_7"));
        assertThat(runtime.findOne({fieldA: "fieldA_7"}).numericValue, is(7));
        assertThat(runtime.count(), is(7));
        assertThat(success, is(true));
    });
    
    test("insert, insert empty {} Documents into the collection", function(){
        
        runtimeSetup();
        var success = runtime.insert({},{},{});
        assertThat(runtime.count(), is(8));
        assertThat(success, is(true));
    });
    
    test("insert with no param throws a Mongo exception", function(){
       
        runtimeSetup();
        try{
            runtime.insert();
            fail();
         } catch(e){
             assertThat(e.message, contains("com.mongodb.CommandFailureException"));
        }
    });
    
    test("insert with null param returns false", function(){
       
        runtimeSetup();
        var success = runtime.insert(null);
        assertThat(success, is(false));
    });
});

suite("Index Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("getIndexInfo returns a list of collection Document indexes", function(){

        runtimeSetup();
        assertThat(runtime.getIndexInfo().length, is(1));
        assertThat(JSON.stringify(runtime.getIndexInfo()), contains("jsTestRuntime"));
    });
    
    test("ensureIndex adds an index to the collection", function(){
        
        runtimeSetup();
        runtime.ensureIndex({lastModified : -1});
        assertThat(JSON.stringify(runtime.getIndexInfo()), contains("jsTestRuntime"));
    });
    
    test("ensureIndex adds an index to the collection", function(){
        
        runtimeSetup();
        runtime.ensureIndex({lastModified2 : -1}, {name: "myIndex"});
        assertThat(JSON.stringify(runtime.getIndexInfo()), contains("jsTestRuntime"));
    });
    
    test("dropIndex drops an Index from the collection Document indexes", function(){
        
        runtimeSetup();
        //using different Index names, due to mongo doing some actions in the backgroud which may cause timing issues
        runtime.ensureIndex({lastModified3 : -1});
        runtime.dropIndex({lastModified3 : -1});
        assertThat(JSON.stringify(runtime.getIndexInfo()), contains("jsTestRuntime"));
    });
    
    test("ensureIndex with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.ensureIndex();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadOnlyImpl.ensureIndex()"));
        }
    });    
    
    test("ensureIndex with null params throws a Null Pointer exception", function(){
       
        runtimeSetup();
        try{
            runtime.ensureIndex(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
});

suite("save Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("save, saves a new Document to the collection", function(){
        
        runtimeSetup();
        var success = runtime.save({fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6});
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).fieldB, is("fieldB_6"));
        assertThat(runtime.findOne({fieldA: "fieldA_6"}).numericValue, is(6));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("save, saves a new Document with _id to the collection", function(){
        
        runtimeSetup();
        var success = runtime.save({_id: "testID", fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6});
        assertThat(runtime.findOne({_id: "testID"}).fieldB, is("fieldB_6"));
        assertThat(runtime.findOne({_id: "testID"}).numericValue, is(6));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("save, saving a document with _id where it already exists overrides that Document", function(){
        
        runtimeSetup();
        var success = runtime.save({_id: "testID", fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6});
        assertThat(runtime.findOne({_id: "testID"}).fieldB, is("fieldB_6"));
        assertThat(runtime.findOne({_id: "testID"}).numericValue, is(6));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
        success = runtime.save({_id: "testID", fieldA: "fieldA_7", fieldB: "fieldB_7", numericValue: 7});
        assertThat(runtime.findOne({_id: "testID"}).fieldB, is("fieldB_7"));
        assertThat(runtime.findOne({_id: "testID"}).numericValue, is(7));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("save, with an empty query saves an empty Document to the collection", function(){
        
        runtimeSetup();
        var success = runtime.save({});
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("save, with no _id saves a new Document to the collection and assigns an _id", function(){
        
        runtimeSetup();
        var success = runtime.save({fieldA: "fieldA_6", fieldB: "fieldB_6", numericValue: 6});
        assertThat(JSON.stringify(runtime.findOne({fieldA: "fieldA_6"})), contains("_id"));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("save with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.save();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.save()"));
        }
    });
    
    test("save with null params throws a Illegal Argument exception", function(){
       
        runtimeSetup();
        try{
            runtime.save(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.IllegalArgumentException: can't be null"));
        }
    });
});

suite("remove Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");

    test("remove, removes a Document from the collection", function(){
        
        runtimeSetup();
        var success = runtime.remove({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1});
        assertThat(runtime.findOne({fieldA: "fieldA_2"}).fieldB, is("fieldB_2"));
        assertThat(runtime.findOne({fieldA: "fieldA_2"}).numericValue, is(2));
        assertThat(runtime.count(), is(4));
        assertThat(success, is(true));
    });
    
    test("remove, with query {} removes all Documents from the collection", function(){
        
        runtimeSetup();
        var success = runtime.remove({});
        assertThat(runtime.count(), is(0));
        assertThat(success, is(true));
    });
    
    test("remove with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.remove();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.remove()"));
        }
    });
    
    test("remove with null params throws a Null Pointer exception", function(){
       
        runtimeSetup();
        try{
            runtime.remove(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
});

suite("update Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("update, updates a Document in the collection", function(){

        runtimeSetup();
        var success = runtime.update({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1},{fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0});
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).fieldB, is("fieldB_0"));
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).numericValue, is(0));
        assertThat(runtime.count(), is(5));
        assertThat(success, is(true));
    });
    
    test("update with upsert, updates a Document in the collection", function(){

        runtimeSetup();
        var success = runtime.update({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1},{fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0},true,false);
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).fieldB, is("fieldB_0"));
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).numericValue, is(0));
        assertThat(runtime.count(), is(5));
        assertThat(success, is(true));
    });
    
    test("update with upsert that doesn't match any document, creates a new Document in the collection", function(){

        runtimeSetup();
        assertThat(runtime.findOne({fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0}), is(null));
        var success = runtime.update({fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0},{fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0},true,false);
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).fieldB, is("fieldB_0"));
        assertThat(runtime.findOne({fieldA: "fieldA_0"}).numericValue, is(0));
        assertThat(runtime.count(), is(6));
        assertThat(success, is(true));
    });
    
    test("update with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.update();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.update()"));
        }
    });
    
    test("update with null params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.update(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.update(null)"));
        }
    });
});

suite("updateMulti Runtime collection tests", function(){
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("updateMulti with multi, updates multiple Documents in the collection", function(){

        runtimeSetup();
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1});
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1});
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1});
        
        var success = runtime.updateMulti({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 1},{ '$set': {fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0}});
        assertThat(runtime.find({fieldA: "fieldA_0", fieldB: "fieldB_0", numericValue: 0}).count(), is(4));
        assertThat(runtime.count(), is(8));
        assertThat(success, is(true));
    });
    
    test("updateMulti with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.updateMulti();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.updateMulti()"));
        }
    });
    
    test("updateMulti with null params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.updateMulti(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadWriteImpl.updateMulti(null)"));
        }
    });
});

suite("aggregation Runtime collection tests", function(){
    
    
    var runtime = Spark.runtimeCollection("jsTestRuntime");
    
    test("aggregate with a match returns that Document", function(){
        
        runtimeSetup();
        var results = runtime.aggregate({$match : { fieldA : "fieldA_1"}});
        assertThat(JSON.stringify(results), contains("fieldB_1"));
    });
    
    test("aggregate with a match and project returns that Document", function(){
        
        var results = runtime.aggregate({$match : { fieldA : "fieldA_1"}}, {$project : {_id : 0, myProjectField : "$fieldB", numericValue : "$numericValue"}});
        assertThat(JSON.stringify(results), contains("myProjectField"));
    });
    
    test("aggregation with a match, project and group", function(){
        
        runtimeSetup();
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 2});
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 3});
        runtime.insert({fieldA: "fieldA_1", fieldB: "fieldB_1", numericValue: 4});
        var results = runtime.aggregate({$match : { fieldA : "fieldA_1"}}, {$project : {_id : 0, mantas : "$fieldB", numericValue : "$numericValue"}}, {$group : {_id:null, total : {$sum : "$numericValue"}}});
        assertThat(JSON.stringify(results), contains(10));
    });
    
    test("aggregate with no params throws a Method Not Found Error", function(){
       
        runtimeSetup();
        try{
            runtime.aggregate();
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadOnlyImpl.aggregate()"));
        }
    });
    
    test("aggregate with empty params throws a Command Failure Exception", function(){
       
        runtimeSetup();
        try{
            runtime.aggregate({});
            fail();
         } catch(e){
             assertThat(e.message, contains("com.mongodb.CommandFailureException"));
        }
    });
    
    test("aggregate with empty Match params retruns all Documents", function(){
       
        var documents = runtime.aggregate({$match : {}});
        assertThat(JSON.stringify(documents), contains("fieldA_3"));
    });
    
    test("aggregate with null params throws a Null Pointer exception", function(){
       
        runtimeSetup();
        try{
            runtime.aggregate(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
});

suite("SparkMongoCursor Runtime collection tests", function(){
   
    var runtime = Spark.runtimeCollection("jsTestRuntime");
   
    runtimeSetup();
    test("Runtime hasNext test on a not empty cursor will have next", function(){
        var documents = runtime.find();
        assertThat(documents.hasNext(), is(true));
    });
    
     test("Runtime hasNext test on an empty cursor will not have next", function(){
        var documents = runtime.find({something : "invalid"});
        assertThat(documents.hasNext(), is(false));
     });
    
    test("Runtime next test on a not empty cursor returns next element", function(){
        var documents = runtime.find();
        assertThat(JSON.stringify(documents.next()), contains("fieldB_1"));
    });
    
    test("Runtime next test on an empty cursor throws a No Such Element Exception", function(){
        var documents = runtime.find({something : "invalid"});
        try{
            documents.next();
            fail();
         } catch(e){
            assertThat(e.message, contains("java.util.NoSuchElementException"));
        }
    });
    
    test("Runtime current test on a not empty cursor returns element at cursor", function(){
        
        var cursor = runtime.find();
        if(cursor.hasNext()){
            cursor.next();
            var obj = cursor.curr();
            }
        assertThat(JSON.stringify(obj), contains("fieldB_1"));
    });
    
    test("Runtime toArray test on a not empty cursor returns those elements", function(){
        var documents = runtime.find().toArray();
        assertThat(documents.length, is(5));
    });
    
    test("Runtime toArray test on an empty cursor returns no elements", function(){
        var documents = runtime.find({something : "invalid"}).toArray();
        assertThat(documents.length, is(0));
    });
});