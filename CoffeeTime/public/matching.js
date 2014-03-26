var Matching = function(num, turn) {
	this.num = num;
	this.m = new Array(num);
	this.h = {};
	this.hr = {};
	this.s = {};

	this.e = [];
	this.r = new Array(num+num%2);
	this.l = [];
	this.f = [];
	this.ee = [];

	this.count = 0;
	this.turn = turn;

	this._initialize();
};

var _ = Matching.prototype;

_._initialize = function() {
	var that = this;

	this._setHashValue();
	this._setMatchingArrayValue();
	this._setEmployeeArrayValue();
	this._setRoomArrayValue();
	this._setLeftRoomValue();

	$(document).find(".creatematching").click( function() {
		that._matchingPhaseOne();
	});
} ;

// matching two people who have not had a coffee time each other.
_._matchingPhaseOne = function() {
	var that = this;
	var c, index;
	var i;

	//console.log(that.h);
	//console.log(that.hr);

	for(var j = 0; j < this.num; j++){
		console.log(that.m[j]);
	}

	console.log("Matching Phase One Start");

	this.count = 0;

	while(this.e.length != 0 && this.count < 3*this.num){
		i = that.e.shift();
		c = that.l[Math.floor((Math.random()*1000000000)%(that.l.length))];

		if(that.r[2*c] == -1){
			that.r[2*c] = i;
		}
		else if(that.m[(that.r[2*c])][i] == 0){
			//console.log(that.hr[that.r[2*c]], that.hr[i], that.m[(that.r[2*c])][i]);
			that.r[2*c+1] = i;
			index = that.l.indexOf(c);
			that.l.splice(index,1);
			that.f.push(c);
		}
		else {
			that.e.push(i);
		}
		that.count++;
	}

	console.log(this.e);
	console.log(this.l);
	console.log(this.f);
	console.log(this.r);
	console.log("Matching Phase One Finish");

	this._switchingPhaseOne();
};

// switching and matching two group of two people who have not had a coffee time each other. (one person is come from unmatched people.)
_._switchingPhaseOne = function() {
	var that = this;
	var flag = true;

	console.log("Switching Phase One Start");

	while(flag){
		flag = false;
		for (var a in that.e){
			for (var b in that.l){
				for(var c in that.f){
					//console.log(a,b,c);

					if( that.m[that.r[2*that.f[c]]][that.e[a]] + that.m[that.r[2*that.l[b]]][that.r[2*that.f[c]+1]] == 0) {
						that.r[2*that.l[b]+1] = that.r[2*that.f[c]+1];
						that.r[2*that.f[c]+1] = that.e[a];
						that.f.push(that.l[b]);
						that.e.splice(a,1);
						that.l.splice(b,1);
						flag = true;
					}
					else if( that.m[that.r[2*that.f[c]]][that.r[2*that.l[b]]] + that.m[that.r[2*that.f[c]+1]][that.e[a]] == 0) {
						var temp = that.r[2*that.f[c]+1];
						that.r[2*that.f[c]+1] = that.r[2*that.l[b]];
						that.r[2*that.l[b]] = temp;
						that.r[2*that.l[b]+1] = that.e[a];
						that.f.push(that.l[b]);
						that.e.splice(a,1);
						that.l.splice(b,1);
						flag = true;
					}

					if(flag) break;
				}
				if(flag) break;
			}
			if(flag) break;
		}
		console.log(that.e);
		console.log(that.l);
		console.log(that.f);
		console.log(that.r);
	}

	console.log("Switching Phase One Finish");

	this._matchingPhaseTwo();
};

// matching two people who have had a coffee time once each other. (one person is come from unmatched people.)
_._matchingPhaseTwo = function() {
	var that = this;
	var c, index;
	var i;

	console.log("Matching Phase Two Start");

	this.count = 0;

	while(this.e.length != 0 && this.count < this.num){
		i = that.e.shift();
		c = that.l[Math.floor((Math.random()*1000000000)%(that.l.length))];

		if(that.m[(that.r[2*c])][i] == 5){
			that.r[2*c+1] = i;
			that.s[i] = c;
			that.ee.push(i);
			index = that.l.indexOf(c);
			that.l.splice(index,1);
			that.f.push(c);
		}
		else {
			that.e.push(i);
		}
		that.count++;
	}

	if(this.count !=0){
	console.log(this.e);
	console.log(this.l);
	console.log(this.f);
	console.log(this.r);
	console.log(this.ee);
	}

	console.log("Matching Phase Two Finish");
	
	this._switchingPhaseTwo();
};

