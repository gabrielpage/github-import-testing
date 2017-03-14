// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");

function GetAllProfilesForPlayer(playerId){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var cursor = collection.find({"playerId": playerId, "masterEntry": true}, {"profileName": 1, "profileDescription": 1});
    // Potentially quite memory intensive if we have lots of items
    return cursor.toArray();
}

function GetAllTransfersForPlayer(playerId){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var cursor = collection.find({"playerId": playerId, "transferEntry": true}, {"transferList": 1});
    // Potentially quite memory intensive if we have lots of items
    return cursor.toArray();
}

function GetProfileForPlayer(playerId, profileName){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var master = collection.findOne({"playerId": playerId, "masterEntry": true, "profileName": profileName});
    if (master === null || master === undefined){
        ErrorMessage(FormatString("Couldn't find profile with name {0}", profileName));
        return;
    }

    var gsPlayerDataId = master.gsPlayerData.$oid;
    var ourPlayerDataId = master.ourPlayerData.$oid;
    var playerEventPrizesDataId = master.playerEventPrizesData.$oid;
    var playerDealershipDataId = master.playerDealershipData.$oid;

    var data = {};
    delete master.masterEntry;
    delete master.gsPlayerData;
    delete master.ourPlayerData;
    delete master.playerEventPrizesData;
    delete master.playerDealershipData;
    data.master = master;

    var gsPlayerData = collection.findOne({"_id": {"$oid": gsPlayerDataId}});
    delete gsPlayerData.profileName;
    delete gsPlayerData.playerId;
    delete gsPlayerData._id;
    data.gsPlayer = gsPlayerData;

    var ourPlayerData = collection.findOne({"_id": {"$oid": ourPlayerDataId}});
    delete ourPlayerData.profileName;
    delete ourPlayerData.playerId;
    delete ourPlayerData._id;
    data.ourPlayer = ourPlayerData;

    var playerEventPrizesData = collection.findOne({"_id": {"$oid": playerEventPrizesDataId}});
    delete playerEventPrizesData.profileName;
    delete playerEventPrizesData.playerId;
    delete playerEventPrizesData._id;
    data.playerEventPrizes = playerEventPrizesData;

    var playerDealershipData = collection.findOne({"_id": {"$oid": playerDealershipDataId}});
    delete playerDealershipData.profileName;
    delete playerDealershipData.playerId;
    delete playerDealershipData._id;
    data.playerDealership = playerDealershipData;

    return data;
}

function SaveNewTransferForPlayer(playerId, transferPlayerId, transferDisplayName, transferStack){
    if (playerId === transferPlayerId){
        Spark.setScriptData("transferToSelf", true);
        return;
    }

    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var doc = collection.findOne({"playerId": playerId, "transferEntry": true});
    if (doc === null || doc === undefined){
        doc = {};
        doc.playerId = playerId;
        doc.transferEntry = true;
        doc.transferList = [];
    }

    for (var i = 0; i < doc.transferList.length; ++i){
        var entry = doc.transferList[i];
        if (entry.id === transferPlayerId && entry.stack === transferStack){
            Spark.setScriptData("transferAlreadyExists", true);
            return;
        }
    }

    var newEntry = {};
    newEntry.id = transferPlayerId;
    newEntry.name = transferDisplayName;
    newEntry.stack = transferStack;

    doc.transferList.push(newEntry);

    collection.update({"playerId": playerId, "transferEntry": true}, doc, true, false);
}

