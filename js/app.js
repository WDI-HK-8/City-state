
$(document).ready(function (){
  var row = '<div class="row"></div>'
  var cell = '<div class="col-xs-1 province" data-col="" data-row=""></div>';
  var water_cells = [
    [11,0],[11,1],[11,10],[11,11],
    [10,0],[10,1],[10,8],[10,9],[10,10],[10,11],
    [9,6],[9,7],[9,8],[9,9],[9,10],[9,11],[9,12],
    [8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],
    [7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],
    [6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],
    [5,2],[5,3],[5,7],[5,8],[5,9],[5,10],[5,11],
    [4,9],[4,10],[4,11],
    [3,9],[3,10],[3,11],
    [2,7],[2,8],[2,9],[2,10],[2,11],
    [1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[1,11],
    [0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11] //85 water cells
  ];
  var phase_counter=0;
  var x;
  var y;
  var z;
  var player1={};
  var player2={};
  var neutral={};
  var total_start_troops;

  grid_init();
  mvrange_map();
  hover_status();
  roll_setup();
  //----------initialize grid------------
  function grid_init(){
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
    $('.province').each(function(index, element){
      this.pos = [index%12, $(element).parent().index()]; // [x,y] coords
      this.owner = ['player 1', 'player 2', 'neutral']; //territory owner
      this.garrison = 0;//initial garrison number;
    });


    //initialize roll button for setup phase

    $('#roll_btn').click(function(){
      one_diceroll(); //sets .roll property
      show_winner(); //compares .roll property to lead, change text 
    });

    //initialize phase button for entering a new phase
    $('#phase_btn').click(function(){
      recruit_setup();
      $(this).hide();
    });


    $('#cancel_btn, #roll_btn, #phase_btn, #confirm_btn').hide();
    $('#setup_ind').css('color','#fbabab');
  }


  //---------map-related------------

  //Initialize movement range with move_range function
  function mvrange_map(){
    $('.province').each(function(){
      var mvrange = move_range(this.pos); 
      this.mvrange = mvrange;
    });
  }

  //provides province info on hover
  function hover_status(){
    $('.province').hover(function(){
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
        + '<br> troops garrison: '
        + this.garrison
        );
    });
  }

  //output adjacent range
  function move_range(data_position){
    var left = [data_position[0]-1, data_position[1]];
    var right = [data_position[0]+1, data_position[1]];
    var up = [data_position[0], data_position[1]-1];
    var down = [data_position[0], data_position[1]+1];
    // console.log(left);
    return [up, down, left, right];
  }

  //---------troop-related------------
  function recruit_setup(){
    player1.recruits = 10;
    player2.recruits = 15;
    neutral.recruits = 20;
    $('#phase_log p').html('player1 recruits: '+ player1.recruits +
                           '<br>player2 recruits: '+ player2.recruits +
                           '<br>neutral recruits' + neutral.recruits);
    add_troops();
  }
  function add_troops(){
    //adds troop to cell on click this. should run AFTER recruit_setup has run.
    $('.province').click(function(){
      if(player1.recruits > 0){
        this.garrison++;
        player1.recruits--; 
        console.log(this.garrison, player1.recruits);
      }
      else if(player1.recruits <= 0){
        alert('You have no more recruits. Should have enforced that ten-child law...');
      }
    });
  }


  //---------dice-roll-calculation------------
  
  //a random dice roll
  function one_diceroll(){
    player1.roll = Math.ceil(Math.random()*6); //adds diceroll to property firstRoll
    player2.roll = Math.ceil(Math.random()*6);
  }

  //determine winner of roll
  function show_winner(){
    if(player1.roll > player2.roll){
      player1.lead = true;
      player2.lead = false;
      $('#roll_btn').hide();
      $('#phase_log p').text('player1 starts');
      $('#phase_btn').show().text('Just give me my troops already');
    }
    else if(player1.roll < player2.roll){
      player1.lead = false;
      player2.lead = true;
      $('#roll_btn').hide();
      $('#phase_log p').text('player2 starts');
      $('#phase_btn').show().text('Place your troops');
    }
    else if(player1.roll === player2.roll){
      player1.lead = 'tie';
      player2.lead = 'tie';
      $('#phase_log em').text('you both rolled the same numbers, roll again!');
    }
    $('#phase_log em').html('player1 roll: ' + player1.roll + '<br>player2 roll: ' + player2.roll +'<br>');
  }

  //initial setup dice roll of game
  function roll_setup(){ 
    $('#phase_log p').text('You must roll to see who goes first');
    $('#roll_btn').text('See who goes first');
    $('#roll_btn').show();
    
    //activate province event click with a counter of 2 for player recruits and another 2 for neutral recruits
    //switch turns until the all recruits are zero
  }


  //---------player-turn management------------

  //phase handler 
  function next_phase(){
  }

  function attack(){
  }

  function fortify(){
  }
});
