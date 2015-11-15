class Player
  constructor: (@game, @cursors) ->
    @config =
      bodyWidth: 42,
      bodyHeight: 32,
      velocity: 150 * 1.2
    @sprite = @game.add.sprite((@game.world.centerX) - 21, (@game.world.centerY) - 16, 'player')
    @game.physics.enable(@sprite, Phaser.Physics.ARCADE)
    @sprite.anchor.setTo(0.5, 0.5)
    @sprite.body.collideWorldBounds = true
    @sprite.body.setSize(@config.bodyWidth, @config.bodyHeight, @config.bodyWidth/2, @config.bodyHeight/2)
    @music = @game.add.audio('player', 0.5, true)
    @music.play()

  rotate: (angle) =>
    @sprite.angle = angle
    @sprite.body.setSize(@config.bodyWidth, @config.bodyHeight, @config.bodyWidth/2, @config.bodyHeight/2)

  update: () =>
    @sprite.body.velocity.x = 0
    @sprite.body.velocity.y = 0
    @music.pause()

    # Add cursor control of player
    if @cursors.left.isDown
      @rotate(180)
      @sprite.body.velocity.x = -@config.velocity
    else if @cursors.right.isDown
      @rotate(0)
      @sprite.body.velocity.x = @config.velocity
    else if @cursors.up.isDown
      @rotate(270)
      @sprite.body.velocity.y = -@config.velocity
    else if @cursors.down.isDown
      @rotate(90)
      @sprite.body.velocity.y = @config.velocity

    if @sprite.body.velocity.x != 0 || @sprite.body.velocity.y != 0
      @music.resume()
    else
      @music.pause()

  cleanup: () =>
    @game.sound.remove(@music)

class Baddy
  constructor: (@game, @group) ->
    @config =
      bodyWidth: 26,
      bodyHeight: 24,
      velocity: 150 * 1.2

    pos = @randomStartingPosition()
    @sprite = @group.create(pos[0], pos[1], 'baddy')
    @game.physics.enable(@sprite, Phaser.Physics.ARCADE)
    @sprite.anchor.setTo(0.5, 0.5)
    @sprite.angle = @randomAngle(pos)
    @sprite.body.setSize(@config.bodyWidth, @config.bodyHeight, @config.bodyWidth/2, @config.bodyHeight/2)
    @sprite.animations.add('move', [0, 1, 2], 10, true)
    @sprite.animations.play('move')
    @sprite.checkWorldBounds = true

    @game.physics.arcade.velocityFromAngle(@sprite.angle, @config.velocity, @sprite.body.velocity)

  randomStartingPosition: () =>
    if @game.rnd.integerInRange(0, 1) == 0
      startX = @game.world.randomX
      startY = @game.rnd.integerInRange(0, 1) == 0 ? -25 : 425
    else
      startY = @game.world.randomY
      startX = @game.rnd.integerInRange(0, 1) == 0 ? -26 : 426
    return [startX, startY]

  randomAngle: (pos) =>
    if pos[0] <= 200 && pos[1] <= 200
      return @game.rnd.integerInRange(20, 70)
    else if pos[0] > 200 && pos[1] <= 200
      return @game.rnd.integerInRange(110, 160)
    else if pos[0] > 200 && pos[1] >= 200
      return @game.rnd.integerInRange(200, 250)
    else
      return @game.rnd.integerInRange(290, 340)

  update: () =>

Text =
  title: (game, text) ->
    text = game.add.text(game.world.centerX, 150, text, {font: "90px 'Faster One'", fill:"#FFDC00", align: "center"})
    text.anchor.setTo(0.5)
    text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15)

  body: (game, text, posY, fontSize) ->
    text = game.add.text(game.world.centerX, posY, text, { font: fontSize + " Audiowide", fill: "#000", align: "center"})
    text.anchor.setTo(0.5)
    text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15)

Game = {}

