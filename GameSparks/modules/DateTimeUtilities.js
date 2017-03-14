// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var secondsPerMinute = 60;
var secondsPerHour = secondsPerMinute * 60;
var secondsPerDay = secondsPerHour * 24;

function GetDayOfWeekForUnixTimestamp(unixTime){
    var date = new Date(unixTime * 1000);
    var dayOfWeek = date.getDay(); // Returns a number from 0-6, ranging from Sunday to Saturday
    var days = ["Sunday", "Monday", "Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return days[dayOfWeek];
}

function GetDayOfWeekForDate(date){
    return GetDayOfWeekForUnixTimestamp(DateToUnixTimestamp(date));
}

function AddDaysToUnixTimestamp(unixTime, daysToAdd){
    return (unixTime + (secondsPerDay * daysToAdd));
}

function AddDaysToDate(date, daysToAdd){
    var timestamp = DateToUnixTimestamp(date);
    timestamp = AddDaysToUnixTimestamp(timestamp, daysToAdd);
    return UnixTimestampToDate(timestamp);
}

function AddMinutesToUnixTimestamp(unixTime, minutesToAdd){
    return (unixTime + (secondsPerMinute * minutesToAdd));
}

function AddMinutesToDate(date, minutesToAdd){
    var timestamp = DateToUnixTimestamp(date);
    timestamp = AddMinutesToUnixTimestamp(timestamp, minutesToAdd);
    return UnixTimestampToDate(timestamp);
}

function UnixTimestampToDate(unixTime){
    var date = new Date(unixTime * 1000);
    return date;
}

function DateToUnixTimestamp(date){
    var unixTimestamp = date.getTime();
    return (unixTimestamp / 1000); // Seconds
}

function GetStartOfDayForDate(date){
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth();
    var day = date.getUTCDate();
    var startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    return startOfDay;
}

function GetStartOfDayForUnixTimestamp(unixTime) {
    var date = UnixTimestampToDate(unixTime);
    var startOfDay = GetStartOfDayForDate(date);
    return (DateToUnixTimestamp(startOfDay));
}

function GetEndOfDayForUnixTimestamp(unixTime) {
    var date = UnixTimestampToDate(unixTime);
    var startOfDay = GetStartOfDayForDate(date);
    var nextDay = AddDaysToDate(startOfDay, 1);
    // Remove an extra second so we're at 23:59:59
    return (DateToUnixTimestamp(nextDay) - 1);
}

function GetOneFullDayInSeconds() {
    return (60 * 60 * 24);
}