// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

function ensureAbsent(redis){
    
    var keys = ["redis_test_key","redis_test_key2","redis_test_key3"];
    
    for(var i = 0; i < keys.length; i++){
       if(redis.exists(keys[i]) == true){
           redis.del(keys[i]);
           assertThat(redis.exists(keys[i]), is(false));
       } 
    }
        if(redis.exists(null) == true){
           redis.del(null);
           assertThat(redis.exists(null), is(false));
       }
}

suite("Redis keys tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";
    var key2 = "redis_test_key2";
    var key3 = "redis_test_key3";
    
    test("Redis del, deletes a key from redis", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.exists(key), is(true));
        assertThat(redis.del(key), is(1));
        assertThat(redis.exists(key), is(false));
    });
    
    test("Redis del, with a null key, deletes a key from redis", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.exists(null), is(true));
        assertThat(redis.del(null), is(1));
        assertThat(redis.exists(null), is(false));
    });

    test("Redis exists, checks if the key exists in redis", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.exists(key), is(true));
    });
    
    test("Redis exists, with a null key, checks if the key exists in redis", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.exists(null), is(true));
    });

    test("Redis expire, sets the key to expire in the number of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.ttl(key), is(-1));
        assertThat(redis.expire(key, 20), is(1));
        assertThat(redis.ttl(key), is(greaterThan(10)));
        assertThat(redis.ttl(key), is(not(greaterThan(21))));
    });
    
    test("Redis expire, with null key sets the key to expire in the number of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.ttl(null), is(-1));
        assertThat(redis.expire(null, 20), is(1));
        assertThat(redis.ttl(null), is(greaterThan(10)));
        assertThat(redis.ttl(null), is(not(greaterThan(21))));
    });

    test("Redis expire, passing in a null value, for time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.expire(key,null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.expire(string,null)"));
        }
    });
    
    test("Redis expireAt, sets the key to expire at the given unixTime", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.ttl(key), is(-1));
        var currentTime = (new Date()).getTime()/1000;
        assertThat(redis.expireAt(key, currentTime+20), is(1));
        assertThat(redis.ttl(key), is(greaterThan(10)));
        assertThat(redis.ttl(key), is(not(greaterThan(21))));
    });
    
    test("Redis expireAt, with a null key, sets the key to expire at the given unixTime", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.ttl(null), is(-1));
        var currentTime = (new Date()).getTime()/1000;
        assertThat(redis.expireAt(null, currentTime+20), is(1));
        assertThat(redis.ttl(null), is(greaterThan(10)));
        assertThat(redis.ttl(null), is(not(greaterThan(21))));
    });

    test("Redis expireAt, passing in a null value for time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.expireAt(key,null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.expireAt(string,null)"));
        }
    });
    
    test("Redis keys, returns all keys matching pattern", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.keys("*redis_test_key2"), is(["redis_test_key2"]));
    });
    
    test("Redis keys, with null pattern, returns all keys matching pattern", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(null, "One"), is("OK"));
        assertThat(redis.keys(null), is(["null"]));
    });
    
    test("Redis persist, remove the existing timeout on key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.ttl(key), is(-1));
        assertThat(redis.expire(key, 20), is(1));
        assertThat(redis.ttl(key), is(greaterThan(10)));
        assertThat(redis.ttl(key), is(not(greaterThan(21))));
        assertThat(redis.persist(key), is(1));
        assertThat(redis.ttl(key), is(-1));
    });
    
    test("Redis persist, with null key, remove the existing timeout on key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.ttl(null), is(-1));
        assertThat(redis.expire(null, 20), is(1));
        assertThat(redis.ttl(null), is(greaterThan(10)));
        assertThat(redis.ttl(null), is(not(greaterThan(21))));
        assertThat(redis.persist(null), is(1));
        assertThat(redis.ttl(null), is(-1));
    });
    
    test("Redis pexpire, this command works exactly like EXPIRE but the time to live of the key is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.pttl(key), is(-1));
        assertThat(redis.pexpire(key, 20000), is(1));
        assertThat(redis.pttl(key), is(greaterThan(10000)));
        assertThat(redis.pttl(key), is(not(greaterThan(21000))));
    });
    
    test("Redis pexpire, with null key, this command works exactly like EXPIRE but the time to live of the key is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.pttl(null), is(-1));
        assertThat(redis.pexpire(null, 20000), is(1));
        assertThat(redis.pttl(null), is(greaterThan(10000)));
        assertThat(redis.pttl(null), is(not(greaterThan(21000))));
    });
    
    test("Redis pexpire, passing in a null value for time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.pexpire(key,null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.pexpire(string,null)"));
        }
    });
    
    test("Redis pexpireAt, has the same effect and semantic as EXPIREAT, but the Unix time at which the key will expire is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.pttl(key), is(-1));
        var currentTime = (new Date()).getTime();
        assertThat(redis.pexpireAt(key, currentTime+20000), is(1));
        assertThat(redis.pttl(key), is(greaterThan(10000)));
        assertThat(redis.pttl(key), is(not(greaterThan(21000))));
    });
    
    test("Redis pexpireAt, with a null key, has the same effect and semantic as EXPIREAT, but the Unix time at which the key will expire is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.pttl(null), is(-1));
        var currentTime = (new Date()).getTime();
        assertThat(redis.pexpireAt(null, currentTime+20000), is(1));
        assertThat(redis.pttl(null), is(greaterThan(10000)));
        assertThat(redis.pttl(null), is(not(greaterThan(21000))));
    });
    
    test("Redis pexpireAt, passing in a null value for time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.pexpireAt(key,null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.pexpireAt(string,null)"));
        }
    });
    
    test("Redis rename, renames key to newKey", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.rename(key, key2), is("OK"));
        assertThat(redis.get(key), is(null));
        assertThat(redis.get(key2), is("One"));
    });
    
    test("Redis rename, with a null key1, renames key to newKey", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.get(null), is("One"));
        assertThat(redis.rename(null, key2), is("OK"));
        assertThat(redis.get(null), is(null));
        assertThat(redis.get(key2), is("One"));
    });
    
    test("Redis rename, with a null key2, renames key to newKey", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.rename(key, null), is("OK"));
        assertThat(redis.get(key), is(null));
        assertThat(redis.get(null), is("One"));
    });
    
    test("Redis renamenx, renames key to newKey if newKey does not yet exist", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.renamenx(key, key2), is(0));
        assertThat(redis.get(key2), is("Two"));
        assertThat(redis.renamenx(key, key3), is(1));
        assertThat(redis.get(key), is(null));
        assertThat(redis.get(key3), is("One"));
    });
    
    test("Redis renamenx, with a null key2, renames key to newKey if newKey does not yet exist", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", null, "Two"), is("OK"));
        assertThat(redis.renamenx(key, null), is(0));
        assertThat(redis.get(null), is("Two"));
        assertThat(redis.renamenx(key, key3), is(1));
        assertThat(redis.get(key), is(null));
        assertThat(redis.get(key3), is("One"));
    });
    
    test("Redis renamenx, with a null key3, renames key to newKey if newKey does not yet exist", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.renamenx(key, key2), is(0));
        assertThat(redis.get(key2), is("Two"));
        assertThat(redis.renamenx(key, null), is(1));
        assertThat(redis.get(key), is(null));
        assertThat(redis.get(null), is("One"));
    });
    
    test("Redis sort, returns the elements contained in the list, set or sorted set at key", function(){
        ensureAbsent(redis);
        assertThat(redis.rpush(key, 3,1,2), is(3));
        assertThat(redis.sort(key), is(["1","2","3"]));
    });
    
    test("Redis sort, with a null key, returns the elements contained in the list, set or sorted set at key", function(){
        ensureAbsent(redis);
        assertThat(redis.rpush(null, 3,1,2), is(3));
        assertThat(redis.sort(null), is(["1","2","3"]));
    });
    
    test("Redis sort, stores the elements contained in the list, set or sorted set at key", function(){
        ensureAbsent(redis);
        assertThat(redis.rpush(key, 3,1,2), is(3));
        assertThat(redis.sort(key, key2), is(3));
        assertThat(redis.lrange(key2, 0, -1), is(["1","2","3"]));
    });
    
    test("Redis sort, with a null key1, stores the elements contained in the list, set or sorted set at key", function(){
        ensureAbsent(redis);
        assertThat(redis.rpush(null, 3,1,2), is(3));
        assertThat(redis.sort(null, key2), is(3));
        assertThat(redis.lrange(key2, 0, -1), is(["1","2","3"]));
    });
    
    test("Redis sort, with a null key2, stores the elements contained in the list, set or sorted set at key", function(){
        ensureAbsent(redis);
        assertThat(redis.rpush(key, 3,1,2), is(3));
        assertThat(redis.sort(key, null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["1","2","3"]));
    });
    
    test("Redis ttl, returns the string representation of the type of the value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.ttl(key), is(-1));
        assertThat(redis.expire(key, 20), is(1));
        assertThat(redis.ttl(key), is(greaterThan(10)));
        assertThat(redis.ttl(key), is(not(greaterThan(21))));
    });
    
    test("Redis ttl, with a null key, returns the string representation of the type of the value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.ttl(null), is(-1));
        assertThat(redis.expire(null, 20), is(1));
        assertThat(redis.ttl(null), is(greaterThan(10)));
        assertThat(redis.ttl(null), is(not(greaterThan(21))));
    });
    
    test("Redis type, returns the remaining time to live of a key that has a timeout", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.lpush(key2, "One"), is(1));
        assertThat(redis.sadd(key3, "One"), is(1));
        assertThat(redis.type(key), is("string"));
        assertThat(redis.type(key2), is("list"));
        assertThat(redis.type(key3), is("set"));
    });
    
    test("Redis type, with a null key, returns the remaining time to live of a key that has a timeout", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.type(null), is("string"));
    });
});

