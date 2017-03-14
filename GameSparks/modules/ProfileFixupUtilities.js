requireOnce("GeneralUtilities");
requireOnce("UpgradeStepChangesUtilities");
requireOnce("VersionedDocumentUtilities2");

function FixupOldDataInProfile(playerId) {
    var versionedProfile = MakeVersionedProfileDocument(playerId);

    var versionedFixups = versionedProfile.GetVersionedKey("fixups", {});

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var requireWrite = false;

        var fixups = versionedFixups.GetData();

        if (FixUpgradesInProfileForReducedSteps(versionedProfile, fixups)) {
            requireWrite = true;
        }

        if (MoveEventsToEvents2(versionedProfile, fixups)) {
            requireWrite = true;
        }

        if (requireWrite) {
            successfullyWritten = versionedProfile.Save();
        }
        else {
            break;
        }
    }
}
