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

	console.log('Connecting');
	var db = yield mongodb.MongoClient.connect(url, {promiseLibrary: rsvp.Promise});

	console.log('Make collection');
	yield db.dropCollection(col).catch(function () {});
	var test = yield db.createCollection(col);

	console.log('Make indexes');
	test.createIndex({hash: 1, ts: 1});
	test.createIndex({hash: 1, count: 1});
	test.createIndex({expires: 1}, {expireAfterSeconds: 0});

	var hash = '123';
	var ts = Math.trunc(Date.now()/1000);

	console.log('Make updates');
	var promises = new Array(20)
			.join(',')
			.split(',')
			.map(function () {

				return test.findOneAndUpdate(
					{hash: hash, ts: ts},
					{
						$set: {expires: new Date(Date.now() + 60 * 1000)},
						$inc: {count: 1}
					},
					{upsert: true}
				);
			});

	console.time('update');
	yield promises;
	console.timeEnd('update');

	var docs = yield test.find({}, {_id: 0}).toArray();
	console.log(docs);

	process.exit();
})
	.catch(function (err) {

		console.error(err);
		process.exit();
	});