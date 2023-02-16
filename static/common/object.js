// Phaser.Physics.Arcade.Sprite
class createPlayer extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        super( scene, cw/2, ch/2, 'person');
        this.scene = scene;
        this.hurtTime = 0;
        this.preMovedVelocity = {
            x: 150,
            y: 0,
        }
        this.init();
    }

    init(){
        this.scene.physics.world.enableBody(this);
        this.setScale(0.6);
        this.setSize(20,50);
        this.anims.play('playerAnim-right', true);
        this.body.setOffset(12,10);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
        this.scene.add.existing(this);
    }
    update(){
        /* keydown */
        const keyCode = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE")
        const keyDown = {
            space: keyCode.SPACE.isDown,
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

        this.body.setVelocityX(data.player.moveSpeed * dir.x);
        this.body.setVelocityY(data.player.moveSpeed * dir.y);

        switch ([dir.x, dir.y].toString()){
            case '-1,-1':
            case '0,-1':    
            case '1,-1':
                this.anims.play('playerAnim-up', true)
            break
            case '-1,1':
            case '0,1':
            case '1,1':
                this.anims.play('playerAnim-down', true)
            break
            case '-1,0':
                this.anims.play('playerAnim-left', true)
            break
            case '1,0':
                this.anims.play('playerAnim-right', true)
            break
            default:
            break
        }

        if ( keyDown.space ){
            if ( this.boomTime === undefined ){
                this.boomTime = 0;
            }
            if ( this.boomTime + (data.weapon.boom.CD * 1000) < this.scene.time.now ){
                new createBoomTimer(this.scene);
            }
        }

        for( let [key, val] of Object.entries( keyDown ) ){
            preKeyDown[key] = val
        }

        this.alpha = ( this.hurtTime + 500 > this.scene.time.now ) ? 0.5 : 1;

        if ( this.body.velocity.x !== 0 || this.body.velocity.y !== 0 ){
            this.preMovedVelocity = {
                x: this.body.velocity.x,
                y: this.body.velocity.y,
            }
        }
    }
}



class createEnemy extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        let rx = ~~(Math.random()*2)
        let ry = ~~(Math.random()*2)
        let SX = Math.floor(scene.player.x) + (rx ? 0.5*cw : -0.5*cw ) + ~~(Math.random()*400 - 200)
        let SY = Math.floor(scene.player.y) + (ry ? 0.5*ch+30 : -0.5*ch-30)
        super( scene, SX, SY, 'enemy' );
        this.scene = scene;
        this.id = 'enemy' + scene.time.now;
        this.moveSpeed = data.enemy.moveSpeed;
        this.health = data.enemy.health;
        this.damage = data.enemy.damage;

        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.setScale(0.6);
        this.anims.play('enemyAnim-down');
        this.body.setSize(20,50);
        this.body.setOffset(12,10);
        this.body.setBounce(1);
        this.scene.enemies.add(this);
        this.scene.add.existing(this);
    }
    update(){
        if (this.active){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX**2 + peY**2))
            this.body.setVelocityX( peX * peR * this.moveSpeed * -1 )
            this.body.setVelocityY( peY * peR * this.moveSpeed * -1 )
        }

        if (this.health <= 0){
            if ( data.exp.active ){
                this.scene.exps.add( new createExp(this.scene, this.x, this.y) )
            }
            this.destroy();
        }
    }
    damageCD( lastTime ){
        return data.enemy.damageCD * 1000 - (this.scene.time.now - lastTime)
    }
}


class createIceBall extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        let {px,py,x,y} = scene.mouseArrow;
        super( scene, x, y, 'weaponImg' );
        this.scene = scene;
        this.vx = -px;
        this.vy = -py;
        this.damage = data.weapon.iceball.damage;
        this.penetrate = data.weapon.iceball.penetrate;
        this.id = ~~scene.time.now;

        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.setScale(0.6);
        this.anims.play('iceballAnim', true);
        this.angle = Math.atan2(this.vy, this.vx) * 180 / Math.PI;
        this.body.setSize(80,35);
        this.body.setOffset(20,10);
        this.body.velocity.x = this.vx * data.weapon.iceball.speed * 0.1;
        this.body.velocity.y = this.vy * data.weapon.iceball.speed * 0.1;
        
        this.scene.add.existing(this);
    }
    update(){
        if ( this.body.checkWorldBounds() || this.penetrate < 0 ){
            this.destroy();
        }
    }
}