suite("Redis strings tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";
    var key2 = "redis_test_key2";
    var key3 = "redis_test_key3";
    
    test("Redis append, if key already exists and is a string, this command appends the value at the end of the string", function(){
        ensureAbsent(redis);
        assertThat(redis.append(key, "One"), is(3));
        assertThat(redis.append(key, " Two"), is(7));
        assertThat(redis.get(key), is("One Two"));
    });
    
    test("Redis append, with a null key, if key already exists and is a string, this command appends the value at the end of the string", function(){
        ensureAbsent(redis);
        assertThat(redis.append(null, "One"), is(3));
        assertThat(redis.append(null, " Two"), is(7));
        assertThat(redis.get(null), is("One Two"));
    });
    
     test("Redis append, with a null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.append(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis bitcount, count the number of set bits (population counting) in a string", function(){
        ensureAbsent(redis);
        assertThat(redis.bitcount(key), is(0));
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.bitcount(key), is(14));
    });
    
    test("Redis bitcount, count the number of set bits (population counting) in a string with range", function(){
        ensureAbsent(redis);
        assertThat(redis.bitcount(key), is(0));
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.bitcount(key, 1, 1), is(5));
    });
    
    test("Redis bitcount, with a null key, count the number of set bits (population counting) in a string", function(){
        ensureAbsent(redis);
        assertThat(redis.bitcount(null), is(0));
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.bitcount(null), is(14));
    });
    
    test("Redis bitcount, with a null key, count the number of set bits (population counting) in a string with range", function(){
        ensureAbsent(redis);
        assertThat(redis.bitcount(null), is(0));
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.bitcount(null, 1, 1), is(5));
    });
    
    test("Redis bitcount, with a null value for range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.bitcount(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.bitcount(string,null,null)"));
        }
    });
    
    test("Redis bitop, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key, AND bitop", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.bitop("AND", key3, key, key2), is(3));
        assertThat(redis.get(key3), is("Dfe"));
    });
    
    test("Redis bitop, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key, OR bitop", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.bitop("OR", key3, key, key2), is(3));
        assertThat(redis.get(key3), is("_\u007Fo"));
    });
    
    test("Redis bitop, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key, XOR bitop", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.bitop("XOR", key3, key, key2), is(3));
        assertThat(redis.get(key3), is("\u001B\u0019\n"));
    });
    
    // test("Redis bitop, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key, NOT bitop", function(){
    //     ensureAbsent(redis);
    //     assertThat(redis.mset(key, "One"), is("OK"));
    //     assertThat(redis.bitop("NOT", key2, key), is(3));
    //     assertThat(redis.get(key2), is("\xB0\x91\x9A")); 
    // });
    
    test("Redis bitop, with a null key1, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(null, "One", key2, "Two"), is("OK"));
        assertThat(redis.bitop("AND", key3, null, key2), is(3));
        assertThat(redis.get(key3), is("Dfe"));
    });
    
    test("Redis bitop, with a null key2, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", null, "Two"), is("OK"));
        assertThat(redis.bitop("OR", key3, key, null), is(3));
        assertThat(redis.get(key3), is("_\u007Fo"));
    });
    
    test("Redis bitop, with a null key3, perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.bitop("XOR", null, key, key2), is(3));
        assertThat(redis.get(null), is("\u001B\u0019\n"));
    });
    
    test("Redis bitop, with a null operator, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
           redis.bitop(null, key3, key, key2);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis decr, decrements the number stored at key by one", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, 10), is("OK"));
        assertThat(redis.decr(key), is(9));
    });
    
    test("Redis decr, with a null key, decrements the number stored at key by one", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, 10), is("OK"));
        assertThat(redis.decr(null), is(9));
    });
    
    test("Redis decrBy, decrements the number stored at key by decrement", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, 10), is("OK"));
        assertThat(redis.decrBy(key, 5), is(5));
    });
    
    test("Redis decrBy, with a null key, decrements the number stored at key by decrement", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, 10), is("OK"));
        assertThat(redis.decrBy(null, 5), is(5));
    });
    
    test("Redis decrBy, with null time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.decrBy(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.decrBy(string,null)"));
        }
    });
    
    test("Redis get, get the value of key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
    });
    
    test("Redis get, with a null key, get the value of key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.get(null), is("One"));
    });
    
    test("Redis setBit/getBit, sets/returns the bit value at offset in the string value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.getbit(key, 20), is(false));
        assertThat(redis.setbit(key, 20, true), is(false));
        assertThat(redis.getbit(key, 20), is(true));
    });
    
    test("Redis setBit/getBit, with a null key, sets/returns the bit value at offset in the string value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.getbit(null, 20), is(false));
        assertThat(redis.setbit(null, 20, true), is(false));
        assertThat(redis.getbit(null, 20), is(true));
    });
    
        test("Redis getBit, with null offset, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.getbit(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.getbit(string,null)"));
        }
    });
    
    test("Redis setBit, with null offset, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.setbit(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.setbit(string,null)"));
        }
    });
    
    test("Redis getRange, returns the substring of the string value stored at key, determined by the offsets start and end", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.getrange(key, 0, 1), is("On"));
    });
    
    test("Redis getRange, with a null key, returns the substring of the string value stored at key, determined by the offsets start and end", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.getrange(null, 0, 1), is("On"));
    });
    
    test("Redis getRange, with null offsets, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.getrange(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.getrange(string,null,null)"));
        }
    });
    
    test("Redis incr, increments the number stored at key by one", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, 10), is("OK"));
        assertThat(redis.incr(key), is(11));
    });
    
    test("Redis incr, with a null key, increments the number stored at key by one", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, 10), is("OK"));
        assertThat(redis.incr(null), is(11));
    });
    
    test("Redis incrBy, increments the number stored at key by increment", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, 10), is("OK"));
        assertThat(redis.incrBy(key, 5), is(15));
    });
    
    test("Redis incrBy, with a null key, increments the number stored at key by increment", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, 10), is("OK"));
        assertThat(redis.incrBy(null, 5), is(15));
    });
    
    test("Redis incrBy, with null time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.incrBy(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.incrBy(string,null)"));
        }
    });
    
    test("Redis incrByFloat, increment the string representing a floating point number stored at key by the specified increment", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, 10.1), is("OK"));
        assertThat(redis.incrByFloat(key, 5.5), is(15.6));
    });
    
    test("Redis incrByFloat, with a null key, increment the string representing a floating point number stored at key by the specified increment", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, 10.1), is("OK"));
        assertThat(redis.incrByFloat(null, 5.5), is(15.6));
    });
    
    test("Redis incrByFloat, with null time, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.incrByFloat(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.incrByFloat(string,null)"));
        }
    });
    
    test("Redis mset/mget, sets/returns the values of all specified keys", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", key2, "Two"), is("OK"));
        assertThat(redis.mget(key,key2), is(["One","Two"]));
    });
    
    test("Redis mset/mget, with null key1, sets/returns the values of all specified keys", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(null, "One", key2, "Two"), is("OK"));
        assertThat(redis.mget(null, key2), is(["One","Two"]));
    });
    
    test("Redis mset/mget, with null key2, sets/returns the values of all specified keys", function(){
        ensureAbsent(redis);
        assertThat(redis.mset(key, "One", null, "Two"), is("OK"));
        assertThat(redis.mget(key, null), is(["One","Two"]));
    });
    
    test("Redis mset, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.mset(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis msetnx, sets the given keys to their respective values. MSETNX will not perform any operation at all even if just a single key already exists", function(){
        ensureAbsent(redis);
        assertThat(redis.msetnx(key, "One", key2, "Two"), is(1));
        assertThat(redis.mget(key,key2), is(["One","Two"]));
        assertThat(redis.msetnx(key2, "Two", key3, "Three"), is(0));
        assertThat(redis.mget(key,key2,key3), is(["One","Two",null]));
    });
    
    test("Redis msetnx, with a null key1, sets the given keys to their respective values. MSETNX will not perform any operation at all even if just a single key already exists", function(){
        ensureAbsent(redis);
        assertThat(redis.msetnx(null, "One", key2, "Two"), is(1));
        assertThat(redis.mget(null,key2), is(["One","Two"]));
        assertThat(redis.msetnx(key2, "Two", key3, "Three"), is(0));
        assertThat(redis.mget(null,key2,key3), is(["One","Two",null]));
    });
    
    test("Redis msetnx, with a null key2, sets the given keys to their respective values. MSETNX will not perform any operation at all even if just a single key already exists", function(){
        ensureAbsent(redis);
        assertThat(redis.msetnx(key, "One", null, "Two"), is(1));
        assertThat(redis.mget(key,null), is(["One","Two"]));
        assertThat(redis.msetnx(null, "Two", key3, "Three"), is(0));
        assertThat(redis.mget(key,null,key3), is(["One","Two",null]));
    });
    
    test("Redis msetnx, with a null key3, sets the given keys to their respective values. MSETNX will not perform any operation at all even if just a single key already exists", function(){
        ensureAbsent(redis);
        assertThat(redis.msetnx(key, "One", key2, "Two"), is(1));
        assertThat(redis.mget(key,key2), is(["One","Two"]));
        assertThat(redis.msetnx(key2, "Two", null, "Three"), is(0));
        assertThat(redis.mget(key,key2,null), is(["One","Two",null]));
    });
    
    test("Redis msetnx, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.msetnx(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis psetex, works exactly like SETEX with the sole difference that the expire time is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.psetex(key, 20000, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.pttl(key), is(greaterThan(10000)));
        assertThat(redis.pttl(key), is(not(greaterThan(21000))));
    });
    
    test("Redis psetex, with a null key, works exactly like SETEX with the sole difference that the expire time is specified in milliseconds instead of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.psetex(null, 20000, "One"), is("OK"));
        assertThat(redis.get(null), is("One"));
        assertThat(redis.pttl(null), is(greaterThan(10000)));
        assertThat(redis.pttl(null), is(not(greaterThan(21000))));
    });
    
    test("Redis psetex, with a null time to live, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
        redis.psetex(key, null, "One");
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.psetex(string,null,string)"));
        }
    });
    
    test("Redis set, set key to hold the string value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
    });
    
    test("Redis set, set key to hold the string value with exists check", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One", "NX"), is("OK"));
        assertThat(redis.get(key), is("One"));
    });
    
    test("Redis set, set key to hold the string value, with exists check and time to live", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One", "NX", "PX", 200), is("OK"));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.pttl(key), is(greaterThan(10)));
        assertThat(redis.pttl(key), is(not(greaterThan(210))));
    });
    
    test("Redis set, with a null key, set key to hold the string value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.get(null), is("One"));
    });
    
    test("Redis set, with a null nx, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.set(key, "One", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis set, with a null px, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.set(key, "One", "NX", null, 20);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis set, with a null time to live, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.set(key, "One", "NX", "PX", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.set(string,string,string,string,null)"));
        }
    });
    
    test("Redis getset, atomically sets key to value and returns the old value stored at key. Returns an error when key exists but does not hold a string value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One"), is("OK"));
        assertThat(redis.getSet(key, "Two"), is("One"));
        assertThat(redis.get(key), is("Two"));
    });
    
    test("Redis getset, with a null key, atomically sets key to value and returns the old value stored at key. Returns an error when key exists but does not hold a string value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One"), is("OK"));
        assertThat(redis.getSet(null, "Two"), is("One"));
        assertThat(redis.get(null), is("Two"));
    });
    
    test("Redis getset, with a null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.getSet(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis setex, set key to hold the string value and set key to timeout after a given number of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.setex(key, 20, "One"), is("OK"));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.ttl(key), is(greaterThan(10)));
        assertThat(redis.ttl(key), is(not(greaterThan(21))));
    });
    
    test("Redis setex, with a null key, set key to hold the string value and set key to timeout after a given number of seconds", function(){
        ensureAbsent(redis);
        assertThat(redis.setex(null, 20, "One"), is("OK"));
        assertThat(redis.get(null), is("One"));
        assertThat(redis.ttl(null), is(greaterThan(10)));
        assertThat(redis.ttl(null), is(not(greaterThan(21))));
    });
    
    test("Redis setex, with a null time to live, Throws a Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.setex(key, null, "One");
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.setex(string,null,string)"));
        }
    });
    
    test("Redis setnx, set key to hold string value if key does not exist", function(){
        ensureAbsent(redis);
        assertThat(redis.setnx(key, "One"), is(1));
        assertThat(redis.get(key), is("One"));
        assertThat(redis.setnx(key, "Two"), is(0));
        assertThat(redis.get(key), is("One"));
    });
    
    test("Redis setnx, with a null key, set key to hold string value if key does not exist", function(){
        ensureAbsent(redis);
        assertThat(redis.setnx(null, "One"), is(1));
        assertThat(redis.get(null), is("One"));
        assertThat(redis.setnx(null, "Two"), is(0));
        assertThat(redis.get(null), is("One"));
    });
    
    test("Redis setnx, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.setnx(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis setrange, overwrites part of the string stored at key, starting at the specified offset, for the entire length of value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One Two Three"), is("OK"));
        assertThat(redis.get(key), is("One Two Three"));
        assertThat(redis.setrange(key, 4, "is a Number"), is(15));
        assertThat(redis.get(key), is("One is a Number"));
    });
    
    test("Redis setrange, with a null key, overwrites part of the string stored at key, starting at the specified offset, for the entire length of value", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One Two Three"), is("OK"));
        assertThat(redis.get(null), is("One Two Three"));
        assertThat(redis.setrange(null, 4, "is a Number"), is(15));
        assertThat(redis.get(null), is("One is a Number"));
    });
    
    test("Redis setrange, with a null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.setrange(key, 4, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis setrange, with a null offset, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.setrange(key, null, "is a Number");
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.setrange(string,null,string)"));
        }
    });
    
    test("Redis strlen, returns the length of the string value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(key, "One Two Three"), is("OK"));
        assertThat(redis.strlen(key), is(13));
    });
    
    test("Redis strlen, with a null key, returns the length of the string value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.set(null, "One Two Three"), is("OK"));
        assertThat(redis.strlen(null), is(13));
    });
});

