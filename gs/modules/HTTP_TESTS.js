// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic HTTP GET tests", function(){
    
    var httpGet = Spark.getHttp("https://portal.gamesparks.net/rest/games/30172kUvnypT");
    var u = "devops@gamesparks.com";
    var p = "ftgpw1234";
    
    test("getHttp is not null", function(){
         assertThat(httpGet, is(not(null)));
    });
    
    test("setBasicAuth, with invalid details returns 401 (Unauthorized)", function(){
        httpGet.setBasicAuth("invalid", "details");
        assertThat(httpGet.get().getResponseCode(), is(401));
    });
    
    test("get, performs a HTTP GET request", function(){
        httpGet.setBasicAuth(u, p);
        httpGet.get();
        assertThat(httpGet.get(), is(not(null)));
    });
    
    test("get, performs a HTTP GET request", function(){
        httpGet.setBasicAuth(u, p);
        httpGet.setHeaders({"X-Cutom-Header": "GameSparks"})
        assertThat(httpGet.get(), is(not(null)));
    });
    
    test("getResponseCode, gets the response code", function(){
        httpGet.setBasicAuth(u, p);
        var response = httpGet.get();
        assertThat(response.getResponseCode(), is(200));
    });
    
    test("getHeaders, gets the headers from the response", function(){
        httpGet.setBasicAuth(u, p);
        var response = httpGet.get();
        assertThat(JSON.stringify(response.getHeaders()), contains("charset=UTF-8"));
    });
    
    test("getResponseString, gets the body of the response as a string", function(){
        httpGet.setBasicAuth(u, p);
        var response = httpGet.get();
        assertThat(response.getResponseString(), contains("WebSocket API Functional Tests"));
    });
    
    test("getResponseJson, gets the body of the response as an JSON", function(){
        httpGet.setBasicAuth(u, p);
        var response = httpGet.get();
        assertThat(JSON.stringify(response.getResponseJson()), contains("Cucumber functional tests run against this game."));
    });
    
    test("getResponseXml, gets the body of the response as an JSON", function(){
        xmlGet = Spark.getHttp("http://www.w3schools.com/xml/note.xml")
        var response = xmlGet.get();
        assertThat(response.getResponseXml().toString(), contains("Don't forget me this weekend!"));
    });
});

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