function SaveNewProfileFromTransferForPlayer(playerId, masterJSON, gsPlayerJSON, ourPlayerJSON, dealershipJSON, eventPrizesJSON){
    var masterData = JSON.parse(masterJSON);
    var gsPlayerData = JSON.parse(gsPlayerJSON);
    var ourPlayerData = JSON.parse(ourPlayerJSON);
    var dealershipData = JSON.parse(dealershipJSON);
    var eventPrizesData = JSON.parse(eventPrizesJSON);

    var profileName = masterData.profileName;
    var profileDescription = masterData.profileDescription;

    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var entry = collection.findOne({"playerId": playerId, "profileName": profileName, "masterEntry": true});
    if (entry !== null && entry !== undefined){
        Spark.setScriptData("profileAlreadyExists", true);
        return;
    }

    var profile = {};
    profile.playerId = playerId;
    profile.profileName = profileName;
    profile.profileDescription = profileDescription;
    profile.masterEntry = true;

    // GS Player Profile
    gsPlayerData.profileName = profileName;
    gsPlayerData.playerId = playerId;
    gsPlayerData.displayName = Spark.loadPlayer(playerId).getDisplayName();

    // Our own Player Profile
    ourPlayerData.profileName = profileName;
    ourPlayerData.playerId = playerId;

    // Player Event Prizes
    eventPrizesData.profileName = profileName;
    eventPrizesData.playerId = playerId;

    // Player Dealership
    dealershipData.profileName = profileName;
    dealershipData.playerId = playerId;

    collection.insert(gsPlayerData);
    collection.insert(ourPlayerData);
    collection.insert(eventPrizesData);
    collection.insert(dealershipData);

    profile.gsPlayerData = gsPlayerData._id;
    profile.ourPlayerData = ourPlayerData._id;
    profile.playerEventPrizesData = eventPrizesData._id;
    profile.playerDealershipData = dealershipData._id;

    collection.insert(profile);
}

function SaveNewProfileForPlayer(playerId, profileName, profileDescription){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var entry = collection.findOne({"playerId": playerId, "profileName": profileName, "masterEntry": true});
    if (entry !== null && entry !== undefined){
        Spark.setScriptData("profileAlreadyExists", true);
        return;
    }

    var snapshot = SnapshotPlayerProfile(playerId);
    snapshot.master.profileName = profileName;
    snapshot.master.profileDescription = profileDescription;

    collection.insert(snapshot.gsPlayer);
    collection.insert(snapshot.ourPlayer);
    collection.insert(snapshot.playerEventPrizes);
    collection.insert(snapshot.playerDealership);

    snapshot.master.gsPlayerData = snapshot.gsPlayer._id;
    snapshot.master.ourPlayerData = snapshot.ourPlayer._id;
    snapshot.master.playerEventPrizesData = snapshot.playerEventPrizes._id;
    snapshot.master.playerDealershipData = snapshot.playerDealership._id;

    collection.insert(snapshot.master);
}

function SnapshotPlayerProfile(playerId){
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
    var profileName = "Snapshot: " + datetime;

    var profile = {};
    profile.playerId = playerId;
    profile.profileName = profileName;
    profile.profileDescription = "";
    profile.masterEntry = true;

    // GS Player Profile
    var gsPlayerCollection = Spark.systemCollection("player");
    var gsPlayerData = gsPlayerCollection.findOne({"_id": {"$oid": playerId}});
    if (gsPlayerData === null) {
        gsPlayerData = {};
    }
    else {
        delete gsPlayerData._id;
    }
    gsPlayerData.profileName = profileName;
    gsPlayerData.playerId = playerId;

    // Our own Player Profile
    var ourPlayerCollection = Spark.runtimeCollection("PlayerProfile");
    var ourPlayerData = ourPlayerCollection.findOne({"_id": {"$oid": playerId}});
    if (ourPlayerData === null) {
        ourPlayerData = {};
    }
    else {
        delete ourPlayerData._id;
    }
    ourPlayerData.profileName = profileName;
    ourPlayerData.playerId = playerId;

    // Player Event Prizes
    var playerEventPrizesCollection = Spark.runtimeCollection("PlayerProfilePrizes");
    var playerEventPrizesData = playerEventPrizesCollection.findOne({"_id": {"$oid": playerId}});
    if (playerEventPrizesData === null) {
        playerEventPrizesData = {};
    }
    else {
        delete playerEventPrizesData._id;
    }
    playerEventPrizesData.profileName = profileName;
    playerEventPrizesData.playerId = playerId;

    // Player Dealership
    var playerDealershipCollection = Spark.runtimeCollection("PlayerDealership");
    var playerDealershipData = playerDealershipCollection.findOne({"_id": playerId});
    if (playerDealershipData === null) {
        playerDealershipData = {};
    }
    else {
        delete playerDealershipData._id;
    }
    playerDealershipData.profileName = profileName;
    playerDealershipData.playerId = playerId;

    var snapshot = {};
    snapshot.master = profile;
    snapshot.gsPlayer = gsPlayerData;
    snapshot.ourPlayer = ourPlayerData;
    snapshot.playerEventPrizes = playerEventPrizesData;
    snapshot.playerDealership = playerDealershipData;

    return snapshot;
}

