var express = require('express');
var orm = require('orm');
var async = require('async');
var app  = express();
var request;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));

app.use(orm.express("mysql://root:knowre@localhost:3306/matching", {
	define: function (db, models, next) {
		models.emp = db.define("emp", {
			empno		: Number,
			firstname	: String,
			lastname	: String,
			deptno		: Number,
			quit		: Number
		}, {
			id 		: 'empno'
		});
		next();
	}
}));

app.use(orm.express("mysql://root:knowre@localhost:3306/matching" ,{
	define: function (db, models, next) {
		models.dept = db.define("dept", {
			deptno		: Number,
			deptname	: String
		}, {
			id 		: 'deptno'
		});			

		next();
	}
}));

app.use(orm.express("mysql://root:knowre@localhost:3306/matching" ,{
	define: function (db, models, next) {
		models.matching = db.define("matching", {
			id 		: Number,
			matchingno	: Number,
			emp1_no	: Number,
			emp2_no	: Number,
		}, {
			id 		: 'id'
		});
		next();
	}
}));

app.listen(7777);

app.get('/', function(req, res) {
	res.sendfile('index.html');
});

app.get('/emp', function(req, res) {
	res.sendfile('index.html');
});

app.get('/goempcreate', function(req, res) {
	res.sendfile('index.html');
});

app.get('/dept', function(req, res) {
	res.sendfile('index.html');
});

app.get('/godeptcreate', function(req, res) {
	res.sendfile('index.html');
});

app.get('/matching', function(req, res) {
	var matchingno = req.query.matchingno;
	if(matchingno === undefined){
		res.sendfile('index.html');
	}
	else{
		if( !isNaN(matchingno) ) {
			if( matchingno == parseInt(matchingno) ) {
				res.sendfile('index.html');
			}
			else {res.send(404, 'Not Found');}
		}
		else {res.send(404, 'Not Found');}
	}
});

app.get('/gomatching', function(req, res) {
	res.sendfile('index.html');
});

app.get('/notfound', function(req, res) {
	res.send(404, 'Not Found');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////	For Control Tables			//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/create_emp', function(req, res) {
	req.models.emp.create([
		{firstname: req.body.firstname,
		lastname: req.body.lastname,
		deptno: req.body.deptno,
		quit: 0}],
		function(error){
			res.json(error || false);
		});
});

app.get('/read_emp', function(req, res) {
	request = req;
	var data2;

	req.models.emp.find({quit: 0}, function(error, data) {
		async.series(
			[
				function(callback) {
					async.mapSeries(data, finddeptno, function(err, results){
						data2 = results;
						callback(null, "");
					});
				},
				function(callback) {
					res.json(data2);
					callback(null, "");
				}
			],
			function(error, results) {
			}
		);
	});
});

var finddeptno = function(v, doneCallback){
	async.series([
		function(callback){
			request.models.dept.find({deptno: v.deptno}, function(error, data){
				callback(null, data[0].deptname);
			});
		}
	],
	function(error, results) {
		v.deptname = results[0];
		delete v.deptno;
		return doneCallback(null, v);
	});
};

app.post('/delete_emp', function(req, res) {
	req.models.emp.get(req.body.empno, function(error, data){
		data.save({quit: 1}, function(error){
			res.json(error || false);
		});
	});
});

app.post('/create_dept', function(req, res) {
	req.models.dept.create([
		{deptname: req.body.deptname}], 
		function(error){
			res.json(error || false);
		});
});

app.get('/read_dept', function(req, res) {
	req.models.dept.find({}, function(error, data) {
		res.json(data);
	});
});

app.post('/delete_dept', function(req, res) {
	req.models.dept.get(req.body.deptno, function(error, data){
		data.remove(function(error){
			res.json(error || false);
		});
	});
});

app.post('/create_matching', function(req, res) {
	//console.log(req.body.query);
	req.models.matching.create(
		req.body.query,
		function(error){
			res.json(error || false);
		}
	);
});

