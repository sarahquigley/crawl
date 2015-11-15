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

window.Player = Player
window.Baddy = Baddy
