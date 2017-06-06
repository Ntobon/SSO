var fs = require('fs');
var NodeRSA = require('node-rsa');
var key = new NodeRSA();

key.generateKeyPair(2048);

var publicKey = key.exportKey('public');
fs.writeFile("./public.key", publicKey, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("The public.key file was saved.");
	}
});

var privateKey = key.exportKey('private');
fs.writeFile("./private.key", privateKey, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("The private.key file was saved.  Please put it in a safe place.");
	}
});
