declare module GameSparks {

	/**
	* The Spark object that is available to all scripts is the entry point into the GameSparks API.
	* It can be used for getting access to objects and functions within the GameSparks platform.
	* This interface is available in all scripts using the notation \"Spark.\"
	* e.g.
	* To return a JSON representation of the Object being acted upon
	* var data = Spark.getData();
	*/
	interface Spark {
		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getPlayer() : SparkPlayer;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		loadPlayer(playerId: string) : SparkPlayer;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getChallenge(challengeInstanceId: string) : SparkChallenge;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessage(data: Object, players: [SparkPlayer]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessageExt(data: Object, extCode: string, players: [SparkPlayer]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessageWithoutPush(data: Object, players: [SparkPlayer]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessageById(data: Object, playerIds: [string]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessageByIdExt(data: Object, extCode: string, playerIds: [string]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendMessageByIdWithoutPush(data: Object, playerIds: [string]) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		message(extCode: string) : SparkMessage;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		save(collectionName: string, document: Object) : boolean;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		remove(collectionName: string, query: Object) : boolean;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		find(collectionName: string, query: Object) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		find(collectionName: string, query: Object, projection: Object) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		lock(challenge: SparkChallenge) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		unlock(challenge: SparkChallenge) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		hasScriptErrors() : boolean;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		setScriptError(key: string, value: Object) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getScriptError(key: string) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		removeScriptError(key: string) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		removeAllScriptErrors() : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getLog() : SparkLog;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getPlayerIds() : [string];

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		logEvent(eventKey: string, values: Object) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getHttp(url: string) : SparkHttp;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		dismissMessage(messageId: string) : boolean;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		runtimeCollection(collectionName: string) : SparkMongoCollectionReadWrite;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		metaCollection(collectionName: string) : SparkMongoCollectionReadOnly;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		systemCollection(collectionName: string) : SparkMongoCollectionReadOnly;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getFiles() : SparkFiles;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		uploadedXml(uploadId: string) : SparkXmlReader;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		uploadedJson(uploadId: string) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		downloadableXml(shortCode: string) : SparkXmlReader;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		downloadableJson(shortCode: string) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendGrid(username: string, password: string) : SendGrid;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getScheduler() : SparkScheduler;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getCache() : SparkCache;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendRequest(request: Object) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		sendRequestAs(request: Object, playerId: string) : Object;

		/**
		* Returns a reference to a SparkRedis object.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		getRedis() : SparkRedis;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getLeaderboards() : SparkLeaderboards;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getConfig() : SparkConfig;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getTeams() : SparkTeams;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getMultiplayer() : SparkMultiplayer;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getProperties() : SparkProperties;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getBulkScheduler() : SparkBulkScheduler;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getScriptData(name: string) : Object;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		setScriptData(name: string, value: Object) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		removeScriptData(name: string) : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		removeAllScriptData() : void;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getRemainingMilliseconds() : number;

		/**
		* The Spark object that is available to all scripts is the entry point into the GameSparks API.
		* It can be used for getting access to objects and functions within the GameSparks platform.
		* This interface is available in all scripts using the notation \"Spark.\"
		* e.g.
		* To return a JSON representation of the Object being acted upon
		* var data = Spark.getData();
		*/
		getData() : Object;

		/**
		* Terminates the script
		*/
		exit() : void;
	}
	/**
	* A cursor over entries within a leaderboard.
	* e.g.
	* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode).getEntries();
	*/
	interface SparkLeaderboardCursor {
		/**
		* A cursor over entries within a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode).getEntries();
		*/
		hasNext() : boolean;

		/**
		* A cursor over entries within a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode).getEntries();
		*/
		next() : SparkLeaderboardEntry;
	}
	/**
	* An entry within a leaderboard.
	* e.g.
	* var entry = leaderboard.getEntries().next();
	*/
	interface SparkLeaderboardEntry {
		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getUserId() : string;

		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getUserName() : string;

		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getRank() : number;

		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getRankPercentage() : number;

		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getWhen() : string;

		/**
		* An entry within a leaderboard.
		* e.g.
		* var entry = leaderboard.getEntries().next();
		*/
		getAttribute(name: string) : Object;
	}
	/**
	* Provides access to a player details
	* e.g.
	* var player = Spark.getPlayer();
	* or
	* var player = Spark.loadPlayer(myplayerid);
	*/
	interface SparkPlayer {
		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getDisplayName() : string;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getUserName() : string;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getPlayerId() : string;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit1(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit1(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit1(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit1(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit2(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit2(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit2(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit2(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit3(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit3(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit3(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit3(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit4(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit4(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit5(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit5(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit6(quantity: number) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		credit6(quantity: number, reason: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit4(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit4(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit5(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit5(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit6(quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		debit6(quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance1() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance2() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance3() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance4() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance5() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getBalance6() : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		addVGood(shortCode: string, quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		addVGood(shortCode: string, quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		useVGood(shortCode: string, quantity: number) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		useVGood(shortCode: string, quantity: number, reason: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		hasVGood(shortCode: string) : number;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		addAchievement(shortCode: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		removeAchievement(shortCode: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		hasAchievement(shortCode: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		dismissMessage(messageId: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getExternalIds() : Object;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getFriendIds() : Object;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		isOnline() : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		validatePassword(password: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		setPassword(password: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		isHiddenOnLeaderboards() : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		hideOnLeaderboards() : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		showOnLeaderboards() : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getPushRegistrations() : [SparkPushRegistration];

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		removePushRegistration(id: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		setSegmentValue(segmentType: string, segmentValue: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getSegmentValue(segmentType: string) : string;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getSegments() : Object;

		/**
		*
		* Disconnects this player, a SessionTerminatedMessage will be sent to the socket, and the socket
		* will be unauthenticated. Params: excludeCurrent - if the script is running in the context of the
		* user being disconnected, the current socket will not be disconnected.
		* e.g.
		* Spark.getPlayer().disconnect(true);
		*/
		disconnect(excludeCurrent: boolean) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getAchievements() : [string];

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		resetAuthTokens() : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getVirtualGoods() : Object;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getLastSeen() : Date;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		unlock() : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getCreationDate() : Date;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		matchesMongoQuery(mongoQuery: Object) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		matchesMongoQueryString(mongoQueryString: string) : boolean;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getPrivateData(name: string) : Object;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		setPrivateData(name: string, value: Object) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		removePrivateData(name: string) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		getScriptData(name: string) : Object;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		setScriptData(name: string, value: Object) : void;

		/**
		* Provides access to a player details
		* e.g.
		* var player = Spark.getPlayer();
		* or
		* var player = Spark.loadPlayer(myplayerid);
		*/
		removeScriptData(name: string) : void;
	}
	/**
	* Provides access to a challenge\'s details.
	* e.g.
	* var challenge = Spark.getChallenge(mychallengeid);
	*/
	interface SparkChallenge {
		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getRunState() : string;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getId() : string;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getShortCode() : string;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		winChallenge(winner: SparkPlayer) : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		drawChallenge() : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		startChallenge() : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getChallengedPlayerIds() : [string];

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getAcceptedPlayerIds() : [string];

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getDeclinedPlayerIds() : [string];

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getChallengerId() : string;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		consumeTurn(playerId: string) : boolean;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		removePlayer(playerId: string) : boolean;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getPrivateData(name: string) : Object;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		setPrivateData(name: string, value: Object) : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		removePrivateData(name: string) : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		getScriptData(name: string) : Object;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		setScriptData(name: string, value: Object) : void;

		/**
		* Provides access to a challenge\'s details.
		* e.g.
		* var challenge = Spark.getChallenge(mychallengeid);
		*/
		removeScriptData(name: string) : void;
	}
	/**
	* Provides access to the Games Redis Instance.
	* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
	* e.g.
	* var redis = Spark.getRedis();
	*/
	interface SparkRedis {
		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		append(key: string, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		bitcount(key: string, start: number, end: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		bitcount(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		bitop(op: string, destKey: string, srcKeys: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		decr(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		decrBy(key: string, integer: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		del(keys: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		exists(key: string) : boolean;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		expire(key: string, seconds: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		expireAt(key: string, unixTime: number) : number;

		/**
		* Get the value of key. If the key does not exist null is returned.
		* http://redis.io/commands/get
		* e.g.
		* var value = redis.get("my key");
		*/
		get(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		getbit(key: string, offset: number) : boolean;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		getrange(key: string, startOffset: number, endOffset: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hdel(key: string, fields: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hexists(key: string, field: string) : boolean;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hget(key: string, field: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hgetAll(key: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hincrBy(key: string, field: string, value: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hincrByFloat(key: string, field: string, increment: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hkeys(key: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hlen(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hmget(key: string, fields: [string]) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hmset(key: string, hash: Object) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hset(key: string, field: string, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hsetnx(key: string, field: string, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		hvals(key: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		incr(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		incrBy(key: string, integer: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		incrByFloat(key: string, increment: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		keys(pattern: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lindex(key: string, index: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		linsert(key: string, where: string, pivit: string, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		llen(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lpop(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lpush(key: string, strings: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lpushx(key: string, strings: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lrange(key: string, start: number, end: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lrem(key: string, count: number, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		lset(key: string, index: number, value: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		ltrim(key: string, start: number, end: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		mget(keys: [string]) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		mset(keysvalues: [string]) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		msetnx(keysvalues: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		persist(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		pexpire(key: string, milliseconds: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		pexpireAt(key: string, millisecondsTimestamp: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		psetex(key: string, milliseconds: number, value: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		pttl(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		rename(oldkey: string, newkey: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		renamenx(oldkey: string, newkey: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		rpop(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		rpoplpush(srckey: string, dstkey: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		rpush(key: string, strings: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		rpushx(key: string, strings: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sadd(key: string, members: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		scard(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sdiff(keys: [string]) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sdiffstore(dstkey: string, keys: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		set(key: string, value: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		set(key: string, value: string, nxxx: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		set(key: string, value: string, nxxx: string, expx: string, time: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		set(key: string, value: string, nxxx: string, expx: string, time: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		getSet(key: string, value: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		setbit(key: string, offset: number, value: boolean) : boolean;

		/**
		* Set key to hold the string value and set key to timeout after a given number of seconds.
		* http://redis.io/commands/setex
		* e.g.
		* redis.setex("my key", 60, "my value")
		*/
		setex(key: string, seconds: number, value: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		setnx(key: string, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		setrange(key: string, offset: number, value: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sinter(keys: [string]) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sinterstore(dstkey: string, keys: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sismember(key: string, member: string) : boolean;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		smembers(key: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		smove(srckey: string, dstkey: string, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sort(key: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sort(key: string, dstkey: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		spop(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		srandmember(key: string, count: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		srandmember(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		srem(key: string, members: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		strlen(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		substr(key: string, start: number, end: number) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sunion(keys: [string]) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		sunionstore(dstkey: string, keys: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		ttl(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		type(key: string) : string;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zadd(key: string, score: number, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zcard(key: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zcount(key: string, min: string, max: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zcount(key: string, min: number, max: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zincrby(key: string, score: number, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zinterstore(dstkey: string, sets: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrange(key: string, start: number, end: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScore(key: string, min: string, max: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScore(key: string, min: string, max: string, offset: number, count: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScore(key: string, min: number, max: number, offset: number, count: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScore(key: string, min: number, max: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScoreWithScores(key: string, min: string, max: string) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScoreWithScores(key: string, min: string, max: string, offset: number, count: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScoreWithScores(key: string, min: number, max: number, offset: number, count: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeByScoreWithScores(key: string, min: number, max: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrangeWithScores(key: string, start: number, end: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrank(key: string, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrem(key: string, members: [string]) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zremrangeByRank(key: string, start: number, end: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zremrangeByScore(key: string, start: string, end: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zremrangeByScore(key: string, start: number, end: number) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrange(key: string, start: number, end: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScore(key: string, max: string, min: string, offset: number, count: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScore(key: string, max: string, min: string) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScore(key: string, max: number, min: number, offset: number, count: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScore(key: string, max: number, min: number) : [string];

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScoreWithScores(key: string, max: string, min: string) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScoreWithScores(key: string, max: string, min: string, offset: number, count: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScoreWithScores(key: string, max: number, min: number, offset: number, count: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeByScoreWithScores(key: string, max: number, min: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrangeWithScores(key: string, start: number, end: number) : Object;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zrevrank(key: string, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zscore(key: string, member: string) : number;

		/**
		* Provides access to the Games Redis Instance.
		* Rather than copy and paste the excellent documentation from the Redis site, we\'ve opted to link to the relevant page through the documentation.
		* e.g.
		* var redis = Spark.getRedis();
		*/
		zunionstore(dstkey: string, sets: [string]) : number;
	}
	/**
	* Provides access to the entries of a leaderboard.
	* e.g.
	* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
	*/
	interface SparkLeaderboard {
		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getDescription() : string;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getName() : string;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getShortCode() : string;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntryCount() : number;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntryCountForIdentifier(identifier: string) : number;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntries() : SparkLeaderboardCursor;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntries(count: number, offset: number) : SparkLeaderboardCursor;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		isPartitioned() : boolean;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		isPartition() : boolean;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getPartitions() : [SparkLeaderboardPartition];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		drop() : void;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		drop(deleteRunningTotalData: boolean) : void;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntriesForItentifier(identifier: string, customIdFilter: Object) : SparkLeaderboardEntry[];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntriesFromPlayer(playerId: string, count: number) : SparkLeaderboardCursor;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getEntriesFromPlayerForCustomId(playerId: string, count: number, customIdFilter: Object) : SparkLeaderboardCursor;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getIdFields() : [string];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getScoreFields() : [string];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		deleteAllEntries(identifier: string, deleteRunningTotals: boolean) : [string];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		deleteEntriesForCustomId(identifier: string, deleteRunningTotals: boolean, customIdFilter: Object) : [string];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		deleteEntry(identifier: string, deleteRunningTotals: boolean) : [string];

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getPropertySet() : Object;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		getRankForScore(score: Object) : number;

		/**
		* Provides access to the entries of a leaderboard.
		* e.g.
		* var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
		*/
		rebuildLeaderboard(awardAchievements: boolean) : void;
	}
	/**
	* Provides access to the leaderboards for the current game.
	* var leaderboards = Spark.getLeaderboards();
	*/
	interface SparkLeaderboards {
		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getLeaderboard(shortCode: string) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getSocialLeaderboard(shortCode: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseSocialLeaderboard(shortCode: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getSocialLeaderboardAs(shortCode: string, playerId: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseSocialLeaderboardAs(shortCode: string, playerId: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getTeamLeaderboard(shortCode: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseTeamLeaderboard(shortCode: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getTeamLeaderboardAs(shortCode: string, playerId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseTeamLeaderboardAs(shortCode: string, playerId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		listLeaderboards() : [SparkLeaderboard];

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getChallengeLeaderboard(challengeInstanceId: string) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getSocialChallengeLeaderboard(challengeInstanceId: string, friendsIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		union(lhs: SparkLeaderboard, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseSocialChallengeLeaderboard(challengeInstanceId: string, friendsIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		union(lhs: SparkLeaderboard, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getSocialChallengeLeaderboardAs(challengeInstanceId: string, playerId: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		union(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseSocialChallengeLeaderboardAs(challengeInstanceId: string, playerId: string, friendIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getTeamChallengeLeaderboard(challengeInstanceId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		union(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseTeamChallengeLeaderboard(challengeInstanceId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		intersection(lhs: SparkLeaderboard, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getTeamChallengeLeaderboardAs(challengeInstanceId: string, playerId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		getInverseTeamChallengeLeaderboardAs(challengeInstanceId: string, playerId: string, teamIds: [string]) : SparkLeaderboard;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		intersection(lhs: SparkLeaderboard, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		intersection(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		intersection(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		difference(lhs: SparkLeaderboard, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		difference(lhs: SparkLeaderboard, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		difference(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* Provides access to the leaderboards for the current game.
		* var leaderboards = Spark.getLeaderboards();
		*/
		difference(lhs: SparkLeaderboardOperations, rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;
	}
	/**
	* A Logging interface that can be called from scripts.
	* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
	* The object passed can either be complex JSON or simple javascript values.
	* e.g.
	* var logger = Spark.getLog();
	*/
	interface SparkLog {
		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		debug(msg: Object) : void;

		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		info(msg: Object) : void;

		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		warn(msg: Object) : void;

		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		error(msg: Object) : void;

		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		getLevel() : string;

		/**
		* A Logging interface that can be called from scripts.
		* This interface writes to the script.log table that is accessible in the developer portal using the NoSQL explorer tool.
		* The object passed can either be complex JSON or simple javascript values.
		* e.g.
		* var logger = Spark.getLog();
		*/
		setLevel(level: string) : void;
	}
	/**
	* The registration of a device to receive push notifications.
	* e.g.
	* var player = Spark.getPlayer().getPushRegistrations();
	*/
	interface SparkPushRegistration {
		/**
		* The registration of a device to receive push notifications.
		* e.g.
		* var player = Spark.getPlayer().getPushRegistrations();
		*/
		getId() : string;

		/**
		* The registration of a device to receive push notifications.
		* e.g.
		* var player = Spark.getPlayer().getPushRegistrations();
		*/
		getPushId() : string;

		/**
		* The registration of a device to receive push notifications.
		* e.g.
		* var player = Spark.getPlayer().getPushRegistrations();
		*/
		getDeviceOS() : string;
	}
	/**
	* An object that represents a bulk job.
	* e.g.
	* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
	*/
	interface SparkBulkJob {
		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getId() : string;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getActualCount() : number;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getCompleted() : Date;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getCreated() : Date;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getData() : Object;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getDoneCount() : number;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getErrorCount() : number;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getEstimatedCount() : number;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getModuleShortCode() : string;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getPlayerQuery() : Object;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getScheduledTime() : Date;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getScript() : string;

		/**
		* An object that represents a bulk job.
		* e.g.
		* var bulkJob = Spark.getBulkJobScheduler().listBulkJobs(null)[0];
		*/
		getStarted() : Date;
	}
	/**
	* Provides access to a HTTP client object.
	* e.g.
	* var httpSender = Spark.getHttp(\"http://somehost\");
	*/
	interface SparkHttp {
		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		setBasicAuth(username: string, password: string) : SparkHttp;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		setHeaders(headers: Object) : SparkHttp;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		get() : SparkHttpResponse;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		postForm(form: Object) : SparkHttpResponse;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		postXml(form: XMLObject) : SparkHttpResponse;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		postJson(form: Object) : SparkHttpResponse;

		/**
		* Provides access to a HTTP client object.
		* e.g.
		* var httpSender = Spark.getHttp(\"http://somehost\");
		*/
		postString(data: string) : SparkHttpResponse;
	}
	/**
	* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
	* e.g.
	* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
	*/
	interface SparkLeaderboardPartition {
		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getDescription() : string;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getName() : string;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getShortCode() : string;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntryCount() : number;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntryCountForIdentifier(identifier: string) : number;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntries() : SparkLeaderboardCursor;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntries(count: number, offset: number) : SparkLeaderboardCursor;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		isPartitioned() : boolean;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		isPartition() : boolean;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		drop() : void;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getPartitions() : [SparkLeaderboardPartition];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		archive() : void;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		isArchived() : boolean;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		drop(deleteRunningTotalData: boolean) : void;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntriesForItentifier(identifier: string, customIdFilter: Object) : SparkLeaderboardEntry[];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntriesFromPlayer(playerId: string, count: number) : SparkLeaderboardCursor;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getEntriesFromPlayerForCustomId(playerId: string, count: number, customIdFilter: Object) : SparkLeaderboardCursor;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getIdFields() : [string];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getScoreFields() : [string];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		deleteAllEntries(identifier: string, deleteRunningTotals: boolean) : [string];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		deleteEntriesForCustomId(identifier: string, deleteRunningTotals: boolean, customIdFilter: Object) : [string];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		deleteEntry(identifier: string, deleteRunningTotals: boolean) : [string];

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getPropertySet() : Object;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		getRankForScore(score: Object) : number;

		/**
		* Represents a single partition of a leaderboard. A partition is also a SparkLeaderboard and can be used wherever a SparkLeaderboard is used.
		* e.g.
		* var partition = Spark.getLeaderboards().getLeaderboard(shortCode).getPartitions()[0];
		*/
		rebuildLeaderboard(awardAchievements: boolean) : void;
	}
	/**
	* Represents the response form the HTTP call.
	* e.g.
	* var headers = response.getHeaders();
	*/
	interface SparkHttpResponse {
		/**
		* Represents the response form the HTTP call.
		* e.g.
		* var headers = response.getHeaders();
		*/
		getHeaders() : Object;

		/**
		* Represents the response form the HTTP call.
		* e.g.
		* var headers = response.getHeaders();
		*/
		getResponseCode() : number;

		/**
		* Represents the response form the HTTP call.
		* e.g.
		* var headers = response.getHeaders();
		*/
		getResponseString() : string;

		/**
		* Represents the response form the HTTP call.
		* e.g.
		* var headers = response.getHeaders();
		*/
		getResponseXml() : Object;

		/**
		* Represents the response form the HTTP call.
		* e.g.
		* var headers = response.getHeaders();
		*/
		getResponseJson() : Object;
	}
	/**
	* Provides access uploaded files along with downloadables
	*/
	interface SparkFiles {
		/**
		* Provides access uploaded files along with downloadables
		*/
		deleteUploadedFile(uploadId: string) : boolean;

		/**
		* Provides access uploaded files along with downloadables
		*/
		uploadedXml(uploadId: string) : SparkXmlReader;

		/**
		* Provides access uploaded files along with downloadables
		*/
		uploadedJson(uploadId: string) : Object;

		/**
		* Provides access uploaded files along with downloadables
		*/
		downloadableXml(shortCode: string) : SparkXmlReader;

		/**
		* Provides access uploaded files along with downloadables
		*/
		downloadableJson(shortCode: string) : Object;
	}
	/**
	* Provides read only access to an Xml document in gamesparks storage.
	* e.g.
	* var myXmlReader = Spark.uploadedXml(\"7359237762da4245add41e44bc994cdd\");
	* or
	* var myXmlReader = Spark.downloadableXml(\"SHORTCODE\");
	*/
	interface SparkXmlReader {
		/**
		* Provides read only access to an Xml document in gamesparks storage.
		* e.g.
		* var myXmlReader = Spark.uploadedXml(\"7359237762da4245add41e44bc994cdd\");
		* or
		* var myXmlReader = Spark.downloadableXml(\"SHORTCODE\");
		*/
		registerCallback(path: string, startCallback: Function) : void;

		/**
		* Provides read only access to an Xml document in gamesparks storage.
		* e.g.
		* var myXmlReader = Spark.uploadedXml(\"7359237762da4245add41e44bc994cdd\");
		* or
		* var myXmlReader = Spark.downloadableXml(\"SHORTCODE\");
		*/
		process() : void;

		/**
		* Provides read only access to an Xml document in gamesparks storage.
		* e.g.
		* var myXmlReader = Spark.uploadedXml(\"7359237762da4245add41e44bc994cdd\");
		* or
		* var myXmlReader = Spark.downloadableXml(\"SHORTCODE\");
		*/
		getElement() : Object;

		/**
		* Provides read only access to an Xml document in gamesparks storage.
		* e.g.
		* var myXmlReader = Spark.uploadedXml(\"7359237762da4245add41e44bc994cdd\");
		* or
		* var myXmlReader = Spark.downloadableXml(\"SHORTCODE\");
		*/
		getXml() : Object;
	}
	/**
	* Provides read only access to a mongo collection.
	* e.g.
	* var myMetaCollection = Spark.metaCollection(\'metatest\');
	*/
	interface SparkMongoCollectionReadOnly {
		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		count() : number;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		count(query: Object) : number;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		distinct(key: string) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		distinct(key: string, query: Object) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		dropIndex(keys: Object) : void;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		dropIndexByName(name: string) : void;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		ensureIndex(keys: Object) : void;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		ensureIndex(keys: Object, optionsIN: Object) : void;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		find() : SparkMongoCursor;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		find(query: Object) : SparkMongoCursor;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		find(query: Object, fields: Object) : SparkMongoCursor;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		findOne() : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		findOne(query: Object) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		findOne(query: Object, fields: Object) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		findOne(query: Object, fields: Object, orderBy: Object) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		aggregate(firstOp: Object, additionalOps: [Object]) : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		getIndexInfo() : Object;

		/**
		* Provides read only access to a mongo collection.
		* e.g.
		* var myMetaCollection = Spark.metaCollection(\'metatest\');
		*/
		getLastError() : Object;
	}
	/**
	* Provides access to the properties for the current game.
	* var properties = Spark.getProperties();
	*/
	interface SparkProperties {
		/**
		* Provides access to the properties for the current game.
		* var properties = Spark.getProperties();
		*/
		getProperty(propertyShortCode: string) : Object;

		/**
		* Provides access to the properties for the current game.
		* var properties = Spark.getProperties();
		*/
		getPropertySet(propertySetShortCode: string) : Object;
	}
	/**
	* Provides read write only access to a mongo collection.
	* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
	* e.g.
	* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
	*/
	interface SparkMongoCollectionReadWrite {
		/**
		* Get a document which is versioned, and safe for concurrent access.
		* Safe as long as only getVersionedDocument() and saveVersionedDocument() are used. Uses 'Optimistic Concurrency'.
		* e.g.
		* var myDocument = Spark.runtimeCollection(\'metatest\').getVersionedDocument({"$oid" : "1234567890"});
		*/
		getVersionedDocument(query: Object) : Object;

		/**
		* Save a document which is versioned, and safe for concurrent access, returns whether the document was saved.
		* The document will be saved if there was no conflicting access to the document. If saving fails you must re-get
		* the document with getVersionedDocument(), reapply the changes and resave. Side effects should only be caused
		* after a successful call.
		* Safe as long as only getVersionedDocument() and saveVersionedDocument() are used. Uses 'Optimistic Concurrency'.
		* e.g.
		* var success = Spark.runtimeCollection(\'metatest\').getVersionedDocument({"$oid" : "1234567890"});
		*/
		saveVersionedDocument(versionedDocument: Object) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		count() : number;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		count(query: Object) : number;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		distinct(key: string) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		distinct(key: string, query: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		dropIndex(keys: Object) : void;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		dropIndexByName(name: string) : void;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		ensureIndex(keys: Object) : void;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		ensureIndex(keys: Object, optionsIN: Object) : void;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		find() : SparkMongoCursor;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		find(query: Object) : SparkMongoCursor;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		find(query: Object, fields: Object) : SparkMongoCursor;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findOne() : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findOne(query: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findOne(query: Object, fields: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findOne(query: Object, fields: Object, orderBy: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findAndModify(query: Object, update: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findAndModify(query: Object, sort: Object, update: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findAndModify(query: Object, fields: Object, sort: Object, remove: boolean, update: Object, returnNew: boolean, upsert: boolean) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		findAndRemove(query: Object) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		insert(documents: [Object]) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		aggregate(firstOp: Object, additionalOps: [Object]) : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		applyChanges(existingDocument: Object, newDocument: Object) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		getIndexInfo() : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		getLastError() : Object;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		save(document: Object) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		remove(query: Object) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		drop() : void;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		update(query: Object, update: Object) : boolean;

		/**
		* Modifies an existing document or documents in a collection. The method can modify specific fields of existing
		* document or documents or replace an existing document entirely, depending on the update parameter.
		* By default, the update() method updates a single document. If the multi option is set to true, the method
		* updates all documents that match the query criteria.
		*
		* Params
		*
		* query - (document) The selection criteria for the update. Use the same query selectors as used in the
		* find() method
		*
		* update - (document) The modifications to apply.
		*
		* upsert - (boolean) if set to true, creates a new document when no document matches the query criteria. The
		* default value is false, which does not insert a new document when no match is found
		*
		* multi - multi (boolean) Optional. If set to true, updates multiple documents that meet the query criteria.
		* If set to false, updates one document. The default value is false. For additional information
		* e.g.
		* var success = myRuntimeCollection.update({"field" : "value"}, {"field" : "value1"}, false, false);
		*/
		update(query: Object, update: Object, upsert: boolean, multi: boolean) : boolean;

		/**
		* Provides read write only access to a mongo collection.
		* All methods defined in SparkMongoCollectionReadOnly are available in this object along with those listed below.
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		updateMulti(query: Object, update: Object) : boolean;
	}
	/**
	* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
	* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
	* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
	* For example, to get an array of the 1000-1100th elements of a cursor, use
	* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
	* e.g.
	* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
	*/
	interface SparkMongoCursor {
		/** Takes a lazy iterator to database results, does all the queries, and returns and array of them. So if the
		 * cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly
		 * there will be a ten-million element array in memory. Before converting to an array, make sure that there
		 * are a reasonable number of results using skip() and limit().
		 */
		toArray() : [Object];
		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		limit(count: number) : SparkMongoCursor;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		skip(count: number) : SparkMongoCursor;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		size() : number;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		count() : number;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		sort(orderBy: Object) : SparkMongoCursor;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		hasNext() : boolean;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		next() : Object;

		/**
		* An iterator over database results. Doing a find() query on a collection returns a SparkMongoCursor thus:
		* var cursor = collection.find( query ); if( cursor.hasNext() ) {var obj = cursor.next();}
		* Warning: Calling toArray() on a SparkMongoCursor will irrevocably turn it into an array. This means that, if the cursor was iterating over ten million results (which it was lazily fetching from the database), suddenly there will be a ten-million element array in memory. Before converting to an array, make sure that there are a reasonable number of results using skip() and limit().
		* For example, to get an array of the 1000-1100th elements of a cursor, use
		* var obj = collection.find( query ).skip( 1000 ).limit( 100 ).toArray();
		* e.g.
		* var myMetaCollection = Spark.runtimeCollection(\'metatest\');
		*/
		curr() : Object;
	}
	/**
	* Provides access to an instance of a team
	* e.g.
	* var team = Spark.getTeams().getTeam(myTeamId);
	*/
	interface SparkTeam {
		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getOwnerId() : string;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getTeamId() : string;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getTeamType() : string;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getMemberIds() : [string];

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		setOwnerId(playerId: string) : boolean;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		addMembers(playerIds: [string]) : void;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		removeMembers(playerIds: [string]) : void;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		drop() : boolean;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		listChatMessages(count: number, offset: number) : [ChatMessage];

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getChatMessage(chatMessageId: string) : Object;

		/**
		* Provides access to an instance of a team
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		deleteChatMessage(chatMessageId: string) : boolean;
	}
	/**
	* Provides the ability to send emails via SendGrid.
	* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
	* e.g.
	* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
	*/
	interface SendGrid {
		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		addTo(email: string, name: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		send() : string;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setFrom(email: string, name: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setReplyTo(email: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setBcc(bcc: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setSubject(subject: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setText(text: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		setHtml(html: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		addUploaded(uploadId: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		addDownloadable(shortCode: string) : SendGrid;

		/**
		* Provides the ability to send emails via SendGrid.
		* You need to have already set up a SendGrid account, when acessing send grid via gamesparks you need to provide your sendgrid username & password
		* e.g.
		* var mySendGrid = Spark.sendGrid(\"userName\", \"password\");
		*/
		addHeader(key: string, value: string) : SendGrid;
	}
	/**
	* Provides access to the bulk scheduler.
	* var bulkScheduler = Spark.getBulkScheduler();
	*/
	interface SparkBulkScheduler {
		/**
		* Provides access to the bulk scheduler.
		* var bulkScheduler = Spark.getBulkScheduler();
		*/
		submitJobModule(playerQuery: Object, module: string, data: Object, delaySeconds: number) : string;

		/**
		* Provides access to the bulk scheduler.
		* var bulkScheduler = Spark.getBulkScheduler();
		*/
		submitJobScript(playerQuery: Object, script: string, data: Object, delaySeconds: number) : string;

		/**
		* Provides access to the bulk scheduler.
		* var bulkScheduler = Spark.getBulkScheduler();
		*/
		cancelJob(jobId: string) : boolean;

		/**
		* Provides access to the bulk scheduler.
		* var bulkScheduler = Spark.getBulkScheduler();
		*/
		listBulkJobs(jobIds: [string]) : SparkBulkJob[];
	}
	/**
	* Contains configuration information for the game
	*/
	interface SparkConfig {
		/**
		* Contains configuration information for the game
		*/
		getStage() : string;

		/**
		* Contains configuration information for the game
		*/
		getApiKey() : string;

		/**
		* Contains configuration information for the game
		*/
		getVirtualGoods() : Object;

		/**
		* Contains configuration information for the game
		*/
		getVirtualGood(shortCode: string) : SparkVirtualGood;

		/**
		* Contains configuration information for the game
		*/
		getAchievements() : Object;

		/**
		* Contains configuration information for the game
		*/
		getAchievement(shortCode: string) : SparkAchievement;

		/**
		* Contains configuration information for the game
		*/
		getSegments() : Object;

		/**
		* Contains configuration information for the game
		*/
		getSegment(shortCode: string) : SparkSegmentType;

		/**
		* Contains configuration information for the game
		*/
		getTeams() : Object;

		/**
		* Contains configuration information for the game
		*/
		getTeam(shortCode: string) : SparkTeamType;

		/**
		* Contains configuration information for the game
		*/
		getChallenges() : Object;

		/**
		* Contains configuration information for the game
		*/
		getChallenge(shortCode: string) : SparkChallengeType;

		/**
		* Contains configuration information for the game
		*/
		getDownloadable(shortCode: string) : SparkDownloadable;

		/**
		* Contains configuration information for the game
		*/
		getDownloadables() : [SparkDownloadable];
	}
	/**
	* Provides access to the platform\'s multiplayer capabilities.
	* e.g.
	* var multiplayer = Spark.getMultiplayer();
	*/
	interface SparkMultiplayer {
		/**
		* Provides access to the platform\'s multiplayer capabilities.
		* e.g.
		* var multiplayer = Spark.getMultiplayer();
		*/
		createMatch(players: [SparkPlayer]) : string;

		/**
		* Provides access to the platform\'s multiplayer capabilities.
		* e.g.
		* var multiplayer = Spark.getMultiplayer();
		*/
		createMatchById(playerIds: [string]) : string;

		/**
		* Provides access to the platform\'s multiplayer capabilities.
		* e.g.
		* var multiplayer = Spark.getMultiplayer();
		*/
		createMatchWithMatchId(matchId: string, players: [SparkPlayer]) : string;

		/**
		* Provides access to the platform\'s multiplayer capabilities.
		* e.g.
		* var multiplayer = Spark.getMultiplayer();
		*/
		createMatchByIdWithMatchId(matchId: string, playerIds: [string]) : string;

		/**
		* Provides access to the platform\'s multiplayer capabilities.
		* e.g.
		* var multiplayer = Spark.getMultiplayer();
		*/
		loadMatch(matchId: string) : SparkMatch;
	}
	/**
	* Provides access to teams for the current game.
	* e.g.
	* var team = Spark.getTeams().getTeam(myTeamId);
	*/
	interface SparkTeams {
		/**
		* Provides access to teams for the current game.
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getTeam(teamId: string) : SparkTeam;

		/**
		* Provides access to teams for the current game.
		* e.g.
		* var team = Spark.getTeams().getTeam(myTeamId);
		*/
		getTeamByOwnerIdAndTeamType(ownerId: string, teamType: string) : [SparkTeam];
	}
	/**
	* Contains configuration information for the achievement
	* The methods in this class respect the segments of the current player when being executed
	*/
	interface SparkAchievement {
		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getName() : string;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getDescription() : string;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency1Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency2Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency3Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency4Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency5Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency6Award() : number;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getPropertySet() : Object;

		/**
		* Contains configuration information for the achievement
		* The methods in this class respect the segments of the current player when being executed
		*/
		getVirtualGoodAward() : SparkVirtualGood;
	}
	/**
	* Contains configuration information for the challenges
	* The methods in this class respect the segments of the current player when being executed
	*/
	interface SparkChallengeType {
		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		getName() : string;

		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		getDescription() : string;

		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		isTurnBased() : boolean;

		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		getAttemptConsumers() : string;

		/**
		* Contains configuration information for the challenges
		* The methods in this class respect the segments of the current player when being executed
		*/
		isGlobal() : boolean;
	}
	/**
	* Provides access to a match\'s details.
	* e.g.
	* var match = Spark.getMultiplayer().loadMatch(matchId);
	*/
	interface SparkMatch {
		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		getId() : string;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		getParticipants() : [SparkParticipant];

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		getServer() : SparkRealtimeServer;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		addPlayers(players: [SparkPlayer]) : void;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		addPlayersById(playerIds: [string]) : void;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		removePlayers(players: [SparkPlayer]) : void;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		removePlayersById(playerIds: [string]) : void;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		enableRealtime() : void;

		/**
		* Provides access to a match\'s details.
		* e.g.
		* var match = Spark.getMultiplayer().loadMatch(matchId);
		*/
		isRealtimeEnabled() : boolean;
	}
	/**
	* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
	*/
	interface SparkMessage {
		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setSendViaSocket(value: boolean) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setSendAsPush(value: boolean) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setSupressPushOnSocketSend(value: boolean) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setIncludeInPushCount(value: boolean) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setExpireAfterHours(hours: number) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setDeviceTypes(deviceTypes: [string]) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setMessageData(data: Object) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		setPlayerIds(playerIds: [string]) : SparkMessage;

		/**
		* Provides the ability to send a ScriptMessage and provide the configuration in code rather than from within the portal
		*/
		send() : void;
	}
	/**
	* Utility to schedule execution of a module in the future
	* validity All Scripts
	* example
	* var theScheduler = Spark.getScheduler();
	*/
	interface SparkScheduler {
		/**
		* Utility to schedule execution of a module in the future
		* validity All Scripts
		* example
		* var theScheduler = Spark.getScheduler();
		*/
		inSeconds(shortCode: string, delaySeconds: number, data: Object) : boolean;

		/**
		* Utility to schedule execution of a module in the future
		* validity All Scripts
		* example
		* var theScheduler = Spark.getScheduler();
		*/
		inSeconds(shortCode: string, delaySeconds: number, data: Object, key: string) : boolean;

		/**
		* Utility to schedule execution of a module in the future
		* validity All Scripts
		* example
		* var theScheduler = Spark.getScheduler();
		*/
		cancel(key: string) : void;
	}
	/**
	* Contains configuration information for the segment
	*/
	interface SparkSegmentType {
		/**
		* Contains configuration information for the segment
		*/
		getName() : string;

		/**
		* Contains configuration information for the segment
		*/
		getDescription() : string;

		/**
		* Contains configuration information for the segment
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the segment
		*/
		getValues() : [SparkSegmentValue];
	}
	/**
	* Contains configuration information for the segment value
	*/
	interface SparkSegmentValue {
		/**
		* Contains configuration information for the segment value
		*/
		getName() : string;

		/**
		* Contains configuration information for the segment value
		*/
		getDescription() : string;

		/**
		* Contains configuration information for the segment value
		*/
		getShortCode() : string;
	}
	/**
	* Contains configuration information for the teams
	* The methods in this class respect the segments of the current player when being executed
	*/
	interface SparkTeamType {
		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getName() : string;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getSocial() : boolean;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getExtendedSocial() : boolean;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getMaxMembers() : number;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getMaxMembershipPerUser() : number;

		/**
		* Contains configuration information for the teams
		* The methods in this class respect the segments of the current player when being executed
		*/
		getMaxOwnershipPerUser() : number;
	}
	/**
	* Contains configuration information for the virtual good
	* The methods in this class respect the segments of the current player when being executed
	*/
	interface SparkVirtualGood {
		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getName() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getDescription() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency1Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency2Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency3Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency4Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency5Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getCurrency6Cost() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getGooglePlayProductId() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getIosAppStoreProductId() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getWP8StoreProductId() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getW8StoreProductId() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getAmazonStoreProductId() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getType() : string;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getTags() : [string];

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getMaxQuantity() : number;

		/**
		* Contains configuration information for the virtual good
		* The methods in this class respect the segments of the current player when being executed
		*/
		getPropertySet() : Object;
	}
	/**
	* Contains configuration information for the downloadable
	*/
	interface SparkDownloadable {
		/**
		* Contains configuration information for the downloadable
		*/
		getShortCode() : string;

		/**
		* Contains configuration information for the downloadable
		*/
		getSize() : number;

		/**
		* Contains configuration information for the downloadable
		*/
		getLastModified() : Date;

		/**
		* Contains configuration information for the downloadable
		*/
		getUrl() : string;
	}
	/**
	* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
	* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
	* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
	* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
	* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
	* e.g.
	* var theCache = Spark.getCache();
	*/
	interface SparkCache {
		/**
		* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
		* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
		* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
		* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
		* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
		* e.g.
		* var theCache = Spark.getCache();
		*/
		put(key: string, object: Object) : void;

		/**
		* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
		* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
		* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
		* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
		* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
		* e.g.
		* var theCache = Spark.getCache();
		*/
		get(key: string) : Object;

		/**
		* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
		* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
		* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
		* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
		* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
		* e.g.
		* var theCache = Spark.getCache();
		*/
		remove(key: string) : void;

		/**
		* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
		* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
		* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
		* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
		* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
		* e.g.
		* var theCache = Spark.getCache();
		*/
		removeAll() : void;

		/**
		* Provides the ability to cache javascript objects. This includes complex objects with functions. Any javascript object can be cached. This allows you to create objects of a particular structure from your JSON data in mongo that can speed up access.
		* This differs slighty from storing data in mongo as the data is stored in memory and expired on a LRU basis. This means access time is significantly faster for these in memory objects
		* Cached objects are backed by mongo, so if an item is expired, when you try to access it again it will be reloaded.
		* There is a limited amount of memory available on servers, so this should be used for few, shared configuration type objects
		* Using this for player data or having a large amount of objects could slow down you application as the store / reload process is more expensive than a mongo find for JSON data
		* e.g.
		* var theCache = Spark.getCache();
		*/
		removeAll(pattern: string) : void;
	}
	/**
	* Provides the details of a participant in a match
	* e.g.
	* var participant = Spark.getMultiplayer().loadMatch(matchId).getParticipants[0];
	*/
	interface SparkParticipant {
		/**
		* Provides the details of a participant in a match
		* e.g.
		* var participant = Spark.getMultiplayer().loadMatch(matchId).getParticipants[0];
		*/
		getPlayer() : SparkPlayer;

		/**
		* Provides the details of a participant in a match
		* e.g.
		* var participant = Spark.getMultiplayer().loadMatch(matchId).getParticipants[0];
		*/
		getPeerId() : number;

		/**
		* Provides the details of a participant in a match
		* e.g.
		* var participant = Spark.getMultiplayer().loadMatch(matchId).getParticipants[0];
		*/
		getAccessToken() : string;
	}
	/**
	* Provides the details of the realtime server on which a match will be played out
	* e.g.
	* var server = Spark.getMultiplayer().loadMatch(matchId).getServer();
	*/
	interface SparkRealtimeServer {
		/**
		* Provides the details of the realtime server on which a match will be played out
		* e.g.
		* var server = Spark.getMultiplayer().loadMatch(matchId).getServer();
		*/
		getHost() : string;

		/**
		* Provides the details of the realtime server on which a match will be played out
		* e.g.
		* var server = Spark.getMultiplayer().loadMatch(matchId).getServer();
		*/
		getPort() : number;
	}
	/**
	* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
	* var operation = Spark.getLeaderboards().union(lb1, lb2);
	*/
	interface SparkLeaderboardOperations {
		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		union(rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		union(rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		intersection(rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		intersection(rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		difference(rhs: SparkLeaderboard) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		difference(rhs: SparkLeaderboardOperations) : SparkLeaderboardOperations;

		/**
		* A comparison operation on the owners (players in a player-based leaderboard, teams in a team-based leaderboard) of entries within leaderboards.
		* var operation = Spark.getLeaderboards().union(lb1, lb2);
		*/
		evaluate() : [string];
	}

	class XMLObject extends Object {

	}

	class ChatMessage extends Object {

	}
}

declare var Spark: GameSparks.Spark;
