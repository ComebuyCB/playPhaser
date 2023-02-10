const gamePlay = {
    key: 'gamePlay',
    preload(){
        this.load.image('map','static/img/map.jpg' )
        this.load.image('border','static/img/border.png' )
        this.load.spritesheet('personImg', 'static/img/player2.png', { frameWidth: 47, frameHeight: 71, } )
        this.load.spritesheet('fireballImg', 'static/img/fireball.png', { frameWidth: 512, frameHeight: 512, } )
        this.load.image('swordImg', 'static/img/sword.png')
    },
    create(){
        let This = this
        console.log(this)

        console.log('text', this.add.text(5,5,'hello') )

    /*=== world ===*/
        const { x:bx, y:by, width:bw, height:bh, } = data.world.bounce
        this.physics.world.setBounds(bx, by, bw, bh)

    /*=== map ===*/
    // this.map = this.add.sprite(0, 0, 'map')
        this.map = this.add.tileSprite(0, 0, cw, ch, 'map')
        this.map.setOrigin(0, 0)
        this.map.setScrollFactor(0)

        const borderThick = {x:72, y:48,}
        this.border = this.add.sprite(cw/2, ch/2, 'border')
        this.border.setDisplaySize(bw + borderThick.x, bh + borderThick.y)

    /*=== animations ===*/
        const createPlayerAnim = (opt={})=>{
            [`${opt.key}-down`, `${opt.key}-left`, `${opt.key}-right`, `${opt.key}-up`].forEach((k,i) => {
                This.anims.create({
                    key: k, frameRate: 8, repeat: -1,
                    frames: This.anims.generateFrameNumbers('personImg', { start: 12*(opt.row+i) + opt.col, end: 12*(opt.row+i) + opt.col + 2, }),
                })
            });
        }


    /*=== player ===*/
        this.player = this.physics.add.sprite(cw/2, ch/2, 'person')
        this.player.setScale(0.6)
        this.player.setSize(20,50)
        this.player.setOffset(12,10)
        this.player.setCollideWorldBounds(true)
        this.player.setBounce(1)

        console.log( this.player )

        createPlayerAnim({key: 'p1', row: 0, col: 3, })

        this.player.anims.play('p1-down', true)
        this.myCam = this.cameras.main.startFollow(this.player)
        
    /*=== enemies ===*/
        this.enemies = this.physics.add.group();
        createPlayerAnim({key: 'enemy', row: 0, col: 0, })

    /*=== weapons ===*/
        this.weapon = [];
        this.weapon.fireballs = this.physics.add.group();

        this.anims.create({
            key: 'fireballAni', frameRate: 8, repeat: -1,
            frames: This.anims.generateFrameNumbers('fireballImg', { start: 0, end: 5, }),
        })

        this.weapon.swords = this.physics.add.group();


    /*=== create objects per time ===*/
        this.hurtTexts = this.add.group();
        this.enemyTime = this.time.addEvent({ 
            delay: data.enemy.spawnPerMS, 
            repeat: -1,
            callback: () => {
                new createEnemy(this)
            }
        })

        this.weapon.fireballTime = this.time.addEvent({ 
            delay: data.weapon.fireball.spawnPerMS, 
            repeat: -1, 
            callback: () => {
                if ( data.weapon.fireball.active ){
                    let vx = this.player.body.velocity.x
                    let vy = this.player.body.velocity.y
                    if ( vx === 0 && vy === 0 ){
                        switch( this.player.anims.currentAnim.key ){
                            case 'p1-left':
                                new createFireBall(this, -1, 0)
                                break
                            case 'p1-right':
                                new createFireBall(this, 1, 0)
                                break
                            case 'p1-up':
                                new createFireBall(this, 0, -1)
                                break
                            case 'p1-down':
                                new createFireBall(this, 0, 1)
                                break
                            default: 
                            break;
                        }
                    } else {
                        new createFireBall(this, vx, vy )
                    }
                }
            }
        })

        this.weapon.swordTime = this.time.addEvent({ 
            delay: data.weapon.sword.spawnPerMS, 
            repeat: -1, 
            callback: () => {
                if ( data.weapon.sword.active ){
                    new createSword(this)
                }
            }
        })


    /*=== collider / overlay ===*/
        this.physics.add.collider(this.enemies, this.weapon.fireballs, function( enemy, fireball ){
            enemy.health -= fireball.damage;
            new createHurtText(This, enemy.x, enemy.y, -fireball.damage)
            if ( enemy.health <= 0 ){
                enemy.destroy();
            }
            fireball.destroy();
        })

        this.physics.add.overlap(this.enemies, this.weapon.swords, function( enemy, sword ){
            if ( sword.hasDamage == true ){
                enemy.health -= sword.damage;
                new createHurtText(This, enemy.x, enemy.y, -sword.damage)
                if ( enemy.health <= 0 ){
                    enemy.destroy();
                }
            }
        })

        this.physics.add.collider(this.enemies, this.enemies)
        this.physics.add.collider(this.player, this.enemies, function( player, enemy ){
            // enemy.destroy();
        })
    },
    update(){
        const This = this
    /*=== map ===*/
        this.map.tilePositionX = this.myCam.scrollX
        this.map.tilePositionY = this.myCam.scrollY


    /*=== keyDown ===*/
        const keyCode = this.input.keyboard.addKeys("W,A,S,D")
        const keyDown = {
            down: keyCode.S.isDown,
            left: keyCode.A.isDown,
            right: keyCode.D.isDown,
            up: keyCode.W.isDown,
            new: preKeyDown.new,  // 解決最後按下的按鈕，來決定要往哪個方向。
        }

        for( let [key, val] of Object.entries( keyDown ) ){
            if ( keyDown[key] === preKeyDown[key] ){ continue }
            if ( keyDown[key] === true ){
                keyDown.new = key
                break
            } else {
                keyDown.new = null
            }
        }

        const dir = {x: 0, y: 0,}
        if ( keyDown.left && keyDown.right ){
            dir.x = ( keyDown.new === 'left' ) ? -1 : 1
        } else if ( keyDown.left ){
            dir.x = -1
        } else if ( keyDown.right ){
            dir.x = 1
        }
        
        if ( keyDown.up && keyDown.down ){
            dir.y = ( keyDown.new === 'up' ) ? -1 : 1
        } else if ( keyDown.up ){
            dir.y = -1
        } else if ( keyDown.down ){
            dir.y = 1
        }

        this.player.setVelocityX(data.player.moveSpeed * dir.x);
        this.player.setVelocityY(data.player.moveSpeed * dir.y);

        switch ([dir.x, dir.y].toString()){
            case '-1,-1':
            case '0,-1':    
            case '1,-1':
                this.player.anims.play('p1-up', true)
            break
            case '-1,1':
            case '0,1':
            case '1,1':
                this.player.anims.play('p1-down', true)
            break
            case '-1,0':
                this.player.anims.play('p1-left', true)
            break
            case '1,0':
                this.player.anims.play('p1-right', true)
            break
            default:
            break
        }


    /*=== update objects ===*/
        if ( this.weapon.fireballs.getChildren()?.[data.weapon.fireball.maxAmount] ){
            this.weapon.fireballs.getChildren()[0].destroy()
        }
        for( let i=0; i<this.weapon.fireballs.getChildren().length; i++ ){
            this.weapon.fireballs.getChildren()[i].update()
        }

        if ( this.weapon.swords.getChildren()?.[data.weapon.sword.maxAmount] ){
            this.weapon.swords.getChildren()[0].destroy()
        }
        for( let i=0; i<this.weapon.swords.getChildren().length; i++ ){
            this.weapon.swords.getChildren()[i].update()
        }

        for( let i=0; i<this.enemies.getChildren().length; i++ ){
            this.enemies.getChildren()[i].update()
        }

        for( let i=0; i<this.hurtTexts.getChildren().length; i++ ){
            this.hurtTexts.getChildren()[i].update()
        }

        for( let [key, val] of Object.entries( keyDown ) ){
            preKeyDown[key] = val
        }
    },
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: cw,
    height: ch,
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                // y: 850
            },
            debug: data.debug,
        },
    },
    useTicker: true,
    scene: [
        // gameStart,
        gamePlay,
    ]
});