suite("Redis hashes tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";

    test("Redis hDel, removes the specified fields from the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hset(key, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(key, "myHash"), is("hashValue"));
        assertThat(redis.hdel(key, "myHash"), is(1));
        assertThat(redis.hget(key, "myHash"), is(null));
    });
    
    test("Redis hDel, with a null key, removes the specified fields from the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hset(null, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(null, "myHash"), is("hashValue"));
        assertThat(redis.hdel(null, "myHash"), is(1));
        assertThat(redis.hget(null, "myHash"), is(null));
    });
    
    test("Redis hDel, with null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.hdel(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis hExists, checks if a hash is stored on a given key", function(){
        ensureAbsent(redis);
        assertThat(redis.hexists(key, "myHash"), is(false));
        assertThat(redis.hset(key, "myHash", "hashValue"), is(1));
        assertThat(redis.hexists(key, "myHash"), is(true));
    });
    
    test("Redis hExists, with a null key, checks if a hash is stored on a given key", function(){
        ensureAbsent(redis);
        assertThat(redis.hexists(null, "myHash"), is(false));
        assertThat(redis.hset(null, "myHash", "hashValue"), is(1));
        assertThat(redis.hexists(null, "myHash"), is(true));
    });
    
    test("Redis hExists, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.hexists(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis hset/hget, sets/returns the value associated with field in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hset(key, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(key, "myHash"), is("hashValue"));
    });
    
    test("Redis hset/hget, with null key, sets/returns the value associated with field in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hset(null, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(null, "myHash"), is("hashValue"));
    });
    
    test("Redis hget, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.hget(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis hset, with null value, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.hset(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.hset(string,null)"));
        }
    });
    
    test("Redis hgetAll, returns all fields and values of the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hmset(key, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hgetAll(key), is({myHash:"hashValue" , myHash2:"hashValue2"}));
    });
    
    test("Redis hgetAll, with null key, returns all fields and values of the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hmset(null, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hgetAll(null), is({myHash:"hashValue" , myHash2:"hashValue2"}));
    });
    
    test("Redis hincrBy, increments the number stored at field in the hash stored at key by increment", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hset(key, "myHash", 20), is(1));
        assertThat(redis.hget(key, "myHash"), is("20"));
        assertThat(redis.hincrBy(key, "myHash", 5), is(25));
        assertThat(redis.hget(key, "myHash"), is("25"));
        assertThat(redis.hincrBy(key, "myHash", -15), is(10));
        assertThat(redis.hget(key, "myHash"), is("10"));
    });
    
    test("Redis hincrBy, with a null key, increments the number stored at field in the hash stored at key by increment", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hset(null, "myHash", 20), is(1));
        assertThat(redis.hget(null, "myHash"), is("20"));
        assertThat(redis.hincrBy(null, "myHash", 5), is(25));
        assertThat(redis.hget(null, "myHash"), is("25"));
        assertThat(redis.hincrBy(null, "myHash", -15), is(10));
        assertThat(redis.hget(null, "myHash"), is("10"));
    });
    
    test("Redis hincrBy, with null increment, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.hincrBy(key, "myHash", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.hincrBy(string,string,null)"));
        }
    });
    
    test("Redis hincrByFloat, increment the specified field of an hash stored at key, and representing a floating point number, by the specified increment", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hset(key, "myHash", 20.5), is(1));
        assertThat(redis.hget(key, "myHash"), is("20.5"));
        assertThat(redis.hincrByFloat(key, "myHash", 5.2), is(25.7));
        assertThat(redis.hget(key, "myHash"), is("25.7"));
        assertThat(redis.hincrByFloat(key, "myHash", -15.3), is(10.4));
        assertThat(redis.hget(key, "myHash"), is("10.4"));
    });
    
    test("Redis hincrByFloat, with a null key, increment the specified field of an hash stored at key, and representing a floating point number, by the specified increment", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hset(null, "myHash", 20.5), is(1));
        assertThat(redis.hget(null, "myHash"), is("20.5"));
        assertThat(redis.hincrByFloat(null, "myHash", 5.2), is(25.7));
        assertThat(redis.hget(null, "myHash"), is("25.7"));
        assertThat(redis.hincrByFloat(null, "myHash", -15.3), is(10.4));
        assertThat(redis.hget(null, "myHash"), is("10.4"));
    });
    
    test("Redis hincrByFloat, with null increment, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.hincrByFloat(key, "myHash", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.hincrByFloat(string,string,null)"));
        }
    });
    
    test("Redis hkeys, returns all field names in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hmset(key, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hkeys(key), is(["myHash","myHash2"]));
    });
    
    test("Redis hkeys, with null key, returns all field names in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hmset(null, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hkeys(null), is(["myHash","myHash2"]));
    });
    
    test("Redis hlen, returns the number of fields contained in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hmset(key, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hlen(key), is(2));
    });
    
    test("Redis hlen, with null key, returns the number of fields contained in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hmset(null, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hlen(null), is(2));
    });
    
    test("Redis hmget/hmset, returns/sets the values associated with the specified fields in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hmset(key, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hmget(key, "myHash", "myHash2"), is(["hashValue","hashValue2"]));
    });
    
    test("Redis hmget/hmset, with a null key, returns/gets the values associated with the specified fields in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hmset(null, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hmget(null, "myHash", "myHash2"), is(["hashValue","hashValue2"]));
    });
    
    test("Redis hmget, with a null values, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.hmget(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis hmset, with a null values, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.hmset(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis hsetnx, sets field in the hash stored at key to value, only if field does not yet exist", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hsetnx(key, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(key, "myHash"), is("hashValue"));
        assertThat(redis.hsetnx(key, "myHash", "newHashValue"), is(0));
        assertThat(redis.hget(key, "myHash"), is("hashValue"));
    });
    
    test("Redis hsetnx, with a null key, sets field in the hash stored at key to value, only if field does not yet exist", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hsetnx(null, "myHash", "hashValue"), is(1));
        assertThat(redis.hget(null, "myHash"), is("hashValue"));
        assertThat(redis.hsetnx(null, "myHash", "newHashValue"), is(0));
        assertThat(redis.hget(null, "myHash"), is("hashValue"));
    });
    
    test("Redis hsetnx, with a null values, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.hsetnx(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.hsetnx(string,null)"));
        }
    });
    
    test("Redis hvals, returns all values in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(key, "myHash"), is(null));
        assertThat(redis.hmset(key, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hvals(key), contains("hashValue"));
        assertThat(redis.hvals(key), contains("hashValue2"));
    });
    
    test("Redis hvals, with null key, returns all values in the hash stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.hget(null, "myHash"), is(null));
        assertThat(redis.hmset(null, {"myHash": "hashValue", "myHash2": "hashValue2"}), is("OK"));
        assertThat(redis.hvals(null), contains("hashValue"));
        assertThat(redis.hvals(null), contains("hashValue2"));
    });
});

