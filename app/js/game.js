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

    game.load.audio('title', ['assets/audio/title.mp3', 'assets/audio/title.ogg']);
    game.load.audio('start', ['assets/audio/start.mp3', 'assets/audio/start.ogg']);
    game.load.audio('play', ['assets/audio/play.mp3', 'assets/audio/play.ogg']);
    game.load.audio('over', ['assets/audio/over.mp3', 'assets/audio/over.ogg']);
    game.load.audio('player', ['assets/audio/playerwalk.mp3', 'assets/audio/playerwalk.ogg']);
    game.load.audio('baddy', ['assets/audio/antwalk.mp3', 'assets/audio/antwalk.ogg']);
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

$(window).load(function(){
  $('.loader').fadeOut(1000);
});
