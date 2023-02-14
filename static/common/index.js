const gamePlay = {
    key: 'gamePlay',
    preload(){
        this.load.image('map','static/img/map.jpg' )
        this.load.image('arrow','static/img/arrow.png' )
        this.load.image('tree','static/img/tree.png' )
        this.load.image('border','static/img/border.png' )
        this.load.spritesheet('personImg', 'static/img/player2.png', { frameWidth: 47, frameHeight: 71, } )
        this.load.spritesheet('expImg', 'static/img/exp.png', { frameWidth: 192, frameHeight: 192, } )
        this.load.spritesheet('fireballImg', 'static/img/fireball.png', { frameWidth: 512, frameHeight: 512, } )
        this.load.spritesheet('weaponsImg', 'static/img/balls.png', { frameWidth: 99, frameHeight: 47, } )
        this.load.image('swordImg', 'static/img/sword.png')
    },
    create(){
        let This = this
    /*=== world ===*/
        const { x:bx, y:by, width:bw, height:bh, } = data.world.bounce
        this.physics.world.setBounds(bx, by, bw, bh);


    /*=== groups ===*/
        this.mouseArrow = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.exps = this.physics.add.group();
        this.weapon = [];
        this.weapon.fireballs = this.physics.add.group();
        this.weapon.iceballs = this.physics.add.group();
        this.weapon.swords = this.physics.add.group();
        this.hurtTexts = this.add.group();


    /*=== map ===*/
    // this.map = this.add.sprite(cw/2, ch/2, 'map')
        this.map = this.add.tileSprite(0, 0, cw, ch, 'map')
        this.map.setOrigin(0, 0)
        this.map.setScrollFactor(0)

        // this.tree = this.add.tileSprite(cw/2, ch/2, cw, ch, 'tree')
        // this.tree.setScrollFactor(0)

        const borderThick = {x:72, y:48,}
        this.border = this.add.sprite(cw/2, ch/2, 'border')
        this.border.setDisplaySize(bw + borderThick.x, bh + borderThick.y)


    /*=== animations ===*/
        function createPersonImgAnim( opt = {} ){
            [`${opt.key}-down`, `${opt.key}-left`, `${opt.key}-right`, `${opt.key}-up`].forEach((k,i) => {
                This.anims.create({ key: k, frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('personImg', { start: 12*(opt.row+i) + opt.col, end: 12*(opt.row+i) + opt.col + 2, }), })
            });
        }

        createPersonImgAnim({key: 'player1', row: 0, col: 3, })
        createPersonImgAnim({key: 'enemy', row: 0, col: 0, })
        this.anims.create({key: 'fireballAni', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('fireballImg', { start: 0, end: 5, }), })
        this.anims.create({key: 'iceballAni', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('weaponsImg', { start: 13, end: 20, }), })
        this.anims.create({key: 'expAni', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('expImg', { start: 10, end: 12, }), })
        

    /*=== player ===*/
        this.player = this.physics.add.sprite(cw/2, ch/2, 'person')
        this.player.setScale(0.6)
        this.player.setSize(20,50)
        this.player.setOffset(12,10)
        this.player.setCollideWorldBounds(true)
        this.player.setBounce(1)
        this.player.anims.play('player1-right', true)
        this.player.hurtTime = 0;
        this.myCam = this.cameras.main.startFollow(this.player)
        
        
    /*=== mouseArrow ===*/
        new createMouseArrow(this)

    /*=== create objects / time ===*/
        this.enemyTime = this.time.addEvent({ 
            repeat: -1,
            delay: data.enemy.spawnCD * 1000, 
            callback: () => {
                if ( !data.enemy.active ){ return false }
                new createEnemy(this)
            }
        })

        this.weapon.iceballSpawnTime = this.time.addEvent({ 
            repeat: -1, 
            delay: data.weapon.iceball.spawnCD * 1000, 
            callback: () => {
                if ( !data.weapon.iceball.active ){ return false }
                new createIceBall(this)
            }
        })

        this.weapon.fireballSpawnTime = this.time.addEvent({ 
            repeat: -1, 
            delay: data.weapon.fireball.spawnCD * 1000, 
            callback: () => {
                if ( !data.weapon.fireball.active ){ return false }
                let vx = this.player.body.velocity.x
                let vy = this.player.body.velocity.y
                if ( vx === 0 && vy === 0 ){
                    switch( this.player.anims.currentAnim.key ){
                        case 'player1-left':
                            new createFireBall(this, -1, 0)
                            break
                        case 'player1-right':
                            new createFireBall(this, 1, 0)
                            break
                        case 'player1-up':
                            new createFireBall(this, 0, -1)
                            break
                        case 'player1-down':
                            new createFireBall(this, 0, 1)
                            break
                        default: 
                        break;
                    }
                } else {
                    new createFireBall(this, vx, vy )
                }
            }
        })

        this.weapon.swordSpawnTime = this.time.addEvent({
            repeat: -1,
            delay: data.weapon.sword.spawnCD * 1000,
            callback: () => {
                if ( !data.weapon.sword.active ){ return false }
                new createSword(this);
            }
        })


    /*=== collider / overlap ===*/
        this.physics.add.collider(this.enemies, this.weapon.fireballs, (enemy, fireball) => {
            enemy.health -= fireball.damage;
            data.totalDamge.fireball += fireball.damage;
            new createHurtText(this, enemy.x, enemy.y, -fireball.damage, { color: '#c00', })
            fireball.destroy()
        })
        this.physics.add.overlap(this.enemies, this.weapon.iceballs, (enemy, iceball) => {
            if ( enemy.hurtByIceBall === undefined || enemy.hurtByIceBall !== iceball.id ){
                enemy.hurtByIceBall = iceball.id;
                enemy.health -= iceball.damage;
                data.totalDamge.iceball += iceball.damage;
                iceball.penetrate -= 1;
                new createHurtText(this, enemy.x, enemy.y, -iceball.damage, { color: '#059', })
            }
        })
        this.physics.add.overlap(this.enemies, this.weapon.swords, (enemy, sword) => {
            if ( enemy.hurtBySwordLastTime === undefined || sword.damageCD( enemy.hurtBySwordLastTime ) < 0 ){
                enemy.hurtBySwordLastTime = this.sys.game.loop.time;
                enemy.health -= sword.damage;
                data.totalDamge.sword += sword.damage;
                new createHurtText(this, enemy.x, enemy.y, -sword.damage, { color: '#0af', } )
            }
        })
        this.physics.add.overlap(this.player, this.exps, (player, exp)=>{
            // this.player.exp += 1;
            exp.addExpToData();
        })
        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            if ( enemy.hurtPlayerLastTime === undefined || enemy.damageCD( enemy.hurtPlayerLastTime ) < 0 ){
                player.hurtTime = this.sys.game.loop.time;
                enemy.hurtPlayerLastTime = this.sys.game.loop.time;
                data.player.health -= enemy.damage; // player.health -= enemy.damage;
                new createHurtText(this, player.x, player.y - 30, -enemy.damage, { color: '#f00', fontSize: 18, strokeThickness: 5, } )
            }
        })
        this.physics.add.collider(this.enemies, this.enemies)

        this.toggleDebug = false;
        console.log('sceneCreated:', this)
    },
    update(){
        const This = this

        $('#totalDamage').html( JSON.stringify(data.totalDamge).replace(/[\"\{\}]/g,'').split(',').join('<br>') )
        
        /*=== debug ===*/
        if (this.toggleDebug === true) {
            if ( this.physics.world?.debugGraphic?.clear === undefined ){
                this.physics.world.createDebugGraphic();
            }
            if (data.debug) {
                this.physics.world.drawDebug = true;
            } else {
                this.physics.world.drawDebug = false;
                this.physics.world.debugGraphic.clear();
            }
            this.toggleDebug = false;
        }


    /*=== map ===*/
        this.map.tilePositionX = this.myCam.scrollX
        this.map.tilePositionY = this.myCam.scrollY
        // this.map.tilePositionX = this.sys.game.loop.frame * 10 // 類似空戰感
        // this.tree.tilePositionX = this.player.x
        // this.tree.tilePositionY = this.player.y


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
                this.player.anims.play('player1-up', true)
            break
            case '-1,1':
            case '0,1':
            case '1,1':
                this.player.anims.play('player1-down', true)
            break
            case '-1,0':
                this.player.anims.play('player1-left', true)
            break
            case '1,0':
                this.player.anims.play('player1-right', true)
            break
            default:
            break
        }

    /*=== update player ===*/
        this.player.alpha = ( this.player.hurtTime + 500 > this.sys.game.loop.time ) ? 0.5 : 1;


    /*=== update groups ===*/
        const groupUpdate = (group) => {
            for( let i=group.getChildren().length-1; i>=0; i-- ){
                group.getChildren()[i].update();
            }
        }
        if ( this.weapon.fireballs.getChildren()?.[data.weapon.fireball.maxAmount] ){
            this.weapon.fireballs.getChildren()[0].destroy()
        }
        if ( this.weapon.swords.getChildren()?.[data.weapon.sword.maxAmount] ){
            this.weapon.swords.getChildren()[0].destroy()
        }

        groupUpdate( this.mouseArrow )
        groupUpdate( this.enemies )
        groupUpdate( this.weapon.fireballs )
        groupUpdate( this.weapon.iceballs )
        groupUpdate( this.weapon.swords )
        groupUpdate( this.hurtTexts )
        groupUpdate( this.exps )

        for( let [key, val] of Object.entries( keyDown ) ){
            preKeyDown[key] = val
        }

        $('#exp').text(data.player.exp.expNow)
        $('#maxExp').text(data.player.exp.expToNextLevel)
        $('#time').text( ~~This.sys.game.loop.time )
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