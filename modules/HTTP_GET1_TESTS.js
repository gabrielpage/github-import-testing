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
});