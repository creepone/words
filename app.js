var express = require('express');
	
var app = express();

app.configure(function () {
	//app.set('view engine', 'jade');
	//app.set('views', __dirname + '/views');
	
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: process.env.NEO4J_URL || 'secret' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.listen(process.env.PORT || 8081);