Spark.setScriptData("config", testProperties());

function testProperties(){
    
    var form = {};
        
    var config = Spark.getConfig();
    
    var vGoods = config.getVirtualGoods();
    if(vGoods && vGoods.length > 0){
        form.vGoods = vGoods;
    }
    
    return form;
}