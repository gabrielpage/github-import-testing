// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Basic SparkPlayer tests", function(){
    
    var player = Spark.getPlayer();
    test("Spark.getPlayer() does not return null", function(){
        assertThat(player, is(not(null)));
    });
     
    test("displayName is set correctly", function(){
        assertThat(player.getDisplayName(), is("JS-Test-Player"));
    });
     
    test("userName is set correctly", function(){
        assertThat(player.getUserName(), is("jstestsplayer"));
    });
     
    test("isOnline is true when user is Online", function(){
        assertThat(player.isOnline(), is(true));
    });
     
    test("getPlayerId is not null when user is Online", function(){
        assertThat(player.getPlayerId(), is(not(null)));
    });
    
    test("getExternalIds obtains a list of external IDs for the player", function(){
        assertThat(player.getExternalIds(), is(not(null)));
        assertThat(typeof player.getExternalIds(), is("object"));
    });
    
    test("pushRegistration is of length 0 when no device is registered", function(){
        assertThat(player.getPushRegistrations().length, is(0));
    });
    
    test("removePushRegistration with null id, Throws Null Pointer Exception", function(){
        try{
            player.removePushRegistration(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
        }
    });
    
    test("removePushRegistration doesn't do anything when id is not found", function(){
        player.removePushRegistration("invalid_id");
    });
});

suite("Currency1 tests", function(){
    
    var player = Spark.getPlayer();
     
    test("Balance1 returns not null", function(){
        assertThat(player.getBalance1(), is(not(null)));
    });
     
    test("credit1 with a value of 0 keeps the Balance1 unchanged", function(){
        var startingBalance = player.getBalance1();
        player.credit1(0);
        assertThat(player.getBalance1(), is(startingBalance));
    });
     
    test("credit1 with a value of 10 increases the Balance1 by 10", function(){
        var startingBalance = player.getBalance1();
        player.credit1(10);
        assertThat(player.getBalance1(), is(startingBalance+10));
    });
     
    test("credit1 with a value of -1 decreases the Balance1 by 1", function(){
        var startingBalance = player.getBalance1();
        player.credit1(-1);
        assertThat(player.getBalance1(), is(startingBalance-1));
    });
     
    test("credit1 with a value of 'string' throws a conversion exception", function(){
        try{
            player.credit1("string");
            fail();
        } catch(e){
            assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
    });
     
    test("credit1 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit1(null);
            fail();
        } catch(e){
            assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit1(null)"));
        }
    });
     
    test("debit1 with a value of 0 keeps the Balance1 unchanged", function(){
        var startingBalance = player.getBalance1();
        player.debit1(0);
        assertThat(player.getBalance1(), is(startingBalance));
    });
     
    test("debit1 with a value of 1 decreases the Balance1 by 1", function(){
        var startingBalance = player.getBalance1();
        player.debit1(1);
        assertThat(player.getBalance1(), is(startingBalance-1));
    });
     
    test("debit1 with a value of -1 increases the Balance1 by 1", function(){
        var startingBalance = player.getBalance1();
        player.debit1(-1);
        assertThat(player.getBalance1(), is(startingBalance+1));
    });
     
    test("debit1 with a value of 'string' throws a conversion exception", function(){
        try{
            player.debit1("string");
            fail();
        } catch(e){
            assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
    });
     
     test("debit1 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit1(null);
            fail();
        } catch(e){
            assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit1(null)"));
        }
    });
});

