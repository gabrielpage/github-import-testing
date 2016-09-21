require("ASSERT");

// POST needs to be re-written to use GameSparks Callback API

suite("Basic HTTP POST tests", function(){
    
    var httpPost = Spark.getHttp("http://httpbin.org/post");
    
    test("getHttp is not null", function(){
        assertThat(httpPost, is(not(null)));
    });
    
    test("POST Form test", function(){
        
        var myJsonForm = Spark.downloadableJson("jsonDownloadable");
        var response = httpPost.postForm(myJsonForm);
        
        assertThat(response.getResponseCode(), is(200));
        assertThat(response.getResponseString(), contains("GameSparks"));
    });
    
    test("POST Form with null input success", function(){
        var response = httpPost.postForm(null);
        
        assertThat(response.getResponseCode(), is(200));
        assertThat(response.getResponseString(), is(not(null)));
    });
    
    test("POST Xml test", function(){
        var myXml = Spark.downloadableXml("xmlDownloadable").getXml();
        var response = httpPost.postXml(myXml);
        assertThat(response.getResponseCode(), is(200));
        var test = response.getResponseXml();
        assertThat(response.getResponseString(), contains("GameSparks"));
    });
    
    test("POST Json test", function(){
        
        var myJson = Spark.downloadableJson("jsonDownloadable");
        var response = httpPost.postJson(myJson);
        
        assertThat(response.getResponseCode(), is(200));
        assertThat(JSON.stringify(response.getResponseJson()), contains("GameSparks"));
    });
    
    test("POST String test", function(){
        
        var myString = "GameSparks";
        var response = httpPost.postString(myString);
        
        assertThat(response.getResponseCode(), is(200));
        assertThat(response.getResponseString(), contains("GameSparks"));
    });
});