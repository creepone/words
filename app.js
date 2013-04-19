var express = require('express'),
	sprite = require('node-sprite'),
	stylus = require('stylus');

var app = express(), compileStylus;

// boot up
configureSprites(function (err, compileStylus) {
	if (err)
		console.log(err);

	configureApp(compileStylus);
});


function configureApp(compileStylus) {
	app.configure(function () {
		//app.set('view engine', 'jade');
		//app.set('views', __dirname + '/views');

		app.use(stylus.middleware({ src: __dirname + '/public', compile: compileStylus }));
		
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.session({ secret: process.env.NEO4J_URL || 'secret' }));
		app.use(app.router);
		app.use(express.static(__dirname + '/public'));
	});

	app.listen(process.env.PORT || 8081);
}

function configureSprites(callback) {
	sprite.stylus({ path: './public/img', httpPath: '/img' }, function (err, helper) {
		if (err)
			console.log(err);

		callback(null, function (str, path) {
			return stylus(str)
				.set('filename', path)
				.define('sprite', helper.fn);
		});
	});
}
