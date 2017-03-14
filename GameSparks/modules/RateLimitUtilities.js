requireOnce("GeneralUtilities");

// redis.get() and redis.setex() work with strings
const desiredValue = "set!";

function IsRateLimited(key) {
    var redis = Spark.getRedis();

    var value = redis.get(key);

    // Spark.getLog().info(FormatString("K: {0}, V: {1}, type: {2}",
    //     key,
    //     value,
    //     typeof(value)));

    return value === desiredValue;
}

function SetRateLimit(key, seconds) {
    var redis = Spark.getRedis();

    redis.setex(key, seconds, desiredValue);
}
