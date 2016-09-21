var player = Spark.getPlayer();
//can only have an achievement once, so remove it before re-adding
player.removeAchievement("FLCA");
player.addAchievement("FLCA");

var players = [];
players.push(player);
Spark.sendMessage({"alert" : "You've just won a car!"}, players);