// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

// TODO - the assertion on callbacks has to be fixed as they will not notify of failure at the moment

suite("Basic XML reader tests", function(){
    
    // test("uploadedXml returns the uploaded xml", function(){
        
    //     var myXmlReader = Spark.uploadedXml("2f575aceb7a84ac18e9c6b31569e92ba");
    //     assertThat(myXmlReader, is(not(null)));
    // });
    
    test("uploadedXml with invalid id, returns null", function(){
        
        var myXmlReader = Spark.uploadedXml("invalid_id");
        assertThat(myXmlReader, is(null));
    });
    
    test("uploadedXml with null id, returns null", function(){
        
        var myXmlReader = Spark.uploadedXml(null);
        assertThat(myXmlReader, is(null));
    });
    
    // test("getXml using uploadedXml returns the xml data stored in an upload", function(){
        
    //     var myXmlReader = Spark.uploadedXml("2f575aceb7a84ac18e9c6b31569e92ba");
    //     assertThat(myXmlReader.getXml().toString(), contains("GameSparks"));
    // });
    
    test("downloadableXml returns the uploaded xml", function(){
        
        var myXmlReader = Spark.downloadableXml("xmlDownloadable");
        assertThat(myXmlReader, is(not(null)));
    });
    
    test("downloadableXml with invalid shortcode, returns null", function(){
        
        var myXmlReader = Spark.downloadableXml("invalid_shortcode");
        assertThat(myXmlReader, is(null));
    });
    
    test("downloadableXml with null shortcode, returns null", function(){
        
        var myXmlReader = Spark.downloadableXml(null);
        assertThat(myXmlReader, is(null));
    });
    
    test("getXml using downloadableXml returns the xml data stored in an upload", function(){
        
        var myXmlReader = Spark.downloadableXml("xmlDownloadable");
        assertThat(myXmlReader.getXml().toString(), contains("GameSparks"));
    });
    
    // test("xml CallBack test", function(){

    //     var xmlData = [
    //     {name:"Gabs", score:"30", game:"game_1", total:"300"},
    //     {name:"Dave", score:"20", game:"game_2", total:"200"},
    //     {name:"James", score:"25", game:"game_3", total:"250"},
    //     {name:"Greg", score:"35", game:"game_4", total:"350"},
    //     {name:"Mantas", score:"15", game:"game_5", total:"150"},
    // ];
        
    //     var index = 0;
    //     var myXmlReader = Spark.uploadedXml("32e534d18bda468dab272b21cdc10df9");
    
    //     myXmlReader.registerCallback("GameSparks.players", 
    //         function(){var rootElement = myXmlReader.getXml();
            
    //         assertThat(rootElement.name.toString(), is(xmlData[index].name));
    //         assertThat(rootElement.score.toString(), is(xmlData[index].score));
    //         assertThat(rootElement.game.toString(), is(xmlData[index].game));
    //         assertThat(rootElement.total.toString(), is(xmlData[index].total));
    //         index++;
    //         }
    //     );
         
    //     myXmlReader.process();
    //  });
     
    //  test("xml getElement test", function(){

    //     var index = 1;
    //     var myXmlReader = Spark.uploadedXml("32e534d18bda468dab272b21cdc10df9");
    
    //     myXmlReader.registerCallback("GameSparks.players", 
    //         function(){var rootElement = myXmlReader.getElement();
            
    //         assertThat(rootElement.@playerId.toString(), is(index.toString()));
    //         index++;
    //         }
    //     );
         
    //     myXmlReader.process();
    //  });
});

suite("Basic JSON reader tests", function(){
    
    // test("uploadedJson returns the uploaded JSON", function(){
        
    //     var uploadedJson = Spark.uploadedJson("9e1fd29d808d4950ab3e5c44b30c4c13");
    //     assertThat(uploadedJson, is(not(null)));
    // });
    
    test("uploadedJson with invalid id, returns null", function(){
        
        var invalidIdResponse = Spark.uploadedJson("invalid_id");
        assertThat(invalidIdResponse, is(null));
    });
    
    test("uploadedJson with null id, returns null", function(){
        
        var nullJsonResponse = Spark.uploadedJson(null);
        assertThat(nullJsonResponse, is(null));
    });
    
    test("downloadableJson returns the uploaded JSON", function(){
        
        var downloadableJson = Spark.downloadableJson("jsonDownloadable");
        assertThat(downloadableJson, is(not(null)));
    });
    
    test("downloadableJson with invalid shortcode, returns null", function(){
        
        var downloadableJson = Spark.downloadableJson("invalid_shortcode");
        assertThat(downloadableJson, is(null));
    });
    
    test("downloadableXml with null shortcode, returns null", function(){
        
        var downloadableJson = Spark.downloadableJson(null);
        assertThat(downloadableJson, is(null));
    });
    
    
    test("JSON validation test", function(){

    var jsonData = {"GameSparks":{"players":[
        {name:"Gabs", score:"30", game:"game_1", total:"300"},
        {name:"Dave", score:"20", game:"game_2", total:"200"},
        {name:"James", score:"25", game:"game_3", total:"250"},
        {name:"Greg", score:"35", game:"game_4", total:"350"},
        {name:"Mantas", score:"15", game:"game_5", total:"150"},
    ]}};
        
        // var uploadedJson = Spark.uploadedJson("9e1fd29d808d4950ab3e5c44b30c4c13");
        var downloadableJson = Spark.downloadableJson("jsonDownloadable");
        // assertThat(uploadedJson, is(jsonData));
        assertThat(downloadableJson, is(jsonData));
     });
});