class createEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let rx = ~~(Math.random()*2)
        let ry = ~~(Math.random()*2)
        let SX = Math.floor(scene.player.x) + (rx ? 0.5*cw : -0.5*cw ) + ~~(Math.random()*400 - 200)
        let SY = Math.floor(scene.player.y) + (ry ? 0.5*ch+30 : -0.5*ch-30)
        super( scene, SX, SY, 'enemy' );
        this.scene = scene;
        this.id = 'enemy' + scene.sys.game.loop.time;
        this.moveSpeed = data.enemy.moveSpeed;
        this.health = data.enemy.health;
        this.damage = data.enemy.damage;

        scene.enemies.add(this);
        this.init();
    }
    init(){
        this.setScale(0.6);
        this.anims.play('enemy-down');
        this.body.setSize(20,50);
        this.body.setOffset(12,10);
        this.body.setBounce(1);
        this.scene.add.existing(this);
    }
    update(){
        if (this.active){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX**2 + peY**2))
            this.setVelocityX( peX * peR * this.moveSpeed * -1 )
            this.setVelocityY( peY * peR * this.moveSpeed * -1 )
        }

        if (this.health <= 0){
            if ( data.exp.active ){
                new createExp( this.scene, this.x, this.y );
            }
            this.destroy();
        }
    }
    damageCD( lastTime ){
        return data.enemy.damageCD * 1000 - (this.scene.sys.game.loop.time - lastTime)
    }
}


class createIceBall extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let {px,py,x,y} = scene.mouseArrow.getChildren()[0];
        super( scene, x, y, 'weaponImg' );
        this.scene = scene;
        this.vx = -px;
        this.vy = -py;
        this.damage = data.weapon.iceball.damage;
        this.penetrate = data.weapon.iceball.penetrate;
        this.id = ~~scene.sys.game.loop.time
        scene.weapon.iceballs.add(this);
        this.init();
    }
    init(){
        this.setScale(0.6);
        this.body.setSize(80,35);
        this.body.setOffset(20,10);
        this.body.velocity.x = this.vx * data.weapon.iceball.speed * 0.1;
        this.body.velocity.y = this.vy * data.weapon.iceball.speed * 0.1;
        this.anims.play('iceballAni', true)
        this.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI
        this.scene.add.existing(this);
    }
    update(){
        if ( this.body.checkWorldBounds() || this.penetrate < 0 ){
            this.destroy();
        }
    }
}


class createFireBall extends Phaser.Physics.Arcade.Sprite {
    constructor( scene, vx, vy ){
        let {x,y} = scene.player;
        super( scene, x, y, 'fireballImg' );
        this.scene = scene;
        this.damage = data.weapon.fireball.damage;
        this.vx = vx;
        this.vy = vy;

        scene.weapon.fireballs.add(this);
        this.init();
    }
    init(){
        this.setScale(0.1);
        this.anims.play('fireballAni');
        this.body.velocity.x = Math.sign(this.vx) * data.weapon.fireball.speed;
        this.body.velocity.y = Math.sign(this.vy) * data.weapon.fireball.speed;
        this.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI
        this.body.setSize(512/2,512/2);
        this.body.setOffset(512/4,512/4);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
        this.scene.add.existing(this);
    }
    update(){
        let vx = this.body.velocity.x
        let vy = this.body.velocity.y
        this.angle = Math.atan2(vy, vx) * 180 / Math.PI
    }
}



class createSword extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let {x,y} = scene.player;
        super( scene, x, y, 'swordImg' );
        this.scene = scene;
        this.spiralRadius = ~~(Math.random()*100 - 50);
        this.spiralRadiusInc = 0.8;
        this.spiralSpeed = ~~(Math.random()*0.2 - 0.1);
        this.spiralSpeedInc = 0.05;
        this.damage = data.weapon.sword.damage;
        
        scene.weapon.swords.add(this);
        this.init();
    }
    init(){
        this.setScale(0.001 * data.weapon.sword.size);
        this.body.setCircle(2000*0.5);
        this.body.setBounce(1);
        this.scene.add.existing(this);
    }
    damageCD( lastTime ){
        return data.weapon.sword.damageCD * 1000 - (this.scene.sys.game.loop.time - lastTime)
    }
    update(){
        this.spiralRadius += this.spiralRadiusInc;
        this.spiralSpeed += this.spiralSpeedInc;
        this.x = this.scene.player.x + this.spiralRadius * Math.cos(this.spiralSpeed) + ~~(Math.random() * 10 - 5);
        this.y = this.scene.player.y + this.spiralRadius * Math.sin(this.spiralSpeed) + ~~(Math.random() * 10 - 5);
        this.angle += 30

        if ( this.body.checkWorldBounds() ){
            this.destroy();
        }
    }
}


