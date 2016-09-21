require("ASSERT");

suite("Basic HTTP GET tests", function(){
    
    var httpGet = Spark.getHttp("https://portal.gamesparks.net/rest/games/30172kUvnypT");
    var u = "devops@gamesparks.com";
    var p = "ftgpw1234";
    
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