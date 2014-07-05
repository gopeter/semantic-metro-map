$(function() {

	// load svg map
	$.get('maps/metro.svg', null, function(data) {
		var el = $('svg', data);
		var svg = document.adoptNode(el[0]);
		$('#map').html(svg);
	}, 'xml');
	
});