// switching and matching two group of two people when the switching status is lower cost (one person is come from unmatched people.)
_._switchingPhaseTwo = function() {
	var that = this;
	var flag = true;

	console.log("Switching Phase Two Start");

	var length = this.ee.length;
	this.count = 0;

	while(flag && this.count < length){
		flag = false;
		that.count++;
		for (var a in that.ee){
			for(var b in that.ee){
				//console.log(a,b);

				if(that.m[that.r[2*that.s[that.ee[a]]]][that.r[2*that.s[that.ee[b]]]] + that.m[that.ee[a]][that.ee[b]] == 0){
					that.r[2*that.s[that.ee[a]]+1] = that.r[2*that.s[that.ee[b]]];
					that.r[2*that.s[that.ee[b]]] = that.ee[a];
					that.ee.splice(b,1);
					that.ee.splice(a,1);
					flag = true;
				}
				else if(that.m[that.r[2*that.s[that.ee[a]]]][that.r[2*that.s[that.ee[b]]]] + that.m[that.ee[a]][that.ee[b]] == 5){
					if(that.m[that.r[2*that.s[that.ee[a]]]][that.r[2*that.s[that.ee[b]]]] == 5){
					that.r[2*that.s[that.ee[a]]+1] = that.r[2*that.s[that.ee[b]]];
					that.r[2*that.s[that.ee[b]]] = that.ee[a];
					that.s[that.r[2*that.s[that.ee[b]]]] = that.s[that.ee[a]];
					that.ee.push(that.r[that.s[that.ee[b]]]);
					that.ee.splice(b,1);
					that.ee.splice(a,1);
					}
					else {
					that.r[2*that.s[that.ee[a]]+1] = that.r[2*that.s[that.ee[b]]];
					that.r[2*that.s[that.ee[b]]] = that.ee[a];
					that.ee.splice(a,1);
					}
					flag = true;
				}
				if(flag) break;
			}
			if(flag) break;
		}
		console.log(that.e);
		console.log(that.l);
		console.log(that.f);
		console.log(that.r);
		console.log(that.ee);
	}

	console.log("Switching Phase Two Finish");

	this._matchingPhaseThree();
};

// matching two people who have had a coffee time more than twice or are in same dept. (one person is come from unmatched people.)
_._matchingPhaseThree = function() {
	var that = this;
	var c, index;
	var i;

	console.log("Matching Phase Three Start");

	this.count = 0;

	while(this.e.length != 0 && this.count < this.num){
		i = that.e.shift();
		c = that.l[Math.floor((Math.random()*1000000000)%(that.l.length))];

		if(that.m[(that.r[2*c])][i] > 5){
			that.r[2*c+1] = i;
			that.s[i] = c;
			that.ee.push(i);
			index = that.l.indexOf(c);
			that.l.splice(index,1);
			that.f.push(c);
		}
		else {
			that.e.push(i);
		}
		that.count++;
	}

	if(this.count !=0){
	console.log(this.e);
	console.log(this.l);
	console.log(this.f);
	console.log(this.r);
	console.log(this.ee);
	}

	console.log("Matching Phase Three Finish");
	
	this._switchingPhaseThree();
};

