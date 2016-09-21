// ====================================================================================================
//
// Cloud Code for module, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("ASSERT");

suite("Testing Misc Requests", function(){
    
    test("Windows Buy Goods Request", function(){
        var windowsBuyGoodsRequest = new SparkRequests.WindowsBuyGoodsRequest();
        windowsBuyGoodsRequest.receipt = "<?xml version=\"1.0\"?><Receipt Version=\"1.0\" CertificateId=\"A656B9B1B3AA509EEA30222E6D5E7DBDA9822DCD\" xmlns=\"http://schemas.microsoft.com/windows/2012/store/receipt\"><ProductReceipt PurchasePrice=\"£0\" PurchaseDate=\"2014-12-12T13:09:18.037Z\" Id=\"ebd94132-b527-4321-bcee-205774c5a2e2\" AppId=\"d7f5021d-b1f7-475c-aab9-8536f9849964\" ProductId=\"com.flipsportsbeta.flipcoins20k\" ProductType=\"Consumable\" PublisherUserId=\"4streBTuRahtFsZOUEUDM7F4bW/uPL9gzJmLRQb10no=\" PublisherDeviceId=\"1ZhJbdB/GDYK61J0pSBBSsS8gHstQwGna2ZJfGC5CsU=\" MicrosoftProductId=\"5d89b9e0-eefc-4dc9-8cf2-a58bb749b9da\" /><Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\"><SignedInfo><CanonicalizationMethod Algorithm=\"http://www.w3.org/TR/2001/REC-xml-c14n-20010315\" /><SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\" /><Reference URI=\"\"><Transforms><Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\" /></Transforms><DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\" /><DigestValue>PJsM+1xxpFa4IRT7ymHWhWw7xQtH0oPzA1zI9zhgqGk=</DigestValue></Reference></SignedInfo><SignatureValue>bSLps1r5A+/ZNOBVyrCBO+40S5td+uIjkwjb5cTaZd+5/+OVwcfjBy3L2AXQ4mF8aqyRFcjdGn31NwKhrawONGXLRuZ9fA019hpsLzEEYwLyiIuUTeA2RhLpiktHtAwtKRvO/47EKN/TJ6tsFXJTOEsVgGyTyLxBpShJyUxlMRIyXUUeF6Ud5eOAw9Lo0PGRqc3wxK2XTCGx3iKn3h6H9RVm6391iigIeOoWnkaEFzq1vHmRcFMFuDzr9TEbwMT9Y2RenUyegrFXtDUcJP5Vo3UG30ZjxjF5e1otA78G5NAGy8RHwxhtxYCmZnfzHKB01VGbK3qQ/reEFj2OItw1bA==</SignatureValue></Signature></Receipt>";
        var response = Spark.sendRequest(windowsBuyGoodsRequest);
        Spark.setScriptData("resp", response);
        assertThat(response.error.verificationError, is(not("2"))); 
    });
});