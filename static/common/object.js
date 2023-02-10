class createEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let rx = ~~(Math.random()*2)
        let ry = ~~(Math.random()*2)

        let SX = Math.floor(scene.player.x) + ((rx ? 0.5 : -0.5) * cw)
        let SY = Math.floor(scene.player.y) + ((ry ? 0.5 : -0.5) * ch)

        super( scene, SX, SY, 'enemy' );
        this.scene = scene
        this.moveSpeed = data.enemy.moveSpeed

        this.setScale(0.6)
        this.anims.play('enemy-down', true)
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
        this.spiralRadius = 0;
        this.spiralRotation = 0;
        this.spiralIncrement = 0.02;
        this.spiralSpeed = 0.1;

        /*=== settings ===*/
        this.setScale(0.05);
        scene.weapon.swords.add(this);
        scene.add.existing(this);

        this.body.setSize(2000*0.8,2000*0.8);
        this.body.setOffset(180,180);
        this.body.setBounce(1);

        this.damage = data.weapon.sword.damage;
        this.hasDamage = false;
    }

    update(){
        this.spiralRadius += this.spiralIncrement;
        this.spiralRotation += this.spiralSpeed;
        var x = this.spiralRadius * Math.cos(this.spiralRotation);
        var y = this.spiralRadius * Math.sin(this.spiralRotation);
        
        this.angle += 12
        this.hasDamage = ( (~~this.scene.sys.game.loop.frame) % data.weapon.sword.damagePerFrame === 0 ) ? true : false;
    }
}


class createHurtText extends Phaser.GameObjects.Text {
    constructor( scene, x, y, text ){
        let style = { color: 'red' }
        super( scene, ~~x, ~~y, text, style );
        this.scene = scene;
        scene.hurtTexts.add(this);
        scene.add.existing(this);
        this.startFrame = scene.sys.game.loop.frame
        this.destroyFrame = 100;
    }

    update(){
        if ( this.scene.sys.game.loop.frame - this.startFrame > this.destroyFrame ){
            this.destroy()
        }
    }
}