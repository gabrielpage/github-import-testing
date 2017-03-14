declare class DealershipPlayerLevelProbabilityRecord { 
    
        /**
         * A class representing the probability of the dealer having a certain class of car variant
         * @constructor
         * @param {number} classCProbability The probabilty (out of the probability denominator) that the player gets a Class C variant
         * @param {number} classBProbability The probabilty (out of the probability denominator) that the player gets a Class B variant
         * @param {number} classAProbability The probabilty (out of the probability denominator) that the player gets a Class A variant
         * @param {number} classSProbability The probabilty (out of the probability denominator) that the player gets a Class S variant
         * @param {number} probabilityDenominator The value to divide the above probabilities by to calculate the percentage probability
         */
        constructor(classCProbability: number, classBProbability: number, classAProbability: number, classSProbability: number, probabilityDenominator: number);

        /**
         * Gets a random class of variant based on the configured probability levels
         * @return {string} ClassS/A/B/C
         */
        getRandomClass(): string;
}