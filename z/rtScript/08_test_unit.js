var onPlayerConnectCount = 0;
var onPlayerDisconnectCount = 0;

var connectedPeers = [];

RTSession.onPlayerConnect(function(player){
	connectedPeers.push(player.getPeerId())
	onPlayerConnectCount += 1;
});

RTSession.onPlayerDisconnect(function(player){
	onPlayerDisconnectCount += 1;
})

RTSession.onPacket(444, function(packet){
	
	RTSession
		.newPacket()
		.setOpCode(445)
		.setTargetPeers(packet.getSender().getPeerId())
		.setData( RTSession
					.newData()
					.setNumber(1, onPlayerConnectCount)
					.setFloatArray(2,1,2,3))
		.send();
	
	return false;
	
});

RTSession.onPacket(554, function(packet){
	
	RTSession
	.newPacket()
	.setOpCode(555)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setFloat(1, packet.getData().getFloat(2)))
	.send();
	
	RTSession
	.newPacket()
	.setOpCode(556)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setNumber(1, packet.getData().getNumber(3)))
	.send();
	
	RTSession
	.newPacket()
	.setOpCode(557)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setNumber(1, packet.getData().getNumber(4)))
	.send();
	
	RTSession
	.newPacket()
	.setOpCode(558)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setFloatArray(1, packet.getData().getFloatArray(5)))
	.send();
	
	RTSession
	.newPacket()
	.setOpCode(559)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setDouble(1, packet.getData().getDouble(1)))
	.send();
	
	RTSession
	.newPacket()
	.setOpCode(560)
	.setTargetPeers(packet.getSender().getPeerId())
	.setData( RTSession
				.newData()
				.setData(1, packet.getData().getData(7)))
	.send();
	
	return false;
});