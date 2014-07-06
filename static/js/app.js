var SMM = function() {
  this.map = 'frankfurt.svg'; 
  this.start = null;
  this.end = null;
  this.calculationDone = false;
  this.init();
};

SMM.prototype = {

  init: function() {
  
    this.loadMap();
  
    // event handler
    $(document).on('click tap', '#Nodes g', $.proxy(this.clickNode,this));
    $(document).on('click', '#calculate', $.proxy(this.calculate,this));    
    $(document).on('click', '#reset', $.proxy(this.reset,this));    
    $(document).on('change', 'select', $.proxy(this.changeMap,this));            
      
  },
  
  /***************************************
  * Helpers 
  ***************************************/
  
  minuteString: function(duration) {
    return (duration == 1) ? 'minute' : 'minutes';
  },
  
  sortArray: function(arr) {
    arr.sort(function(a, b){
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });
    return arr;
  },
  
  loadMap: function() {
  
    $.get('maps/' + this.map, null, function(data) {
      var el = $('svg', data);
      var svg = document.adoptNode(el[0]);
      $('#map').html(svg);
    }, 'xml');  
    
  },  

  /***************************************
  * Events
  ***************************************/
  
  clickNode: function(el) {

    if (this.start == null || this.end == null) {
    
      // get grouped svg element => 'g'
      var $parent = $(el.target).closest('g');
      var node = $parent.find('circle')[0];
      lunar.toggleClass(node, 'active');
      
      var id = $parent.attr('id');
      
      if (this.start == id) {
        
        this.start = null;
        $('#start').hide().find('span').text('');        
        
      } else if (this.start == null) {
      
        this.start = id;
        $('#start').show().find('span').text(id.substring(4));
        
      } else {
      
        this.end = id;
        $('#end').show().find('span').text(id.substring(4));       
        
        $('#calculate').show();
        $('#reset').show();             
        
      }
      
    } 
    
  },
  
  changeMap: function(el) {
    var val = $(el.target).val();
    this.map = val + '.svg';
    this.loadMap();
    this.reset();
  },
  
  reset: function() {
  
    this.start = null;
    this.end = null;  
    
    $('#Nodes circle').each(function() {   
      if (lunar.hasClass($(this)[0], 'active')) {
        lunar.removeClass($(this)[0], 'active');          
      }
      if (lunar.hasClass($(this)[0], 'result')) {
        lunar.removeClass($(this)[0], 'result');          
      }      
    });
    
    $('#Edges line').each(function() {   
      if (lunar.hasClass($(this)[0], 'result')) {
        lunar.removeClass($(this)[0], 'result');          
      }
    });    
    
    $('#start').hide().find('span').text('');       
    $('#end').hide().find('span').text('');           
    $('#calculate').hide();
    $('#reset').hide();    
    
    $('#timetable').find('ol').empty();
    $('#timetable').find('strong span').empty();     
    $('#timetable').hide();
    
    return false;       
            
  },
  
  calculate: function() {
  
    var self = this;
  
    if (this.start && this.end && !this.calculationDone) {
      $.ajax({
        url: '/',
        type: 'post',
        data: {
          map: self.map,
          start: self.start,
          end: self.end
        },  
        dataType: 'json',
        success: function(res) {
          var path = res.path;
          var details = res.details;
        
          // add active class to used nodes
          $.each(path, function(i, obj) {
            var node = $('#' + obj).find('circle')[0];
            lunar.addClass(node, 'result');                                   
          });
        
          // create string that tells the user what line(s) he should take and calculate the total travel time
          var description = [];        
          var total_time = 0;
        
          // add active class to used edges
          $.each(details, function(i, obj) {
            
            // append string that describes the route form point X to Y
            var str = 'Go from ' + obj.edges[0].substring(4) + ' to ' + obj.edges[1].substring(4) + ' with Line ' + obj.meta[1]['line'].substring(4) + ' <br /><span>' + obj.meta[1]['duration'] + ' ' + self.minuteString(obj.meta[1]['duration']) + '</span>';            
            description.push(str);                
            
            // calculate the total travel time
            total_time += parseInt(obj.meta[1]['duration']);
            
            // create string that matches the ID of the edge between two stops (e.g. 'AB2') to add active class
            // sort nodes alphabetically because edges are described this way (e.g. 'AB2' and not 'BA2')
            var nodes = self.sortArray([obj.edges[0].substring(4), obj.edges[1].substring(4)]);         
            var edge = nodes.join('') + obj.meta[1]['line'].substring(4);
            
            lunar.addClass($('#' + edge)[0], 'result');                    
            
          });
          
          // fill timetable
          $('#timetable').show();
          $.each(description, function(i, obj) {
            $('#timetable').find('ol').append('<li>' + obj + '</li>');
          });
          $('#timetable').find('strong span').text(total_time + ' ' + self.minuteString(total_time));
          
          self.calculationDone = true;
          
        }
        
      }); 
    } else if (this.start && this.end && this.calculationDone) {
      return false;
    }
    
    return false;
    
  }
  
};

var smm = new SMM();