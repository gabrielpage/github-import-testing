requireOnce("RaceUtilities");

function GetSkillConfig() {
    // the code is the configuration!
    return {
		WorstSkill : GetWorstSkill(),
		FTUECornerMul : 0.0375,

		PreWagersAIAdvantageMin : -1.0,
		PreWagersAIAdvantageMax : -0.5,

		PreRematchingEnabledAIAdvantageMin : -0.5,
		PreRematchingEnabledAIAdvantageMax : 0.25
    };
}
