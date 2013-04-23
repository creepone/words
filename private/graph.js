var _ = require('underscore'),
	async = require('async'),
	neo4j = require('neo4j-js'),
	graph;

_.extend(exports, {
	/*
		Inserts the given set of parsed sentences into the graph (database).
	*/
	insertSentences: function(sentences, callback) {
		
		async.series([
			ensureGraph, 
			_.partial(createUniqueSentences, sentences)
		], 
		function (err, results) {
			if (err) callback(err);

			var sentenceNodes = results[1];
			console.log(sentenceNodes);
			callback(null, {});
		});

	}
});


function ensureGraph(callback) {
	if (graph)
		return callback();

	var url = (process.env.NEO4J_URL || 'http://localhost:7474') + '/db/data/';

	neo4j.connect(url, function (err, result) {
		if (err) return callback(err);
		graph = result;

		// todo: make sure all the indices exist at this point

		callback();
	});
}

function createUniqueSentences(sentences, callback) {

	var queryBatch = graph.createBatch(),
		createBatch = graph.createBatch(),
		indexBatch = graph.createBatch(),
		nodes = [];

	async.map(sentences, query, queryDone);
	queryBatch.run();

	function query(s, callback) {
		var luceneQuery = 'sentence:' + JSON.stringify(s.sentence) + ' AND language:' + JSON.stringify(s.language);
		var cypherQuery = 'START n=node:sentences(' + JSON.stringify(luceneQuery) + ') RETURN n';

		graph.query(queryBatch, cypherQuery, function (err, result) {
			if (err) callback(err);
			callback(null, result[0]);
		});
	}

	function queryDone(err, results) {
		if (err) callback(err);

		nodes = results;
		var toCreate = [];

		// create those sentence nodes we couldn't find
		_.map(sentences, function (s, index) {
			if (!results[index])
				toCreate.push({
					data: { sentence: s.sentence, language: s.language },
					index: index
				});
		});

		async.map(toCreate, create, createDone);
		createBatch.run();
	}

	function create(entry, callback) {
		graph.createNode(createBatch, entry.data, function (err, result) {
			if (err) callback(err);

			nodes[entry.index] = result;
			callback(null, { data: entry.data, node: result });
		});
	}

	function createDone(err, results) {
		if (err) return callback(err);

		async.map(results, index, indexDone);
		indexBatch.run();
	}

	function index(n, callback) {
		n.node.index(indexBatch, "sentences", n.data, callback);
	}

	function indexDone(err, results) {
		if (err) return callback(err);

		callback(null, nodes);
	}
}