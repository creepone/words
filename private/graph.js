var _ = require('underscore'),
	async = require('async'),
	neo4j = require('neo4j-js'),
	graph;

_.extend(exports, {
	/*
		Inserts the given set of parsed sentences into the graph (database).
	*/
	insertSentences: function(sentences, callback) {

		var o = {
			sentences: sentences,
			words: _.flatten(
				sentences.map(function (s) { 
					return (s.words || []).map(function (w) { 
						return _.extend(w, { sentence: s }); 
					})
				})
			)
		};

		async.series([
			ensureGraph,
			_.partial(createUniqueSentences, o),
			_.partial(connectSentences, o),
			_.partial(cleanupUsages, o),
			_.partial(createUniqueWords, o),
			_.partial(createUsages, o)
		], 
		function (err) {
			if (err) return callback(err);
			console.log(o);
			callback(null, {});
		});

	}
});


function ensureGraph(callback) {
	if (graph)
		return callback(null);

	var url = (process.env.NEO4J_URL || 'http://localhost:7474') + '/db/data/';

	neo4j.connect(url, function (err, result) {
		if (err) return callback(err);
		graph = result;

		ensureIndexes(function (err) {
			if (err) return callback(err);
			callback(null);
		});
	});
}

function ensureIndexes(callback) {

	var indexes = ["usages", "words", "sentences"],
		indexBatch;

	graph.listNodeIndexes(function (err, result) {
		if (err) return callback(err);

		var toCreate = indexes.filter(function (index) {
			return !(index in result);
		});

		indexBatch = graph.createBatch();
		async.map(toCreate, createIndex, callback);
		indexBatch.run();
	});

	function createIndex(name, callback) {
		graph.createNodeIndex(indexBatch, name, callback);
	}
}

function createUniqueSentences(o, callback) {

	var queryBatch = graph.createBatch(),
		createBatch = graph.createBatch(),
		indexBatch = graph.createBatch();

	async.map(o.sentences, query, queryDone);
	queryBatch.run();

	function query(sentence, callback) {
		var luceneQuery = 'sentence:' + JSON.stringify(sentence.sentence) + 
			' AND language:' + JSON.stringify(sentence.language);

		var cypherQuery = 'START n=node:sentences(' + JSON.stringify(luceneQuery) + ') RETURN n';

		graph.query(queryBatch, cypherQuery, function (err, result) {
			if (err) return callback(err);
			callback(null, result[0] && result[0].n);
		});
	}

	function queryDone(err, results) {
		if (err) return callback(err);

		o.sentences.nodes = results;
		var toCreate = [];

		// create those sentence nodes we couldn't find
		o.sentences.forEach(function (s, index) {
			if (!o.sentences.nodes[index])
				toCreate.push({
					data: _.pick(s, "sentence", "language"),
					index: index
				});
		});

		async.map(toCreate, create, createDone);
		createBatch.run();
	}

	function create(entry, callback) {
		graph.createNode(createBatch, entry.data, function (err, result) {
			if (err) return callback(err);

			o.sentences.nodes[entry.index] = result;
			callback(null, { data: entry.data, node: result });
		});
	}

	function createDone(err, results) {
		if (err) return callback(err);

		async.map(results, function (result, callback) {
			result.node.index(indexBatch, "sentences", result.data, callback);
		}, callback);

		indexBatch.run();
	}
}

function connectSentences(o, callback) {
	var nodes = o.sentences.nodes;

	var cypherQuery = "START ";	
	cypherQuery += nodes.map(function (n, i) { return "n" + i + " = node(" + n.id + ")" }).join(",");
	cypherQuery += " CREATE UNIQUE ";

	var range = _.range(nodes.length), 
		connections = [];

	_.map(range, function(i) {
		_.map(range, function (j) {
			if (i < j) {
				connections.push("n" + i + "-[:TRANSLATES]-n" + j);
			}
		})
	})

	cypherQuery += connections.join(",");

	graph.query(cypherQuery, callback);
}

function cleanupUsages(o, callback) {
	var nodes = o.sentences.nodes,
		queryBatch = graph.createBatch();

	async.map(nodes, query, callback);
	queryBatch.run();

	function query(node, callback) {
		var cypherQuery = [
			"START sentence=node(" + node.id +") ",
			"MATCH sentence<-[u:USED_IN]-usage-[b:BASE]->word ",
			"DELETE u,b,usage"
		].join("");

		graph.query(queryBatch, cypherQuery, callback);
	}
}

function createUniqueWords(o, callback) {

	var queryBatch = graph.createBatch(),
		createBatch = graph.createBatch(),
		indexBatch = graph.createBatch();

	async.map(o.words, query, queryDone);
	queryBatch.run();

	function query(word, callback) {
		var luceneQuery = 'word:' + JSON.stringify(word.baseForm) + 
			' AND language:' + JSON.stringify(word.sentence.language);

		var cypherQuery = 'START n=node:words(' + JSON.stringify(luceneQuery) + ') RETURN n';

		graph.query(queryBatch, cypherQuery, function (err, result) {
			if (err) return callback(err);
			callback(null, result[0] && result[0].n);
		});
	}

	function queryDone(err, results) {
		if (err) return callback(err);

		o.words.nodes = results;
		var toCreate = [];

		// create those word nodes we couldn't find
		o.words.forEach(function (w, index) {
			if (!o.words.nodes[index])
				toCreate.push({
					data: { language: w.sentence.language, word: w.baseForm },
					index: index
				});
		});

		async.map(toCreate, create, createDone);
		createBatch.run();
	}

	function create(entry, callback) {
		graph.createNode(createBatch, entry.data, function (err, result) {
			if (err) return callback(err);

			o.words.nodes[entry.index] = result;
			callback(null, { data: entry.data, node: result });
		});
	}

	function createDone(err, results) {
		if (err) return callback(err);

		async.map(results, function (result, callback) {
			result.node.index(indexBatch, "words", result.data, callback);
		}, callback);

		indexBatch.run();
	}
}

function createUsages(o, callback) {
	var queryBatch = graph.createBatch(),
		indexBatch = graph.createBatch();

	var words = o.words.map(function (word, index) {
		var sentenceIndex = o.sentences.indexOf(word.sentence);
		return {
			word: word,
			wordId: o.words.nodes[index].id,
			sentenceId: o.sentences.nodes[sentenceIndex].id
		};
	});

	async.map(words, create, createDone);
	queryBatch.run();

	function create(word, callback) {
		var cypherQuery = [
			"START sentence = node(" + word.sentenceId + "),",
			"word = node(" + word.wordId + ") ",
			"CREATE sentence<-[:USED_IN]-(u {",
			"text: {text}, language: {language}, occurences: {occurences}",
			"})-[:BASE]->word ",
			"RETURN u"
		].join("");

		var params = {
			text: word.word.text,
			language: word.word.sentence.language,
			occurences: JSON.stringify(word.word.occurences)
		};

		graph.query(queryBatch, cypherQuery, params, function (err, results) {
			if (err) return callback(err);
			callback(null, { data: _.pick(params, "text", "language"), node: results[0].u });
		});
	}

	function createDone(err, results) {
		if (err) return callback(err);

		async.map(results, function (result, callback) {
			result.node.index(indexBatch, "usages", result.data, callback);
		}, callback);

		indexBatch.run();
	}
}