// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

function setPlayers(){
    
    var authRequest = new SparkRequests.AuthenticationRequest();
    var response = null;
    var segmentPlayers = [];
    var playerDetails = [
        {userName:"segmentUserName_1", password:"password", displayName:"segmentDisplayName_1"},
        ];
    
    for(i in playerDetails){
        
        authRequest.userName = playerDetails[i].userName;
        authRequest.password = playerDetails[i].password;
        response = Spark.sendRequest(authRequest);
        
        if(response.error != null){
            
            var regRequest = new SparkRequests.RegistrationRequest();
            
            regRequest.userName = playerDetails[i].userName;
            regRequest.password = playerDetails[i].password;
            regRequest.displayName = playerDetails[i].displayName;
            response = Spark.sendRequest(regRequest);
        }
    
        segmentPlayers.push({userName:response.displayName, userId:response.userId});
    }

    return segmentPlayers;
}

suite("Segmentation basic tests", function(){
    
    var playerId = setPlayers()[0].userId;
    var player = Spark.loadPlayer(playerId);
    
    test("Segmentation with null segment Type, does nothing", function(){
        
        player.setSegmentValue("CS", "CSV");
        assertThat(player.getSegments(), is(not(null)));
        player.setSegmentValue(null, "CSV2");
        
        for(var segmentType in player.getSegments()){
            assertThat(segmentType, is("CS"));
            assertThat(player.getSegmentValue(segmentType), is("CSV"));
        }
    });
    
    test("Segmentation with null segment Value, deletes the Segment", function(){
        
        player.setSegmentValue("CS", "CSV");
        assertThat(player.getSegments(), is(not(null)));
        player.setSegmentValue("CS", null);
        
        for(var segmentType in player.getSegments()){
            fail();
        }
    });
});

