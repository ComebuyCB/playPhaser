const gamePlay = {
    key: 'gamePlay',
    preload(){
        this.load.image('map','static/img/map.jpg' )
        this.load.image('arrow','static/img/arrow.png' )
        this.load.image('border','static/img/border.png' )
        this.load.spritesheet('personImg', 'static/img/player2.png', { frameWidth: 47, frameHeight: 71, } )
        this.load.spritesheet('expImg', 'static/img/exp.png', { frameWidth: 192, frameHeight: 192, } )
        this.load.spritesheet('fireballImg', 'static/img/fireball.png', { frameWidth: 512, frameHeight: 512, } )
        this.load.spritesheet('weaponsImg', 'static/img/balls.png', { frameWidth: 99, frameHeight: 47, } )
        this.load.spritesheet('boomImg', 'static/img/boom.png', { frameWidth: 130, frameHeight: 113, } )
        this.load.image('swordImg', 'static/img/sword.png')
    },
    create(){
        let This = this
    /*=== world ===*/
        const { x:bx, y:by, width:bw, height:bh, } = data.world.bounce
        this.physics.world.setBounds(bx, by, bw, bh);


    /*=== groups ===*/
        this.trees = this.add.group();
        this.enemies = this.add.group();
        this.exps = this.add.group();
        this.weapon = [];
        this.weapon.fireballs = this.add.group();
        this.weapon.iceballs = this.add.group();
        this.weapon.swords = this.add.group();
        this.weapon.booms = this.add.group();
        this.hurtTexts = this.add.group();


    /*=== map ===*/
    // this.map = this.add.sprite(cw/2, ch/2, 'map')
        this.map = this.add.tileSprite(bx, by, bw, bh, 'map');
        this.map.setOrigin(0, 0)

        const borderThick = {x:72, y:48,}
        this.border = this.add.sprite(cw/2, ch/2, 'border')
        this.border.setDisplaySize(bw + borderThick.x, bh + borderThick.y)


    /*=== animations ===*/
        function createPersonImgAnim( opt = {} ){
            [`${opt.key}-down`, `${opt.key}-left`, `${opt.key}-right`, `${opt.key}-up`].forEach((k,i) => {
                This.anims.create({ key: k, frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('personImg', { start: 12*(opt.row+i) + opt.col, end: 12*(opt.row+i) + opt.col + 2, }), })
            });
        }
        createPersonImgAnim({key: 'playerAnim', row: 0, col: 3, })
        createPersonImgAnim({key: 'enemyAnim', row: 0, col: 0, })
        this.anims.create({key: 'fireballAnim', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('fireballImg', { start: 0, end: 5, }), })
        this.anims.create({key: 'iceballAnim', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('weaponsImg', { start: 13, end: 20, }), })
        this.anims.create({key: 'expAnim', frameRate: 8, repeat: -1, frames: This.anims.generateFrameNumbers('expImg', { start: 10, end: 12, }), })
        this.anims.create({key: 'boomAnim', frameRate: 30, repeat: 0, hideOnComplete: true, frames: This.anims.generateFrameNumbers('boomImg', { start: 0, end: 17, }), })



    /*=== player & mouseArrow ===*/
        this.player = new createPlayer(this);
        this.mouseArrow = new createMouseArrow(this);
        
        
    /*=== camera ===*/
        this.myCam = this.cameras.main.startFollow(this.player,false);
        this.myCam.setBackgroundColor(0x664422);


    /*=== objects / time ===*/
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
                This.weapon.iceballs.add( new createIceBall(This) );
            }
        })

        this.weapon.fireballSpawnTime = this.time.addEvent({ 
            repeat: -1, 
            delay: data.weapon.fireball.spawnCD * 1000, 
            callback: () => {
                if ( !data.weapon.fireball.active ){ return false }
                let {x,y} = this.player.preMovedVelocity;
                This.weapon.fireballs.add( new createFireBall(This, x, y) );
            }
        })

        this.weapon.swordSpawnTime = this.time.addEvent({
            repeat: -1,
            delay: data.weapon.sword.spawnCD * 1000,
            callback: () => {
                if ( !data.weapon.sword.active ){ return false }
                This.weapon.swords.add( new createSword(This) )
            }
        })


    /*=== collider / overlap ===*/
        this.physics.add.collider(this.enemies, this.weapon.fireballs, (enemy, fireball) => {
            enemy.health -= fireball.damage;
            data.totalDamage.fireball += fireball.damage;
            This.hurtTexts.add( new createHurtText(This, enemy.x, enemy.y, -fireball.damage, { color: '#c00', }) );
            fireball.destroy()
        })

        this.physics.add.overlap(this.enemies, this.weapon.iceballs, (enemy, iceball) => {
            if ( enemy.hurtByIceBall === undefined || enemy.hurtByIceBall !== iceball.id ){
                enemy.hurtByIceBall = iceball.id;
                enemy.health -= iceball.damage;
                data.totalDamage.iceball += iceball.damage;
                iceball.penetrate -= 1;
                This.hurtTexts.add( new createHurtText(this, enemy.x, enemy.y, -iceball.damage, { color: '#059', }) );
            }
        })

        this.physics.add.overlap(this.enemies, this.weapon.swords, (enemy, sword) => {
            if ( sword.damagedTargetsTime[enemy.id] === undefined || sword.damageCD( enemy.id ) < 0 ){
                sword.damagedTargetsTime[enemy.id] = this.time.now;
                enemy.health -= sword.damage;
                data.totalDamage.sword += sword.damage;
                This.hurtTexts.add( new createHurtText(This, enemy.x, enemy.y, -sword.damage, { color: '#0af', }) );
            }
        })

        this.physics.add.overlap(this.enemies, this.weapon.booms, (enemy, boom)=>{
            if ( boom.damagedTargets.includes( enemy.id ) ){ return false }
            boom.damagedTargets.push( enemy.id );
            enemy.health -= boom.damage;
            data.totalDamage.boom += boom.damage;
            This.hurtTexts.add( new createHurtText(this, enemy.x, enemy.y, -boom.damage, { color: '#f00', fontSize: 20, }) );
        })

        this.physics.add.overlap(this.player, this.exps, (player, exp)=>{
            // this.player.exp += 1;
            exp.addExpToData();
        })

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            if ( enemy.hurtPlayerLastTime === undefined || enemy.damageCD( enemy.hurtPlayerLastTime ) < 0 ){
                player.hurtTime = this.time.now;
                enemy.hurtPlayerLastTime = this.time.now;
                data.player.health -= enemy.damage; // player.health -= enemy.damage;
                This.hurtTexts.add( new createHurtText(this, player.x, player.y - 30, -enemy.damage, { color: '#f00', fontSize: 18, strokeThickness: 5, }) );
            }
        })

        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.player, this.trees);
        this.physics.add.collider(this.enemies, this.trees);

        this.toggleDebug = false;
        console.log('sceneCreated:', this);
    },
    update(){
        const This = this

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
        // this.map.tilePositionX = this.myCam.scrollX
        // this.map.tilePositionY = this.myCam.scrollY
        // this.map.tilePositionX = this.sys.game.loop.frame * 10 // 類似空戰感
        // this.tree.tilePositionX = this.player.x
        // this.tree.tilePositionY = this.player.y


    /*=== update groups ===*/
        if ( this.weapon.fireballs.getChildren()?.[data.weapon.fireball.maxAmount] ){
            this.weapon.fireballs.getChildren()[0].destroy()
        }
        if ( this.weapon.swords.getChildren()?.[data.weapon.sword.maxAmount] ){
            this.weapon.swords.getChildren()[0].destroy()
        }

        const groupUpdate = (group) => {
            for( let i=group.getChildren().length-1; i>=0; i-- ){
                group.getChildren()[i].update();
            }
        }
        this.player.update()
        this.mouseArrow.update()
        groupUpdate( this.enemies )
        groupUpdate( this.weapon.fireballs )
        groupUpdate( this.weapon.iceballs )
        groupUpdate( this.weapon.swords )
        groupUpdate( this.weapon.booms )
        groupUpdate( this.hurtTexts )
        groupUpdate( this.exps )


    /*=== render to DOM ===*/
        $('#hp').text(data.player.health);
        $('#lv').text(data.player.exp.level);
        $('#exp').text(data.player.exp.expNow);
        $('#maxExp').text(data.player.exp.expToNextLevel);
        $('#expBar').css('--percent', data.player.exp.expNow / data.player.exp.expToNextLevel * 100 + '%');
        $('#totalDamage').html( JSON.stringify(data.totalDamage).replace(/[\"\{\}]/g,'').split(',').join('<br>') );

        let t = ~~((This.player.boomTime ? This.player.boomTime : 0) + (data.weapon.boom.CD * 1000) - This.time.now);
        $('#ultCD').text((t > 0) ? t : 'Ready');
        $('#time').text( ~~This.time.now );
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