class createFireBall extends Phaser.GameObjects.Sprite {
    constructor( scene, vx, vy ){
        let {x,y} = scene.player;
        super( scene, x, y, 'fireballImg' );
        this.scene = scene;
        this.damage = data.weapon.fireball.damage;
        this.vx = vx;
        this.vy = vy;

        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);

        this.setScale(0.1);
        this.anims.play('fireballAnim');
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


class createSword extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        let {x,y} = scene.player;
        super( scene, x, y, 'swordImg' );
        this.scene = scene;
        this.damage = data.weapon.sword.damage;
        this.spiral = {
            radius: ~~(Math.random()*100 - 50),
            radiusInc: 0.8,
            speed: ~~(Math.random()*0.2 - 0.1),
            speedInc: 0.05,
        }
        this.damagedTargetsTime = {};
        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.setScale(0.001 * data.weapon.sword.size);
        this.body.setCircle(1200*0.5);
        this.body.setBounce(1);
        this.scene.add.existing(this);
    }
    damageCD( id ){
        return data.weapon.sword.damageCD * 1000 - (this.scene.time.now - this.damagedTargetsTime[id] )
    }
    update(){
        this.spiral.radius += this.spiral.radiusInc;
        this.spiral.speed += this.spiral.speedInc;
        this.x = this.scene.player.x + this.spiral.radius * Math.cos(this.spiral.speed) + ~~(Math.random() * 10 - 5);
        this.y = this.scene.player.y + this.spiral.radius * Math.sin(this.spiral.speed) + ~~(Math.random() * 10 - 5);
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
        this.startTime = scene.time.now;
        this.destroyTime = 1000;

        scene.hurtTexts.add(this);
        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.scene.add.existing(this);
    }
    update(){
        this.y -= 0.1;
        if ( this.scene.time.now - this.startTime > this.destroyTime ){
            this.destroy()
        }
    }
}


class createExp extends Phaser.GameObjects.Sprite {
    constructor( scene, x, y ){
        super( scene, x, y, 'exp' );
        this.scene = scene;
        this.moveSpeed = 100;
        this.inRange = false;
        this.acc = 1;

        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.setScale(0.15);
        this.anims.play('expAnim', true);
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
                this.body.setVelocityX( peX * peR * this.moveSpeed * -1 * this.acc )
                this.body.setVelocityY( peY * peR * this.moveSpeed * -1 * this.acc )
            }
        }
    }
    addExpToData( num = 1 ){
        let pExp = data.player.exp;
        this.destroy();
        pExp.expNow += num;
        if ( pExp.expNow >= pExp.expToNextLevel ){
            pExp.expNow -= pExp.expToNextLevel;
            pExp.expToNextLevel += 10;
            pExp.level += 1;
        }
    }
}


class createMouseArrow extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        super( scene, 0, 0, 'arrow' );
        this.scene = scene;

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


class createBoom extends Phaser.GameObjects.Sprite {
    constructor( scene ){
        let rdX = ~~(Math.random() * 300 - 150);
        let rdY = ~~(Math.random() * 300 - 150);
        let {x,y} = scene.player;
        super( scene, x + rdX, y + rdY, 'boomImg' );
        this.scene = scene;
        this.damage = data.weapon.boom.damage;
        this.damagedTargets = [];
        
        this.init();
    }
    init(){
        this.scene.physics.world.enableBody(this);
        this.anims.play('boomAnim', true);
        this.setSize(130,93);
        this.body.setOffset(0,15);
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
        this.scene.player.boomTime = this.scene.time.now;
        this.scene.boomTimer = this.scene.time.addEvent({
            repeat: -1,
            delay: data.weapon.boom.spawnCD * 1000,
            callback: () => {
                if ( !data.weapon.boom.active ){ return false }
                this.scene.weapon.booms.add( new createBoom(This.scene) );
                if ( This.scene.time.now > This.scene.player.boomTime + (data.weapon.boom.duration * 1000) ){
                    this.scene.boomTimer.destroy();
                }
            }
        })
    }
}