class createHurtText extends Phaser.GameObjects.Text {
    constructor( scene, x, y, text, styleOpt={} ){
        let style = { color: '#cc0000', fontFamily: '微軟正黑體', strokeThickness: 2, fontSize: 15, }
        Object.assign( style, styleOpt );
        super( scene, x, y, text, style );
        this.scene = scene;
        this.startTime = scene.sys.game.loop.time;
        this.destroyTime = 1000;

        scene.hurtTexts.add(this);
        this.init();
    }
    init(){
        this.scene.add.existing(this);
    }
    update(){
        this.y -= 0.1;
        if ( this.scene.sys.game.loop.time - this.startTime > this.destroyTime ){
            this.destroy()
        }
    }
}


class createExp extends Phaser.Physics.Arcade.Sprite {
    constructor( scene, x, y ){
        super( scene, x, y, 'exp' );
        this.scene = scene;
        this.moveSpeed = 100;
        this.inRange = false;
        this.acc = 1;

        scene.exps.add(this);
        this.init();
    }
    init(){
        this.setScale(0.15);
        this.anims.play('expAni', true);
        this.body.setCircle(60,30,30)
        this.scene.add.existing(this);
    }
    update(){
        if (this.active){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX*peX + peY*peY))

            if ( Math.sqrt( peX*peX + peY*peY ) < 100 || this.inRange ){
                this.inRange = true;
                this.acc += 0.01;
                this.setVelocityX( peX * peR * this.moveSpeed * -1 * this.acc )
                this.setVelocityY( peY * peR * this.moveSpeed * -1 * this.acc )
            }
        }
    }
    addExpToData( num = 1 ){
        let pExp = data.player.exp
        this.destroy();
        pExp.expNow += num;
        if ( pExp.expNow >= pExp.expToNextLevel ){
            pExp.expNow -= pExp.expToNextLevel;
            pExp.expToNextLevel += 10;
            pExp.level += 1;
        }
        $('#lv').text(pExp.level);
        $('#exp').text(pExp.expNow);
        $('#expBar').css('--percent', pExp.expNow / pExp.expToNextLevel * 100 + '%');
        $('#maxExp').text(pExp.expToNextLevel);
    }
}


class createMouseArrow extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        super( scene, 0, 0, 'arrow' );
        this.scene = scene;

        scene.mouseArrow.add(this);
        this.init();
    }
    init(){
        this.setScale(0.15);
        this.scene.add.existing(this);
    }
    update(){
        if (this.active){
            let player = this.scene.player
            let mp = this.scene.input.mousePointer

            let peX = cw/2 - mp.x
            let peY = ch/2 - mp.y
            let peR = (1 / Math.sqrt(peX**2 + peY**2))
            this.px = (peR * peX * 50)
            this.py = (peR * peY * 50)
            this.x = player.x - this.px
            this.y = player.y - this.py
            this.angle = Math.atan2( peX, peY ) * -180 / Math.PI
        }
    }
}


class createBoom extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let rdX = ~~(Math.random() * 300 - 150);
        let rdY = ~~(Math.random() * 300 - 150);
        let {x,y} = scene.player;
        super( scene, x + rdX, y + rdY, 'boomImg' );
        this.scene = scene;
        this.damage = data.weapon.boom.damage;
        this.damagedTargets = [];
        
        scene.weapon.booms.add(this);
        this.init();
    }
    init(){
        this.anims.play('boomAni', true);
        this.setSize(130,98);
        this.setOffset(0,5);
        this.scene.add.existing(this);
    }
    update(){
        if ( !this.anims.isPlaying ){
            this.destroy();
        }
    }
}


class createBoomTimer {
    constructor( scene ){
        this.scene = scene;
        if ( scene.boomTimer ){
            scene.boomTimer.destroy()
        }
        this.init();
    }
    init(){
        let This = this
        this.scene.player.boomTime = this.scene.sys.game.loop.time;
        this.scene.boomTimer = this.scene.time.addEvent({
            repeat: -1,
            delay: data.weapon.boom.spawnCD * 1000,
            callback: () => {
                if ( !data.weapon.boom.active ){ return false }
                new createBoom(This.scene);
                if ( This.scene.sys.game.loop.time > This.scene.player.boomTime + (data.weapon.boom.duration * 1000) ){
                    this.scene.boomTimer.destroy();
                }
            }
        })
    }
}