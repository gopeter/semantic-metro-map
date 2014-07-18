var SMM = function() {
  this.map = 'frankfurt.svg'; 
  this.ownMap = null;
  this.start = null;
  this.end = null;
  this.calculationDone = false;
  this.init();
};

SMM.prototype = {

  init: function() {
  
    this.loadMap();
  
    // event handler
    $(document).hammer();
    $(document).on('tap', '#Nodes g', $.proxy(this.clickNode, this));
    $(document).on('tap', '#calculate', $.proxy(this.calculate, this));    
    $(document).on('tap', '#reset', $.proxy(this.reset, this));    
    $(document).on('change', 'select', $.proxy(this.changeMap, this));            
      
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
  
  removeSpecialChars: function(str) {
    return str.replace(/[^\w]/gi, ''); 
  },  
  
  loadMap: function(file) {
  
    var map;
  
    if (file) {
      map = file;      
    } else {
      map = 'maps/' + this.map;
    }
  
    $.get(map, null, function(data) {
      var el = $('svg', data);
      var svg = document.adoptNode(el[0]);
      $('#map').html(svg);
    }, 'xml');  
    
  },  
  
  getLengthOfSVGElement: function(el) {
    var l;
  
    /* metro maps are described with paths, lines and circles only */
    if (el.tagName == 'path') {
    
      l = el.getTotalLength();
      
    } else if (el.tagName == 'line') {
    
      var b = el.getBBox();      
      if (b.height == 0) {
        l = b.width;
      } else {
        // Pythagorean theorem
        l = Math.sqrt(Math.pow(b.width, 2) + Math.pow(b.height, 2));
      }
      
    } else if (el.tagName == 'circle') {
    
      var r = $(el).attr('r');
      l = r * 2 * Math.PI;
      
    }
    
    return l;
  },
  
  animateElement: function(animateElements, j, t, s) {
  
    var self = this;
    var el = '#' + $(animateElements[j]).attr('id');
    var distance = 7;
    
    setTimeout(function() {
      
      var length = self.getLengthOfSVGElement($(el)[0]);
      var f = (length / 2) / distance;    
    
      Snap.animate(0,distance, function( value ) {        
        s.select(el).attr({'stroke-dasharray': '4,' + value, 'stroke-dashoffset': (f * value) * 0.75});
      }, t);
         
    }, j * t);            
    
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
    
    if (val == 'own') {
    
      var map = prompt("Insert URL to your SVG file", "");
      this.ownMap = map;
      this.loadMap(map);
      $('#legend').hide();
      
    } else {
      
      this.map = val + '.svg';
      this.ownMap = null;      
      this.loadMap();
      $('#legend').show();      
      
    }
    
    this.reset();
  },
  
  reset: function() {
  
    this.start = null;
    this.end = null;  

    var s = Snap('svg');    
    
    $('#Nodes circle').each(function() {   
      if (lunar.hasClass($(this)[0], 'active')) {
        lunar.removeClass($(this)[0], 'active');          
      }
      
      $(this).css({
        'stroke-dasharray':'0,0',
        'stroke-dashoffset':0
      });
    });
  
    $('#Edges line').each(function() {   
      $(this).css({
        'stroke-dasharray':'0,0',
        'stroke-dashoffset':0
      });
    });    
    
    $('#start').hide().find('span').text('');       
    $('#end').hide().find('span').text('');           
    $('#calculate').hide();
    $('#reset').hide();    
    
    $('#timetable').find('ol').empty();
    $('#timetable').find('strong span').empty();     
    $('#timetable').hide();
    
    this.calculationDone = false;    
            
  },
  
  calculate: function() {
  
    var self = this;
    var $spinner = $('.spinner');
  
    if (this.start && this.end && !this.calculationDone) {
    
      var map = (self.ownMap) ? self.ownMap : self.map;
    
      $.ajax({
        url: '/',
        type: 'post',
        data: {
          map: map,
          start: self.start,
          end: self.end
        },  
        dataType: 'json',
        beforeSend: function() {
          $spinner.addClass('show');
        },
        success: function(res) {
        
          setTimeout(function() {
            $spinner.removeClass('show')
          }, 500);
        
          var path = res.path;
          var details = res.details;

          var description = [];        
          var total_time = 0;          
          var nodes = [];
          var edges = [];          
        
          // get active nodes as objects
          $.each(path, function(i, obj) {
            var node = $('#Node' + self.removeSpecialChars(obj)).find('circle').attr({'id':'Circle' + obj})[0];
            nodes.push(node);
          });
        
          // get active edges as objects
          $.each(details, function(i, obj) {
            
            // append string that describes the route form point X to Y
            var str = 'Go from ' + obj.edges[0] + ' to ' + obj.edges[1] + ' with Line ' + obj.meta[1]['line'] + ' <br /><span>' + obj.meta[1]['duration'] + ' ' + self.minuteString(obj.meta[1]['duration']) + '</span>';            
            description.push(str);                
            
            // calculate the total travel time
            total_time += parseInt(obj.meta[1]['duration']);
            
            // create string that matches the ID of the edge between two stops (e.g. 'AB2') to add active class
            // sort nodes alphabetically because edges are described this way (e.g. 'AB2' and not 'BA2')
            var nodes = self.sortArray([obj.edges[0], obj.edges[1]]);         
            var edge = nodes.join('') + obj.meta[1]['line'];
            
            edges.push($('#Edge' + self.removeSpecialChars(edge))[0]);                 
            
          });
          
          // create array of nodes and edges to animate them in the correct order
          var animateElements = []
          for (var i = 0; i < path.length; i++) {          
            animateElements.push(nodes[i]);  
            
            if (i < path.length - 1) {
              animateElements.push(edges[i]);
            }
          }
          
          // animate elements in turn
          var s = Snap('svg');
          var t = 500;
          for (var j = 0; j < animateElements.length; j++) {
            self.animateElement(animateElements, j, t, s);
          }
          
          // fill timetable
          $('#timetable').show();
          $.each(description, function(i, obj) {
            $('#timetable').find('ol').append('<li>' + obj + '</li>');
          });
          $('#timetable').find('strong span').text(total_time + ' ' + self.minuteString(total_time));
          
          self.calculationDone = true;
          
        }, error: function() {
          alert('Route not possible');
          self.reset();
        }
        
      }); 
    } else if (this.start && this.end && this.calculationDone) {
      return false;
    }
    
  }
  
};

var smm = new SMM();