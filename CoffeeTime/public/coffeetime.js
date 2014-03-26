var CoffeeTime = function($dom){
	this.$dom = $dom;
	this.turn = 0;
	this._initialize();
};

var _ = CoffeeTime.prototype;

_._initialize = function() {
	this._getTurnValue();
	this._showMenuPage();
};

_._showMenuPage = function() {
	var that = this;
	var $dom2 = $($("#MenuPage").render({}));

	this.$dom.empty();
	$dom2.appendTo(this.$dom);

	$dom2.find('.emp').click(function(){
		that._renderEmpList('emp');
	});
	$dom2.find('.dept').click(function(){
		that._renderDeptList('dept');
	});
	$dom2.find('.matching').click(function(){
		that._renderMatchingList(that.turn,'matching');
	});	
	$dom2.find('.gomatching').click(function(){
		that._matchingEmp('gomatching');
	});
};

_._matchingEmp = function(url) {
	var that = this;

	$.get('/get_empnum', function(num){
		var $dom = $($("#MatchingPage").render({
			turn: that.turn+1
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);
		// for back button
		that._push(url);

		var matching = new Matching(num, that.turn);
	});
};

_._renderEmpList = function(url) {
	var that = this;

	$.get('/read_emp', function(data){
		console.log(data);
		var $dom = $($("#TmplEmpList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._bindDelEmpEvent($dom, url);
		// for back button
		that._push(url);

		$dom.find('.goempcreate').click(function() {
			that._renderEmpCreate('goempcreate');
		});
	});
};

_._bindDelEmpEvent = function($dom, url) {
	var that = this;
	for(var i = 1; i < $dom.find('table')[0].tBodies[0].childElementCount+1; i++){
		$(that.$dom.find('table tr:nth-child('+i+')')).find('button').click(function() {
			var that_that = this;
			var conf = confirm('Do you really want to delete the employee?');
			if (conf == true){
				$.post('/delete_emp', {				
					empno: this.id
				}, function(data){
					if(data){alert('Delete Failed');}
					else{
						$(that_that).parent().parent().hide();
						that._replace(url);
					}
				});
			}
		});
	}
};

_._renderEmpCreate = function(url) {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplEmpCreate").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._bindClickOnEmpCreate($dom);
		// for back button
		that._push(url);
	});
};

_._bindClickOnEmpCreate = function($dom) {
	var that = this;

	$dom.find('.empcreate').click(function(){
		$.post('/create_emp', {
			firstname: $dom.find('.empfirstname').val(),
			lastname: $dom.find('.emplastname').val(),
			deptno: ($dom.find('.empdeptno')[0].selectedIndex) + 1
		}, function(data){
			if(data){alert('Create Failed');}
			else{
				that._showMenuPage();
				// for back button
				that._push('/');
			}
		});
	});
};

_._renderDeptList = function(url) {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplDeptList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);
		// for back button
		that._push(url);
		$dom.find('.godeptcreate').click(function() {
			that._renderDeptCreate('godeptcreate');
		});
	});
};

_._renderDeptCreate = function(url) {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplDeptCreate").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);
		// for back button
		that._push(url);
		that._bindClickOnDeptCreate($dom);
	});
};

_._bindClickOnDeptCreate = function($dom) {
	var that = this;

	$dom.find('.deptcreate').click(function(){
		$.post('/create_dept', {
			deptname: $dom.find('.deptdeptname').val()
		}, function(data){
			if(data){alert('Create Failed');}
			else{
				that._showMenuPage();
				// for back button
				that._push('/');
			}
		});
	});
};

_._renderMatchingList = function(turn, url) {
	var that = this;

	$.post('/read_matching', {matchingno: turn}, function(data){
		var $dom = $($("#TmplMatchingList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._renderMatchingListLink(url);

		// for back button
		that._push(url+'?matchingno='+turn);
	});
};

_._renderMatchingListLink = function(url) {
	var that = this;

	var div = document.createElement('div');
	$(div).attr('class', 'matchinglistlink').append('<ul></ul>').appendTo(that.$dom);

	for(var i = 1; i < this.turn+1; i++){
		var links = document.createElement('li');
		links.id = "link-"+i;
		$(links).html(i);
		$(links).click(function(){
			that._renderMatchingList($(this).index()+1, url);
		});
		$(that.$dom.find('.matchinglistlink ul')).append(links);
	}
};

_._getTurnValue = function() {
	var that = this;
	$.get('get_turn', function(data){if(data != null) that.turn = data;});
};

_._push = function (url) {
	var data = {html: this.$dom[0].innerHTML};
	history.pushState(data, '', url);
}

_._replace = function (url) {
	var data = {html: this.$dom[0].innerHTML};
	history.replaceState(data, '', url);
}