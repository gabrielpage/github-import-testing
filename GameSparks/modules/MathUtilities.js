// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

// Module: MathUtilities.
// Linearly interpolates between a and b by t.
function Lerp(a, b, t)
{
    return (a + t * (b - a));
}

// Module: MathUtilities.
function Clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
}

// Module: MathUtilities.
// inclusive min, inclusive max
function Random(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Module: MathUtilities.
// Adds equivalent of Math.Log10() which is missing (from Rhino 1.7R4). Note:
// you can't add this into the Math module as GameSparks seal this for performance
// reasons.
function Log10(x) {
  return Math.log(x) / Math.LN10;
};

// Module: MathUtilities.
// Rounds number to significantFigures numbers of figures.
function RoundToSignificantFigures(number, significantFigures) {
    if(number == 0) {
        return 0;
    }

    var d = Math.ceil(Log10(number < 0 ? -number: number));
    var power = significantFigures - d;

    var magnitude = Math.pow(10, power);
    var shifted = Math.round(number*magnitude);
    return shifted / magnitude;
}

/// Module: MathUtilities.
/// returns 'toParse' if 'toParse' is a number, otherwise null if 'toParse' is not a string, or it can't be parsed
/// by parseFloat, otherwise the number represented by 'toParse'
function ParseStringToFloat(toParse) {
    var floatValue = 0;
    var toParseType = typeof toParse;

    if (typeof toParse === "number") {
        return toParse;
    }
    else if (typeof toParse === "string") {
        floatValue = parseFloat(toParse);
    }
    else {
        return null;
    }

    if (isNaN(floatValue)) {
        return null;
    }
    return floatValue;
}

// Module: MathUtilities.
// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function FisherYatesShuffle(array, picks){
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    if (array.length <= picks){
        return array;
    }
    else{
        return array.slice(0, picks);
    }
}

// Module: MathUtilities.
// Returns the given number as a string with thousands separated.
// Regex "borrowed" from here: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function SeparateThousands(number) {
    // All you crappy types can get out :P
    if (isNaN(number)) {
        return NaN;
    }
    
    if (number === null) {
        return null;
    }
    
    if (number === undefined) {
        return undefined;
    }
    
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}