const gamePlay = {
    key: 'gamePlay',
    preload(){
        this.load.image('map','static/img/map2.jpg')
        this.load.spritesheet('personImg', 'static/img/player2.png', { frameWidth: 47, frameHeight: 71, } )
        this.load.spritesheet('fireballImg', 'static/img/fireball.png', { frameWidth: 512, frameHeight: 512, } )
    },
    create(){
        let This = this
        console.log(this)
    /*=== map ===*/
        this.map = this.add.tileSprite(0, 0, cw, ch, 'map')
        this.map.setOrigin(0, 0)
        this.map.setScrollFactor(0)

    /*=== animations ===*/
        const createPerson = (opt={})=>{
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

        createPerson({key: 'p1', row: 0, col: 3, })

        this.player.anims.play('p1-down', true)
        this.myCam = this.cameras.main.startFollow(this.player)
        
    /*=== enemies ===*/
        this.enemies = this.physics.add.group();
        createPerson({key: 'enemy', row: 0, col: 0, })

    /*=== fireballs ===*/
        this.fireballs = this.physics.add.group();
        this.anims.create({
            key: 'fireballAni', frameRate: 8, repeat: -1,
            frames: This.anims.generateFrameNumbers('fireballImg', { start: 0, end: 5, }),
        })

    /*=== collider / overlay ===*/
        this.physics.add.collider(this.enemies, this.fireballs, function( enemy, fireball ){
            enemy.health -= fireball.damage
            console.log( enemy.health, fireball.damage )
            if ( enemy.health <= 0 ){
                enemy.destroy();
            }
            fireball.destroy();
        })

        this.physics.add.collider(this.enemies, this.enemies)
        this.physics.add.collider(this.player, this.enemies, function( player, enemy ){
            // enemy.destroy();
        })


        this.personMove = ( person, dir )=>{
        }

        this.enemyTime = this.time.addEvent({ 
            delay: data.enemy.spawnPerMS, 
            repeat: -1,
            callback: () => {
                new createEnemy(this)
            }
        })

        this.fireballTime = this.time.addEvent({ 
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
    },
    update(){
        const This = this
        const keyCode = this.input.keyboard.addKeys("W,A,S,D")
        const {W,A,S,D} = keyCode
        const keyDown = {
            down: S.isDown,
            left: A.isDown,
            right: D.isDown,
            up: W.isDown,
            new: preKeyDown.new,
        }

        this.map.tilePositionX = this.myCam.scrollX
        this.map.tilePositionY = this.myCam.scrollY

        for( let [key, val] of Object.entries( keyDown ) ){
            if ( keyDown[key] !== preKeyDown[key] ){
                if ( keyDown[key] === true ){
                    keyDown.new = key
                    break
                } else {
                    keyDown.new = null
                }
            }
        }

        let finalXY = {
            x: 0,
            y: 0,
        }

        if ( keyDown.left && keyDown.right ){
            finalXY.x = ( keyDown.new === 'left' ) ? -1 : 1
        } else if ( keyDown.left ){
            finalXY.x = -1
        } else if ( keyDown.right ){
            finalXY.x = 1
        }
        
        if ( keyDown.up && keyDown.down ){
            finalXY.y = ( keyDown.new === 'up' ) ? -1 : 1
        } else if ( keyDown.up ){
            finalXY.y = -1
        } else if ( keyDown.down ){
            finalXY.y = 1
        }

        this.player.setVelocityX( data.player.moveSpeed * finalXY.x);
        this.player.setVelocityY( data.player.moveSpeed * finalXY.y);

        if ( finalXY.x !==0 || finalXY.y !==0 ){
            const {x, y} = finalXY
            const str = [x,y].toString()
            switch (str){
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
        }
        if ( finalXY.x === -1 ){
            if ( finalXY.y === -1 ){
                this.player.anims.play('p1-up', true)
            } else if ( finalXY.y === 1 ){
                this.player.anims.play('p1-down', true)
            } else {
                this.player.anims.play('p1-left', true );
            }
        } else if ( finalXY.x === 1 ){
            if ( finalXY.y === -1 ){
                this.player.anims.play('p1-up', true)
            } else if ( finalXY.y === 1 ){
                this.player.anims.play('p1-down', true)
            } else {
                this.player.anims.play('p1-right', true );
            }
        }

        
        if ( this.fireballs.getChildren()?.[data.weapon.fireball.maxAmount] ){
            this.fireballs.getChildren()[0].destroy()
        }
        for( let i=0; i<this.fireballs.getChildren().length; i++ ){
            this.fireballs.getChildren()[i].update()
        }

        for( let i=0; i<this.enemies.getChildren().length; i++ ){
            this.enemies.getChildren()[i].update()
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
    scene: [
        // gameStart,
        gamePlay,
    ]
});