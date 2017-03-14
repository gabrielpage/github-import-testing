var ErrorMessageStr = "";

// Module: GeneralUtilities
// Similar to C# String.Format(), but no error if e.g. {2} is too big an index
// 'null' turns up as 'null' in the output
// 'undefined' will not get substituted e.g. '{0}' remains in the text
// Also no fancy formatting options, but hey...
// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
// var formatted = FormatString("{0} is dead, but {1} is alive! {0} {2}", "ASP", "ASP.NET");
function FormatString(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
};

// Module: GeneralUtilities
// Sloppy string match where undefined, null and the empty string are all equal
function AreStringsEqual(lhs, rhs) {
    if (lhs === null || lhs === undefined || lhs === "") {
        return (rhs === null || rhs === undefined || rhs === "");
    }
    return lhs === rhs;
}

// Module: GeneralUtilities
function EpochToGameSparksDate(epoch){
    epoch = epoch * 1000;
    var date = new Date(epoch);
    var isoDate = date.toISOString();
    var finalDate = isoDate.substring(0, 16); // GS doesn't use the lower orders (seconds and milliseconds), so omit them with substring
    finalDate += "Z"; // Add the Z back on to indicate UTC
    return finalDate;
}

// Module: GeneralUtilities
// Are we running on the preview stack?
function OnPreviewStack() {
    // string is the nearest JS gets to an enum ...
    return Spark.getConfig().getStage() === "preview";
}

// Module: GeneralUtilities
// Logs to the response 'log' field, if we are running on the preview stack
// ***************************************************************
// **** DO NOT USE THIS FUNCTION FOR PROPER SERVER CODE ****
// ****           THIS SHOULD ONLY BE USED FOR DEBUGGING          ****
// ***************************************************************
// function LogMessage(message){
//     if (!OnPreviewStack()) {
//         return;
//     }

//     if (message == undefined || message == null) {
//         return;
//     }

//     message = message + "\n";

//     var logName = "log";
//     var log = Spark.getScriptData(logName);

//     if (log === undefined || log === null) {
//         log = "";
//     }
//     Spark.setScriptData(logName, log + message);
// }

// Module: GeneralUtilities
// Sets a script error with the tag "ERROR".
function ErrorMessage(message, response, logAsWarning) {
    ErrorMessageStr += "[" + message + "]";

    // should be able to do the following, but does't currently work in the
    // version of Javascript GS is using
    // var logFunction = Spark.getLog().error;
    // if (logAsWarning) {
    //     logFunction = Spark.getLog().warn;
    // }

    var logFunction = function(text) {
        if (logAsWarning) {
            Spark.getLog().warn(text);
        }
        else {
            Spark.getLog().error(text);
        }
    }

    if (response === undefined || response === null ||
        response.error === undefined || response.error === null) {
        Spark.setScriptError("ERROR", ErrorMessageStr);
        logFunction(message);
        return;
    }

    for (var key in response.error){
        if (response.error.hasOwnProperty(key)){
            ErrorMessageStr += "[" + key + ":" + response.error[key] + "]";
        }
    }

    Spark.setScriptError("ERROR", ErrorMessageStr);
    logFunction(message);
}

// Module: GeneralUtilities
// DOES NOT SEND A FAIL BACK TO THE CLIENT. Use ErrorMessage() for that.
// Write info to script.log. Accepts FormatString() style varargs
function ErrorLog(/*format, varargs*/)
{
    var log = FormatString.apply(null, arguments);

    Spark.getLog().error(log);
}

// Module: GeneralUtilities
// write warning to script.log. Accepts FormatString() style varargs
function Warn(/*format, varargs*/)
{
    var log = FormatString.apply(null, arguments);

    Spark.getLog().warn(log);
}

// Module: GeneralUtilities
// write info to script.log. Accepts FormatString() style varargs
function Log(/*format, varargs*/)
{
    var log = FormatString.apply(null, arguments);

    Spark.getLog().info(log);
}

