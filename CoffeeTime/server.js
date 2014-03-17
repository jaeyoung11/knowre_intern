﻿var express = require('express');
var orm = require('orm');
var app  = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));

app.use(orm.express("mysql://root:knowre@localhost:3306/matching", {
	define: function (db, models, next) {
		models.emp = db.define("emp", {
			empno		: Number,
			firstname	: String,
			lastname	: String,
			deptno		: Number
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
			emp1_fn	: String,
			emp1_ln	: String,
			emp1_dn	: String,
			emp2_no	: Number,
			emp2_fn	: String,
			emp2_ln	: String,
			emp2_dn	: String
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////	For Control Tables			//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/create_emp', function(req, res) {
	req.models.emp.create([
		{firstname: req.body.firstname,
		lastname: req.body.lastname,
		deptno: req.body.deptno}], 
		function(error){
			res.json(error || false);
		});
});

app.get('/read_emp', function(req, res) {
	req.models.emp.find({}, function(error, data) {
		res.json(data);
	});
});

app.post('/delete_emp', function(req, res) {
	req.models.emp.get(req.body.empno, function(error, data){
		data.remove(function(error){
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
	var query = req.body.query;
	query.map( function(v) {
		if(v.emp1_no != -1){
			req.models.emp.find({empno: v.emp1_no}, function(erorr,emp1){
				v.emp1_fn = emp1[0].firstname;
				v.emp1_ln = emp1[0].lastname;
				req.models.dept.find({deptno: emp1[0].deptno}, function(error,dept1){
					v.emp1_dn = dept1[0].deptname;
				});
			});
		}

		if(v.emp2_no != -1){
			req.models.emp.find({empno: v.emp2_no}, function(erorr,emp2){
				v.emp2_fn = emp2[0].firstname;
				v.emp2_ln = emp2[0].lastname;
				req.models.dept.find({deptno: emp2[0].deptno}, function(error,dept2){
					v.emp2_dn = dept2[0].deptname;
				});
			});
		}
	})

	setTimeout( function() {
		req.models.matching.create(
			req.body.query,
			function(error){
				res.json(error || false);
			}
		);
	}, 1000);

});

app.post('/read_matching', function(req, res) {
	req.models.matching.find({matchingno: req.body.matchingno}, function(err,data) {
		res.json(data);
	});
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////	To Assist Calculation			//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/get_empnum', function(req, res) {
	req.models.emp.count({}, function(error, count) {
		res.json(count);
	});
});

app.get('/get_emplist', function(req, res) {
	req.models.emp.find({}, function(erorr,data) {
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
	req.models.emp.find({deptno: req.body.deptno}, function(erorr,data) {
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
	req.models.matching.find({}, function(err,data) {
		res.json(
			data.map( function(v) {
				delete emp1_fn;
				delete emp1_ln;
				delete emp1_dn;
				delete emp2_fn;
				delete emp2_ln;
				delete emp2_dn;
				return v;
			})
		);
	});
});