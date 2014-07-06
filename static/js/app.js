var SMM = function() {
  this.map = 'frankfurt.svg'; 
  this.start = null;
  this.end = null;
  this.init();
};

SMM.prototype = {

  init: function() {
  
    this.loadMap();
  
    // event handler
    $(document).on('click', '#Nodes g', $.proxy(this.clickNode,this));
    $(document).on('click', '#calculate', $.proxy(this.calculate,this));    
    $(document).on('click', '#reset', $.proxy(this.reset,this));    
    $(document).on('change', 'select', $.proxy(this.changeMap,this));            
      
  },
  
  clickNode: function(el) {

    if (this.start == null || this.end == null) {
    
      // get grouped svg element => 'g'
      var $parent = $(el.target).parent();
      var node = $parent.find('circle')[0];
      lunar.toggleClass(node, 'activeNode');
      
      var id = $parent.attr('id');
      
      if (this.start == null) {
      
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
  
  loadMap: function() {
  
    $.get('maps/' + this.map, null, function(data) {
      var el = $('svg', data);
      var svg = document.adoptNode(el[0]);
      $('#map').html(svg);
    }, 'xml');  
    
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
      if (lunar.hasClass($(this)[0], 'activeNode')) {
        lunar.removeClass($(this)[0], 'activeNode');          
      }
    });
    
    $('#start').hide().find('span').text('');       
    $('#end').hide().find('span').text('');           
    $('#calculate').hide();
    $('#reset').hide();     
    
    return false;       
            
  },
  
  calculate: function() {
  
    var self = this;
  
    if (this.start && this.end) {
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
            lunar.addClass($('#' + obj)[0], 'resultNode');                                   
          });
        
          // add active class to used edges
          $.each(details, function(i, obj) {
          
            console.log(obj)
          
            // lunar.addClass($('#' + node)[0], 'resultNode');                        
          });
          
        }
        
      }); 
    } else {
      alert('Chose start and end point.')
    }
    
    return false;
    
  }
  
};

var smm = new SMM();