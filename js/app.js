var row = '<div class="row"></div>'
var cell = '<div class="col-xs-1 province" data-col="" data-row=""></div>';
var counter= 0;
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
var up,down,left,right, attacker, defender, leader, second_player, player_turn; //CURRENT PLAYER: 'LEADER' ONLY
var move_garrison, fortify_garrison;
var phase_counter=0;
var player1={};
var player2={};
var neutral={};
var player_turn;
var map_grid; //this is the basic building block of the map. (NOTE: there is a #map_grid id also)

$(document).ready(function(){

  grid_init();
  mvrange_map();
  roll_setup();
  //----------TESTING ONLY---------------
  // map_grid.click(function(){
  //   $('div[class*="-xs-"]').toggleClass();
  // })

  //splitter feature code
  $('.main').split({
    orientation: 'vertical',
    limit: 10,
    position: '50%'
  });

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
    //initialize properties of each grid cell
    map_grid = $('.province').slice(12);
    map_grid.each(function(index, element){
      this.pos = [index, $(element).parent().index()]; // [x,y] coords
      this.owner = 'nobody'; //territory owner
      this.garrison = 0;//initial garrison number;
    });
  
 
    //initialize phase button for entering a new phase
    $('#advance_btn').click(function(){
      //increments each time this button is clicked, advancing it to 'tiers' of phases. USE SIMILAR FOR MANAGING TURNS
      phase_counter++;
      
      if(phase_counter==1){//run recruit setup
        recruit_setup(); 
        $(this).hide();
      }
      else if(phase_counter==2){//run 1st fortify phase
        $('#attack_ind').toggleClass('phase_ind');
        $('#deploy_ind, #advance_btn').show();
        $('#setup_ind, #attack_btn').hide(); //hide attack btn
        map_grid.unbind();
        fortify();
      }
      else if(phase_counter==3){
        console.log('next players turn');
      }
      else if(phase_counter==4){
        //run other player's turn. Change current player.
      }

    $(this).hide();
    });

    //initialize attack button for continuing attack (ATTACK PHASE ONLY)
    $('#attack_btn').click(function(){ //"Invade another province"
      map_grid.unbind();
      if($(attacker).hasClass('attacker_color')){//toggles off attacker pathing
      toggle_adjacent(attacker);
      }
      attack();
      $(this).hide();  
    });

    //runs once from init()
    $('#turn_reminder, #deploy_ind').hide();
    $('#attack_btn, #roll_btn, #advance_btn, #confirm_btn').hide();
    $('#setup_ind').css('color','#fbabab');
  };

  //---------visuals & animation----
  function show_turn(player_turn){
    $('#turn_reminder').text('It\'s '+player_turn+' \'s Turn.').animate({ "bottom": "+=50px" }, "slow" ).fadeIn(1300, function(){
      $(this).fadeOut(1000, function(){
        $('#turn_reminder').removeAttr('style').hide();//this resets the position to initial
      });
    }).show();
  }

  function show_tooltip(msg){
    //something
  }

  //---------map-related------------

  //Initialize movement range with move_range property for all provinces.
  //unpacking the mvrange 2D array of map_grid[x] into a 1D array of [[x*,y],[x*,y],[x*,y],[x*,y]] USE $.attr
  function mvrange_map(){
    map_grid.each(function(){
      this.mvrange = move_range(this.pos); //[[x*,y],[x*,y],[x*,y],[x*,y]]
      var range = this.mvrange;
      for(i = 0; i < range.length; i++){ //[x*,y],[x*,y],[x*,y],[x*,y]

        switch (i){ //switch case for index and up,down,left,right DOM objects
          case 0:
            this.upper = range[i][0];
            break;
          case 1:
            this.downer = range[i][0];
            break;
          case 2:
            this.lefter = range[i][0];
            break;
          case 3:
            this.righter = range[i][0];
            break;
        }          
      } 
    });
  }

  //output adjacent range
  function move_range(data_position){
    var left = [data_position[0]-1, data_position[1]];
    var right = [data_position[0]+1, data_position[1]];
    var up = [data_position[0]-12, data_position[1]-1];
    var down = [data_position[0]+12, data_position[1]+1];
    var adjacent_range = [up,down,left,right];
    return adjacent_range;
  }

  //---------troop-related------------
  function recruit_setup(){

    //initialize recruit count. Add in choice for the beginning...
    player1.recruits = 4;
    player2.recruits = 4;
    neutral.recruits = 6;
    player1.recruitcounter = 0;
    player2.recruitcounter = 0;
    neutral.recruitcounter = 0;
    reupdate_log();
    show_turn(leader);
    add_troops();
  }

  function reupdate_log(){
    //re-update the game log on each cell selection... NOTE TO SELF: Refactor this later
    $('#phase_log p').html('<table><tr><th>Player1 troops:</th><th>Player2 troops:</th><th>Neutral troops:</th></tr><tr><td>'+ player1.recruits+'</td><td>'+ player2.recruits+'</td><td>'+ neutral.recruits+'</td></tr></table>');
  }

  //add_troops() handler...NOTE TO SELF: Refactor more with 'this' via fun.bind() to bind to click element
  function populate(owner,this_map,player){
    $('#recruit_sound').trigger('play');
    counter++;
    owner.recruits--; 
    owner.recruitcounter++;
    this_map.owner = player;
    this_map.garrison++;
  }

  function alt_deploy(css_arg1, css_arg2, player){
    $('#sidebar').css(css_arg1, css_arg2);
    $('#tooltip').text('It\'s time to place '+ player +'\'s troops');
  }

  //adds troop to cell on click this. should run AFTER recruit_setup has run.
  function add_troops(){ 
    $('#tooltip').text('It\'s '+ leader + '\'s turn. Select a province');
    $('#deploy_sound').trigger('play');
    $('#phase_log em').hide();
    $('#sidebar').css('background-color','rgba(17,63,99,1)'); //player1 color cue
    
    map_grid.click(function(){
             
      //player 1 deploy twice THIS CAN BE REFACTORED
      if(player1.recruits > 0 && player1.recruitcounter < 2 && this.owner!= 'neutral' && this.owner!= second_player){ 
        populate(player1,this,leader);
        //player color
        $(this).addClass('p1_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);

        //set for neutral
        if(player1.recruitcounter >= 2){ //once you deploy twice
          neutral.recruitcounter = 0; //reset the turn counter for next object you are to recruit for
          alt_deploy('background-color',"rgba(77,37,4,1)", leader);
        }
      }
      //neutral deployment deploy twice
      else if(player1.recruitcounter >= 2 && neutral.recruitcounter < 2 && this.owner!= leader && this.owner!= second_player){ 
        populate(neutral,this,'neutral');
        //player color
        $(this).addClass('neut_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);

        if(neutral.recruitcounter >= 2 && counter >= 6){
          player1.recruitcounter = 0;
          counter = 0;
          alt_deploy('background-color','rgba(17,63,99,1)',leader); //change to player1 color
          show_turn(leader);
        }
        else if(neutral.recruitcounter >= 2 && counter == 4){
          player2.recruitcounter = 0;
          alt_deploy('background-color','rgba(75,111,79,1)',second_player);
          show_turn(second_player);
        }
      }
      //player 2 deploy twice
      else if(player1.recruitcounter >= 2 && neutral.recruitcounter >= 2 && this.owner != leader && this.owner!= 'neutral'){
        populate(player2, this, second_player);

        //player color
        $(this).addClass('p2_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);
        
        if(player2.recruitcounter >= 2){
          neutral.recruitcounter = 0;
          alt_deploy('background-color','rgba(77,37,4,1)',second_player);
        }
      }
      //when player1's player2's, and neutral's recruits reach zero...
      else if(player1.recruits <= 0 && neutral.recruits <=0 && player2.recruits <=0){
        map_grid.unbind();
        $('#ready_sound').trigger('play');
        alert('All troops have been setup.');
        $('#tooltip').text("To attack, select the \'launch attack\' button");
        $('#sidebar').css('background-color','#2d2d2d');
        $('#attack_btn').text('Launch attack').show();
        $('#advance_btn').text('Skip to next phase').show(); 
        $('#attack_ind').toggleClass('phase_ind');
      }
      else{ //Clicking someone else's marked province
        $('#phase_log p').text('Someone got this tile already! Just invade it later.');
      }
      reupdate_log();
    });
  }

  //choosing attack_origin and attack_tgt
  function attack(){ //unbound map_grid before each run

    //initial message instructions
    $('#phase_log p').html('It\'s '+leader+'\'s time to attack');
    $('#tooltip').html(leader+'\'s attack. First select your attacking province.');
  
    counter = 0; //reset counter

    map_grid.hover(function(){$( this ).toggleClass( "hover_attack" ); });
    map_grid.click(function(){

      //checks if attack origin selected is owned by you and has garrison greater than 1
      if(counter < 1 && this.owner == leader && this.garrison > 1){
        attacker = this; //assigns to global attacker
        toggle_adjacent(this); //toggles attack range color
        //display in log
        $('#phase_log p').html("You have selected <span id=\"player1_roll\">"+this.owner+'\'s</span>'+ ' province:'+'<br><br>It has '+this.garrison+ ' troops garrisoned'+'<br><br>This city has no harbor to attack over water.');
        $('#tooltip').html(leader+'\'s attack. Click again to target');
        $('#attack_btn').text('Invade another province').show(); //show other invade options
        counter++;
      }
      //select attack target only if it has an adjacent color class
      else if(counter >= 1 && $(this).hasClass('adjacent_color')){ 
          counter++;
          //CHANGE LEADER TO CURRENT PLAYER
          if(this.owner == leader){
            alert('But milord/milady, that\'s your own province. Are you trying to start a civil war?');
          }
          //otherwise, paint it red, one-time target only. //EXTRA TIME: right click to get out/unbind,set of selection state...
          else{
            defender = this;
            $(this).toggleClass('adjacent_color').toggleClass('defender_color');
            $('#phase_log p').html('You are about to attack '+ defender.owner+ '\'s province<br><br> Its has '+ defender.garrison+ ' defending troops<br><br> Attack?');  

            $('#confirm_btn').text('Confirm attack').show().click(function(){
              battle(attacker, defender); 
              toggle_adjacent(attacker); 
              events_reset(attacker, defender);
              $('#attack_btn').show();
              $(this).unbind().hide();
            });
          }
      }
      //if what you click is not your own
      else if(this.owner != leader && counter < 2){
        alert('Pick your own territory to attack');
      }
      else if(this.owner == leader && this.garrison <= 1 && counter < 2){
        alert('attacking provinces must have more than one troop to launch attacks');
      }
    });
  }


  function toggle_adjacent(this_obj){//just plug "this" into the arg and it will toggle adjacent
    var adjacent_indices = [this_obj.upper, this_obj.downer, this_obj.lefter, this_obj.righter];
    $(attacker).toggleClass('attacker_color');
    for(i = 0; i < adjacent_indices.length;i++){
      $(map_grid[adjacent_indices[i]]).toggleClass('adjacent_color');
      $(map_grid[adjacent_indices[i]]).html('<span class="garrison_color">'+map_grid[adjacent_indices[i]].garrison+'</span><br>'+map_grid[adjacent_indices[i]].owner); 
      //Always revert empty cells back to empty string
      if(map_grid[adjacent_indices[i]].owner == 'nobody'){
        $(map_grid[adjacent_indices[i]]).text('');
      }
      //Below section for Fortify() only; Hence counter is set to 3.
      else if(counter >= 3){ //Undo attack adjacent highlighting
        $(map_grid[adjacent_indices[i]]).toggleClass('adjacent_color');//turn off adjacent_color class
        if(map_grid[adjacent_indices[i]].owner == leader){//turns on fortify_color for those that are leader
          $(map_grid[adjacent_indices[i]]).toggleClass('fortify_color');
        }
      }
    }
  }

  function events_reset(attacker, defender){
    //ends click selections on map or warnings
    $("map_grid, attacker, defender").unbind();
    $(defender).toggleClass('defender_color adjacent_color');//clears highlight of defender cells
  }
  function offense(attacker){ //conditions met: attacker.garrison is already greater than 1
    var attacker_rolls = [];
    var attacker_avail = attacker.garrison - 1;
    if(attacker_avail >= 3){//attacking with 3+ troops
      for(i = 0; i < 3; i++){
        attacker_rolls.push(singleman_diceroll());
      }
    }    
    else if(attacker_avail < 3){//attacking with under 3 troops
      //attacking with 2 troops
      if(attacker_avail == 2){
        for(i = 0; i < 2; i++){
          attacker_rolls.push(singleman_diceroll());
        }
      }      
      else if(attacker_avail <=1){//attacking with 1 or less troops
        for(i = 0; i < 1; i++){
          attacker_rolls.push(singleman_diceroll());
        }
      }
    }
    return attacker_rolls.sort().reverse();
  }

  function defense(defender){    //conditions met: attacker garrison is already greater than 1
    var defender_rolls = [];   
    if(defender.garrison >= 2){//defending with 2+ troops
      for(i = 0; i < 2; i++){
        defender_rolls.push(singleman_diceroll());
      }
    }    
    //defending with 1 or less troops
    else if(defender.garrison <=1){
      for(i = 0; i < 1; i++){
        defender_rolls.push(singleman_diceroll());
      }
    }
    return defender_rolls.sort().reverse(); 
  }

  //get greatest pair via one_dicerolls
  function battle(attacker, defender){
    var attacker_rolls = offense(attacker); 
    var defender_rolls = defense(defender); 
    $('#status_log').html('Attacker rolls: '+attacker_rolls+'<br> Defender rolls: '+ defender_rolls);
    //based on defender garrison, compare top corresponding attacker and defender array elements,
    //yield victor, tally garrison count 
    var battle_losses = battle_outcome(attacker_rolls, defender_rolls); //index 0 is attacker losses; index 1 is defender losses;
    attacker.garrison -= battle_losses[0];
    defender.garrison -= battle_losses[1];

    $('#phase_log p').html('Attacker has '+ attacker.garrison+ ' remaining<br> Defender has '+ defender.garrison+ ' remaining');  

    //update log of province cells upon each battle
    $(attacker).html(attacker.garrison+'<br>'+attacker.owner);
    $(defender).html(defender.garrison+'<br>'+defender.owner);
    $('#battle_effect1').trigger('play');
    //display animate battle losses per province
    if(battle_losses[0] > 0){
      $(attacker).append('<br><span class="battle_tally">-'+battle_losses[0]+'</span>');
      $('.battle_tally').hide();
      $('.battle_tally').animate({ "bottom": "+=10px" }, "slow" ).fadeIn(800,function(){
        $(this).fadeOut(1200);
      }).show();
    }
    if(battle_losses[1] > 0){
      $(defender).append('<br><span class="battle_tally">-'+battle_losses[1]+'</span>');
      $('.battle_tally').hide();
      $('.battle_tally').animate({ "bottom": "+=50px" }, "slow" ).fadeIn(800,function(){
        $(this).fadeOut(1200);//toggle off the battle_tally class
      }).show().removed;
    }
    //check if you defeated all defenders on a province, then capture it
    if(defender.garrison == 0){
      capture_province(attacker, defender);    
    } 
  }

  //take over defender cell with all but one troop if defender garrison is zero only (watch for bugs)        
  function capture_province(attacker, defender){
    defender.owner = attacker.owner; //Set new owner of province
    defender.garrison = attacker.garrison - 1;
    attacker.garrison = 1; //leave one man behind
    //toggle province's new labeling and styles, while removing old ones
    $(defender).toggleClass().toggleClass('col-xs-1 province p1_colors defender_color'); //Better way to target substring color classes???
    $(defender).html('<span class="garrison_color">'+defender.garrison+'</span><br>'+defender.owner);
    $(attacker).html('<span class="garrison_color">'+attacker.garrison+'</span><br>'+attacker.owner);
  }

  //---------dice-roll-calculation------------
  //compute winner for battle function
  function battle_outcome(attacker_rolls, defender_rolls){
    var attacker_losses = 0;
    var defender_losses = 0;
    if(defender_rolls.length >= 2){//for defender has 2 dices
      attacker_rolls.length = 2;
      defender_rolls.forEach(function(element, index){
        
        //if indexed attacker roll is less or equal to iteration of defender roll
        if(element >= attacker_rolls[index]){
          attacker_losses++;
        }
        else if(element < attacker_rolls[index]){
          defender_losses++;
        }
      });
    }
    else if(defender_rolls.length == 1){//for defender has only one dice 
      attacker_rolls.length = 1;

      if (defender_rolls[0] >= attacker_rolls[0]){//for one-on-one dice matchup, 
        attacker_losses++;
      }
      else if(defender_rolls[0] < attacker_rolls[0]){
        defender_losses++;
      }
    }
    return [attacker_losses, defender_losses];
  }

  //---------dice-roll-calculation------------
  
  //a random dice roll
  function one_diceroll(){
    player1.roll = Math.ceil(Math.random()*6); //adds diceroll to property firstRoll
    player2.roll = Math.ceil(Math.random()*6);
  }
  //single-player dice roll
  function singleman_diceroll(){
    return Math.ceil(Math.random()*6); //adds diceroll to property firstRoll
  }

  //determine winner of roll
  function show_winner(){
    $('#dice_roll_sound').trigger('play');
    if(player1.roll > player2.roll){
      $('#roll_btn').hide();
      $('#phase_log p').text('Player 1 starts!');
      $('#advance_btn').show().text('Place your troops');
      leader = 'player 1';
      second_player = 'player 2';
    }
    else if(player1.roll < player2.roll){
      $('#roll_btn').hide();
      $('#phase_log p').text('Player 2 starts!');
      $('#advance_btn').show().text('Place your troops');
      leader = 'player 2';
      second_player = 'player 1';
    }
    else if(player1.roll === player2.roll){
      $('#phase_log em').text('IT\'S A TIE! Roll again!');
    }

    $('#status_log').html('<span id="player1_roll">Player 1</span> rolled: <br><span id="player1_roll">' + player1.roll + '</span><br><span id="player2_roll">Player 2</span> rolled:<br> <span id="player2_roll">' + player2.roll +'</span><br>');
  } 

  //initial setup dice roll of game
  function roll_setup(){
    $('#phase_log p').text('Select \'Simultaneous Roll\'');
    $('#tooltip').text('Roll to see who goes first.');
    $('#roll_btn').text('Simultaneous Roll!');
    $('#roll_btn').show();
    initial_roll();
  }

  //initialize roll button for setup phase
  function initial_roll(){
    $('#roll_btn').click(function(){
      one_diceroll(); //sets .roll property
      show_winner(); //compares .roll property to lead, change text
    });
  } 

  //---------Fortification/move phase------------

  function fortify(){
    //Binds click event for your own territory that exceeds one garrison
    counter = 3; //reset counter

    $('#tooltip').text('Select one territory to fortify');
    $('#attack_ind').toggleClass('phase_ind');
    $('#fortify_ind').toggleClass('phase_ind');
    map_grid.click(function(){ //select own territory to fortify
      if(counter == 3 && this.owner == leader && this.garrison > 1){
        mover = this;
        toggle_adjacent(this);
        counter++;
      }
      else if(counter == 4){ //if fortify territory selected
        if(this.owner == leader && $(this).hasClass('fortify_color')){
          console.log('counter 4 has run');
          toggle_adjacent(mover);
          this.garrison += mover.garrison-1;
          mover.garrison = 1;
          $(this).html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner); //REFACTOR
          $(mover).html('<span class="garrison_color">'+mover.garrison+'</span><br>'+mover.owner); //REFACTOR
          map_grid.unbind();
        }
        else if(this.owner != leader){
          alert('select your own province!');
        }
      }
    });
    //cancel button to reset counter
  }

});
//------------END OF .ready()--------------