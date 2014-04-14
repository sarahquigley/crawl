Player = function(game, cursors){
    this.game = game;
    this.cursors = cursors;

    this.sprite = this.game.add.sprite((this.game.world.centerX) - 21, (this.game.world.centerY) - 16, 'player');
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.setSize(this.config.bodyWidth, this.config.bodyHeight, this.config.bodyWidth/2, this.config.bodyHeight/2);  
    this.music = this.game.add.audio('player', 0.3, true);
    this.music.play();
};

Player.prototype = {
  config: {
    bodyWidth: 42,
    bodyHeight: 32,
    velocity: 150 * 1.2
  },

  rotate: function(angle){
    this.sprite.angle = angle;
    this.sprite.body.setSize(this.config.bodyWidth, this.config.bodyHeight, this.config.bodyWidth/2, this.config.bodyHeight/2);  
  },

  update: function(){
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    this.music.pause();

    // Add cursor control of player
    if (this.cursors.left.isDown) {
      this.rotate(180);
      this.sprite.body.velocity.x = -this.config.velocity;
    } else if (this.cursors.right.isDown){
      this.rotate(0);
      this.sprite.body.velocity.x = this.config.velocity;
    } else if (this.cursors.up.isDown){
      this.rotate(270);
      this.sprite.body.velocity.y = -this.config.velocity;
    } else if (this.cursors.down.isDown){
      this.rotate(90);
      this.sprite.body.velocity.y = this.config.velocity;
    }

    if ( this.sprite.body.velocity.x != 0 || this.sprite.body.velocity.y != 0 ){
      this.music.resume();
    } else {
      this.music.pause();
    }
  },

  cleanup: function(){
    this.sprite.destroy();
    this.game.sound.remove(this.music);
  }
};

Baddy = function(game, group){
  this.game = game;
  this.group = group;

  var pos = this.randomStartingPosition();
  var angle = this.randomAngle(pos);

  this.sprite = this.group.create(pos[0], pos[1], 'baddy');
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.anchor.setTo(0.5, 0.5);
  this.sprite.angle = angle;
  this.sprite.body.setSize(this.config.bodyWidth, this.config.bodyHeight, this.config.bodyWidth/2, this.config.bodyHeight/2);  
  this.sprite.animations.add('move', [0, 1, 2], 10, true);
  this.sprite.animations.play('move');
  game.physics.arcade.velocityFromAngle(angle, this.config.velocity, this.sprite.body.velocity);
};

Baddy.prototype = {
  config: {
    bodyWidth: 26,
    bodyHeight: 24,
    velocity: 150 * 1.2
  },

  randomStartingPosition: function(){
    if (this.game.rnd.integerInRange(0, 1) === 0) {
      startX = this.game.world.randomX;
      startY = this.game.rnd.integerInRange(0, 1) === 0 ? -25 : 425;
    } else {
      startY = this.game.world.randomY;
      startX = this.game.rnd.integerInRange(0, 1) === 0 ? -26 : 426;
    }
    return [startX, startY];
  },

  randomAngle: function(pos){
    if (pos[0] <= 200 && pos[1] <= 200) {
      return this.game.rnd.integerInRange(20, 70);
    } else if ( pos[0] > 200 && pos[1] <= 200 ) {
      return this.game.rnd.integerInRange(110, 160);
    } else if ( pos[0] > 200 && pos[1] >= 200 ) {
      return this.game.rnd.integerInRange(200, 250);
    } else {
      return this.game.rnd.integerInRange(290, 340);
    }
  },

  update: function(){
  }
};

Text = {
  title: function(game, text){
    var text = game.add.text(game.world.centerX, 150, text, {font: "90px 'Faster One'", fill:"#FFDC00", align: "center"});
    text.anchor.setTo(0.5);
    text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);
  },

  body: function(game, text, posY, fontSize){
    text = game.add.text(game.world.centerX, posY, text, { font: fontSize + " Audiowide", fill: "#000", align: "center"});
    text.anchor.setTo(0.5);
    text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);
  }

};

Game = {};

Game.Load = function(game){};

