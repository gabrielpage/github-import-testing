// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
function assertThat(actual, matcher){
    if(!matcher.matches(actual)){
        throw "Expected '" + actual + "'" + matcher.error(actual);
    }
}

function fail(){
    throw new Error("Fail reached, should not have hit this line");
}

function greaterThanOrEqualTo(expected){
    return new Matcher(function(actual){
                return actual >= expected;
            },
            function(){
                return " to be greater than or equal to '" + expected + "'";
            });
}

function greaterThan(expected){
    return new Matcher(function(actual){
                return actual > expected;
            },
            function(){
                return " to be greater than '" + expected + "'";
            });
}

function contains(expected){
    return new Matcher(function(actual){
                return actual.indexOf(expected) > -1;
            },
            function(){
                return " to contain '" + expected + "'";
            });
}

function not(expected){
    if(expected && expected.constructor == Matcher.prototype.constructor){
        return new Matcher(function(actual){
               return !expected.matches(actual); 
            },
            function(){
                return " not" + expected.error();
            });
    } else {
        return new Matcher(function(actual){
                return actual != expected;
            },
            function(){
                return " not to be '" + expected + "'";
            });
    }
}

function notDefined(){
    return new Matcher(function(actual){
                return typeof actual == 'undefined'
            },
            function(){
                return " to be undefined'";
            });
}

function is(expected){
    
    if(expected && expected.constructor == Matcher.prototype.constructor){
        //looks odd, but allows is to be used as syntactic sugar for test readability
        return expected;
    } else {
        return new Matcher(function(actual){
                if(expected === null && actual === null){
                    return true;
                }
               if(typeof actual === "object" && typeof expected === "object" ){
                  return JSON.stringify(actual) === JSON.stringify(expected);
               }
                return actual === expected;
            },
            function(){
                return " to be '" + expected + "'";
            });
    }
}

function Matcher (matches, error) {
    this.matches = matches;
    this.error = error;
}