app.post('/read_matching', function(req, res) {
	request = req;
	var data2;

	req.models.matching.find({matchingno: req.body.matchingno}, function(err,data) {
		async.series(
			[
				function(callback) {
					async.mapSeries(data, findempinfo, function(err, results){
						data2 = results;
						callback(null, "");
					});
				},
				function(callback) {
					res.json(data2);
					callback(null, "");
				}
			],
			function(error, results) {
			}
		);
	});
});

var findempinfo = function(v, doneCallback){
	async.series([
		function(callback){
			if(v.emp1_no != -1){
				request.models.emp.find({empno: v.emp1_no}, function(error, emp1){
					/*
						req.models.dept.find({deptno: emp1[0].deptno}, function(error,dept1){
							v.emp1_dn = dept1[0].deptname;
						});
					*/	
					callback(null, emp1[0].firstname, emp1[0].lastname);
				});
			}
			else{
				callback(null, null);
			}
		},
		function(callback){
			if(v.emp2_no != -1){
				request.models.emp.find({empno: v.emp2_no}, function(error, emp2){
					/*
						req.models.dept.find({deptno: emp2[0].deptno}, function(error,dept2){
							v.emp2_dn = dept2[0].deptname;
						});
					*/					
					callback(null, emp2[0].firstname, emp2[0].lastname);
				});
			}
			else{
				callback(null, null);
			}			
		}
	],
	function(error, results) {
		if(results[0 ] != null){
			v.emp1_fn = results[0][0];
			v.emp1_ln = results[0][1];
		}
		if(results[1] != null){
			v.emp2_fn = results[1][0];
			v.emp2_ln = results[1][1];
		}
		delete v.id;
		return doneCallback(null, v);
	});
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////	To Assist Calculation			//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/get_empnum', function(req, res) {
	req.models.emp.count({quit: 0}, function(error, count) {
		res.json(count);
	});
});

app.get('/get_emplist', function(req, res) {
	req.models.emp.find({quit: 0}, function(erorr,data) {
		res.json(
			data.map( function(v) {
				return v.empno;
			})
		);
	});
});

app.get('/get_deptlist', function(req, res) {
	req.models.dept.find({}, function(erorr,data) {
		res.json(
			data.map( function(v) {
				return v.deptno;
			})
		);
	});
});

app.post('/get_emplist_withdept', function(req, res) {
	req.models.emp.find({deptno: req.body.deptno, quit: 0}, function(erorr,data) {
		res.json(
			data.map( function(v) {
				return v.empno;
			})
		);
	});
});

app.get('/get_turn', function(req, res) {
	req.models.matching.aggregate({}).max("matchingno").get( function(error, max) {
		res.json(max);
	});
});

app.get('/get_matchinglist', function(req, res) {
	request = req;
	var data2;

	req.models.matching.find({}, function(err,data) {
		async.series(
			[
				function(callback) {
					async.mapSeries(data, findempquit, function(err, results){
						data2 = results;
						callback(null, "");
					});
				},
				function(callback) {
					res.json(data2);
					callback(null, "");
				}
			],
			function(error, results) {
			}
		);
	});
});

var findempquit = function(v, doneCallback){
	async.series([
		function(callback){
			if(v.emp1_no != -1){
				request.models.emp.find({empno: v.emp1_no}, function(error, emp1){
					callback(null, emp1[0].quit);
				});
			}
			else{
				callback(null, -1);
			}			
		},
		function(callback){
			if(v.emp2_no != -1){
				request.models.emp.find({empno: v.emp2_no}, function(error, emp2){
					callback(null, emp2[0].quit);
				});
			}
			else{
				callback(null, -1);
			}
		}
	],
	function(error, results) {
		v.emp1_quit = results[0];
		v.emp2_quit = results[1];
		return doneCallback(null, v);
	});
};