Game.Load = class Load
  constructor: (@game) ->

  preload: () =>
    @game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js')
    @game.load.image('player', 'assets/ladybug-shadow-60.png')
    @game.load.spritesheet('baddy', 'assets/ant-spritesheet-shadow-30.png', 32, 30)
    @game.load.image('background', 'assets/background.jpg')

    @game.load.audio('title', ['assets/audio/title.mp3', 'assets/audio/title.ogg'])
    @game.load.audio('start', ['assets/audio/start.mp3', 'assets/audio/start.ogg'])
    @game.load.audio('play', ['assets/audio/play.mp3', 'assets/audio/play.ogg'])
    @game.load.audio('over', ['assets/audio/over.mp3', 'assets/audio/over.ogg'])
    @game.load.audio('player', ['assets/audio/playerwalk.mp3', 'assets/audio/playerwalk.ogg'])
    @game.load.audio('baddy', ['assets/audio/antwalk.mp3', 'assets/audio/antwalk.ogg'])

  create: () =>
    @background = @game.add.tileSprite(0, 0, 400, 400, 'background')
    @cursors = @game.input.keyboard.createCursorKeys()
    @time = @game.time.now + 1000

    @music = @game.add.sound('title', 1, true)
    @music.play()

    Text.title(@game, "Crawl")
    Text.body(@game, "move with arrow keys\npress UP to begin", 250, "20px")

  cleanup: () =>
    @game.sound.remove(@music)

  update: () =>
    if @game.time.now > @time && !ScoreIt.isVisible() && @cursors.up.isDown
      @cleanup()
      @game.state.start('Play')

Game.Play = class Play
  constructor: (@game) ->

  create: () ->
    @background = @game.add.tileSprite(0, 0, 400, 400, 'background')
    @cursors = @game.input.keyboard.createCursorKeys()

    @music = @game.add.sound('play', 1, true)
    @music.play()

    # Player
    @player = new Player(@game, @cursors)

    # Baddies
    @baddies = @game.add.group()
    @nextBaddyTime = @game.time.now

    # Scoretext
    @score = 0
    @nextScoringTime = @game.time.now
    @scoreText = @game.add.text(15, 10, @score.toString(), {font: '30px Audiowide', fill: '#FFDC00'})
    @scoreText.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15)

  update: () =>
    @game.physics.arcade.overlap(@player.sprite, @baddies, @gameOver, null, this)

    # Player
    @player.update()

    # Spawn baddies
    if @game.time.now >= @nextBaddyTime
      @nextBaddyTime += 500
      new Baddy(@game, @baddies)

    # Increase score
    if @game.time.now >= @nextScoringTime
      @nextScoringTime += 1000
      @score += 1
      @scoreText.text = @score.toString()

  cleanup: () =>
    @game.sound.remove(@music)

  ###
  render: () =>
    @game.debug.body(@player)
    @game.debug.spriteBounds(@player)
    @baddies.forEach((baddy) ->
      @game.debug.body(baddy)
      @game.debug.spriteBounds(baddy)
    )
  ###

  gameOver: (player, baddy) =>
    player.kill()
    @game.score = @score
    @player.cleanup()
    @cleanup()
    @game.state.start('Over')


Game.Over = class Over
  constructor: (@game) ->

  create: () =>
    @background = @game.add.tileSprite(0, 0, 400, 400, 'background')
    @cursors = @game.input.keyboard.createCursorKeys()
    @time = @game.time.now + 1000

    @music = @game.add.sound('title', 1, true)
    @music.play()

    Text.title(@game, "Game\nOver")
    Text.body(@game, "You scored " + @game.score + "!", 280, "30px")
    Text.body(@game, "press UP to restart", 310, "22px")

    ScoreIt.checkAndRegisterScore(@game.score.toString())

  cleanup: () =>
    @game.sound.remove(@music)

  update: () =>
    if @game.time.now > @time && !ScoreIt.isVisible() && @cursors.up.isDown
      @cleanup()
      @game.state.start('Play')

window.WebFontConfig = {
  google: {
    families: ['Faster One', 'Audiowide']
  }
}

game = new Phaser.Game(400, 400, Phaser.AUTO, 'game')
game.state.add('Load', Game.Load)
game.state.add('Play', Game.Play)
game.state.add('Over', Game.Over)
game.state.start('Load')

$(() -> ScoreIt.create("#scoreboard", 12))

$(window).load(() ->
  $('.loader').fadeOut(1000)
)
