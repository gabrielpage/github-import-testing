requireOnce("GeneralUtilities");

var VersionedProfilePrototype = {
    ProfileCollectionName : "PlayerProfile",
    PlayerId : null,
    Key : null,
    DefaultValue : null,

    GetData : function() {
        var table = this.GetTable()

        this.Document = table.getVersionedDocument({"$oid" : this.GetPlayerId()});

        if (this.Document === null || this.Document === undefined) {
            var emptyProfile = {
                "_id" : {
                    "$oid" : this.GetPlayerId()
                }
            }

            // The insert will fail if a document with that id already exists, so it's not destructive
            table.insert(emptyProfile);

            this.Document = table.getVersionedDocument({"$oid" : this.GetPlayerId()});
        }

        var data = this.Document[this.Key];

        if (data === null || data === undefined) {
            return this.DefaultValue;
        }

        return data;
    },

    SetData : function(value) {
        var table = this.GetTable()

        if (this.Document === undefined) {
            throw "You must call GetData() before SetData() on a versioned profile";
        }

        this.Document[this.Key] = value;

        var success = table.saveVersionedDocument(this.Document);

        // LogMessage(FormatString("SetData({0}) : {1} in document: {2}",
        //     value, success, this.Document));

        return success;
    },

    DeleteData : function() {
        var table = this.GetTable()

        delete this.Document[this.Key];

        var success = table.saveVersionedDocument(this.Document);

        // LogMessage(FormatString("DeleteData() : {0} in document: {1}",
        //     success, this.Document));

        return success;
    },

    NukeProfile : function() {
        var table = this.GetTable();
        table.remove({
            _id : {
                $oid : this.GetPlayerId()
            }
        });
    },

    GetTable : function() {
        if (this.Table === null || this.Table === undefined) {
            this.Table = Spark.runtimeCollection(this.ProfileCollectionName);
        }
        return this.Table;
    },

    GetPlayerId : function() {
        // Don't default this ...
        // if (this.PlayerId === null || this.PlayerId === undefined) {
        //     this.PlayerId = Spark.getPlayer().getPlayerId()
        // }
        return this.PlayerId;
    }
};

// Module: VersionedDocumentUtilities.
// Make a versioned profile object for a specific top-level item in the player profile.
function MakeVersionedProfile(playerId /*: string */, key /*: string */, defaultValue /*:object*/) {
    var versionedProfile =  Object.create(VersionedProfilePrototype);
    // don't let these be undefined
    versionedProfile.PlayerId = playerId || null;
    versionedProfile.Key = key || null;
    versionedProfile.DefaultValue = defaultValue || null;

    if (versionedProfile.PlayerId === null || versionedProfile.PlayerId === "") {
        var error = FormatString("null or empty playerId creating VersionedProfile for key: {0}",
            versionedProfile.Key);
        Spark.getLog().error(error);
        throw error;
    }

    if (versionedProfile.Key === null || versionedProfile.Key === "") {
        var error = FormatString("null or empty key creating VersionedProfile for playerId: {0}",
            versionedProfile.PlayerId)
        Spark.getLog().error(error);
        throw error;
    }

    // LogMessage(FormatString("MakeVersionedProfile(playerId: {0}, key: {1}, defaultValue: {2})",
    //     versionedProfile.PlayerId,
    //     versionedProfile.Key,
    //     versionedProfile.DefaultValue));

    return versionedProfile;
}

// Module: VersionedDocumentUtilities.
// Make a versioned profile object for a specific top-level item in the prizes-only profile table.
function MakeVersionedPrizeProfile(playerId /*: string */, key /*: string */, defaultValue /*:object*/) {
    var versionedProfile = MakeVersionedProfile(playerId, key, defaultValue);

    versionedProfile.ProfileCollectionName = "PlayerProfilePrizes";

    // LogMessage(FormatString("MakeVersionedProfile(playerId: {0}, key: {1}, defaultValue: {2})",
    //     versionedProfile.PlayerId,
    //     versionedProfile.Key,
    //     versionedProfile.DefaultValue));

    return versionedProfile;
}

// Module: VersionedDocumentUtilities.
// Removes profile documents for this user from all the relevant tables.
function NukeProfileTablesEntries(playerId)
{
    var player;

    if (playerId === null || playerId === undefined) {
        player = Spark.getPlayer();
        playerId = player.getPlayerId();
    }
    else {
        player = Spark.loadPlayer(playerId);
    }

    var versionedProfile = MakeVersionedProfile(playerId, "unusedKey");
    versionedProfile.NukeProfile();

    var versionedPrizeProfile = MakeVersionedPrizeProfile(playerId, "unusedKey");
    versionedPrizeProfile.NukeProfile();
}