// Module: GeneralUtilities
// Assuming version is in format "major.minor.build" returns build as a string
function VersionGetBuild(version) {
    var splitArray = version.split(".");

    return splitArray[2];
}

// Module: GeneralUtilities
// Assuming version is in format "major.minor.build" returns minor as a string
function VersionGetMinor(version) {
    var splitArray = version.split(".");

    return splitArray[1];
}

// Module: GeneralUtilities
// Assuming version is in format "major.minor.build" returns major as a string
function VersionGetMajor(version) {
    var splitArray = version.split(".");

    return splitArray[0];
}

// Module: GeneralUtilities
function VersionIsKickbackToPreview(version)
{
    if (version === null || version === undefined) {
        return false;
    }

    var kickbackVersions = GetKickbackVersions();

    if (kickbackVersions === null || kickbackVersions === undefined) {
        return false;
    }

    return (kickbackVersions.indexOf(version) !== -1);
}

// Module: GeneralUtilities
// Returns true is version1 is older than version2
function VersionIsOlder(version1, version2){
    var split1 = version1.split(".");
    var split2 = version2.split(".");

    if (split1.length !== split2.length){
        ErrorMessage(version1 + " and " + version2 + " are not in the same format");
        return true;
    }

    for (var i = 0; i < split1.length; ++i){
        var num1 = parseInt(split1[i]);
        var num2 = parseInt(split2[i]);

        if (isNaN(num1)){
            ErrorMessage(split1[i] + " cannot be converted to a number");
            return true;
        }

        if (isNaN(num2)){
            ErrorMessage(split2[i] + " cannot be converted to a number");
            return true;
        }

        //Spark.getLog().info(FormatString("{0} vs {1}", num1, num2));

        if (num1 === num2){
            //Spark.getLog().info(FormatString("{0} === {1}", num1, num2));
            continue;
        }

        if (num1 < num2){
            //Spark.getLog().info(FormatString("{0} < {1}", num1, num2));
            return true;
        }
        else{
            //Spark.getLog().info(FormatString("{0} >= {1}", num1, num2));
            return false;
        }
    }

    return false;
}

// Module: GeneralUtilities
function SplitVersionNumber(version)
{
    var split = version.split(".");
    if (split.length != 3)
        Spark.getLog().error("SplitVersionNumber: Expected 3 parts to the version, but there were " + split.length);
    else
        return { major: split[0], minor: split[1], patch: split[2] };
}

// Module: GeneralUtilities
function GetVersionProperty(/*string*/ versionName) {
    var property = Spark.getProperties().getProperty("Property_Versions");
    if (property === null || property === undefined){
        return null;
    }

    return property[versionName];
}

// Module: GeneralUtilities
function GetKickbackVersions() {
    var kickbackVersions = [];

    var iOSKickbackVersion = GetVersionProperty("KickbackToPreviewVersionIOS");
    if (iOSKickbackVersion !== null && iOSKickbackVersion !== undefined) {
        kickbackVersions.push(iOSKickbackVersion);
    }

    var androidKickbackVersion = GetVersionProperty("KickbackToPreviewVersionAndroid");
    if (androidKickbackVersion !== null && androidKickbackVersion !== undefined) {
        kickbackVersions.push(androidKickbackVersion);
    }

    return kickbackVersions;
}

// Module: GeneralUtilities
function GetMinimumVersion(platform){
    var property = Spark.getProperties().getProperty("Property_Versions");
    if (property === null || property === undefined){
        ErrorMessage("Spark property set \"Property_Versions\" doesn't exist");
        return null;
    }
    var propertyName = "MinimumVersion" + platform;
    var minimumVersion = property[propertyName];
    if (minimumVersion === null || minimumVersion === undefined){
        ErrorMessage("Spark property set \"Property_Versions\" doesn't contains a \"" + propertyName + "\" property");
        return null;
    }
    return minimumVersion;
}

