#!/bin/bash
#Downloads all the metadata from Gamesparks

#Dev = 288169BlouRu
#QA = 294089DgvgXV
#Prod = 294090X0PqDS
APIKEY=294090X0PqDS

#preview or live
STAGE=preview

#meta.ABTests
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.ABTests/find" | python -m json.tool > ABTests.json

#meta.CarInventory
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 39f6b037-4a90-c202-9af7-9d78d7dda4d4" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.CarInventory/find" | python -m json.tool > CarInventory.json

#meta.CarModels
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 3eabcdd4-fb2c-7aae-fce4-9fb2ffb58030" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.CarModels/find" | python -m json.tool > CarModels.json

#meta.CurrencyCaps
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: af6d398d-f517-c7fd-7986-0d6958194f1e" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.CurrencyCaps/find" | python -m json.tool > CurrencyCaps.json

#meta.DealershipCache
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.DealershipCache/find" | python -m json.tool > DealershipCache.json

#meta.DealershipPlayerLevelProbability
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 459d1200-a166-1243-fe45-ea96601dca21" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.DealershipPlayerLevelProbability/find" | python -m json.tool > DealershipPlayerLevelProbability.json

#meta.DealershipSlotProbability
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: ccae3cef-30a5-15f3-e994-8a85e83ce4a1" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.DealershipSlotProbability/find" | python -m json.tool > DealershipSlotProbability.json

#meta.Profanity
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 4f66a980-df83-1fe7-38b9-7fa5f1179e77" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.Profanity/find" | python -m json.tool > Profanity.json

#meta.XPAwards
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: b755179c-0b8b-31c5-8eb9-91348ef91902" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.XPAwards/find" | python -m json.tool > XPAwards.json

#meta.XPValues
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: c144864e-ed23-3334-831f-1b662fbdbfd0" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.XPValues/find" | python -m json.tool > XPValues.json

#meta.bankBoxPrizes
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: fd74bda4-e659-e9ff-61ab-2da8d7a1dbd4" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.bankBoxPrizes/find" | python -m json.tool > bankBoxPrizes.json

#meta.betData
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: da874a8e-21b7-8ff8-373e-593cda918f35" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.betData/find" | python -m json.tool > betData.json

#meta.blueprintPurchaseData
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: fd74bda4-e659-e9ff-61ab-2da8d7a1dbd4" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.blueprintPurchaseData/find" | python -m json.tool > blueprintPurchaseData.json

#meta.carSlotCosts
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 3aa1cf0c-418f-8d24-08d2-31edc8687696" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.carSlotCosts/find" | python -m json.tool > carSlotCosts.json

#meta.cohortSets
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.cohortSets/find" | python -m json.tool > cohortSets.json

#meta.dealershipCalendar
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.dealershipCalendar/find" | python -m json.tool > dealershipCalendar.json

#meta.edgeAIUpgradeProbabilities
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: fd74bda4-e659-e9ff-61ab-2da8d7a1dbd4" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.edgeAIUpgradeProbabilities/find" | python -m json.tool > edgeAIUpgradeProbabilities.json

#meta.exchangeRates
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 0697e7c8-9629-4068-0417-6c748f0c0d66" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.exchangeRates/find" | python -m json.tool > exchangeRates.json

#meta.gatchaPrizes
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.gatchaPrizes/find" | python -m json.tool > gatchaPrizes.json

#meta.raceEvents
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a049ac9b-f481-be9b-8cbc-7d56641fc434" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.raceEvents/find" | python -m json.tool > RaceEvents.json

#meta.servicingGlobalSetup
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 5ea124ea-b573-d739-2fa1-df5204b78709" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.servicingGlobalSetup/find" | python -m json.tool > servicingGlobalSetup.json

#meta.servicingSetupByClass
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: 5b464fb3-f6a3-9833-dfe6-b23872be1090" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.servicingSetupByClass/find" | python -m json.tool > servicingSetupByClass.json

#meta.upgradeCostsByClass
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a6b38015-5e18-7c90-3996-4edb00a70b1e" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.upgradeCostsByClass/find" | python -m json.tool > upgradeCostsByClass.json

#meta.upgradeGlobalCosts
curl -X POST -H "Authorization: Basic am9obi5hdGtpbnNvbkBodXRjaGdhbWVzLmNvbTpIdXRjaDFKb2huYTI=" -H "Cache-Control: no-cache" -H "Postman-Token: a6b38015-5e18-7c90-3996-4edb00a70b1e" -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -F "limit=10000" -F "sort={_id:1}" "https://portal.gamesparks.net/rest/games/$APIKEY/mongo/$STAGE/meta.upgradeGlobalCosts/find" | python -m json.tool > upgradeGlobalCosts.json