suite("Redis lists tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";
    var key2 = "redis_test_key2";
    
    test("Redis lindex, returns the element at index index in the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.lindex(key, 0), is(null));
        assertThat(redis.lpush(key, "One"), is(1));
        assertThat(redis.lindex(key, 0), is("One"));
    });
    
    test("Redis lindex, with a null key, returns the element at index index in the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.lindex(null, 0), is(null));
        assertThat(redis.lpush(null, "One"), is(1));
        assertThat(redis.lindex(null, 0), is("One"));
    });
    
    test("Redis lindex, with null index, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.lindex(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.lindex(string,null)"));
        }
    });
    
    test("Redis linsert, inserts value in the list stored at key either before or after the reference value pivot", function(){
        ensureAbsent(redis);
        assertThat(redis.lrange(key, 0, -1), is([]));
        assertThat(redis.rpush(key, "One", "Three"), is(2));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.linsert(key, "BEFORE", "Three", "Two"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lindex(key, 1), is("Two"));
    });
    
    test("Redis linsert, with a null key, inserts value in the list stored at key either before or after the reference value pivot", function(){
        ensureAbsent(redis);
        assertThat(redis.lrange(null, 0, -1), is([]));
        assertThat(redis.rpush(null, "One", "Three"), is(2));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.linsert(null, "BEFORE", "Three", "Two"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lindex(null, 1), is("Two"));
    });
    
    test("Redis linsert, with null pivot, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.linsert(key, null, "Three", "Two");
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis llen, returns the length of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One", "Three"), is(2));
        assertThat(redis.llen(key), is(2));
    });
    
    test("Redis llen, with a null key, returns the length of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One", "Three"), is(2));
        assertThat(redis.llen(null), is(2));
    });
    
    test("Redis lpop, removes and returns the first element of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two", "Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lpop(key), is("One"));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.lrange(key, 0, -1), not(contains("One")));
    });
    
    test("Redis lpop, with a null key, removes and returns the first element of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One","Two", "Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lpop(null), is("One"));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.lrange(null, 0, -1), not(contains("One")));
    });
    
    test("Redis lpush, inserts all the specified values at the head of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.lpush(key, "Two"), is(1));
        assertThat(redis.llen(key), is(1));
        assertThat(redis.lindex(key, 0), is("Two"));
        assertThat(redis.lpush(key, "One"), is(2));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.lindex(key, 0), is("One"));
    });
    
    test("Redis lpush, with a null key, inserts all the specified values at the head of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.lpush(null, "Two"), is(1));
        assertThat(redis.llen(null), is(1));
        assertThat(redis.lindex(null, 0), is("Two"));
        assertThat(redis.lpush(null, "One"), is(2));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.lindex(null, 0), is("One"));
    });
    
    test("Redis lpush, with null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.lpush(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis lpushx, inserts value at the head of the list stored at key, only if key already exists and holds a list", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.lpushx(key, "One"), is(0));
        assertThat(redis.llen(key), is(0));
        assertThat(redis.lpush(key, "Two"), is(1));
        assertThat(redis.llen(key), is(1));
        assertThat(redis.lindex(key, 0), is("Two"));
        assertThat(redis.lpushx(key, "One"), is(2));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.lindex(key, 0), is("One"));
    });
    
    test("Redis lpushx, with a null key, inserts value at the head of the list stored at key, only if key already exists and holds a list", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.lpushx(null, "One"), is(0));
        assertThat(redis.llen(null), is(0));
        assertThat(redis.lpush(null, "Two"), is(1));
        assertThat(redis.llen(null), is(1));
        assertThat(redis.lindex(null, 0), is("Two"));
        assertThat(redis.lpushx(null, "One"), is(2));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.lindex(null, 0), is("One"));
    });
    
    test("Redis lpushx, with null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.lpushx(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis lrange, returns the specified elements of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One", "Two"), is(2));
        assertThat(redis.lrange(key, 0, 0), is(["One"]));
        assertThat(redis.lrange(key, 1, 1), is(["Two"]));
    });
    
    test("Redis lrange, with a null key, returns the specified elements of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One", "Two"), is(2));
        assertThat(redis.lrange(null, 0, 0), is(["One"]));
        assertThat(redis.lrange(null, 1, 1), is(["Two"]));
    });
    
    test("Redis lrange, with null offsets, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.lrange(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.lrange(string,null,null)"));
        }
    });
    
    test("Redis lrem, removes the first count occurrences of elements equal to value from the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One", "Two","Two", "Three"), is(4));
        assertThat(redis.llen(key), is(4));
        assertThat(redis.lrem(key, 2, "Two"), is(2));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.lrange(key, 0, -1), is(["One","Three"]));
    });
    
    test("Redis lrem, with a null key, removes the first count occurrences of elements equal to value from the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One", "Two","Two", "Three"), is(4));
        assertThat(redis.llen(null), is(4));
        assertThat(redis.lrem(null, 2, "Two"), is(2));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.lrange(null, 0, -1), is(["One","Three"]));
    });
    
    test("Redis lrem, with null value, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.lrem(key, null, "Two");
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.lrem(string,null,string)"));
        }
    });
    
    test("Redis lrem, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.lrem(key, 2, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis lset, sets the list element at index to value", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One", "Two", "Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.lset(key, 0, "Four"), is("OK"));
        assertThat(redis.lset(key, -2, "Five"), is("OK"));
        assertThat(redis.lset(key, 2, "Six"), is("OK"));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["Four","Five","Six"]));
    });
    
    test("Redis lset, with a null key, sets the list element at index to value", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One", "Two", "Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.lset(null, 0, "Four"), is("OK"));
        assertThat(redis.lset(null, -2, "Five"), is("OK"));
        assertThat(redis.lset(null, 2, "Six"), is("OK"));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["Four","Five","Six"]));
    });
    
    test("Redis lset, with null index, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
        redis.lset(key, null, "Five");
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.lset(string,null,string)"));
        }
    });
    
    test("Redis lset, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.lset(key, 2, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis ltrim, trim an existing list so that it will contain only the specified range of elements", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One", "Two", "Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.ltrim(key, 1, -2), is("OK"));
        assertThat(redis.llen(key), is(1));
        assertThat(redis.lrange(key, 0, -1), is(["Two"]));
    });
    
    test("Redis ltrim, with a null key, trim an existing list so that it will contain only the specified range of elements", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One", "Two", "Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.ltrim(null, 1, -2), is("OK"));
        assertThat(redis.llen(null), is(1));
        assertThat(redis.lrange(null, 0, -1), is(["Two"]));
    });
    
    test("Redis ltrim, with null ranges, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.ltrim(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.ltrim(string,null,null)"));
        }
    });
    
    test("Redis rpop, removes and returns the last element of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two", "Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.rpop(key), is("Three"));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.lrange(key, 0, -1), not(contains("Three")));
    });
    
    test("Redis rpop, with a null key, removes and returns the last element of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One","Two", "Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.rpop(null), is("Three"));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.lrange(null, 0, -1), not(contains("Three")));
    });
    
    test("Redis rpoplpush, atomically returns and removes the last element (tail) of the list stored at source, and pushes the element at the first element (head) of the list stored at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two","Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.rpoplpush(key, key2), is("Three"));
        assertThat(redis.lrange(key, 0, -1), not(contains("Three")));
        assertThat(redis.lrange(key2, 0, -1), is(["Three"]));
    });
    
    test("Redis rpoplpush, with a null key1, atomically returns and removes the last element (tail) of the list stored at source, and pushes the element at the first element (head) of the list stored at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One","Two","Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.rpoplpush(null, key2), is("Three"));
        assertThat(redis.lrange(null, 0, -1), not(contains("Three")));
        assertThat(redis.lrange(key2, 0, -1), is(["Three"]));
    });
    
    test("Redis rpoplpush, with a null key2, atomically returns and removes the last element (tail) of the list stored at source, and pushes the element at the first element (head) of the list stored at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two","Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
        assertThat(redis.rpoplpush(key, null), is("Three"));
        assertThat(redis.lrange(key, 0, -1), not(contains("Three")));
        assertThat(redis.lrange(null, 0, -1), is(["Three"]));
    });
    
    test("Redis rpush, insert all the specified values at the tail of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two","Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
    });
    
    test("Redis rpush, with a null key, insert all the specified values at the tail of the list stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One","Two","Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["One","Two","Three"]));
    });
    
    test("Redis rpushx, inserts value at the tail of the list stored at key, only if key already exists and holds a list", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpushx(key, "Three"), is(0));
        assertThat(redis.llen(key), is(0));
        assertThat(redis.rpush(key, "One","Two"), is(2));
        assertThat(redis.llen(key), is(2));
        assertThat(redis.rpushx(key, "Three"), is(3));
        assertThat(redis.llen(key), is(3));
        assertThat(redis.lrange(key, 0, -1), is(["One","Two","Three"]));
    });
    
    test("Redis rpushx, with a null key, inserts value at the tail of the list stored at key, only if key already exists and holds a list", function(){
        ensureAbsent(redis);
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpushx(null, "Three"), is(0));
        assertThat(redis.llen(null), is(0));
        assertThat(redis.rpush(null, "One","Two"), is(2));
        assertThat(redis.llen(null), is(2));
        assertThat(redis.rpushx(null, "Three"), is(3));
        assertThat(redis.llen(null), is(3));
        assertThat(redis.lrange(null, 0, -1), is(["One","Two","Three"]));
    });
});

