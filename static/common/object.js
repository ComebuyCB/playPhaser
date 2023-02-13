class createEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let rx = ~~(Math.random()*2)
        let ry = ~~(Math.random()*2)

        let SX = Math.floor(scene.player.x) + ((rx ? 0.5 : -0.5) * cw) + ~~( Math.random()*200 - 100 )
        let SY = Math.floor(scene.player.y) + ((ry ? 0.5 : -0.5) * ch)

        super( scene, SX, SY, 'enemy' );
        this.scene = scene
        this.moveSpeed = data.enemy.moveSpeed

        this.setScale(0.6)
        scene.add.existing(this);
        scene.enemies.add(this);
        
        this.anims.play('enemy-down');
        this.body.setSize(20,50)
        this.body.setOffset(12,10)
        // this.body.setCollideWorldBounds(true);
        this.body.setBounce(1)

        this.health = data.enemy.health;
        this.hurtBySword = false;
    }

    update(){
        if ( this.active ){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX*peX + peY*peY))
            this.setVelocityX( peX * peR * this.moveSpeed * -1 )
            this.setVelocityY( peY * peR * this.moveSpeed * -1 )
        }

        if (this.health <= 0 ){
            new createExp( this.scene, this.x, this.y );
            this.destroy()
        }
    }
}



class createFireBall extends Phaser.Physics.Arcade.Sprite {
    constructor( scene, vx, vy ){
        let {x,y} = scene.player;
        super( scene, x, y, 'fireballImg' );
        this.scene = scene

        /*=== settings ===*/
        this.setScale(0.1);
        scene.weapon.fireballs.add(this);
        scene.add.existing(this);
        this.anims.play('fireballAni');
        
        this.body.velocity.x = Math.sign(vx) * data.weapon.fireball.speed;
        this.body.velocity.y = Math.sign(vy) * data.weapon.fireball.speed;

        this.angle = Math.atan2(y, x) * 180 / Math.PI

        this.body.setSize(512/2,512/2);
        this.body.setOffset(512/4,512/4);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1)

        this.damage = data.weapon.fireball.damage
        this.boundAmount = data.weapon.fireball.boundAmount;
    }

    update(){
        let vx = this.body.velocity.x
        let vy = this.body.velocity.y
        this.angle = Math.atan2(vy, vx) * 180 / Math.PI

        if ( this.body.checkWorldBounds() ){
            this.boundAmount --
            if ( this.boundAmount <=0 ){
                this.destroy()
            }
        }
    }
}



class createSword extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let {x,y} = scene.player;
        super( scene, x, y, 'swordImg' );
        this.scene = scene;
        this.spiralRadius = ~~(Math.random()*100);
        this.spiralRadiusInc = 0.8;
        this.spiralSpeed = 0;
        this.spiralSpeedInc = 0.05;

        /*=== settings ===*/
        this.setScale(0.05);
        scene.weapon.swords.add(this);
        scene.add.existing(this);

        this.body.setSize(2000*0.8,2000*0.8);
        this.body.setOffset(180,180);
        this.body.setBounce(1);

        this.damage = data.weapon.sword.damage;
    }

    damageCD( lastTime ){
        return data.weapon.sword.damageCD * 1000 - (this.scene.sys.game.loop.time - lastTime)
    }

    update(){
        this.spiralRadius += this.spiralRadiusInc + Math.sign( Math.random()*2 );
        this.spiralSpeed += this.spiralSpeedInc;
        this.x = this.scene.player.x + this.spiralRadius * Math.cos(this.spiralSpeed);
        this.y = this.scene.player.y + this.spiralRadius * Math.sin(this.spiralSpeed);
        this.angle += 30

        if ( Math.abs(this.x - this.scene.player.x) > cw + 100 || 
            Math.abs(this.y - this.scene.player.y) > ch + 100 ){
            this.destroy()
        }
    }
}


class createHurtText extends Phaser.GameObjects.Text {
    constructor( scene, x, y, text ){
        let style = { color: 'red', fontFamily: '微軟正黑體', }
        super( scene, x, y, text, style );
        this.scene = scene;
        scene.hurtTexts.add(this);
        scene.add.existing(this);
        this.startTime = scene.sys.game.loop.time;
        this.destroyTime = 1000;
    }

    update(){
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

        this.setScale(0.15);
        this.anims.play('expAni', true);
        scene.add.existing(this);
        scene.exps.add(this);
    }

    update(){
        if ( this.active ){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX*peX + peY*peY))

            if ( Math.sqrt(peX*peX + peY*peY) < 100 ){
                this.setVelocityX( peX * peR * this.moveSpeed * -1 )
                this.setVelocityY( peY * peR * this.moveSpeed * -1 )
            }
        }
    }
}