Game.Load.prototype = {

  preload: function(){
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('player', 'assets/ladybug-shadow-60.png');
    game.load.spritesheet('baddy', 'assets/ant-spritesheet-shadow-30.png', 32, 30);
    game.load.image('background', 'assets/background.jpg');

    game.load.audio('title', ['assets/audio/Buggybug_Title.mp3', 'assets/audio/Buggybug_Title.ogg']);
    game.load.audio('start', ['assets/audio/Buggybug_Start.mp3', 'assets/audio/Buggybug_Start.ogg']);
    game.load.audio('play', ['assets/audio/Buggybug.mp3', 'assets/audio/Buggybug_Full.ogg']);
    game.load.audio('over', ['assets/audio/Buggybug_Over.mp3', 'assets/audio/Buggybug_Over.ogg']);
    game.load.audio('player', ['assets/audio/Buggybug_Walk.mp3', 'assets/audio/Buggybug_Walk.ogg']);
    game.load.audio('baddy', ['assets/audio/Buggyant_Walk_Long.mp3', 'assets/audio/Buggyant_Walk_Long.ogg']);
  },

  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');
    this.cursors = game.input.keyboard.createCursorKeys();
    this.time = this.game.time.now + 1000;

    this.music = game.add.sound('title', 1, true);
    this.music.play();

    Text.title(game, "Crawl");
    Text.body(game, "move with arrow keys\npress UP to begin", 250, "20px");
  },

  cleanup: function(){
    game.sound.remove(this.music);
  },

  update: function(){
    if (this.game.time.now > this.time && !ScoreIt.isVisible() && this.cursors.up.isDown) {
      this.cleanup();
      game.state.start('Play');
    }
  }
};

Game.Play = function(game){};

Game.Play.prototype = {

  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');
    this.cursors = game.input.keyboard.createCursorKeys();

    this.music = game.add.sound('play', 1, true);
    this.music.play();

    // Player
    this.player = new Player(game, this.cursors); 

    // Baddies
    this.baddies = game.add.group();
    this.baddies.setAll('outOfBoundsKill', true);
    this.nextBaddyTime = game.time.now;

    // Scoretext
    this.score = 0;
    this.nextScoringTime = game.time.now;
    this.scoreText = game.add.text(15, 10, this.score.toString(), {font: '30px Audiowide', fill: '#FFDC00'});
    this.scoreText.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);
  },

  update: function(){
    game.physics.arcade.overlap(this.player.sprite, this.baddies, this.gameOver, null, this);

    // Player
    this.player.update();

    // Spawn baddies
    if(game.time.now >= this.nextBaddyTime){
      this.nextBaddyTime += 500;
      new Baddy(game, this.baddies);
    }

    // Increase score
    if(game.time.now >= this.nextScoringTime){
      this.nextScoringTime += 1000;
      this.score += 1;
      this.scoreText.text = this.score.toString();
    }
  },

  cleanup: function(){
    game.sound.remove(this.music);
  },

  /*render: function(){
    game.debug.body(this.player);
    game.debug.spriteBounds(this.player);
    this.baddies.forEach(function(baddy){
    game.debug.body(baddy);
    game.debug.spriteBounds(baddy);
    });
    },*/

  gameOver: function(player, baddy){
    player.kill();
    game.score = this.score;
    this.player.cleanup();
    this.cleanup();
    game.state.start('Over');
  }

};

Game.Over = function(game){};

Game.Over.prototype = {
  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');
    this.cursors = game.input.keyboard.createCursorKeys();
    this.time = game.time.now + 1000;

    this.music = game.add.sound('title', 1, true);
    this.music.play();

    Text.title(game, "Game\nOver");
    Text.body(game, "You scored " + game.score + "!", 280, "30px");
    Text.body(game, "press UP to restart", 310, "22px");

    ScoreIt.checkAndRegisterScore(game.score.toString());
  },

  cleanup: function(){
    game.sound.remove(this.music);
  },

  update: function(){
    if (game.time.now > this.time && !ScoreIt.isVisible() && this.cursors.up.isDown) {
      this.cleanup();
      game.state.start('Play');
    }
  }
};

var game = new Phaser.Game(400, 400, Phaser.AUTO, 'game');

WebFontConfig = {
  google: {
    families: ['Faster One', 'Audiowide']
  }
};

game.state.add('Load', Game.Load);
game.state.add('Play', Game.Play);
game.state.add('Over', Game.Over);
game.state.start('Load');

$(function(){
  ScoreIt.create("#scoreboard", 12);
});