function RemoveProfileForPlayer(playerId, profileName){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var profile = collection.findOne({"playerId": playerId, "profileName": profileName, "masterEntry": true});
    if (profile === null || profile === undefined){
        ErrorMessage(FormatString("Couldn't find profile with name {0}", profileName));
        return;
    }

    var gsPlayerDataId = profile.gsPlayerData.$oid;
    var ourPlayerDataId = profile.ourPlayerData.$oid;
    var playerEventPrizesDataId = profile.playerEventPrizesData.$oid;
    var playerDealershipDataId = profile.playerDealershipData.$oid;

    collection.remove({"_id": {"$oid": gsPlayerDataId}});
    collection.remove({"_id": {"$oid": ourPlayerDataId}});
    collection.remove({"_id": {"$oid": playerEventPrizesDataId}});
    collection.remove({"_id": {"$oid": playerDealershipDataId}});

    collection.remove({"playerId": playerId, "profileName": profileName, "masterEntry": true});
}

function RestoreProfileForPlayer(playerId, profileName){
    var collection = Spark.runtimeCollection("PlayerProfileStore");
    var profile = collection.findOne({"playerId": playerId, "profileName": profileName, "masterEntry": true});
    if (profile === null || profile === undefined){
        ErrorMessage(FormatString("Couldn't find profile with name {0}", profileName));
        return;
    }

    var gsPlayerDataId = profile.gsPlayerData.$oid;
    var ourPlayerDataId = profile.ourPlayerData.$oid;
    var playerEventPrizesDataId = profile.playerEventPrizesData.$oid;
    var playerDealershipDataId = profile.playerDealershipData.$oid;

    var gsPlayerData = collection.findOne({"_id": {"$oid": gsPlayerDataId}});
    var ourPlayerData = collection.findOne({"_id": {"$oid": ourPlayerDataId}});
    var playerEventPrizesData = collection.findOne({"_id": {"$oid": playerEventPrizesDataId}});
    var playerDealershipData = collection.findOne({"_id": {"$oid": playerDealershipDataId}});

    RestoreProfileDirectlyForPlayer(playerId, gsPlayerData, ourPlayerData, playerEventPrizesData, playerDealershipData);
}

function RestoreProfileDirectlyForPlayer(playerId, gsPlayerData, ourPlayerData, playerEventPrizesData, playerDealershipData){
    delete gsPlayerData.profileName;
    delete gsPlayerData.playerId;
    delete gsPlayerData._id;

    delete ourPlayerData.profileName;
    delete ourPlayerData.playerId;
    delete ourPlayerData._id;

    delete playerEventPrizesData.profileName;
    delete playerEventPrizesData.playerId;
    delete playerEventPrizesData._id;

    delete playerDealershipData.profileName;
    delete playerDealershipData.playerId;
    delete playerDealershipData._id;

    // GS Player Profile
    var player = Spark.loadPlayer(playerId);
    // Currency
    player.debit1(player.getBalance1());
    player.debit2(player.getBalance2());
    player.debit3(player.getBalance3());
    player.debit4(player.getBalance4());
    player.debit5(player.getBalance5());
    player.debit6(player.getBalance6());
    player.credit1(gsPlayerData.currency1);
    player.credit2(gsPlayerData.currency2);
    player.credit3(gsPlayerData.currency3);
    player.credit4(gsPlayerData.currency4);
    player.credit5(gsPlayerData.currency5);
    player.credit6(gsPlayerData.currency6);
    // Segment Values
    for (var key in gsPlayerData.segments){
        player.setSegmentValue(key, gsPlayerData.segments[key]);
    }
    // Level (Virtual Goods)
    player.useVGood("Level", player.hasVGood("Level"));
    player.addVGood("Level", gsPlayerData.goods.Level);

    // Our own Player Profile
    var ourPlayerCollection = Spark.runtimeCollection("PlayerProfile");
    ourPlayerCollection.update({"_id": {"$oid": playerId}}, ourPlayerData);

    // Player Event Prizes
    var playerEventPrizesCollection = Spark.runtimeCollection("PlayerProfilePrizes");
    playerEventPrizesCollection.update({"_id": {"$oid": playerId}}, playerEventPrizesData);

    // Player Dealership
    var playerDealershipCollection = Spark.runtimeCollection("PlayerDealership");
    playerDealershipCollection.update({"_id": {"$oid": playerId}}, playerDealershipData);
}