// switching and matching two group of two people when the switching status is lower cost (one person is come from unmatched people.)
_._switchingPhaseThree = function() {
	var that = this;
	var flag = true;

	console.log("Switching Phase Three Start");

	var length = this.ee.length;
	this.count = 0;

	while(flag && this.count < length){
		flag = false;
		that.count++;
		for (var a in that.ee){
			for(var b in that.f){
				//console.log(a,b);

				if(that.m[that.r[2*that.s[that.ee[a]]]][that.r[2*that.f[b]]] + that.m[that.ee[a]][that.r[2*that.f[b]+1]] <= 5){
					that.r[2*that.s[that.ee[a]]+1] = that.r[2*that.f[b]+1];
					that.r[2*that.f[b]+1] = that.ee[a];
					that.ee.splice(a,1);
					flag = true;
				}
				if(flag) break;
			}
			if(flag) break;
		}
		console.log(that.e);
		console.log(that.l);
		console.log(that.f);
		console.log(that.r);
		console.log(that.ee);
	}

	console.log("Switching Phase Three Finish");

	this._saveMatchingResult();
};

_._saveMatchingResult = function() {
	var that = this;
	var query = [];

	this.turn++;

	console.log("Saving Start");
	console.log(that.r);

	for(var i = 0; i < this.num/2; i++){
		if(that.r[2*i] != -1 && that.r[2*i+1] != -1){
			query[i] = {
				matchingno: that.turn,
				emp1_no: that.hr[that.r[2*i]],
				emp2_no: that.hr[that.r[2*i+1]]
			};
		}
		else if(that.r[2*i] == -1 && that.r[2*i+1] != -1){
			query[i] = {
				matchingno: that.turn,
				emp1_no: -1,
				emp2_no: that.hr[that.r[2*i+1]]
			};
		}
		else if(that.r[2*i] != -1 && that.r[2*i+1] == -1){
			query[i] = {
				matchingno: that.turn,
				emp1_no: that.hr[that.r[2*i]],
				emp2_no: -1
			};
		}
		else if(that.r[2*i] == -1 && that.r[2*i+1] == -1){
			query[i] = {
				matchingno: that.turn,
				emp1_no: -1,
				emp2_no: -1
			};
		}
	}

	$.post('create_matching', 
		{query: query},
		function(data){
		if(data){alert('Create Failed');}
		else{
			window.coffeeTime.turn++;
			window.coffeeTime._showMenuPage();
			// for back button
			that._push('/');
		}
	});
	
	console.log("Saving Finish");

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////	Set Values  on Data Structures	//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

_._setMatchingArrayValue = function() {
	var that = this;

	for (var i = 0; i < this.num; i++) {
		that.m[i] = new Array(that.num);
	}

	for(var i = 0; i < this.num; i++){
		for(var j = 0; j < that.num; j++){
			that.m[i][j] = 0;
		}
	}

	// increase 10 if two employees are in the same department.
	$.get('/get_deptlist', function(data){
		$.each(data, function(i1, val1){
			$.post('/get_emplist_withdept',{deptno: val1}, function(data2){
				$.each(data2, function(j2, val2){
					$.each(data2, function(j3, val3){
						that.m[that.h[val2]][that.h[val3]] = 9;
					});
				});
			});
		});
	});

	// increase 5 if two employees already had a coffee time. (5 for each)
	$.get('/get_matchinglist', function(data){
		$.each(data, function(i, val){
			// check quit employees
			if(val.emp1_quit == 0 && val.emp2_quit == 0){
				that.m[that.h[val.emp1_no]][that.h[val.emp2_no]] += 5;
				that.m[that.h[val.emp2_no]][that.h[val.emp1_no]] += 5;
			}
			else{
				//console.log(val.emp1_no, val.emp2_no);
			}
		});
	});

};

_._setHashValue = function() {
	var that = this;
	$.get('/get_emplist', function(data){
		$.each(data, function(i, val){
			that.h[val] = i;
			that.hr[i] = val;
		});
	});
};

_._setEmployeeArrayValue = function() {
	var that = this;
	for (var i = 0; i < this.num; i++){
		that.e.push(i);
	}
};

_._setRoomArrayValue = function() {
	var that = this;
	for (var i = 0; i < this.num+this.num%2; i++){
		that.r[i] = -1;
	}
};

_._setLeftRoomValue = function() {
	var that = this;
	for (var i = 0; i < (this.num)/2; i++){
		that.l.push(i);
	}
};

_._push = function (url) {
	var data = {html: $("#Main")[0].innerHTML};
	history.pushState(data, '', url);
}
