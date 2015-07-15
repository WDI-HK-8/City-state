
$(document).ready(function (){
  var row = '<div class="row"></div>'
  var cell = '<div class="col-xs-1 per_cell" data-col="" data-row=""></div>';
  var x;
  var y;
  var z;

  //----------initialize grid------------

  //initialize twelve rows first
  for (y = 0; y < 12; y++){
    $('#map_grid').append(row);
  }
  //initialize twelve elements per row
 	$('#map_grid').children().each(function(index, element){
    for(x = 0; x < 12; x++){
      $(element).append(cell);
    }  
	});

  //initialize properties of each grid cell (USE CLASS CONSTRUCTOR)
  $('.per_cell').each(function(index, element){
    this.pos = [index%12, $(element).parent().index()]; // [x,y] coords
    this.owner = ['player 1', 'player 2', 'neutral']; //territory owner
    this.garrison = 0;//initial garrison number;
  });

  //Initialize movement range with move_range function
  $('.per_cell').each(function(){
    var mvrange = move_range(this.pos); 
    this.mvrange = mvrange;
  });

  //---------output xy and range---------
  //provides cell indexing on hover
  $('.per_cell').hover(function(){
    var click_xy = this.pos;
    $('#test').html(
      'map cell selected: ' 
      + click_xy 
      + '<br> up range: '
      + this.mvrange[0]
      + '<br> down range: '
      + this.mvrange[1]
      + '<br> left range: '
      + this.mvrange[2]
      + '<br> right range: '
      + this.mvrange[3]
      );
  });


  //---------functions------------
  //output adjacent range
  function move_range(data_position){
    var left = [data_position[0]-1, data_position[1]];
    var right = [data_position[0]+1, data_position[1]];
    var up = [data_position[0], data_position[1]-1];
    var down = [data_position[0], data_position[1]+1];
    // console.log(left);
    return [up, down, left, right];
  }

});