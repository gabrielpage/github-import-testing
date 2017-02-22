function resetBonusTimes(player) {
    if(player){
        if(!player.getScriptData("nextHourly")){
            var nextHourly = new Date(new Date().getHours() + 1);
            player.getScriptData("nextHourly", nextHourly);
        }
        if(!player.getScriptData("nextDaily")){
            var nextDaily = new Date(new Date().getDate() + 1);
            player.setScriptData("nextDaily", nextDaily);
        }
    }   
}