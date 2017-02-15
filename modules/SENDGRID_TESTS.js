// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

// Some of these tests cannot be fully validated using Cloud Code
suite("basic sendGrid tests", function(){
    
    test("sendGrid, is not null", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        assertThat(sendGrid, is(not(null)));
    });
    
    test("sendGrid with null password", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", null);
        sendGrid.send();
    });
    
    test("sendGrid with null username", function(){
        
        var sendGrid = Spark.sendGrid(null, "d3v3LQper");
        sendGrid.send();
    });
    
    test("sendGrid with null addTo email, Throws a Null Pointer Exception", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        try{
            sendGrid.addTo(null, "GameSparks");
            sendGrid.send();
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
        }
    });
    
    test("sendGrid with null addTo name, Throws a Null Pointer Exception", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        try{
            sendGrid.addTo("gamesparks@mailinator.com", null);
            sendGrid.send();
            fail();
         } catch(e){
             assertThat(e.message, contains("java.lang.NullPointerException: null"));
        }
    });
    
    test("sendGrid with null setFrom email", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setFrom(null, "GameSparks");
        sendGrid.send();
    });
    
    test("sendGrid with null setFrom name", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setFrom("info@gamesparks.com", null);
        sendGrid.send();
    });
    
    test("sendGrid with null setReplyTo", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setReplyTo(null);
        sendGrid.send();
    });
    
    test("sendGrid with null setBcc", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setBcc(null);
        sendGrid.send();
    });
    
    test("sendGrid with null setSubject", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setSubject(null);
        sendGrid.send();
    });
    
    test("sendGrid with null setText", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setText(null);
        sendGrid.send();
    });
    
    test("sendGrid with null setHtml", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.setHtml(null);
        sendGrid.send();
    });
    
    test("sendGrid with null addUploaded", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.addUploaded(null);
        sendGrid.send();
    });
    
    test("sendGrid with null addDownloadable", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.addDownloadable(null);
        sendGrid.send();
    });
    
    // test("sendGrid with null addHeader", function(){
        
    //     var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        
    //         sendGrid.addHeader(null,null);
    //         sendGrid.send();
    // });
    
    // Navigate to https://mailinator.com/inbox.jsp?to=gamesparks#/#maildirpane
    // Select latest e-mail and Click "Original" to inspect the email
    test("send mail from sendgrid", function(){
        
        var sendGrid = Spark.sendGrid("game_sparks", "d3v3LQper");
        sendGrid.addTo("gamesparks@mailinator.com", "GameSparks");
        sendGrid.setFrom("info@gamesparks.com", "GameSparks");
        sendGrid.setReplyTo("me@email.com");
        sendGrid.setBcc("anotherMe@mail.com");
        sendGrid.setSubject("GameSparks SendGrid test" + new Date());
        sendGrid.setText("Some test text");
        sendGrid.setHtml("<b>Welcome to using SendGrid via GameSparks</b>");
        sendGrid.addUploaded("2f575aceb7a84ac18e9c6b31569e92ba");
        sendGrid.addDownloadable("jsonDownloadable");
        sendGrid.addHeader("X-Sent-Using", "SendGrid-API");
        sendGrid.send();
    });
});