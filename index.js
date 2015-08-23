'use strict';
/**
	* Created by a.murin on 23/08/15.
	*/

var mongodb = require('mongodb');
var co = require('co');
var rsvp = require('rsvp');

co(function* () {

	const url = 'mongodb://localhost/test?w=1&journal=false';
	const col = 'test';

	var db = yield mongodb.MongoClient.connect(url, {promiseLibrary: rsvp.Promise});
	yield db.dropCollection(col);
	var test = yield db.createCollection(col);

	test.createIndex({hash: 1, ts: 1});
	test.createIndex({expires: 1}, {expireAfterSeconds: 0});

	var hash = '123';
	var now = Date.now();
	var ts = Math.trunc(now/1000);

	var promises = new Array(20)
		.join(',')
		.split(',')
		.map(function () {

			return test.findOneAndUpdate(
				{hash: hash, ts: ts},
				{
					$set: {expires: new Date(now + 60 * 1000)},
					$inc: {count: 1}
				},
				{upsert: true}
			);
		});

	yield promises;

	var docs = yield test.find({}, {_id: 0}).toArray();
	console.log(docs);

	process.exit();
});