suite("Redis sets tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";
    var key2 = "redis_test_key2";
    var key3 = "redis_test_key3";

    test("Redis sadd, add the specified members to the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One"), is(1));
        assertThat(redis.scard(key), is(1));
    });
    
    test("Redis sadd, with a null key, add the specified members to the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One"), is(1));
        assertThat(redis.scard(null), is(1));
    });
    
    test("Redis sadd, with a null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.sadd(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis sdiff, returns the members of the set resulting from the difference between the first set and all the successive sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sdiff(key2,key), contains("Four"));
        assertThat(redis.sdiff(key2,key), contains("Five"));
        assertThat(redis.sdiff(key2,key), contains("Six"));
    });
    
    test("Redis sdiff, with a null key1, returns the members of the set resulting from the difference between the first set and all the successive sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sdiff(key2,null), contains("Four"));
        assertThat(redis.sdiff(key2,null), contains("Five"));
        assertThat(redis.sdiff(key2,null), contains("Six"));
    });
    
    test("Redis sdiff, with a null key2, returns the members of the set resulting from the difference between the first set and all the successive sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(null), is(6));
        assertThat(redis.sdiff(null,key), contains("Four"));
        assertThat(redis.sdiff(null,key), contains("Five"));
        assertThat(redis.sdiff(null,key), contains("Six"));
    });
    
    test("Redis sdiffstore, this command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sdiffstore(key3,key2,key), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("Four"));
        assertThat(redis.smembers(key3), contains("Five"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sdiffstore, with a null key1, this command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sdiffstore(key3,key2,null), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("Four"));
        assertThat(redis.smembers(key3), contains("Five"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sdiffstore, with a null key2, this command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(null), is(6));
        assertThat(redis.sdiffstore(key3,null,key), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("Four"));
        assertThat(redis.smembers(key3), contains("Five"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sdiffstore, with a null key3, this command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sdiffstore(null,key2,key), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.smembers(null), contains("Four"));
        assertThat(redis.smembers(null), contains("Five"));
        assertThat(redis.smembers(null), contains("Six"));
    });
    
    test("Redis sinter, returns the members of the set resulting from the intersection of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sinter(key2,key), contains("One"));
        assertThat(redis.sinter(key2,key), contains("Two"));
        assertThat(redis.sinter(key2,key), contains("Three"));
    });
    
    test("Redis sinter, with a null key1, returns the members of the set resulting from the intersection of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sinter(key2,null), contains("One"));
        assertThat(redis.sinter(key2,null), contains("Two"));
        assertThat(redis.sinter(key2,null), contains("Three"));
    });
    
    test("Redis sinter, with a null key2, returns the members of the set resulting from the intersection of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(null), is(6));
        assertThat(redis.sinter(null,key), contains("One"));
        assertThat(redis.sinter(null,key), contains("Two"));
        assertThat(redis.sinter(null,key), contains("Three"));
    });
    
    test("Redis sinterstore, this command is equal to SINTER, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sinterstore(key3,key2,key), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Two"));
        assertThat(redis.smembers(key3), contains("Three"));
    });
    
    test("Redis sinterstore, with a null key1, this command is equal to SINTER, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sinterstore(key3,key2,null), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Two"));
        assertThat(redis.smembers(key3), contains("Three"));
    });
    
    test("Redis sinterstore, with a null key2, this command is equal to SINTER, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(null), is(6));
        assertThat(redis.sinterstore(key3,null,key), is(3));
        assertThat(redis.scard(key3), is(3));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Two"));
        assertThat(redis.smembers(key3), contains("Three"));
    });
    
    test("Redis sinterstore, with a null key3, this command is equal to SINTER, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "One", "Two", "Three", "Four", "Five", "Six"), is(6));
        assertThat(redis.scard(key2), is(6));
        assertThat(redis.sinterstore(null,key2,key), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.smembers(null), contains("One"));
        assertThat(redis.smembers(null), contains("Two"));
        assertThat(redis.smembers(null), contains("Three"));
    });
    
    test("Redis sismember, returns if member is a member of the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sismember(key, "One"), is(true));
        assertThat(redis.sismember(key, "Four"), is(false));
    });
    
    test("Redis sismember, with a null key, returns if member is a member of the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sismember(null, "One"), is(true));
        assertThat(redis.sismember(null, "Four"), is(false));
    });
    
    test("Redis smembers, returns all the members of the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.smembers(key), contains("One"));
        assertThat(redis.smembers(key), contains("Two"));
        assertThat(redis.smembers(key), contains("Three"));
    });
    
    test("Redis smembers, with null key, returns all the members of the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.smembers(null), contains("One"));
        assertThat(redis.smembers(null), contains("Two"));
        assertThat(redis.smembers(null), contains("Three"));
    });
    
    test("Redis smove, move member from the set at source to the set at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two"), is(2));
        assertThat(redis.scard(key), is(2));
        assertThat(redis.sadd(key2, "Three"), is(1));
        assertThat(redis.scard(key2), is(1));
        assertThat(redis.smove(key, key2, "Two"), is(1));
        assertThat(redis.scard(key), is(1));
        assertThat(redis.scard(key2), is(2));
    });
    
    test("Redis smove, with null key1, move member from the set at source to the set at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two"), is(2));
        assertThat(redis.scard(null), is(2));
        assertThat(redis.sadd(key2, "Three"), is(1));
        assertThat(redis.scard(key2), is(1));
        assertThat(redis.smove(null, key2, "Two"), is(1));
        assertThat(redis.scard(null), is(1));
        assertThat(redis.scard(key2), is(2));
    });
    
    test("Redis smove, with null key2, move member from the set at source to the set at destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two"), is(2));
        assertThat(redis.scard(key), is(2));
        assertThat(redis.sadd(null, "Three"), is(1));
        assertThat(redis.scard(null), is(1));
        assertThat(redis.smove(key, null, "Two"), is(1));
        assertThat(redis.scard(key), is(1));
        assertThat(redis.scard(null), is(2));
    });
    
    test("Redis spop, removes and returns a random element from the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        var removed = redis.spop(key);
        assertThat(redis.scard(key), is(2));
        assertThat(redis.smembers(key), not(contains(removed)));
    });
    
    test("Redis spop, with null key, removes and returns a random element from the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        var removed = redis.spop(null);
        assertThat(redis.scard(null), is(2));
        assertThat(redis.smembers(null), not(contains(removed)));
    });
    
    test("Redis srandmember, when called with just the key argument, return a random element from the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.smembers(key), contains(redis.srandmember(key)));
    });
    
    test("Redis srandmember, with null key, when called with just the key argument, return a random element from the set value stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.smembers(null), contains(redis.srandmember(null)));
    });
    
    test("Redis srandmember, when called with the additional count argument, return an array of count", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        var returned = redis.srandmember(key, 2);
        assertThat(redis.smembers(key), contains(returned[0]));
        assertThat(redis.smembers(key), contains(returned[1]));
    });
    
    test("Redis srandmember, with null key, when called with the additional count argument, return an array of count", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        var returned = redis.srandmember(null, 2);
        assertThat(redis.smembers(null), contains(returned[0]));
        assertThat(redis.smembers(null), contains(returned[1]));
    });
    
    test("Redis srandmember, with null count, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.srandmember(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.srandmember(string,null)"));
        }
    });
    
    test("Redis srem, remove the specified members from the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.srem(key, "Two"), is(1));
        assertThat(redis.smembers(key), not(contains("Two")));
    });
    
    test("Redis srem, with null key, remove the specified members from the set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.srem(null, "Two"), is(1));
        assertThat(redis.smembers(null), not(contains("Two")));
    });
    
    test("Redis srem, with null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.srem(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis sunion, returns the members of the set resulting from the union of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(key2), is(3));
        assertThat(redis.sunion(key,key2), contains("One"));
        assertThat(redis.sunion(key,key2), contains("Six"));
    });
    
    test("Redis sunion, with null key1, returns the members of the set resulting from the union of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(key2), is(3));
        assertThat(redis.sunion(null,key2), contains("One"));
        assertThat(redis.sunion(null,key2), contains("Six"));
    });
    
    test("Redis sunion, with null key2, returns the members of the set resulting from the union of all the given sets", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sunion(key,null), contains("One"));
        assertThat(redis.sunion(key,null), contains("Six"));
    });
    
    test("Redis sunionstore, this command is equal to SUNION, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(key2), is(3));
        assertThat(redis.sunionstore(key3,key,key2), is(6));
        assertThat(redis.scard(key3), is(6));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sunionstore, with null key1, this command is equal to SUNION, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(null), is(0));
        assertThat(redis.sadd(null, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sadd(key2, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(key2), is(3));
        assertThat(redis.sunionstore(key3,null,key2), is(6));
        assertThat(redis.scard(key3), is(6));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sunionstore, with null key2, this command is equal to SUNION, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(null, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(null), is(3));
        assertThat(redis.sunionstore(key3,key,null), is(6));
        assertThat(redis.scard(key3), is(6));
        assertThat(redis.smembers(key3), contains("One"));
        assertThat(redis.smembers(key3), contains("Six"));
    });
    
    test("Redis sunionstore, with null key3, this command is equal to SUNION, but instead of returning the resulting set, it is stored in destination", function(){
        ensureAbsent(redis);
        assertThat(redis.scard(key), is(0));
        assertThat(redis.sadd(key, "One", "Two", "Three"), is(3));
        assertThat(redis.scard(key), is(3));
        assertThat(redis.sadd(key2, "Four", "Five", "Six"), is(3));
        assertThat(redis.scard(key2), is(3));
        assertThat(redis.sunionstore(null,key,key2), is(6));
        assertThat(redis.scard(null), is(6));
        assertThat(redis.smembers(null), contains("One"));
        assertThat(redis.smembers(null), contains("Six"));
    });
});

