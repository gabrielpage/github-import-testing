// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================

var RequireOnce = function(require){
    //an array to let us track what has already been required
    var alreadyRequired = [];
    
    this.processRequire = function(module, force){
        
        if(force){
            require(module);
        } else {
            if(alreadyRequired.indexOf(module) == -1){
                alreadyRequired.push(module);
                require(module);
            }
        }
    }
}

//redefine require
require = new RequireOnce(require).processRequire;