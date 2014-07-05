var map = 'metro.svg'; // ability to change maps dynamically

$(function() {

	// load svg map
	$.get('maps/' + map, null, function(data) {
		var el = $('svg', data);
		var svg = document.adoptNode(el[0]);
		$('#map').html(svg);
	}, 'xml');
	
	// post foobar
	$.ajax({
		url: '/',
		type: 'post',
		data: {
			map: map,
			start: 'StopC',
			end: 'StopF'
		}, 
		success: function(res) {
			console.log(res);
		}
		
	});
	
});