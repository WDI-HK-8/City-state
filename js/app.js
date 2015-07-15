$(document).ready(function (){
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
  var up,down,left,right, attackers;
  var x,y,z;
  var phase_counter=0;
  var player1={};
  var player2={};
  var neutral={};
  var player_turn;

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
    //initialize properties of each grid cell
    $('.province').each(function(index, element){
      this.pos = [index, $(element).parent().index()]; // [x,y] coords
      this.owner; //territory owner
      this.garrison = 0;//initial garrison number;
    });
<<<<<<< HEAD
 
    //initialize phase button for entering a new phase
    $('#advance_btn').click(function(){
      phase_counter++;
      //checks only sets recruit setup once, after second-time clicked
      if(phase_counter==1){//run recruit setup
        recruit_setup(); 
      }
      else if(phase_counter==2){//run to progress into the main of the game
        attack();
        phase_counter++;
      }
      else if(phase_counter==3){

      }
      $(this).hide();
    });


    $('#cancel_btn, #roll_btn, #advance_btn, #confirm_btn').hide();
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
      $('#test').html(
        'Map cell selected: ' 
        + this.pos
        + '<br> Up range: '
        + this.mvrange[0]
        + '<br> Down range: '
        + this.mvrange[1]
        + '<br> Left range: '
        + this.mvrange[2]
        + '<br> Right range: '
        + this.mvrange[3]

        + '<br> Troops garrison: '

        + this.garrison
        );
    });
  }

  //output adjacent range
  function move_range(data_position){
    var left = [data_position[0]-1, data_position[1]];
    var right = [data_position[0]+1, data_position[1]];

    var up = [data_position[0]-12, data_position[1]-1];
    var down = [data_position[0]+12, data_position[1]+1];

    return [up, down, left, right];
  }

  //---------troop-related------------
  function recruit_setup(){

    //initialize recruit count
    player1.recruits = 4;
    player2.recruits = 4;
    neutral.recruits = 8;
    player1.recruitcounter = 0;
    player2.recruitcounter = 0;
    neutral.recruitcounter = 0;
    reupdate_log();
    add_troops();
  }

  function reupdate_log(){
    //re-update the game log on each cell selection... NOTE TO SELF: Refactor this later
    $('#phase_log p').html('Player1 recruits: '+ player1.recruits +
                           '<br>Player2 recruits: '+ player2.recruits +
                           '<br>Neutral recruits: ' + neutral.recruits);
  }

  //add_troops() handler...NOTE TO SELF: Refactor more with 'this' via fun.bind() to bind to click element
  function populate(owner){
    owner.recruits--; 
    owner.recruitcounter++;
  }
  //adds troop to cell on click this. should run AFTER recruit_setup has run.
  function add_troops(){ //BUG: adds troops for player2 when neutral is adding
    // alert('Player1: Place Troops');
    $('#phase_log em').hide();
    $('#sidebar').css('background-color','rgba(17,63,99,1)'); //player1 color cue
    $('.province').click(function(){
      
      //player 1 deploy twice
      if(player1.recruits > 0 && player1.recruitcounter < 2 && this.owner!= 'neutral' && this.owner!= 'player2'){ 
        counter++; //counter to keep cycle sustainable
        populate(player1);
        this.owner = 'player1';
        this.garrison++;
        $(this).css('background-color','rgba(0,15,88,0.5)').html(this.garrison+'<br><small>'+this.owner+'</small>');

        //set for neutral
        if(player1.recruitcounter >= 2){ //once you deploy twice
          neutral.recruitcounter = 0; //reset the turn counter for next object
          $('#sidebar').css('background-color','rgba(77,37,4,1)');
        }
      }
      //player1's neutral deploy twice
      else if(player1.recruitcounter >= 2 && neutral.recruitcounter < 2 && this.owner!= 'player1' && this.owner!= 'player2'){ 
        populate(neutral);
        this.owner = 'neutral';
        this.garrison++;
        $(this).css('background-color','rgba(77,37,4,0.5)').html(this.garrison+'<br><small>'+this.owner+'</small>');
        if(neutral.recruitcounter >= 2 && counter == 4){
          player1.recruitcounter = 0;
          counter = 0;
          $('#sidebar').css('background-color','rgba(17,63,99,1)'); //change to player1 color
        }
        else if(neutral.recruitcounter >= 2 && counter == 2){
          player2.recruitcounter = 0;
          $('#sidebar').css('background-color','rgba(75,111,79,1)'); //change to player2 color
        }
      }
      //player 2 deploy twice
      else if(player1.recruitcounter >= 2 && this.owner!= 'player1' && this.owner!= 'neutral'){
        counter++;
        populate(player2);
        this.owner = 'player2';
        this.garrison++;
        $(this).css('background-color','rgba(24,79,30,0.5)').html(this.garrison+'<br><small>'+this.owner+'</small>');
        
        if(player2.recruitcounter >= 2){
          neutral.recruitcounter = 0;
          $('#sidebar').css('background-color','rgba(77,37,4,1)'); //change to neutral color
        }
      }

      //when player1's player2's, and neutral's recruits reach zero...
      else if(player1.recruits <= 0 && neutral.recruits <=0 && player2.recruits <=0){
        $('#sidebar').css('background-color','#2d2d2d');
        $('.province').unbind();
        $('#test').hide();
        $('#advance_btn').text('Start Play').show();
        alert('You are ready to begin your turn.');
      }
      //catch over clicking someone else's marked province
      else{
        $('#phase_log p').text('Someone got this tile already! Just invade it later.');
      }

      //update recruit list
      reupdate_log();
    });
  }

  //choosing attack_origin and attack_tgt
  function attack(){

    //unbind() add_troops function's click event
    counter = 0; //reset counter

    $('.province').hover(
        function(){
          $( this ).toggleClass( "active" ).css('border','orange 5px solid');
        },
        function(){
          $( this ).toggleClass( "active" ).css('border', '1px solid darkgrey');
        }
    );    
    $('.province').click(function(){
      //checks if attack origin is selected, restricted by counter, should run once only
      
      if(counter < 1 && this.owner == 'player1' && this.garrison > 1){
        attacker = this; //assigns to global variable
        //one attacker must stay behind
        var attack_origin = attacker.garrison-1; 
        counter++;
        $(this).css('border','orange 5px solid');

        //highlight range of attack
        //store (row, height) values of clicked province
        var attack_range = move_range(this.pos);
        //target adjacent provinces based on this
        up = $('.province')[attack_range[0][0]];
        down = $('.province')[attack_range[1][0]]; 
        left = $('.province')[attack_range[2][0]]; 
        right = $('.province')[attack_range[3][0]];
        $([up,down,left,right]).each(function(index, element){
          $(element).css('background-color','rgba(255,0,0,0.3)');
          $(element).html(element.garrison+'<br>'+element.owner);
        });
  
      }
      //select attack_origin, allows only one
      else if(counter == 1){ 
        //select your own cities show the adjacent provinces...
        $([up, down, left, right]).click(function(){ 
          counter++;
          //check for your own land
          if(this.owner == 'player1'){
            alert('Sir, that\'s your own province. Are you trying to start a civil war?');
          }
          //EXTRA TIME: right click to get out/unbind,set of selection state...
          //otherwise, paint it red, increase counter, one-time target only.
          else{
            var defender = this;
            $(this).css('background-color','red');
            $([up, down, left, right]).unbind('click');
            $('.province').unbind('hover');
            //initiates a button for attacking
            $('#confirm_btn').text('To battle!').show().click(function(){
              $('.province').unbind('click');
              battle(attacker, defender);
              $(this).hide();
              $('.province').unbind('click'); //clears all events from map squares
              $('.province').css('background-color','transparent'); //clears highlighted map squares
            });
            //initiates a button for skipping
            $('#cancel_btn').text('Skip Attack Phase').show().click(function(){
              alert('next phase');
              $(this).hide();
            });
          }

        });
      }
      //if what you click is not your own, and you have selected
      else if(this.owner != 'player1' && counter < 2){
        alert('Pick your own territory to attack from'+counter);
      }
      else if(this.owner == 'player1' && this.garrison <= 1 && counter < 2){
        alert('attacking provinces must have more than one troop to launch attacks');
      }
    });
  }

  function offense(attacker){
    //conditions met: attacker.garrison is already greater than 1
    var attacker_rolls = [];
    var attacker_avail = attacker.garrison - 1;
    //attacking with 3+ troops
    if(attacker_avail >= 3){
      for(i = 0; i < 3; i++){
        attacker_rolls.push(singleman_diceroll());
      }
    }
    //attacking with under 3 troops
    else if(attacker_avail < 3){
      //attacking with 2 troops
      if(attacker_avail == 2){
        for(i = 0; i < 2; i++){
          attacker_rolls.push(singleman_diceroll());
        }
      }
      //attacking with 1 or less troops
      else if(attacker_avail <=1){
        for(i = 0; i < 1; i++){
          attacker_rolls.push(singleman_diceroll());
        }
      }
    }
    return attacker_rolls.sort().reverse();
  }

  function defense(defender){
      //conditions met: attacker garrison is already greater than 1
      var defender_rolls = [];
      //defending with 2+ troops
      if(defender.garrison >= 2){
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
    var attacker_rolls = offense(attacker); //returns avail_attackers
    var defender_rolls = defense(defender);
    console.log('Attacker: '+attacker_rolls+' Defender: '+ defender_rolls);
    //based on defender garrison, compare top corresponding attacker and defender array elements,
    //yield victor, tally garrison count 
    var battle_losses = battle_outcome(attacker_rolls, defender_rolls); //index 0 is attacker losses; index 1 is defender losses;
    attacker.garrison -= battle_losses[0];
    defender.garrison -= battle_losses[1];

    console.log('attacker has '+ attacker.garrison+ ' remaining');
    console.log('defender has '+ defender.garrison+ ' remaining');
    //update log of province cells upon each battle
    $(attacker).html(attacker.garrison+'<br><small>'+attacker.owner+'</small>');
    $(defender).html(defender.garrison+'<br><small>'+defender.owner+'</small>');
  }
  //allow to keep attacking or skip

  //---------dice-roll-calculation------------
  //compute winner for battle function
  function battle_outcome(attacker_rolls, defender_rolls){
    var attacker_losses = 0;
    var defender_losses = 0;
    //for defender has 2 dices
    if(defender_rolls.length >= 2){
      //mutate attacker rolls to match 2 (don't worry, it is sorted)
      attacker_rolls.length = 2;

      defender_rolls.forEach(function(element, index){
        
        //if indexed attacker roll is less or equal to iteration of defender roll
        if(element >= attacker_rolls[index]){
          console.log('attacker loses 1');
          attacker_losses++;
        }
        else if(element < attacker_rolls[index]){
          console.log('defender loses 1');
          defender_losses++;
        }

      });
    }
    //for defender has only one dice 
    else if(defender_rolls.length == 1){
      attacker_rolls.length = 1;

      //for one-on-one dice matchup, 
      if (defender_rolls[0] >= attacker_rolls[0]){
        console.log('attacker loses 1');
        attacker_losses++;
      }
      else if(defender_rolls[0] < attacker_rolls[0]){
        console.log('defender loses 1');
        defender_losses++;
      }
    }
    // console.log('attacker_losses: '+attacker_losses+' defender_losses: '+defender_losses);
    return [attacker_losses, defender_losses];
  }

  //a random dice roll
  function one_diceroll(){
    player1.roll = Math.ceil(Math.random()*6); //adds diceroll to property firstRoll
    player2.roll = Math.ceil(Math.random()*6);
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
    if(player1.roll > player2.roll){
      player1.lead = true;
      player2.lead = false;
      $('#roll_btn').hide();
      $('#phase_log p').text('Player 1 starts!');
      $('#advance_btn').show().text('Just give me my troops already');
    }
    else if(player1.roll < player2.roll){
      player1.lead = false;
      player2.lead = true;
      $('#roll_btn').hide();
      $('#phase_log p').text('Player 2 starts!');
      $('#advance_btn').show().text('Place your troops');
    }
    else if(player1.roll === player2.roll){
      player1.lead = 'tie';
      player2.lead = 'tie';
      $('#phase_log em').text('IT\'S A TIE! Roll again!');
    }

    $('#phase_log em').html('Player1 rolled: ' + player1.roll + '<br>Player2 rolled: ' + player2.roll +'<br>');
  }

  //initial setup dice roll of game
  function roll_setup(){ 
    $('#phase_log p').text('You must roll to see who goes first');
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


  //---------player-turn management------------

  //phase handler 
  function next_phase(){

  }

  function attack(){
  }

  function fortify(){
  }

});//------------END OF .ready()--------------