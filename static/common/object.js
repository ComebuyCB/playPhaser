class createEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor( scene ){
        let x = ~~(Math.random()*2)
        let y = ~~(Math.random()*2)
        super( scene, x*cw, y*ch, 'enemy' );
        this.scene = scene

        this.setScale(0.6)
        this.anims.play('enemy-down', true)
        scene.enemies.add(this);
        scene.add.existing(this);
        this.anims.play('enemy-down');

        this.body.setSize(20,50)
        this.body.setOffset(12,10)
        this.body.setCollideWorldBounds(true);
        
        this.health = data.enemy.health;
    }

    update(){
        if ( this.active ){
            let peX = this.x - this.scene.player.x
            let peY = this.y - this.scene.player.y
            let peR = (1 / Math.sqrt(peX*peX + peY*peY))
            this.setVelocityX( peX * peR * data.enemy.moveSpeed * -1 )
            this.setVelocityY( peY * peR * data.enemy.moveSpeed * -1 )
        }
    }
}



class createFireBall extends Phaser.Physics.Arcade.Sprite {
    constructor( scene, vx, vy ){
        let {x,y} = scene.player;
        super( scene, x, y, 'fireball' );
        this.scene = scene

        /*=== settings ===*/
        this.setScale(0.1);
        scene.fireballs.add(this);
        scene.add.existing(this);
        this.anims.play('fireballAni');
        
        this.body.velocity.x = Math.sign(vx) * data.weapon.fireball.speed;
        this.body.velocity.y = Math.sign(vy) * data.weapon.fireball.speed;
        console.log( Math.sign(vx) * data.weapon.fireball.speed )

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