suite("Segmentation tests", function(){
    
    var playerId = setPlayers()[0].userId;
    var player = Spark.loadPlayer(playerId);
    
    test("test Leaderboard Segmentation", function(){
        var listLeaderboardsRequest = new SparkRequests.ListLeaderboardsRequest();
        listLeaderboardsRequest.wildcards = "SEGL";
        Spark.loadPlayer(playerId).setSegmentValue("CS", "CSV");
        var response = Spark.sendRequestAs(listLeaderboardsRequest, playerId);
        assertThat(response.leaderboards[0].name, is("segment_ln_1"));
        assertThat(response.leaderboards[0].description, is("segment_ld_1"));
        
        Spark.loadPlayer(playerId).setSegmentValue("CS", "CSV2");
        response = Spark.sendRequestAs(listLeaderboardsRequest, playerId);
        assertThat(response.leaderboards[0].name, is("segment_ln_2"));
        assertThat(response.leaderboards[0].description, is("segment_ld_2"));
    });
    
    test("test Virtual Goods Segmentation", function(){
        var listVirtualGoodsRequest = new SparkRequests.ListVirtualGoodsRequest();
        player.setSegmentValue("CS", "CSV");
        var response = Spark.sendRequestAs(listVirtualGoodsRequest, playerId);
        var virtualGood = null;
        var found = false;
        
        for(var i in response.virtualGoods){
            virtualGood = response.virtualGoods[i];
            
            if(virtualGood.shortCode === "SEGVG"){
                assertThat(virtualGood.name, is("segment_vgn_1"));
                assertThat(virtualGood.description, is("segment_vgd_1"));
                assertThat(virtualGood.currency1Cost, is(11));
                assertThat(virtualGood.currency2Cost, is(11));
                assertThat(virtualGood.currency3Cost, is(11));
                assertThat(virtualGood.currency4Cost, is(11));
                assertThat(virtualGood.currency5Cost, is(11));
                assertThat(virtualGood.currency6Cost, is(11));
                assertThat(virtualGood.maxQuantity, is(11));
                found = true;
            }
        }
        assertThat(found, is(true));
        
        player.setSegmentValue("CS", "CSV2");
        response = Spark.sendRequestAs(listVirtualGoodsRequest, playerId);
        virtualGood = null;
        found = false;
        
        for(var j in response.virtualGoods){
            virtualGood = response.virtualGoods[j];
            
            if(virtualGood.shortCode === "SEGVG"){
                assertThat(virtualGood.name, is("segment_vgn_2"));
                assertThat(virtualGood.description, is("segment_vgd_2"));
                assertThat(virtualGood.currency1Cost, is(12));
                assertThat(virtualGood.currency2Cost, is(12));
                assertThat(virtualGood.currency3Cost, is(12));
                assertThat(virtualGood.currency4Cost, is(12));
                assertThat(virtualGood.currency5Cost, is(12));
                assertThat(virtualGood.currency6Cost, is(12));
                assertThat(virtualGood.maxQuantity, is(12));
                found = true;
            }
        }
        assertThat(found, is(true));
    });
    
    test("test Achievement Segmentation", function(){
        player.setSegmentValue("CS", "CSV");
        player.removeAchievement("SEGA");
        var initialBal1 = player.getBalance1();
        var initialBal2 = player.getBalance2();
        var initialBal3 = player.getBalance3();
        var initialBal4 = player.getBalance4();
        var initialBal5 = player.getBalance5();
        var initialBal6 = player.getBalance6();
        player.addAchievement("SEGA");
        assertThat(player.getBalance1(), is(initialBal1+11));
        assertThat(player.getBalance2(), is(initialBal2+11));
        assertThat(player.getBalance3(), is(initialBal3+11));
        assertThat(player.getBalance4(), is(initialBal4+11));
        assertThat(player.getBalance5(), is(initialBal5+11));
        assertThat(player.getBalance6(), is(initialBal6+11));
        
        player.setSegmentValue("CS", "CSV2");
        player.removeAchievement("SEGA");
        initialBal1 = player.getBalance1();
        initialBal2 = player.getBalance2();
        initialBal3 = player.getBalance3();
        initialBal4 = player.getBalance4();
        initialBal5 = player.getBalance5();
        initialBal6 = player.getBalance6();
        player.addAchievement("SEGA");
        assertThat(player.getBalance1(), is(initialBal1+12));
        assertThat(player.getBalance2(), is(initialBal2+12));
        assertThat(player.getBalance3(), is(initialBal3+12));
        assertThat(player.getBalance4(), is(initialBal4+12));
        assertThat(player.getBalance5(), is(initialBal5+12));
        assertThat(player.getBalance6(), is(initialBal6+12));
    });
    
    test("test Challenge Segmentation", function(){
        player.setSegmentValue("CS", "CSV");
        var listChallengeTypreRequest = new SparkRequests.ListChallengeTypeRequest();
        var response = Spark.sendRequestAs(listChallengeTypreRequest, playerId);
        var challengeTemplate = null;
        var found = false;
        
        for(var i in response.challengeTemplates){
            challengeTemplate = response.challengeTemplates[i];
            
            if(challengeTemplate.challengeShortCode === "SEGC"){
                assertThat(challengeTemplate.name, is("segment_cn_1"));
                assertThat(challengeTemplate.description, is("segment_cd_1"));
                assertThat(challengeTemplate.tags, is("segment_t_1"));
                found = true;
            }
        }
        assertThat(found, is(true));
        
        player.setSegmentValue("CS", "CSV2");
        response = Spark.sendRequestAs(listChallengeTypreRequest, playerId);
        challengeTemplate = null;
        found = false;
        
        for(var j in response.challengeTemplates){
            challengeTemplate = response.challengeTemplates[j];
            
            if(challengeTemplate.challengeShortCode === "SEGC"){
                assertThat(challengeTemplate.name, is("segment_cn_2"));
                assertThat(challengeTemplate.description, is("segment_cd_2"));
                assertThat(challengeTemplate.tags, is("segment_t_2"));
                found = true;
            }
        }
        assertThat(found, is(true));
    });
});