suite("Redis sorted sets tests", function(){
    
    var redis = Spark.getRedis();
    var key = "redis_test_key";
    var key2 = "redis_test_key2";
    var key3 = "redis_test_key3";

    test("Redis zadd/zcard, adds/returns all the specified members with the specified scores to the sorted set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.zcard(key), is(0));
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zcard(key), is(1));
    });
    
    test("Redis zadd/zcard, with a null key, adds/returns all the specified members with the specified scores to the sorted set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.zcard(null), is(0));
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zcard(null), is(1));
    });
    
    test("Redis zadd, with a null score, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zadd(key,null, "One");
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zadd(string,null,string)"));
        }
    });
    
    test("Redis zadd, with a null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zadd(key,1, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zcount, count the members in a sorted set with scores within the given values using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zcount(key, "-inf", "+inf"), is(3));
    });
    
    test("Redis zcount, count the members in a sorted set with scores within the given values using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zcount(key, 1, 3), is(3));
    });
    
    test("Redis zcount, with null key, count the members in a sorted set with scores within the given values", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zcount(null, 1, 3), is(3));
    });
    
    test("Redis zcount, with null values, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zcount(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zincrby, increment the score of a member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zscore(key, "One"), is(1));
        assertThat(redis.zincrby(key, 2, "One"), is(3));
        assertThat(redis.zscore(key, "One"), is(3));
    });
    
    test("Redis zincrby, with null key, increment the score of a member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zscore(null, "One"), is(1));
        assertThat(redis.zincrby(null, 2, "One"), is(3));
        assertThat(redis.zscore(null, "One"), is(3));
    });
    
    test("Redis zincrby, with null increment, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zincrby(key, null, "One");
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zincrby(string,null,string)"));
        }
    });
    
    test("Redis zincrby, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zincrby(key, 2, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zinterstore, intersect multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zinterstore(key3, key, key2), is(2));
        assertThat(redis.zrange(key3, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zinterstore, with null key1, intersect multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zinterstore(key3, null, key2), is(2));
        assertThat(redis.zrange(key3, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zinterstore, with null key2, intersect multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zinterstore(key3, key, null), is(2));
        assertThat(redis.zrange(key3, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zinterstore, with null key3, intersect multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zinterstore(null, key, key2), is(2));
        assertThat(redis.zrange(null, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zrange, return a range of members in a sorted set, by index", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key, 1, "One"), is(1));
        assertThat(redis.zadd(key, 2, "Two"), is(1));
        assertThat(redis.zrange(key, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zrange, with null key, return a range of members in a sorted set, by index", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null, 1, "One"), is(1));
        assertThat(redis.zadd(null, 2, "Two"), is(1));
        assertThat(redis.zrange(null, 0, -1), is(["One","Two"]));
    });
    
    test("Redis zrange,with null index, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrange(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrange(string,null,null)"));
        }
    });
    
    test("Redis zrangeByScore, return a range of members in a sorted set, by score using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(key, "-inf", "+inf"), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, return a range of members in a sorted set, by score using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(key, 1, 2), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, with null key, return a range of members in a sorted set, by score using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(null, "-inf", "+inf"), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScore(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrangeByScore, return a range of members in a sorted set, by score using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(key, "-inf", "+inf", 0, 10), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, return a range of members in a sorted set, by score using number, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(key, 1, 2, 0, 10), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, with null key, return a range of members in a sorted set, by score using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zrangeByScore(null, "-inf", "+inf", 0, 10), is(["One","Two"]));
    });
    
    test("Redis zrangeByScore, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScore(key, null, null, 0, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrangeByScore, with offset range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScore(key, 1, 2, null, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrangeByScore(string,number,number,null,number)"));
        }
    });
    
    test("Redis zrangeByScore, with count range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScore(key, 1, 2, 0, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrangeByScore(string,number,number,number,null)"));
        }
    });
    
    test("Redis zrangeByScoreWithScores, return a range of members in a sorted set, by score using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScoreWithScores(key, "-inf", "+inf"), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeByScoreWithScores, return a range of members in a sorted set, by score using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScoreWithScores(key, 1, 2), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeByScoreWithScores, with null key, return a range of members in a sorted set, by score using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zrangeByScoreWithScores(null, "-inf", "+inf"), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeByScoreWithScores, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScoreWithScores(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrangeByScoreWithScores, return a range of members in a sorted set, by score using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScoreWithScores(key, "-inf", "+inf", 0, 10), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeByScoreWithScores, return a range of members in a sorted set, by score using number, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrangeByScoreWithScores(key, 1, 2, 0, 10), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeByScoreWithScores, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScoreWithScores(key, null, null, 0, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrangeByScoreWithScores, with offset range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScoreWithScores(key, 1, 2, null, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrangeByScoreWithScores(string,number,number,null,number)"));
        }
    });
    
    test("Redis zrangeByScoreWithScores, with count range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeByScoreWithScores(key, 1, 2, 0, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrangeByScoreWithScores(string,number,number,number,null)"));
        }
    });
    
    test("Redis zrangeWithScores, return a range with scores of members in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key, 1, "One"), is(1));
        assertThat(redis.zadd(key, 2, "Two"), is(1));
        assertThat(redis.zrangeWithScores(key, 0, -1), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeWithScores, with null key, return a range with scores of members in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null, 1, "One"), is(1));
        assertThat(redis.zadd(null, 2, "Two"), is(1));
        assertThat(redis.zrangeWithScores(null, 0, -1), is([{One : 1}, {Two : 2}]));
    });
    
    test("Redis zrangeWithScores, with null range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrangeWithScores(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrangeWithScores(string,null,null)"));
        }
    });
    
    test("Redis zrank, determine the index of a member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key, 1, "One"), is(1));
        assertThat(redis.zadd(key, 2, "Two"), is(1));
        assertThat(redis.zrank(key, "Two"), is(1));
    });
    
    test("Redis zrank, with null key, determine the index of a member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null, 1, "One"), is(1));
        assertThat(redis.zadd(null, 2, "Two"), is(1));
        assertThat(redis.zrank(null, "Two"), is(1));
    });
    
    test("Redis zrank, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrank(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrem, remove one or more members from a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zrem(key, "One", "Two"), is(2));
        assertThat(redis.zrange(key, 0, -1), is([]));
    });
    
    test("Redis zrem, with null value, Throws Null Pointer Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrem(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException"));
        }
    });
    
    test("Redis zremrangeByRank, remove all members in a sorted set within the given indexes", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zremrangeByRank(key, 0, -1), is(2));
        assertThat(redis.zrange(key, 0, -1), is([]));
    });
    
    test("Redis zremrangeByRank, with null key, remove all members in a sorted set within the given indexes", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zremrangeByRank(null, 0, -1), is(2));
        assertThat(redis.zrange(null, 0, -1), is([]));
    });
    
    test("Redis zremrangeByRank, with null range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zremrangeByRank(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zremrangeByRank(string,null,null)"));
        }
    });
    
    test("Redis zremrangeByScore, remove all members in a sorted set within the given scores, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zremrangeByScore(key, "-inf", "+inf"), is(2));
        assertThat(redis.zrange(key, 0, -1), is([]));
    });
    
    test("Redis zremrangeByScore, remove all members in a sorted set within the given scores, using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zremrangeByScore(key, 1, 2), is(2));
        assertThat(redis.zrange(key, 0, -1), is([]));
    });
    
    test("Redis zremrangeByScore, with null key, remove all members in a sorted set within the given scores, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zremrangeByScore(null, "-inf", "+inf"), is(2));
        assertThat(redis.zrange(null, 0, -1), is([]));
    });
    
    test("Redis zremrangeByScore, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zremrangeByScore(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrevrange, return a range of members in a sorted set, by index, with scores ordered from high to low", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrange(key, 0, -1), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrange, with null key, return a range of members in a sorted set, by index, with scores ordered from high to low", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrange(null, 0, -1), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrange, with null range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrange(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrange(string,null,null)"));
        }
    });
    
    test("Redis zrevrangeByScore, return a range of members in a sorted set, by score, with scores ordered from high to low, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(key, "+inf", "-inf"), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, return a range of members in a sorted set, by score, with scores ordered from high to low, using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(key, 4, 1), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, with null key, return a range of members in a sorted set, by score, with scores ordered from high to low, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(null, "+inf", "-inf"), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScore(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrevrangeByScore, return a range of members in a sorted set, by score, with scores ordered from high to low, using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(key, "+inf", "-inf", 0, 10), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, with null key, return a range of members in a sorted set, by score, with scores ordered from high to low, using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(null, "+inf", "-inf", 0, 10), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, return a range of members in a sorted set, by score, with scores ordered from high to low, using number, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScore(key, 4, 1, 0, 10), is(["One","Three","Two","Four"]));
    });
    
    test("Redis zrevrangeByScore, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScore(key, null, null, 0, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrevrangeByScore, with offset range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScore(key, 1, 2, null, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrangeByScore(string,number,number,null,number)"));
        }
    });
    
    test("Redis zrevrangeByScore, with count range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScore(key, 1, 2, 0, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrangeByScore(string,number,number,number,null)"));
        }
    });

    test("Redis zrevrangeByScoreWithScores, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(key, "+inf", "-inf"), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using number", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(key, 4, 1), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores, with null key, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using string", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(null, "+inf", "-inf"), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScoreWithScores(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrevrangeByScoreWithScores, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(key, "+inf", "-inf", 0, 10), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using number, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(key, 4, 1, 0, 10), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores,with null key, return a range and score of members in a sorted set, by score, with scores ordered from high to low, using string, offset and count", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrangeByScoreWithScores(null, "+inf", "-inf", 0, 10), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeByScoreWithScores, with null range, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScoreWithScores(key, null, null, 0, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zrevrangeByScoreWithScores, with offset range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScoreWithScores(key, 1, 2, null, 10);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrangeByScoreWithScores(string,number,number,null,number)"));
        }
    });
    
    test("Redis zrevrangeByScoreWithScores, with count range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeByScoreWithScores(key, 1, 2, 0, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrangeByScoreWithScores(string,number,number,number,null)"));
        }
    });
    
    test("Redis zrevrangeWithScores, Adds all the specified members with the specified scores to the sorted set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zadd(key,1, "Four"), is(1));
        assertThat(redis.zrevrangeWithScores(key, 0, -1), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeWithScores, with null key, Adds all the specified members with the specified scores to the sorted set stored at key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zadd(null,1, "Four"), is(1));
        assertThat(redis.zrevrangeWithScores(null, 0, -1), is([{One : 4}, {Three : 3}, {Two : 2}, {Four : 1}]));
    });
    
    test("Redis zrevrangeWithScores, with null range, Throws Method Not Found Error", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrangeWithScores(key, null, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.redis.SparkRedisImpl.zrevrangeWithScores(string,null,null)"));
        }
    });
    
    test("Redis zrevrank, determine the index of a member in a sorted set, with scores ordered from high to low", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,4, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key,3, "Three"), is(1));
        assertThat(redis.zrevrank(key, "Three"), is(1));
    });
    
    test("Redis zrevrank, with null key, determine the index of a member in a sorted set, with scores ordered from high to low", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,4, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zrevrank(null, "Three"), is(1));
    });
    
    test("Redis zrevrank, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zrevrank(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zscore, get the score associated with the given member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,7, "One"), is(1));
        assertThat(redis.zscore(key, "One"), is(7));
    });
    
    test("Redis zscore, with null key, get the score associated with the given member in a sorted set", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,7, "One"), is(1));
        assertThat(redis.zscore(null, "One"), is(7));
    });
    
    test("Redis zscore, with null value, Throws Jedis Data Exception", function(){
        ensureAbsent(redis);
        try{
            redis.zscore(key, null);
            fail();
         } catch(e){
             assertThat(e.message, contains("redis.clients.jedis.exceptions.JedisDataException"));
        }
    });
    
    test("Redis zunionstore, add multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zunionstore(key3, key, key2), is(3));
        assertThat(redis.zrangeByScoreWithScores(key3, "-inf", "+inf"), is([{One : 2}, {Three : 3}, {Two : 4}]));
    });
    
    test("Redis zunionstore, with null key1, add multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zunionstore(key3, null, key2), is(3));
        assertThat(redis.zrangeByScoreWithScores(key3, "-inf", "+inf"), is([{One : 2}, {Three : 3}, {Two : 4}]));
    });
    
    test("Redis zunionstore, with null key2, add multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(null,1, "One"), is(1));
        assertThat(redis.zadd(null,2, "Two"), is(1));
        assertThat(redis.zadd(null,3, "Three"), is(1));
        assertThat(redis.zunionstore(key3, key, null), is(3));
        assertThat(redis.zrangeByScoreWithScores(key3, "-inf", "+inf"), is([{One : 2}, {Three : 3}, {Two : 4}]));
    });
    
    test("Redis zunionstore, with null key3, add multiple sorted sets and store the resulting sorted set in a new key", function(){
        ensureAbsent(redis);
        assertThat(redis.zadd(key,1, "One"), is(1));
        assertThat(redis.zadd(key,2, "Two"), is(1));
        assertThat(redis.zadd(key2,1, "One"), is(1));
        assertThat(redis.zadd(key2,2, "Two"), is(1));
        assertThat(redis.zadd(key2,3, "Three"), is(1));
        assertThat(redis.zunionstore(null, key, key2), is(3));
        assertThat(redis.zrangeByScoreWithScores(null, "-inf", "+inf"), is([{One : 2}, {Three : 3}, {Two : 4}]));
    });
});