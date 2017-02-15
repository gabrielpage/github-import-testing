require("ASSERT");

suite("basic GameSparksCustomSDK Download tests", function(){
    
    var httpGet = Spark.getHttp("https://portal.gamesparks.net/sdk/30172kUvnypT/XcwCoabdsLR5EbNRmoWV5pG0qfixM6lc/GameSparksCustomSDK.cs");
    var u = "devops@gamesparks.com";
    var p = "ftgpw1234";
    
    httpGet.setBasicAuth(u, p);
    var response = httpGet.get();
    
    test("getHttp is not null", function(){
         assertThat(response, is(not(null)));
    });
    
    test("getResponseString, gets the response Body", function(){
        
        assertThat(response.getResponseString(), contains("THIS FILE IS AUTO GENERATED, DO NOT MODIFY!!"));
    });
});

suite("basic GameSparksCustomSDK501 Download tests", function(){
    
    var httpGet = Spark.getHttp("https://portal.gamesparks.net/sdk/30172kUvnypT/XcwCoabdsLR5EbNRmoWV5pG0qfixM6lc/GameSparksCustomSDK501.cs");
    var u = "devops@gamesparks.com";
    var p = "ftgpw1234";
    
    httpGet.setBasicAuth(u, p);
    var response = httpGet.get();
    
    test("getHttp is not null", function(){
         assertThat(response, is(not(null)));
    });
    
    test("getResponseString, gets the response Body", function(){
        
        assertThat(response.getResponseString(), contains("THIS FILE IS AUTO GENERATED, DO NOT MODIFY!!"));
    });
});