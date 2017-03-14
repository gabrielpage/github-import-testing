/**
 * A class representing the probability of the dealer having a certain class of car variant
 * @constructor
 * @param {number} classCProbability The probabilty (out of the probability denominator) that the player gets a Class C variant
 * @param {number} classBProbability The probabilty (out of the probability denominator) that the player gets a Class B variant
 * @param {number} classAProbability The probabilty (out of the probability denominator) that the player gets a Class A variant
 * @param {number} classSProbability The probabilty (out of the probability denominator) that the player gets a Class S variant
 * @param {number} probabilityDenominator The value to divide the above probabilities by to calculate the percentage probability
 */
DealershipPlayerLevelProbabilityRecord = function (
    classCProbability, 
    classBProbability, 
    classAProbability, 
    classSProbability,
    probabilityDenominator) {
        
        /**
         * Gets a random class of variant based on the configured probability levels
         * @return {string} ClassS/A/B/C
         */
        this.getRandomClass = function () {
            var levelId = Math.floor((Math.random() * probabilityDenominator) + 1);            
            if (levelId <= classSProbability){
                return "ClassS";
            }  
            else if (levelId <= (classSProbability + classAProbability)) {
                return "ClassA";
            }   
            else if  (levelId <= (classSProbability + classAProbability + classBProbability)) {
                return "ClassB";
            }   
            else {
                return "ClassC"
            }
        };
};