// Module: GeneralUtilities
function GetMaximumVersion(platform){
    var property = Spark.getProperties().getProperty("Property_Versions");
    if (property === null || property === undefined){
        ErrorMessage("Spark property set \"Property_Versions\" doesn't exist");
        return null;
    }
    var propertyName = "MaximumVersion" + platform;
    var maximumVersion = property[propertyName];
    if (maximumVersion === null || maximumVersion === undefined){
        ErrorMessage("Spark property set \"Property_Versions\" doesn't contains a \"" + propertyName + "\" property");
        return null;
    }
    return maximumVersion;
}

// Module: GeneralUtilities.
function UnixTimeToReadableString(unix){
    var time = unix;
    if (time.toString().length === 10){
        // In seconds
        time *= 1000;
    }
    else if (time.toString().length === 13){
        // In milliseconds
    }

    var a = new Date(time);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
    var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
    var timeStr = FormatString("{0} {1} {2} {3}:{4}:{5}", date, month, year, hour, min, sec);
    return timeStr;
}

// Module: GeneralUtilities
function FloatsEqual(number1, number2) {
    var epsilon = 0.0001;
    if (Math.abs(number1 - number2) <= epsilon) {
        return true;
    }
    return false;
}

// Module: GeneralUtilities
function GetUniqueValuesInArray(inputArray) {
    var u = {}, a = [];
    for(var i = 0; i < inputArray.length; ++i){
        if(!u.hasOwnProperty(inputArray[i])) {
            a.push(inputArray[i]);
            u[inputArray[i]] = 1;
        }
    }
    return a;
}

// Module: GeneralUtilities
// Checks the minimum and maximum versions on the server for a match with the player's version that
// was sent up on authentication. If there is a conflict then some scriptData will be added which
// must be interpreted on the client. This function will also return true if there is a version conflict,
// false otherwise.
function AddPossibleVersionOutOfDateToResponse(playerId) {
    var player = Spark.loadPlayer(playerId);
    var clientVersion = player.getSegmentValue("VERSION");
    var platform = player.getSegmentValue("PLATFORM");
    if (clientVersion === null || clientVersion === undefined ||
        platform === null || platform === undefined) {

        Spark.getLog().error(FormatString("{0}: Version or Platform (or both) are null/undefined!"));
        return true;
    }

    var minVersion = (GetMinimumVersion(platform) === null) ? "0.0.0" : GetMinimumVersion(platform);
    if (VersionIsOlder(clientVersion, minVersion)) {
        Spark.setScriptData("minimumVersion", minVersion);
        return true;
    }

    var maxVersion = (GetMaximumVersion(platform) === null) ? "0.0.0" : GetMaximumVersion(platform);
    if (VersionIsOlder(maxVersion, clientVersion)) {
        Spark.setScriptData("maximumVersion", maxVersion);
        return true;
    }

    return false;
}

// Module: GeneralUtilities
function GetGameSettingEntry(entryName) {
    // Send back whether AI ladders are enabled or not.
    var gameSettings = Spark.getProperties().getProperty("Property_GameSettings");
    var entryValue = false;
    if (gameSettings === null || gameSettings === undefined) {
        Spark.getLog().warn("The GameSettings (Shortcode: 'Property_GameSettings') doesn't exist!");
    }
    else {
        if (gameSettings[entryName] === null || gameSettings[entryName] === undefined) {
            Spark.getLog().warn(FormatString("The GameSettings property doesn't have an '{0}' attribute!",
                entryName));
        }
        else {
            entryValue = gameSettings[entryName];
        }
    }

    return entryValue;
}

// Module: GeneralUtilities
function CanAllowDebugEvents(context) {
    var allowDebugEvents = GetGameSettingEntry("AllowDebugEvents");

    if (!allowDebugEvents) {
        if (context) {
            Spark.getLog().error(FormatString("Debug events are not allowed for: {0}. Bailing!", context));
        }
        else {
            Spark.getLog().error(FormatString("Debug events are not allowed. Bailing!"));
        }
    }

    return allowDebugEvents;
}
