// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("basic cache tests", function(){
    
    var cache = Spark.getCache();
    var cachedObject = ["simple object"];
    var cachedObject2 = ["simple object 2"];
    
    test("getCache, is not null", function(){
        
        assertThat(cache, is(not(null)));
    });
    
    test("put/get, puts or gets a cached object", function(){
        
        cache.put("cacheKey", cachedObject);
        assertThat(cache.get("cacheKey"), is(cachedObject));
    });
    
    test("put/get with null key, puts or gets the cached object with a null key", function(){
        
        cache.put(null, cachedObject);
        assertThat(cache.get(null), is(cachedObject));
    });
    
    test("put/get with null object, puts or gets the null value from the cache key", function(){
        
        cache.put("cacheKey", null);
        assertThat(cache.get("cacheKey"), is(null));
    });
    
    test("remove, removes the cached object", function(){
        
        cache.put("cacheKey", cachedObject);
        assertThat(cache.get("cacheKey"), is(cachedObject));
        cache.remove("cacheKey");
        assertThat(cache.get("cacheKey"), is(null));
    });
    
    test("removeAll, removes all cached objects", function(){
        
        cache.put("cacheKey", cachedObject);
        cache.put("cacheKey2", cachedObject2);
        assertThat(cache.get("cacheKey"), is(cachedObject));
        assertThat(cache.get("cacheKey2"), is(cachedObject2));
        cache.removeAll();
        assertThat(cache.get("cacheKey"), is(null));
        assertThat(cache.get("cacheKey2"), is(null));
    });
    
    test("removeAll with regex, removes objects matching pattern", function(){
        
        cache.put("cacheKey", cachedObject);
        cache.put("cacheKey2", cachedObject2);
        assertThat(cache.get("cacheKey"), is(cachedObject));
        assertThat(cache.get("cacheKey2"), is(cachedObject2));
        cache.removeAll("cacheK");
        assertThat(cache.get("cacheKey"), is(null));
        assertThat(cache.get("cacheKey2"), is(null));
    });
    
    test("removeAll with null regex, removes objects matching pattern", function(){
        
        cache.put("cacheKey", cachedObject);
        cache.put(null, cachedObject2);
        assertThat(cache.get("cacheKey"), is(cachedObject));
        assertThat(cache.get(null), is(cachedObject2));
        cache.removeAll("cacheK");
        assertThat(cache.get("cacheKey"), is(null));
        assertThat(cache.get(null), is(cachedObject2));
    });
});