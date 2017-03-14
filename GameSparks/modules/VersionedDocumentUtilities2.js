// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================

requireOnce("GeneralUtilities");

// call VersionedDocumentPrototype.GetVersionedKey(key, defaultValue) to create this
var VersionedKeyPrototype = {
    VersionedDocument : null,
    Key : null,
    DefaultValue : null,

    // Get a reference to the data for this key. If required we patch the default value into the document.
    GetData : function() {
        return this.VersionedDocument.GetKey_(this.Key, this.DefaultValue);
    },

    // Sets the passed value into the document for this key, replaces the current data. You don't need to
    // call this for data returned by GetData, as that is already a reference to the document.
    SetData : function(value) {
        return this.VersionedDocument.SetKey_(this.Key, value)
    },
}

var VersionedDocumentPrototype = {
    ProfileCollectionName : null,
    PlayerId : null,

    Load : function() {
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
    },

    GetVersionedKey : function(key, defaultValue) {
        var versionedKey =  Object.create(VersionedKeyPrototype);

        versionedKey.VersionedDocument = this;
        versionedKey.Key = key;
        versionedKey.DefaultValue = defaultValue;

        return versionedKey;
    },

    // @private - don't use directly!
    GetKey_ : function(key, defaultValue) {
        var data = this.Document[key];

        if (data === null || data === undefined) {
            // if we return the default value we set it into the document
            // so that we are always returning a reference into the document,
            // and don't ever have to call SetKey_ unless we want to replace
            // the current data wholesale
            if (defaultValue !== null && defaultValue !== undefined) {
                this.Document[key] = defaultValue;
            }
            return defaultValue;
        }

        return data;
    },

    // @private - don't use directly!
    SetKey_ : function(key, value) {
        this.Document[key] = value;
    },

    Save : function() {
        var table = this.GetTable();

        var success = table.saveVersionedDocument(this.Document);

        // LogMessage(FormatString("Save() : {0} in document: {1}",
        //     success, this.Document));

        if (!success) {
            // need to re-load to try again
            this.Load();
        }

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
function MakeVersionedDocument(playerId /*: string */, collectionName /*:string*/) {
    var versionedProfile =  Object.create(VersionedDocumentPrototype);
    versionedProfile.ProfileCollectionName = collectionName;

    // don't let these be undefined
    versionedProfile.PlayerId = playerId || null;

    if (versionedProfile.PlayerId === null ||
        versionedProfile.PlayerId === undefined ||
        versionedProfile.PlayerId === "") {
        var error = FormatString("null or empty playerId creating VersionedProfile for key: {0}",
            versionedProfile.Key);
        Spark.getLog().error(error);
        throw error;
    }

    versionedProfile.Load();

    // LogMessage(FormatString("MakeVersionedProfile(playerId: {0}, key: {1}, defaultValue: {2})",
    //     versionedProfile.PlayerId,
    //     versionedProfile.Key,
    //     versionedProfile.DefaultValue));

    return versionedProfile;
}

// Module: VersionedDocumentUtilities.
// Make a versioned profile object for a specific top-level item in the player profile.
function MakeVersionedProfileDocument(playerId /*: string */) {
    return MakeVersionedDocument(playerId, "PlayerProfile");
}

// Module: VersionedDocumentUtilities.
// Make a versioned profile object for a specific top-level item in the player profile.
function MakeVersionedABTestsDocument(playerId /*: string */) {
    return MakeVersionedDocument(playerId, "ABTestsRuntimeData");
}

// this isn't required since there is only a single key in the prizes table (eventPrizes) AND THERE SHOULD NEVER BE
// MORE KEYS. Until the table is removed and we move to a 'document per prize' system and use database queries

// function MakeVersionedOldPrizeDocument(playerId /*: string */) {
//     var versionedProfile = MakeVersionedProfile(playerId, key, defaultValue);

//     versionedProfile.ProfileCollectionName = "PlayerProfilePrizes";

//     // LogMessage(FormatString("MakeVersionedProfile(playerId: {0}, key: {1}, defaultValue: {2})",
//     //     versionedProfile.PlayerId,
//     //     versionedProfile.Key,
//     //     versionedProfile.DefaultValue));

//     return versionedProfile;
// }