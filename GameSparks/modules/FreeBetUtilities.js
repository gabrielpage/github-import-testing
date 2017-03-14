// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm
//
// ====================================================================================================
requireOnce("GeneralUtilities");
requireOnce("PlayerDataUtilities");
requireOnce("TimeUtilities");

// Module: PlayerDataUtilities
function GetVersionedFreeBets(playerId) {
    return MakeVersionedProfile(playerId, "freeBets", []);
}

// Module: FreeBetUtilities
function AddFreeBet(playerId, betAmount, quantity, expiryTimestamp) {
    var versionedFreeBets = GetVersionedFreeBets(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var freeBets = versionedFreeBets.GetData();

        var freeBetEntry = {"Bet": betAmount, "Quantity": quantity, "GSExpiryDate": expiryTimestamp, "BetReservedUntil": 0};

        freeBets.push(freeBetEntry);

        successfullyWritten = versionedFreeBets.SetData(freeBets);
    }
}

function RemoveFreeBet(playerId, betAmount, quantity) {
    var versionedFreeBets = GetVersionedFreeBets(playerId);

    var successfullyWritten = false;
    while (!successfullyWritten) {
        var freeBets = versionedFreeBets.GetData();

        // Clear out any expired/depleted free bets.
        freeBets = freeBets.filter(IsFreeBetStillValid);

        // Check to see if the player has a free bet of the specified value.
        var eligibleFreeBets = [];

        for (var i = freeBets.length - 1; i >= 0; i--) {
            if (freeBets[i].Bet === betAmount) {
                eligibleFreeBets.push(freeBets[i]);
            }
        }

        var remainingQuantityToRemove = quantity;
        while (remainingQuantityToRemove > 0){
            if (eligibleFreeBets.length > 0) {
                // If there's more than one eligible bet, we should deplete the one that will expire the soonest.
                if (eligibleFreeBets.length > 1) {
                    eligibleFreeBets.sort(CompareExpiryDates);
                }

                // Don't deplete if it's already reserved and the reservation hasn't expired!
                if (eligibleFreeBets[0].BetReservedUntil === null || eligibleFreeBets[0].BetReservedUntil < GetNow())
                {
                    if (eligibleFreeBets[0].Quantity >= remainingQuantityToRemove){
                        eligibleFreeBets[0].Quantity -= remainingQuantityToRemove;
                        remainingQuantityToRemove = 0;
                    }
                    else{
                        remainingQuantityToRemove -= eligibleFreeBets[0].Quantity;
                        eligibleFreeBets[0].Quantity = 0;

                        freeBets = freeBets.filter(IsFreeBetStillValid);
                        eligibleFreeBets = [];
                        for (var i = freeBets.length - 1; i >= 0; i--) {
                            if (freeBets[i].Bet === betAmount) {
                                eligibleFreeBets.push(freeBets[i]);
                            }
                        }
                    }
                }
            }
            else{
                break;
            }
        }

        freeBets = freeBets.filter(IsFreeBetStillValid);

        successfullyWritten = versionedFreeBets.SetData(freeBets);
    }
}

// Module: FreeBetUtilities
// If the player has a free bet of a given amount, this deducts one of them and reserves it for up to
// two minutes. Since the game only takes wagers when the player gets to the start line, this is
// essential if players use a free bet within seconds of it expiring to ensure the free bets don't
// expire during the load time. If no free bet is available, "hasReservedFreeBet" will be false.
// Reserved bets can be redeemed or refunded.
function ReserveFreeBet(playerId, betAmount) {
    var versionedFreeBets = GetVersionedFreeBets(playerId);

    var reservedFreeBet;
    var successfullyWritten = false;
    while (!successfullyWritten) {
        reservedFreeBet = false;
        var freeBets = versionedFreeBets.GetData();

        // Clear out any expired/depleted free bets.
        freeBets = freeBets.filter(IsFreeBetStillValid);

        // Check to see if the player has a free bet of the specified value.
        var eligibleFreeBets = [];

        for (var i = freeBets.length - 1; i >= 0; i--) {
            if (freeBets[i].Bet === betAmount) {
                eligibleFreeBets.push(freeBets[i]);
            }
        }

        if (eligibleFreeBets.length > 0) {
            // If there's more than one eligible bet, we should deplete the one that will expire the soonest.
            if (eligibleFreeBets.length > 1) {
                eligibleFreeBets.sort(CompareExpiryDates);
            }

            // Don't deplete if it's already reserved and the reservation hasn't expired!
            if (eligibleFreeBets[0].BetReservedUntil === null || eligibleFreeBets[0].BetReservedUntil < GetNow())
            {
                eligibleFreeBets[0].Quantity -= 1;
                eligibleFreeBets[0].BetReservedUntil = GetNow() + (2 * 60000); // Reserved bets expire 2 minutes after redemption.
                // Spark.getLog().debug(FormatString("Reserved free bet of ${0} until {1}", betAmount, EpochToGameSparksDate(eligibleFreeBets[0].BetReservedUntil)));
            }
            reservedFreeBet = true;
        }

        successfullyWritten = versionedFreeBets.SetData(freeBets);
    }

    return {"freeBetsArray": freeBets, "hasReservedFreeBet": reservedFreeBet};
}

