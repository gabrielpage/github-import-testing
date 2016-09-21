// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

require("ASSERT");

suite("Simple Meta collection tests", function(){
    
    var meta = Spark.metaCollection("jsTestMeta");
    
    test("Loading a collection that doesn't exist returns an empty collection", function(){
        assertThat(Spark.metaCollection("invalid_name"), is(not(null)));
        assertThat(Spark.metaCollection("invalid_name").count(), is(0));
    });
    
    test("Loading a collection that exists returns that collection", function(){
        assertThat(meta, is(not(null)));
        assertThat(meta.count(), is(greaterThan(0)));
    });
    
    test("count returns 1 when given one document query", function(){
        var documentCount = meta.count({fieldA: "fieldA_1"})
        assertThat(documentCount, is(1));
    });
    
    test("count without params returns all Documents", function(){
        var documentCount = meta.count();
        assertThat(documentCount, is(greaterThan(1)));
    });
    
    test("count with empty params returns all Documents", function(){
        var documentCount = meta.count({});
        assertThat(documentCount, is(greaterThan(1)));
    });
    
    test("count with null params returns all Documents", function(){
        var documentCount = meta.count(null);
        assertThat(documentCount, is(greaterThan(1)));
    });
});

suite("findOne Meta collection tests", function(){
    
    var meta = Spark.metaCollection("jsTestMeta");
    
    test("findOne with query returns that Document", function(){
        var firstDocument = meta.findOne({fieldA: "fieldA_4"});
        assertThat(firstDocument.fieldB, is("fieldB_4"));
    });
    
    test("findOne without params returns the first Document", function(){
        var firstDocument = meta.findOne();
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with empty query param returns the first Document", function(){
        var firstDocument = meta.findOne({});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null query param returns the first Document", function(){
        var firstDocument = meta.findOne(null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with query and field remove returns that Document without the specified field", function(){
        var theDocument = meta.findOne({fieldA: "fieldA_4"},{numericValue:0});
        assertThat(theDocument.fieldB, is("fieldB_4"));
        assertThat(theDocument.numericValue, is(notDefined()));
    });
    
    test("findOne with empty query and remove value params returns the first Document", function(){
        var firstDocument = meta.findOne({},{});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null query and remove value params returns the first Document", function(){
        var firstDocument = meta.findOne(null,null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with empty params returns the first Document", function(){
        var firstDocument = meta.findOne({},{},{});
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with null params returns the first Document", function(){
        var firstDocument = meta.findOne(null,null,null);
        assertThat(firstDocument.fieldA, is("fieldA_1"));
        assertThat(firstDocument.fieldB, is("fieldB_1"));
    });
    
    test("findOne with sort -1 returns the last Document", function(){
        var lastDocument = meta.findOne({}, {}, {_id: -1});
        var findLast = meta.find().sort({_id: -1}).limit(1).toArray();
        assertThat(lastDocument.fieldA, is(findLast[0].fieldA));
    });
    
    test("findOne with a query returns that Document", function(){
        var theDocument = meta.findOne({fieldA:"fieldA_3"}, {}, {});
        assertThat(theDocument.fieldB, is("fieldB_3"));
    });
    
    test("findOne requesting a field be removed does not return that field", function(){
        var theDocument = meta.findOne({}, {numericValue:1}, {});
        assertThat(theDocument.numericValue, is(not(null)));
        
        var theDocument = meta.findOne({}, {numericValue:0}, {});
        assertThat(theDocument.numericValue, is(notDefined()));
    });
});

suite("distinct Meta collection tests", function(){
    
    var meta = Spark.metaCollection("jsTestMeta");
    
    test("distinct returns distinct values for the given key", function(){
        var distinctValues = meta.distinct("fieldA");
        assertThat(distinctValues[0], is("fieldA_1"));
        assertThat(distinctValues[1], is("fieldA_2"));
        assertThat(distinctValues[2], is("fieldA_3"));
    });
    
    test("distinct with key and query returns distinct value for the given key", function(){
        var distinctValues = meta.distinct("fieldA", {fieldA: "fieldA_1"});
        assertThat(distinctValues.toString(), is("fieldA_1"));
    });
    
    test("distinct with key and empty query returns all objects", function(){
        var distinctValues = meta.distinct("fieldA", {});
        assertThat(distinctValues.toString(), is("fieldA_1,fieldA_2,fieldA_3,fieldA_4,fieldA_5"));
    });
    
    test("distinct with key and null query returns all objects", function(){
        var distinctValues = meta.distinct("fieldA", null);
        assertThat(distinctValues.toString(), is("fieldA_1,fieldA_2,fieldA_3,fieldA_4,fieldA_5"));
    });
    
    test("distinct with null key and query returns empty object", function(){
        var distinctValues = meta.distinct(null, {fieldA: "fieldA_1"});
        assertThat(distinctValues.toString(), is(""));
    });
    
    test("distinct with a null key, returns an empty object array", function(){
        var distinctValues = meta.distinct(null);
        assertThat(distinctValues, is([]));
    });
    
    test("distinct with an empty key, returns an empty object array", function(){
        var distinctValues = meta.distinct({});
        assertThat(distinctValues, is([]));
    });
});

suite("find Meta collection tests", function(){
    
    var meta = Spark.metaCollection("jsTestMeta");
    
    test("find with query returns that Document", function(){
        var theDocument = meta.find({fieldA: "fieldA_4"});
        assertThat(theDocument.count(), is(1));
    });
    
    test("find without params returns the Documents", function(){
        var theDocument = meta.find();
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with empty query param returns the Documents", function(){
        var theDocument = meta.find({});
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with null query param returns the Documents", function(){
        var theDocument = meta.find(null);
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with query and field remove returns that Document without the specified field", function(){
        var theDocument = meta.find({fieldA: "fieldA_4"},{numericValue:0});
        assertThat(JSON.stringify(theDocument.toArray()), contains("fieldB_4"));
        assertThat(JSON.stringify(theDocument.toArray()), not(contains("numericValue")));
        assertThat(theDocument.count(), is(1));
    });
    
    test("find with count called on cursor doesn't impact subsequent read", function(){
        var theDocument = meta.find({fieldA: "fieldA_4"},{numericValue:0});
        assertThat(theDocument.count(), is(1));
        assertThat(JSON.stringify(theDocument.toArray()), contains("fieldB_4"));
        assertThat(JSON.stringify(theDocument.toArray()), not(contains("numericValue")));
    });
    
    test("find with empty query and remove value params returns the Documents", function(){
        var theDocument = meta.find({},{});
        assertThat(theDocument.count(), is(greaterThan(1)));
    });
    
    test("find with null query and remove value params returns the Documents", function(){
        var theDocument = meta.find(null,null);
        assertThat(theDocument.count(), is(greaterThan(1)));
    });

    test("find with sort set to -1 returns reversed order of Documents", function(){
        var x = meta.find().sort({_id: -1}).toArray();
        var y = meta.find().sort({_id: 1}).toArray();
        
        assertThat(JSON.stringify(y.reverse()), is(JSON.stringify(x)));
    });
    
    test("find with sort set to -1 and skip 1 returns reversed order of Documents", function(){
        var x = meta.find().sort({_id: -1}).skip(1).toArray();
        var y = meta.find().sort({_id: 1}).limit(x.length).toArray();
        
        assertThat(JSON.stringify(y.reverse()), is(JSON.stringify(x)));
    });
    
    test("find with sort set to -1 and limit 2 returns reversed order of Documents", function(){
        var x = meta.find().sort({_id: -1}).limit(2).toArray();
        var ySize = meta.find().size();
        var y = meta.find().sort({_id: 1}).skip(ySize-x.length).toArray();
        
        assertThat(JSON.stringify(y.reverse()), is(JSON.stringify(x)));
    });
    
    test("find with sort set to -1, limit 2 and skip 1 returns reversed order of Documents", function(){
        var x = meta.find().sort({_id: -1}).skip(1).limit(2).toArray();
        var ySkip = meta.find().skip(1).size()-x.length;
        var y = meta.find().sort({_id: 1}).skip(ySkip).limit(2).toArray();
        
        assertThat(JSON.stringify(y.reverse()), is(JSON.stringify(x)));
     });
    
    test("find, order of sort, limit and skip shouldn't matter", function(){
         var a = meta.find().sort({_id: -1}).skip(1).limit(2).toArray();
         a = JSON.stringify(a);
         var b = meta.find().sort({_id: -1}).limit(2).skip(1).toArray();
         b = JSON.stringify(b);
         var c = meta.find().skip(1).sort({_id: -1}).limit(2).toArray();
         c = JSON.stringify(c);
         var d = meta.find().skip(1).limit(2).sort({_id: -1}).toArray();
         d = JSON.stringify(d);
         var e = meta.find().limit(2).sort({_id: -1}).skip(1).toArray();
         e = JSON.stringify(e);
         var f = meta.find().limit(2).skip(1).sort({_id: -1}).toArray();
         f = JSON.stringify(f);
         
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
        var metaDocuments = meta.find().limit(-1);
        var count = 0;
        while(metaDocuments.hasNext()){
            metaDocuments.next();
            count++;
        }
        assertThat(count, is(1));
    });
    
    test("find with a limit of 1 returns 1 entry", function(){
        var metaDocuments = meta.find().limit(1);
        assertThat(metaDocuments.size(), is(1));
    });
    
    test("find with a limit of 0 returns all entries", function(){
        var metaDocuments = meta.find().limit(0);
        assertThat(metaDocuments.size(), is(greaterThan(0)));
    });
    
    test("find with a limit of null throws a Method Not Found Error", function(){
        try{
            meta.find().limit(null);
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCursorImpl.limit(null)"));
        }
    });
    
    test("find with a skip of 1 returns 1 less entry", function(){
        var metaDocuments = meta.find().skip(1);
        assertThat(metaDocuments.size(), is(meta.find().size()-1));
    });
    
    test("find with a skip of 0 returns all entries", function(){
        var metaDocuments = meta.find().skip(0);
        assertThat(metaDocuments.size(), is(meta.find().size()));
    });
    
    test("find with a skip of -1 returns all entries", function(){
        var metaDocuments = meta.find().skip(-1);
        assertThat(metaDocuments.size(), is(greaterThan(0)));
    });
    
    test("find with a skip of null throws a Method Not Found Error", function(){
        try{
            meta.find().skip(null);
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCursorImpl.skip(null)"));
        }
    });
    
    test("find with a skip 1 returns the 2nd value in the cursor ", function(){
        var cursor = meta.find().skip(1);
        if(cursor.hasNext()) {
            var obj = cursor.next();
            }
        assertThat(obj.fieldA, is("fieldA_2"));
    });
    
    test("find with a toArray builds and array of ", function(){
        var metaDocuments = meta.find().toArray();
        assertThat(metaDocuments[0].fieldA, is("fieldA_1"));
        assertThat(metaDocuments[1].fieldA, is("fieldA_2"));
        assertThat(metaDocuments[2].fieldA, is("fieldA_3"));
    });
});

suite("aggregation Meta collection tests", function(){
    
    var meta = Spark.metaCollection("jsTestMeta")
    
    test("aggregate with a match returns that Document", function(){
        
        var results = meta.aggregate({$match : { fieldA : "fieldA_1"}});
        assertThat(JSON.stringify(results), contains("fieldB_1"));
    });
    
    test("aggregate with a match and project returns that Document", function(){
        
        var results = meta.aggregate({$match : { fieldA : "fieldA_1"}}, {$project : {_id : 0, myProjectField : "$fieldB", numericValue : "$numericValue"}});
        assertThat(JSON.stringify(results), contains("myProjectField"));
    });
    
    test("aggregation with a match, project and group", function(){
        
        var results = meta.aggregate({$match : { fieldA : "fieldA_5"}}, {$project : {_id : 0, fieldB : "$fieldB", numericValue : "$numericValue"}}, {$group : {_id:null, total : {$sum : "$numericValue"}}});
        assertThat(JSON.stringify(results), contains(5));
    });
    
       test("aggregate with no params throws a Method Not Found Error", function(){
       
        try{
            meta.aggregate();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.mongo.impl.SparkMongoCollectionReadOnlyImpl.aggregate()"));
        }
    });
    
    test("aggregate with empty params throws a Command Failure Exception", function(){
       
        try{
            meta.aggregate({});
         } catch(e){
             assertThat(e.message, contains("com.mongodb.CommandFailureException"));
        }
    });
    
    test("aggregate with empty Match params retruns all Documents", function(){
       
        var documents = meta.aggregate({$match : {}});
        assertThat(JSON.stringify(documents), contains("fieldA_3"));
    });
    
    test("aggregate with null params throws a Null Pointer exception", function(){
       
        try{
            meta.aggregate(null);
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
});

suite("SparkMongoCursor Meta collection tests", function(){
   
    var meta = Spark.metaCollection("jsTestMeta");
   
    test("Meta hasNext test on a not empty cursor will have next", function(){
        var documents = meta.find();
        assertThat(documents.hasNext(), is(true));
    });
    
     test("Meta hasNext test on an empty cursor will not have next", function(){
        var documents = meta.find({something : "invalid"});
        assertThat(documents.hasNext(), is(false));
     });
    
    test("Meta next test on a not empty cursor returns next element", function(){
        var documents = meta.find();
        assertThat(JSON.stringify(documents.next()), contains("fieldB_1"));
    });
    
    test("Meta next test on an empty cursor throws a No Such Element Exception", function(){
        var documents = meta.find({something : "invalid"});
        try{
            documents.next();
         } catch(e){
            assertThat(e.message, contains("java.util.NoSuchElementException"));
        }
    });
    
    test("Meta current test on a not empty cursor returns element at cursor", function(){
        
        var cursor = meta.find();
        if(cursor.hasNext()){
            cursor.next();
            var obj = cursor.curr();
            }
        assertThat(JSON.stringify(obj), contains("fieldB_1"));
    });
    
    test("Meta toArray test on a not empty cursor returns those elements", function(){
        var documents = meta.find().toArray();
        assertThat(documents.length, is(5));
    });
    
    test("Meta toArray test on an empty cursor returns no elements", function(){
        var documents = meta.find({something : "invalid"}).toArray();
        assertThat(documents.length, is(0));
    });
});