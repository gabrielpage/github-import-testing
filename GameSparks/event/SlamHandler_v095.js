// ====================================================================================================
//
// Cloud Code for SlamHandler_v095, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("SlamUtilities");
requireOnce("AtomicUtilities");

SlamHandler_v095();

function SlamHandler_v095(){
    var slamId = Spark.getData().slamId;
    var messageType = Spark.getData().messageType;
    var round = Spark.getData().round;

    if (messageType === "Join"){
        Join();
    }
    else {
        AtomicModify(Atomic_SlamHandler, [slamId, messageType, round], slamId, "slams");
    }

    function Atomic_SlamHandler(slamId, messageType, round){
        var collection = Spark.runtimeCollection("slams");
        var entry = RetrieveSlamData(slamId);
        if (entry === null || entry === undefined){
            ErrorMessage(FormatString("Cannot find slam event with id {0}", slamId));
            return null;
        }

        var rounds = entry.Rounds;
        if (rounds === null || rounds === undefined){
            ErrorMessage("entry.Rounds is null or undefined");
            return null;
        }
        //Spark.getLog().debug(FormatString("Getting matches from round {0}/{1}", round, rounds.length));
        var roundWeWant = rounds[round - 1];
        if (roundWeWant === null || roundWeWant === undefined){
            ErrorMessage("rounds[round - 1] is null or undefined");
            return null;
        }
        var matches = rounds[round - 1].Matches;

        Spark.getLog().error(FormatString("{0} -> SlamHandler: {1}", Spark.getPlayer().getDisplayName(), messageType));

        switch (messageType){
            case "StartRaceSuccess":
                StartRaceSuccess(matches, slamId);
                break;
            case "StartRaceFailure":
                StartRaceFailure(matches, slamId, entry);
                break;
            case "VisualHelperSignUp":
                VisualHelperSignUp(slamId, entry);
                break;
            case "QueryOpponentStatus":
                var opponentLeft = HasOpponentDisconnected(matches);
                Spark.setScriptData("opponentLeft", opponentLeft);
                return null;
        }

        Spark.setScriptData("slamData", entry);
        Spark.setScriptData("slamId", slamId);
        return entry;
    }

    function Join(){
        var event = Spark.getData().scriptData.event;
        var perfectCurrentTime = parseFloat(Spark.getData().scriptData.perfectCurrentTime);
        var perfectSessionTime = parseFloat(Spark.getData().scriptData.perfectSessionTime);

        var player = Spark.getPlayer();
        var playerId = player.getPlayerId();

        var version = player.getSegmentValue("VERSION");
        version = version.split(".").join("");

        var skill = EnterSessionAndGetSkill(playerId, event);
        var matchmakeValue = Math.max(perfectSessionTime * skill, 0);

        var hardCriteria = FormatString("criteria_slam_{0}_v{1}", event, version);

        var response = Spark.sendRequestAs({"@class": ".MatchmakingRequest",
                                "matchGroup": hardCriteria,
                                "matchShortCode": "SlamMatching_TestSlam_v079",
                                "skill": skill},
                                playerId);
        if (response !== null){
            if (response.error !== undefined){
                Spark.getLog().error(response.error);
                ErrorMessage("MatchmakingRequest failed: ", response.error);
            }
        }
    }

    function StartRaceSuccess(matches, slamId){
        var playerId = Spark.getPlayer().getPlayerId();
        for (var i = 0; i < matches.length; ++i){
            if (matches[i].Contender1 !== null && matches[i].Contender1.id === playerId){
                matches[i].Contender1.started = true;
                // Spark.getLog().info(FormatString("{0} has started their race", matches[i].Contender1.displayName));
            }
            else if (matches[i].Contender2 !== null && matches[i].Contender2.id === playerId){
                matches[i].Contender2.started = true;
                // Spark.getLog().info(FormatString("{0} has started their race", matches[i].Contender2.displayName));
            }
        }
    }

    function StartRaceFailure(matches, slamId, entry){
        var playerId = Spark.getPlayer().getPlayerId();
        var result = GetPlayerAndOpponent(matches, playerId);
        if (result === null){
            return;
        }

        var playerContender = result.player;
        var opponentContender = result.opponent;
        var match = result.match;
        if (match.Finished){
            //Spark.getLog().debug(FormatString("{0} vs {1} has already finished", playerContender.displayName, opponentContender.displayName));
            return;
        }

        var opponentLeft = HasPlayerDisconnected(match, opponentContender.id);
        if (opponentLeft){
            SetMatchWinnerAndLoser(match, playerContender, opponentContender);
        }

        FinishSlamRace(entry, entry.EventName, slamId, playerContender.time, playerContender.id, false, false);
    }

    function HasOpponentDisconnected(matches){
        // TODO: ATOMIC
        var playerId = Spark.getPlayer().getPlayerId();
        var result = GetPlayerAndOpponent(matches, playerId);
        if (result === null){
            return;
        }
        var match = result.match;
        var playerContender = result.player;
        var opponentContender = result.opponent;

        return HasPlayerDisconnected(match, opponentContender.id);
    }

    function HasPlayerDisconnected(match, playerId){
        var player = Spark.loadPlayer(playerId);
        if (player === null || player === undefined){
            return true;
        }
        var disconnected = false;
        if (match.Contender1 !== null && match.Contender1.id === playerId){
            disconnected = !player.isOnline() || match.Contender1.disconnected;
        }
        else if (match.Contender2 !== null && match.Contender2.id === playerId){
            disconnected = !player.isOnline() || match.Contender2.disconnected;
        }
        return disconnected;
    }

    function VisualHelperSignUp(slamId, entry){
        var visualHelpers = entry.VisualHelpers;
        if (visualHelpers === null || visualHelpers === undefined){
            visualHelpers = [];
        }
        // Id doesn't exist in the list already
        if (visualHelpers.indexOf(Spark.getPlayer().getPlayerId()) < 0){
            visualHelpers.push(Spark.getPlayer().getPlayerId());
            entry["VisualHelpers"] = visualHelpers;
        }
    }
}