// Module: FreeBetUtilities
// Redeems a free bet of the given amount. If the bet has been reserved, the reservation timestamp is
// set to zero. If the bet hasn't been reserved, it is deducted from the count. If no free bet is
// available, "hasRedeemedFreeBet" will be false.
function RedeemFreeBet(playerId, betAmount) {
    var versionedFreeBets = GetVersionedFreeBets(playerId);

    var redeemedFreeBet;
    var successfullyWritten = false;
    while (!successfullyWritten) {
        redeemedFreeBet = false;

        var freeBets = versionedFreeBets.GetData();

        // Clear out any expired/depleted free bets.
        freeBets = freeBets.filter(IsFreeBetStillValid);

        // Check to see if the player has a free bet of the specified value.
        var eligibleFreeBets = [];
        for (var i = 0; i < freeBets.length; i++) {
            if (freeBets[i].Bet === betAmount) {
                eligibleFreeBets.push(freeBets[i]);
            }
        }

        if (eligibleFreeBets.length > 0) {
            // If there's more than one eligible bet, we should deplete the one that will expire the soonest.
            if (eligibleFreeBets.length > 1) {
                eligibleFreeBets.sort(CompareExpiryDates);
            }

            // If it isn't reserved, or the reservation expired, deplete the quantity. If it is reserved,
            // reset the reserved time to 0.
            if (eligibleFreeBets[0].BetReservedUntil === null || eligibleFreeBets[0].BetReservedUntil < GetNow()) {
                eligibleFreeBets[0].Quantity -= 1;
            }
            else {
                eligibleFreeBets[0].BetReservedUntil = 0;
            }

            redeemedFreeBet = true;
        }

        successfullyWritten = versionedFreeBets.SetData(freeBets);
    }

    return {"freeBetsArray": freeBets, "hasRedeemedFreeBet": redeemedFreeBet};
}

// Module: FreeBetUtilities
// Refunds a free bet of the given amount, returning an up-to-date array of the player's free bets.
// You can only refund bets that have been reserved.
function RefundFreeBet(playerId, betAmount) {
    var versionedFreeBets = GetVersionedFreeBets(playerId);

    var freeBets;
    var successfullyWritten = false;
    while (!successfullyWritten) {
        freeBets = versionedFreeBets.GetData();

        // Check to see if the player has a reserved free bet of the specified value.
        var eligibleFreeBets = [];
        for (var i = 0; i < freeBets.length; i++) {
            if (freeBets[i].Bet === betAmount && freeBets[i].BetReservedUntil >= GetNow()) {
                eligibleFreeBets.push(freeBets[i]);
            }
        }

        // There should only be one reserved free bet, but just in case...
        for (var i = 0; i < eligibleFreeBets.length; i++) {
            eligibleFreeBets[i].Quantity += 1;
            eligibleFreeBets[i].BetReservedUntil = 0;
        }

        successfullyWritten = versionedFreeBets.SetData(freeBets);
    }
    return freeBets;
}

function IsFreeBetStillValid(freeBet) {
    return ((freeBet.Quantity > 0 || freeBet.BetReservedUntil >= GetNow()) && freeBet.GSExpiryDate >= GetNow());
}

function CompareExpiryDates(a, b) {
    if (a.GSExpiryDate < b.GSExpiryDate) {
        return -1;
    }
    if (a.GSExpiryDate > b.GSExpiryDate) {
        return 1;
    }
    return 0;
}