suite("Currency2 tests", function(){
    
    var player = Spark.getPlayer();
     
     test("Balance2 returns not null", function(){
         assertThat(player.getBalance2(), is(not(null)));
     });
     
     test("credit2 with a value of 0 keeps the Balance2 unchanged", function(){
        var startingBalance = player.getBalance2();
        player.credit2(0);
        assertThat(player.getBalance2(), is(startingBalance));
     });
     
     test("credit2 with a value of 10 increases the Balance2 by 10", function(){
        var startingBalance = player.getBalance2();
        player.credit2(10);
        assertThat(player.getBalance2(), is(startingBalance+10));
     });
     
     test("credit2 with a value of -1 decreases the Balance2 by 1", function(){
        var startingBalance = player.getBalance2();
        player.credit2(-1);
        assertThat(player.getBalance2(), is(startingBalance-1));
     });
     
     test("credit2 with a value of 'string' throws a conversion exception", function(){
         try{
            player.credit2("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("credit2 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit2(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit2(null)"));
         }
     });
     
     test("debit2 with a value of 0 keeps the Balance2 unchanged", function(){
        var startingBalance = player.getBalance2();
        player.debit2(0);
        assertThat(player.getBalance2(), is(startingBalance));
     });
     
     test("debit2 with a value of 1 decreases the Balance2 by 1", function(){
        var startingBalance = player.getBalance2();
        player.debit2(1);
        assertThat(player.getBalance2(), is(startingBalance-1));
     });
     
     test("debit2 with a value of -1 increases the Balance2 by 1", function(){
        var startingBalance = player.getBalance2();
        player.debit2(-1);
        assertThat(player.getBalance2(), is(startingBalance+1));
     });
     
     test("debit2 with a value of 'string' throws a conversion exception", function(){
         try{
            player.debit2("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("debit2 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit2(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit2(null)"));
         }
     });
});

suite("Currency3 tests", function(){
    
    var player = Spark.getPlayer();
     
     test("Balance3 returns not null", function(){
         assertThat(player.getBalance3(), is(not(null)));
     });
     
     test("credit3 with a value of 0 keeps the Balance3 unchanged", function(){
        var startingBalance = player.getBalance3();
        player.credit3(0);
        assertThat(player.getBalance3(), is(startingBalance));
     });
     
     test("credit3 with a value of 10 increases the Balance3 by 10", function(){
        var startingBalance = player.getBalance3();
        player.credit3(10);
        assertThat(player.getBalance3(), is(startingBalance+10));
     });
     
     test("credit3 with a value of -1 decreases the Balance3 by 1", function(){
        var startingBalance = player.getBalance3();
        player.credit3(-1);
        assertThat(player.getBalance3(), is(startingBalance-1));
     });
     
     test("credit3 with a value of 'string' throws a conversion exception", function(){
         try{
            player.credit3("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("credit3 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit3(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit3(null)"));
         }
     });
     
     test("debit3 with a value of 0 keeps the Balance3 unchanged", function(){
        var startingBalance = player.getBalance3();
        player.debit3(0);
        assertThat(player.getBalance3(), is(startingBalance));
     });
     
     test("debit3 with a value of 1 decreases the Balance3 by 1", function(){
        var startingBalance = player.getBalance3();
        player.debit3(1);
        assertThat(player.getBalance3(), is(startingBalance-1));
     });
     
     test("debit3 with a value of -1 increases the Balance3 by 1", function(){
        var startingBalance = player.getBalance3();
        player.debit3(-1);
        assertThat(player.getBalance3(), is(startingBalance+1));
     });
     
     test("debit3 with a value of 'string' throws a conversion exception", function(){
         try{
            player.debit3("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("debit3 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit3(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit3(null)"));
         }
     });
});

suite("Currency4 tests", function(){
    
    var player = Spark.getPlayer();
     
     test("Balance4 returns not null", function(){
         assertThat(player.getBalance4(), is(not(null)));
     });
     
     test("credit4 with a value of 0 keeps the Balance4 unchanged", function(){
        var startingBalance = player.getBalance4();
        player.credit4(0);
        assertThat(player.getBalance4(), is(startingBalance));
     });
     
     test("credit4 with a value of 10 increases the Balance4 by 10", function(){
        var startingBalance = player.getBalance4();
        player.credit4(10);
        assertThat(player.getBalance4(), is(startingBalance+10));
     });
     
     test("credit4 with a value of -1 decreases the Balance4 by 1", function(){
        var startingBalance = player.getBalance4();
        player.credit4(-1);
        assertThat(player.getBalance4(), is(startingBalance-1));
     });
     
     test("credit4 with a value of 'string' throws a conversion exception", function(){
         try{
            player.credit4("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("credit4 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit4(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit4(null)"));
         }
     });
     
     test("debit4 with a value of 0 keeps the Balance4 unchanged", function(){
        var startingBalance = player.getBalance4();
        player.debit4(0);
        assertThat(player.getBalance4(), is(startingBalance));
     });
     
     test("debit4 with a value of 1 decreases the Balance4 by 1", function(){
        var startingBalance = player.getBalance4();
        player.debit4(1);
        assertThat(player.getBalance4(), is(startingBalance-1));
     });
     
     test("debit4 with a value of -1 increases the Balance4 by 1", function(){
        var startingBalance = player.getBalance4();
        player.debit4(-1);
        assertThat(player.getBalance4(), is(startingBalance+1));
     });
     
     test("debit4 with a value of 'string' throws a conversion exception", function(){
        try{
            player.debit4("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("debit4 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit4(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit4(null)"));
         }
     });
});

suite("Currency5 tests", function(){
    
    var player = Spark.getPlayer();
     
     test("Balance5 returns not null", function(){
         assertThat(player.getBalance5(), is(not(null)));
     });
     
     test("credit5 with a value of 0 keeps the Balance5 unchanged", function(){
        var startingBalance = player.getBalance5();
        player.credit5(0);
        assertThat(player.getBalance5(), is(startingBalance));
     });
     
     test("credit5 with a value of 10 increases the Balance5 by 10", function(){
        var startingBalance = player.getBalance5();
        player.credit5(10);
        assertThat(player.getBalance5(), is(startingBalance+10));
     });
     
     test("credit5 with a value of -1 decreases the Balance5 by 1", function(){
        var startingBalance = player.getBalance5();
        player.credit5(-1);
        assertThat(player.getBalance5(), is(startingBalance-1));
     });
     
     test("credit5 with a value of 'string' throws a conversion exception", function(){
         try{
            player.credit5("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("credit5 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit5(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit5(null)"));
         }
     });
     
     test("debit5 with a value of 0 keeps the Balance5 unchanged", function(){
        var startingBalance = player.getBalance5();
        player.debit5(0);
        assertThat(player.getBalance5(), is(startingBalance));
     });
     
     test("debit5 with a value of 1 decreases the Balance5 by 1", function(){
        var startingBalance = player.getBalance5();
        player.debit5(1);
        assertThat(player.getBalance5(), is(startingBalance-1));
     });
     
     test("debit5 with a value of -1 increases the Balance5 by 1", function(){
        var startingBalance = player.getBalance5();
        player.debit5(-1);
        assertThat(player.getBalance5(), is(startingBalance+1));
     });
     
     test("debit5 with a value of 'string' throws a conversion exception", function(){
         try{
            player.debit5("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("debit5 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit5(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit5(null)"));
         }
     });
});

suite("Currency6 tests", function(){
    
    var player = Spark.getPlayer();
     
     test("Balance6 returns not null", function(){
         assertThat(player.getBalance6(), is(not(null)));
     });
     
     test("credit6 with a value of 0 keeps the Balance6 unchanged", function(){
        var startingBalance = player.getBalance6();
        player.credit6(0);
        assertThat(player.getBalance6(), is(startingBalance));
     });
     
     test("credit6 with a value of 10 increases the Balance6 by 10", function(){
        var startingBalance = player.getBalance6();
        player.credit6(10);
        assertThat(player.getBalance6(), is(startingBalance+10));
     });
     
     test("credit6 with a value of -1 decreases the Balance6 by 1", function(){
        var startingBalance = player.getBalance6();
        player.credit6(-1);
        assertThat(player.getBalance6(), is(startingBalance-1));
     });
     
     test("credit6 with a value of 'string' throws a conversion exception", function(){
         try{
            player.credit6("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("credit6 with a value of null throws a Method Not Found Error", function(){
        try{
            player.credit6(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.credit6(null)"));
         }
     });
     
     test("debit6 with a value of 0 keeps the Balance6 unchanged", function(){
        var startingBalance = player.getBalance6();
        player.debit6(0);
        assertThat(player.getBalance6(), is(startingBalance));
     });
     
     test("debit6 with a value of 1 decreases the Balance6 by 1", function(){
        var startingBalance = player.getBalance6();
        player.debit6(1);
        assertThat(player.getBalance6(), is(startingBalance-1));
     });
     
     test("debit6 with a value of -1 increases the Balance6 by 1", function(){
        var startingBalance = player.getBalance6();
        player.debit6(-1);
        assertThat(player.getBalance6(), is(startingBalance+1));
     });
     
     test("debit6 with a value of 'string' throws a conversion exception", function(){
         try{
            player.debit6("string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("debit6 with a value of null throws a Method Not Found Error", function(){
        try{
            player.debit6(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.debit6(null)"));
         }
     });
});

suite("Player Virtual Goods tests", function(){
    
    var player = Spark.getPlayer();
     
     test("hasVGood returns not null when the VGood exists", function(){
         assertThat(player.hasVGood("GOLD"), is(not(null)));
     });
     
     test("hasVGood with a value of null returns a 0", function(){
        assertThat(player.hasVGood(null), is(0));
     });
     
     test("addVGood with a value of 0 keeps the Players VGoods unchanged", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.addVGood("GOLD", 0);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods));
     });
     
     test("addVGood with a values 'GOLD' and null throws a Method Not Found Error", function(){
         try{
            player.addVGood("GOLD", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.addVGood(string,null)"));
         }
     });
     
     test("addVGood with a values null and 10 does not add 10 null VGoods", function(){
         var startingVGoods = player.hasVGood(null);
         player.addVGood(null, 10);
         assertThat(player.hasVGood(null), is(not(startingVGoods+10)));
     });
     
     test("addVGood with a value of 10 increases the Players VGoods by 10", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.addVGood("GOLD", 10);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods+10));
     });
     
     test("addVGood with a value of -1 decreases the Players VGoods by 1", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.addVGood("GOLD", -1);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods-1));
     });
     
     test("addVGood with a value of 'string' throws a conversion exception", function(){
         try{
            player.addVGood("GOLD", "string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("useVGood with a value of 0 keeps the Players VGoods unchanged", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.useVGood("GOLD", 0);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods));
     });
     
     test("useVGood with a value of 1 decreases the Players VGoods by 1", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.useVGood("GOLD", 1);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods-1));
     });
     
     test("useVGood with a value of -1 increases the Players VGoods by 1", function(){
         var startingVGoods = player.hasVGood("GOLD");
         player.useVGood("GOLD", -1);
         assertThat(player.hasVGood("GOLD"), is(startingVGoods+1));
     });
     
     test("useVGood with a value of 'string' throws a conversion exception", function(){
         try{
            player.useVGood("GOLD", "string");
            fail();
         } catch(e){
             assertThat(e.message, contains("Cannot convert string to java.lang.Integer"));
        }
     });
     
     test("useVGood with a values 'GOLD' and null throws a Method Not Found Error", function(){
         try{
            player.useVGood("GOLD", null);
            fail();
         } catch(e){
             assertThat(e.message, contains("Can't find method com.gamesparks.scripting.impl.SparkPlayerImpl.useVGood(string,null)"));
         }
     });
     
     test("useVGood with a values null and 10 does not remove 10 null VGoods", function(){
         var startingVGoods = player.hasVGood(null);
         player.useVGood(null, 10);
         assertThat(player.hasVGood(null), is(not(startingVGoods-10)));
     });
     
    test("testing VGood Max qty", function(){
        var startingVGoods = player.hasVGood("UVG");
        player.addVGood("UVG", 1);
        assertThat(player.hasVGood("UVG"), is(startingVGoods+1));
        player.useVGood("UVG", 1);
        assertThat(player.hasVGood("UVG"), is(0));
        player.addVGood("UVG", 5);
        assertThat(player.hasVGood("UVG"), is(0));
    });
    
    test("getVirtualGoods returns all virtual goods for the player", function(){
         assertThat(player.getVirtualGoods(), is(not(null)));
    });
});

// When the GS-1008 is fixed, add Achievement tests for null values as well as uncomment the addAchievement lines
suite("Player Achievements tests", function(){
    
    var player = Spark.getPlayer();
    
    test("hasAchievement returns not null when Achievement exists", function(){
         assertThat(player.hasAchievement("OD"), is(not(null)));
     });
     
     test("hasAchievement returns false when a null value is passed in", function(){
         assertThat(player.hasAchievement(null), is(false));
     });
     
     test("hasAchievement returns false when Achievement doesn't exist", function(){
         assertThat(player.hasAchievement("invalid_shortcode"), is(false));
     });
     
     test("addAchievement adds an achievement for the Player", function(){
         if(player.hasAchievement("OD")){
             player.removeAchievement("OD");
             assertThat(player.hasAchievement("OD"), is(false));
         }
         player.addAchievement("OD");
         assertThat(player.hasAchievement("OD"), is(true));
     });
    
    test("removeAchievement removes an achievement from the Player", function(){
         if(!player.hasAchievement("OD")){
             player.addAchievement("OD");
             assertThat(player.hasAchievement("OD"), is(true));
         }
         player.removeAchievement("OD");
         assertThat(player.hasAchievement("OD"), is(false));
     });
    
//  test("addAchievement returns false with invalid shortCode", function(){
//      assertThat(player.addAchievement("invalid_shortcode"), is(false));
//  });
     
    test("removeAchievement returns true with invalid shortCode", function(){
         assertThat(player.removeAchievement("invalid_shortcode"), is(false));
    });
    
    test("getAchievements returns all achievements for the player", function(){
         assertThat(player.getAchievements(), is(not(null)));
    });
});

suite("Player Authentication tests", function(){
    
    var player = Spark.getPlayer();
    
    test("validatePassword returns true when a correct password is given", function(){
         assertThat(player.validatePassword("password"), is(true));
     });
     
     test("validatePassword returns false when an incorrect password is given", function(){
         assertThat(player.validatePassword("incorrect_password"), is(false));
     });
     
     test("validatePassword throws a Null Pointer Exception when passed in a null value", function(){
         try{
            player.validatePassword(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
         }
     });
     
     test("setPassword throws a Null Pointer Exception when passed in a null value", function(){
         try{
            player.setPassword(null);
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
         }
     });
     
      test("setPassword sets a new password for the player", function(){
          
         player.setPassword("newPassword");
         assertThat(player.validatePassword("newPassword"), is(true));
         player.setPassword("password");
     });
});

suite("Player Leaderboard Hide/Show tests", function(){
    
    var player = Spark.getPlayer();
    
    test("hide, hides the Player from leaderboards", function(){
          if(player.isHiddenOnLeaderboards()){
             player.showOnLeaderboards();
             assertThat(player.isHiddenOnLeaderboards(), is(false));
         }
         player.hideOnLeaderboards();
         assertThat(player.isHiddenOnLeaderboards(), is(true));
     });
     
     test("show, shows the Player in leaderboards", function(){
          if(!player.isHiddenOnLeaderboards()){
             player.hideOnLeaderboards();
             assertThat(player.isHiddenOnLeaderboards(), is(true));
         }
         player.showOnLeaderboards();
         assertThat(player.isHiddenOnLeaderboards(), is(false));
     });
});
// Private data and Script data has to be tested with null pointers, currently disabled due to bug: GS-1012
suite("Player Private Data tests", function(){
    
    var player = Spark.getPlayer();
    
    test("getPrivateData returns null for non-existant name in a name/value pair", function(){
         assertThat(player.getPrivateData("invalid_name"), is(null));
     });
     
    test("getPrivateData returns null when a null is passed as name in a name/value pair", function(){
        assertThat(player.getPrivateData(null), is(null));
    });
     
    test("setPrivateData sets private data for the Player", function(){
        if(player.getPrivateData("test_data") != null) {
            player.removePrivateData("test_data");
            assertThat(player.getPrivateData("test_data"), is(null));
        }
        player.setPrivateData("test_data", "test_value");
        assertThat(player.getPrivateData("test_data"), is("test_value"));
    });
     
    test("setPrivateData with Scriptable value sets private data for the Player", function(){
        if(player.getPrivateData("test_data") != null) {
            player.removePrivateData("test_data");
            assertThat(player.getPrivateData("test_data"), is(null));
        }
        player.setPrivateData("test_data", ["test_value", "test_value2"]);
        assertThat(player.getPrivateData("test_data"), is(["test_value", "test_value2"]));
    });
     
    //  test("setPrivateData throws a Null Pointer Exception when trying to add a value to a null name", function(){
    //      try{
    //         player.setPrivateData(null, "test_value");
    //         fail();
    //      } catch(e){
    //          assertThat(e.message, contains("java.lang.NullPointerException"));
    //      }
    //  });
     
     test("removePrivateData removes private data from the Player", function(){
          if(player.getPrivateData("test_data") == null) {
             player.setPrivateData("test_data", "test_value");
             assertThat(player.getPrivateData("test_data"), is("test_value"));
         }
         player.removePrivateData("test_data");
         assertThat(player.getPrivateData("test_data"), is(null));
     });
});

suite("Player Script Data tests", function(){
    
    var player = Spark.getPlayer();

    test("getScriptData returns null for non-existant name in a name/value pair", function(){
        assertThat(player.getScriptData("invalid_name"), is(null));
    });

    test("setScriptData sets script data for the Player", function(){
        if(player.getScriptData("test_dviata") != null) {
            player.removeScriptData("test_data");
            assertThat(player.getScriptData("test_data"), is(null));
        }
        player.setScriptData("test_data", "test_value");
        assertThat(player.getScriptData("test_data"), is("test_value"));
    });
    
    test("setScriptData with Scriptable value sets private data for the Player", function(){
        if(player.getScriptData("test_data") != null) {
            player.removeScriptData("test_data");
            assertThat(player.getScriptData("test_data"), is(null));
        }
        player.setScriptData("test_data", ["test_value", "test_value2"]);
        assertThat(player.getScriptData("test_data"), is(["test_value", "test_value2"]));
    });
     
    test("removeScriptData removes private data from the Player", function(){
        if(player.getScriptData("test_data") == null) {
            player.setScriptData("test_data", "test_value");
            assertThat(player.getScriptData("test_data"), is("test_value"));
        }
        player.removeScriptData("test_data");
        assertThat(player.getScriptData("test_data"), is(null));
    });
});

suite("Player Message test", function(){
    
    var player = Spark.getPlayer();
    var listMessageRequest = new SparkRequests.ListMessageRequest();
    listMessageRequest.entryCount = 1;

    test("dismissMessage, dismisses a message when one exists", function(){
        Spark.sendMessage({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(player.dismissMessage(response.messageList[0].messageId), is(true));
    });
    
    test("dismissMessage, returns false when a message doesn't exist", function(){
        Spark.sendMessage({"data" : "This is a test Data!"}, player);
        var response = listMessageRequest.Send();
        assertThat(player.dismissMessage("invalid_id"), is(false));
    });  

});