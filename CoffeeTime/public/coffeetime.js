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
		that._renderEmpList();
	});
	$dom2.find('.dept').click(function(){
		that._renderDeptList();
	});
	$dom2.find('.matching').click(function(){
		that._renderMatchingList(that.turn);
	});	
	$dom2.find('.gomatching').click(function(){
		that._matchingEmp();
	});
};

_._matchingEmp = function() {
	var that = this;

	$.get('/get_empnum', function(num){
		var $dom = $($("#MatchingPage").render({
			turn: that.turn+1
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		var matching = new Matching(num, that.turn);
	});
};

_._renderEmpList = function() {
	var that = this;

	$.get('/read_emp', function(data){
		var $dom = $($("#TmplEmpList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._bindDelEmpEvent($dom);
		$dom.find('.goempcreate').click(function() {
			that._renderEmpCreate();
		});
	});
};

_._bindDelEmpEvent = function($dom) {
	var that = this;
	for(var i = 1; i < $dom.find('table')[0].tBodies[0].childElementCount+1; i++){
		$(that.$dom.find('table tr:nth-child('+i+')')).find('button').click(function() {
			var conf = confirm('Do you really want to delete the employee?');
			if (conf == true){
				$.post('/delete_emp', {				
					empno: this.id
				}, function(data){
					if(data){alert('Delete Failed');}
					else{that._showMenuPage();}
				});
			}
		});
	}
};

_._renderEmpCreate = function() {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplEmpCreate").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._bindClickOnEmpCreate($dom);
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
			else{that._showMenuPage();}
		});
	});
};

_._renderDeptList = function() {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplDeptList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		$dom.find('.godeptcreate').click(function() {
			that._renderDeptCreate();
		});
	});
};

_._renderDeptCreate = function() {
	var that = this;

	$.get('/read_dept', function(data){
		var $dom = $($("#TmplDeptCreate").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

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
			else{that._showMenuPage();}
		});
	});
};

_._renderMatchingList = function(turn) {
	var that = this;
	console.log(turn);
	$.post('/read_matching', {matchingno: turn}, function(data){
		var $dom = $($("#TmplMatchingList").render({
			data:data
		}));

		that.$dom.empty();
		$dom.appendTo(that.$dom);

		that._renderMatchingListLink();
	});
};

_._renderMatchingListLink = function() {
	var that = this;

	var div = document.createElement('div');
	$(div).attr('class', 'matchinglistlink').append('<ul></ul>').appendTo(that.$dom);

	for(var i = 1; i < this.turn+1; i++){
		var links = document.createElement('li');
		links.id = "link-"+i;
		$(links).html(i);
		$(links).click(function(){
			that._renderMatchingList($(this).index()+1);
		});
		$(that.$dom.find('.matchinglistlink ul')).append(links);
	}
};

_._getTurnValue = function() {
	var that = this;
	$.get('get_turn', function(data){if(data != null) that.turn = data;});
};
