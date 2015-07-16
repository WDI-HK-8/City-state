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
  var up,down,left,right, attackers, leader, second_player, player_turn;
  var x,y,z;
  var phase_counter=0;
  var player1={};
  var player2={};
  var neutral={};
  var player_turn;

  grid_init();
  mvrange_map();
  roll_setup();

  $('.main').split({
    orientation: 'vertical',
    limit: 10,
    position: '70%'
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
    $('.province').each(function(index, element){
      this.pos = [index, $(element).parent().index()]; // [x,y] coords
      this.owner = 'nobody'; //territory owner
      this.garrison = 0;//initial garrison number;
    });
 
    //initialize phase button for entering a new phase
    $('#advance_btn').click(function(){
      phase_counter++;
      // console.log(phase_counter);
      //checks only sets recruit setup once, after second-time clicked
      if(phase_counter==1){//run recruit setup
        recruit_setup(); 
        $(this).hide();
        // console.log('attack is run in phase_counter '+phase_counter);
      }
      else if(phase_counter==2){//run to progress into the main of the game
        $('.province').unbind(click);
        attack();
        // console.log('attack is run in phase_counter '+phase_counter);
      }

      else if(phase_counter==3){
        $('#attack_btn').hide();
        fortify();
      }
    });

    //initialize cancel button for moving phases
    $('#attack_btn').click(function(){
      $('.province').unbind('click');
      attack();
    });


    $('#turn_reminder').hide();
    $('#attack_btn, #roll_btn, #advance_btn, #confirm_btn').hide();
    $('#setup_ind').css('color','#fbabab');
  }

  //---------visuals & animation----
  function show_turn(player_turn){
    $('#turn_reminder').text('It\'s '+player_turn+' \'s Turn.');
    $('#turn_reminder').animate({ "bottom": "+=50px" }, "slow" ).fadeIn(1300, function(){
      $(this).fadeOut(1000, function(){
        $('#turn_reminder').removeAttr('style').hide();
      });
    }).show();
  }

  //---------map-related------------

  //Initialize movement range with move_range function
  function mvrange_map(){
    $('.province').each(function(){
      this.mvrange = move_range(this.pos); 
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
    player1.recruits = 8;
    player2.recruits = 8;
    neutral.recruits = 16;
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
  function populate(owner){
    owner.recruits--; 
    owner.recruitcounter++;
  }

  //adds troop to cell on click this. should run AFTER recruit_setup has run.
  function add_troops(){ //BUG: adds troops for player2 when neutral is adding
    $('#tooltip').text('It\'s '+ leader + '\'s turn. Select a province');
    $('#deploy_sound').trigger('play');
    $('#phase_log em').hide();
    $('#sidebar').css('background-color','rgba(17,63,99,1)'); //player1 color cue
    $('.province').click(function(){
      
      //when player1's player2's, and neutral's recruits reach zero...
      if(player1.recruits <= 0 && neutral.recruits <=0 && player2.recruits <=0){
        $('#ready_sound').trigger('play');
        alert('All troops have been setup.');
        $('#tooltip').text("To attack, select the \'launch attack\' button");
        $('#sidebar').css('background-color','#2d2d2d');
        $('.province').unbind();
        $('#attack_btn').text('Launch attack').show();//runs attack again
        $('#advance_btn').text('Skip to next phase').show(); 
      }

      //player 1 deploy twice
      else if(player1.recruits > 0 && player1.recruitcounter < 2 && this.owner!= 'neutral' && this.owner!= second_player){ 
        $('#recruit_sound').trigger('play');
        counter++; //counter to keep cycle sustainable
        populate(player1);
        this.owner = leader;
        this.garrison++;
        //player color
        $(this).addClass('p1_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);

        //set for neutral
        $('#recruit_sound').trigger('play');
        if(player1.recruitcounter >= 2){ //once you deploy twice
          neutral.recruitcounter = 0; //reset the turn counter for next object you are to recruit for
          $('#sidebar').css('background-color','rgba(77,37,4,1)');
          $('#tooltip').text('It\'s time for '+leader+' to place neutral troops');
        }
      }
      //neutral deployment deploy twice
      else if(player1.recruitcounter >= 2 && neutral.recruitcounter < 2 && this.owner!= leader && this.owner!= second_player){ 
        $('#recruit_sound').trigger('play');
        populate(neutral);
        this.owner = 'neutral';
        this.garrison++;
        //player color
        $(this).addClass('neut_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);
        
        if(neutral.recruitcounter >= 2 && counter == 4){
          $('#recruit_sound').trigger('play');
          player1.recruitcounter = 0;
          counter = 0;
          $('#sidebar').css('background-color','rgba(17,63,99,1)'); //change to player1 color
          $('#tooltip').text('It\'s time to place '+ leader +'\'s troops');
          show_turn(leader);
        }
        else if(neutral.recruitcounter >= 2 && counter == 2){
          $('#recruit_sound').trigger('play');
          player2.recruitcounter = 0;
          $('#sidebar').css('background-color','rgba(75,111,79,1)'); //change to player2 color
          $('#tooltip').text('It\'s time to place '+ second_player +'\'s troops');
          show_turn(second_player);
        }
      }
      //player 2 deploy twice
      else if(player1.recruitcounter >= 2 && this.owner!= leader && this.owner!= 'neutral'){
        $('#recruit_sound').trigger('play');
        counter++;
        populate(player2);
        this.owner = second_player;
        this.garrison++;
        //player color
        $(this).addClass('p2_colors').html('<span class="garrison_color">'+this.garrison+'</span><br>'+this.owner);
        
        if(player2.recruitcounter >= 2){
          $('#recruit_sound').trigger('play');
          neutral.recruitcounter = 0;
          $('#sidebar').css('background-color','rgba(77,37,4,1)'); //change to neutral color
          $('#tooltip').text('It\'s time to place '+second_player+' neutral troops');
        }
      }

      //Clicking someone else's marked province
      else{
        $('#phase_log p').text('Someone got this tile already! Just invade it later.');
      }
      reupdate_log();
    });
  }

  //choosing attack_origin and attack_tgt
  function attack(){
    //initial message instructions
    $('#setup_ind').hide();
    $('#invade_ind').toggleClass('invade_ind');
    $('#phase_log p').html('It\'s '+leader+'\'s time to attack');
    $('#tooltip').html(leader+'\'s attack. First select your attacking province.');
    
    // console.log('attack function called');
    counter = 0; //reset counter

    $('.province').hover(function(){
      $( this ).toggleClass( "hover_attack" );
    });

    $('.province').click(function(){

      //checks if attack origin selected is owned by you and has garrison greater than 1
      if(counter < 1 && this.owner == leader && this.garrison > 1){
        attacker = this; //assigns to global variable
        //one attacker must stay behind
        $('#phase_log p').html("You have selected <span id=\"player1_roll\">"+this.owner+'\'s</span>'+ ' province:'+'<br><br>It has '+this.garrison+ ' troops garrisoned'+'<br><br>This city has no harbor to attack over water.');
        var attack_origin = attacker.garrison-1; 
        counter++;

        //highlight range of attack
        //store (row, height) values of clicked province
        var attack_range = move_range(this.pos);
        //target adjacent provinces based on this
        up = $('.province')[attack_range[0][0]];
        down = $('.province')[attack_range[1][0]]; 
        left = $('.province')[attack_range[2][0]]; 
        right = $('.province')[attack_range[3][0]];
        $([up,down,left,right]).each(function(index, element){
          $(element).toggleClass('adjacent_color');
          $(element).css('font-size','15px');
          $(element).html(element.garrison+'<br>'+element.owner);
        });
        $(attacker).toggleClass('attacker_color');
  
      }
      //select attack target
      else if(counter == 1){ 
        $('#tooltip').html(leader+'\'s attack. Click again to target');
        //select your own cities show the adjacent provinces...
        $([up, down, left, right]).click(function(){ 
          counter++;
          //check for your own land NEED TO ADD CURRENT PLAYER
          if(this.owner == leader){
            alert('Sir, that\'s your own province. Are you trying to start a civil war?');
          }
          //EXTRA TIME: right click to get out/unbind,set of selection state...
          //otherwise, paint it red, increase counter, one-time target only.
          else{
            var defender = this;
            $(this).toggleClass('adjacent_color');//toggles off the defender cell's adjacent color
            $(this).toggleClass('defender_color');//toggles on the defender color, red.
            $('#phase_log p').html('You are about to attack '+ defender.owner+ '\'s province<br><br> Its has '+ defender.garrison+ ' defending troops<br><br> Attack?');  

            //initiates a button for attacking
            $('#confirm_btn').text('Confirm attack').show().click(function(){
              battle(attacker, defender);

              //after the battle is over, revert color labeling
              $('.province').unbind('click');//ends blick mouse event after attacking
              $('.province').unbind('mouseenter mouseleave');
              $(defender).toggleClass('defender_color').toggleClass('adjacent_color');//clears highlight of attacker cells
              $(attacker).toggleClass('attacker_color');//clears highlight of adjacent cells

              $(attacker).css('border','none');
              $([up, down, left, right]).each(function(index, element){
                
                $(element).toggleClass('adjacent_color');
                // console.log('toggle adjacent color');
                
                //empty cells will revert back without labels
                if(element.owner == "nobody"){
                  $(element).text('');
                }

              });
              $(this).hide();

            });
            //initiates a button for skipping to re-target next attacker and target
            $('#attack_btn').text('Invade another province').show();
          }

        });
      }
      //if what you click is not your own, and you have selected
      else if(this.owner != leader && counter < 2){
        alert('Pick your own territory to attack');
      }
      else if(this.owner == leader && this.garrison <= 1 && counter < 2){
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
    var defender_rolls = defense(defender); //LOOP BUG
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
      $(attacker).append('<br><sub class="battle_tally">-'+battle_losses[0]+'</sub>');
      $('.battle_tally').hide();
      $('.battle_tally').animate({ "bottom": "+=10px" }, "slow" ).fadeIn(1200,function(){
        $(this).fadeOut(1200,function(){

        });
      }).show();
    }
    if(battle_losses[1] > 0){
      $(defender).append('<br><sub class="battle_tally">-'+battle_losses[1]+'</sub>');
      $('.battle_tally').hide();
      $('.battle_tally').animate({ "bottom": "+=50px" }, "slow" ).fadeIn(1200,function(){
        $(this).fadeOut(1200,function(){
          
        });//toggle off the battle_tally class
      }).show().removed;
    }
    //check if you defeated all defenders on a province, then capture it
    if(defender.garrison == 0){
      capture_province(attacker, defender);    
    }
    
  }

  function capture_province(attacker, defender){
    //take over defender cell with all but one troop if defender garrison is zero only (watch for bugs)
      //Set new owner of province
      defender.owner = attacker.owner;
      defender.garrison = attacker.garrison - 1; 
      //toggle province's new labeling and styles, while removing old ones 
      $('defender').toggleClass('[class*="color"]').toggleClass('.p1_colors').html('<span class="garrison_color">'+defender.garrison+'</span><br>'+defender.owner);;
      console.log('the defender object is toggled with p1 class');
      //move all but one of the garrison to the defender's garrison, if the garrison isn't bugged at negative value
  }


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
          // console.log('attacker loses 1');
          attacker_losses++;
        }
        else if(element < attacker_rolls[index]){
          // console.log('defender loses 1');
          defender_losses++;
        }

      });
    }
    //for defender has only one dice 
    else if(defender_rolls.length == 1){
      attacker_rolls.length = 1;

      //for one-on-one dice matchup, 
      if (defender_rolls[0] >= attacker_rolls[0]){
        // console.log('attacker loses 1');
        attacker_losses++;
      }
      else if(defender_rolls[0] < attacker_rolls[0]){
        // console.log('defender loses 1');
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
    $('#tooltip').text('Roll to see who goes first.')
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
    //on click of your own troops

    //show tooltip
    //show log of instructions
  }

});//------------END OF .ready()--------------