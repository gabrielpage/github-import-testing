var params = Spark.getData();
var platform = params.platform;
var gameVersion = Spark.getPlayer().getSegmentValue("VERSION");
var collection = Spark.metaCollection("BundleManifests");
collection.ensureIndex({"Platform": 1, "GameVersion": 1});

var query = {"Platform": platform, "GameVersion": gameVersion};
var fields = {"ManifestHash": 1, "CreationTime": 1};
var orderBy = {"CreationTime": -1};
var result = collection.findOne(query, fields, orderBy);
if (result == null)
{
    Spark.setScriptError("ERROR", "No BundleManifest entry found for " + platform + " " + gameVersion);
}
else
{
    var latestHash = result["ManifestHash"];
    Spark.setScriptData("ManifestHash", latestHash);
    Spark.setScriptData("CreationTime", result["CreationTime"]);
    var builtInHash = params.builtInHash;
    if ((builtInHash == "") || (builtInHash == latestHash))
    {
        // a blank hash is sent by non-debug builds so we assume its built-in bundles have been published
        Spark.setScriptData("BuiltInHashIsKnown", true);
    }
    else
    {
        query["ManifestHash"] = builtInHash;
        result = collection.findOne(query, fields);
        Spark.setScriptData("BuiltInHashIsKnown", result != null);
    }
}
