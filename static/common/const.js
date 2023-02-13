const cw = 1200;
const ch = 675;
const preKeyDown = {
    down: false,
    left: false,
    right: false,
    up: false,
    new: null,
}

let data = {
    debug: false,
    pause: false,
    world: {
        bounce: {
            x: 0 - cw / 2, 
            y: 0 - ch / 2,
            width: cw * 2,
            height: ch * 2,
        }
    },
    enemy: {
        health: 20,
        spawnCD: 0.7,
        damage: 2,
        moveSpeed: 50,
        clear: function(){
            let scene = game.scene.keys.gamePlay
            for( let i=scene.enemies.getChildren().length - 1; i>=0; i-- ){
                scene.enemies.getChildren()[i].destroy()
            }
        }
    },
    player: {
        health: 50,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        moveSpeed: 150,
    },
    weapon: {
        fireball: {
            active: true,
            damage: 5,
            spawnCD: 0.3,
            maxAmount: 100,
            boundAmount: 2,
            speed: 250,
            clear: function(){
                let scene = game.scene.keys.gamePlay
                for( let i=scene.weapon.fireballs.getChildren().length - 1; i>=0; i-- ){
                    scene.weapon.fireballs.getChildren()[i].destroy()
                }
            }
        },
        sword: {
            active: true,
            damage: 3,
            damageCD: 0.6,
            spawnCD: 0.8,
            maxAmount: 20,
            // speed: 150,
            clear: function(){
                let scene = game.scene.keys.gamePlay
                for( let i=scene.weapon.swords.getChildren().length - 1; i>=0; i-- ){
                    scene.weapon.swords.getChildren()[i].destroy()
                }
            }
        },
    },
}

const gui = new dat.gui.GUI();
gui.add(data, 'debug').onChange((val)=>{
    let scene = game.scene.keys.gamePlay
    scene.toggleDebug = true
})
gui.add(data, 'pause').onChange((val)=>{
    let scene = game.scene
    if ( val ){
        scene.pause('gamePlay')
    } else {
        scene.resume('gamePlay')
    }
})

let gui_enemy = gui.addFolder('Enemy');
    gui_enemy.add(data.enemy, 'health').min(1).max(1000).step(1).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        for( let i=0; i<scene.enemies.getChildren().length; i++ ){
            scene.enemies.getChildren()[i].health = val
        }
    })
    gui_enemy.add(data.enemy, 'spawnCD').min(0.01).max(2).step(0.01).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.enemyTime.delay = val
    })
    
    gui_enemy.add(data.enemy, 'moveSpeed').min(1).max(200).step(1).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        for( let i=0; i<scene.enemies.getChildren().length; i++ ){
            scene.enemies.getChildren()[i].moveSpeed = val
        }
    })
    gui_enemy.add(data.enemy, 'damage').min(1).max(300).step(1);
    gui_enemy.add(data.enemy, 'clear');
    gui_enemy.open();

let gui_player = gui.addFolder('Player');
    gui_player.add(data.player, 'health').min(1).max(1000).step(1);
    gui_player.add(data.player, 'exp').min(0).max(500).step(1).listen();
    gui_player.add(data.player, 'moveSpeed').min(1).max(500).step(1);
    gui_player.open();

let gui_weapon = gui.addFolder('Weapon');
    gui_weapon.open();

let gui_fireball = gui_weapon.addFolder('Fireball');
    gui_fireball.add(data.weapon.fireball, 'active');
    gui_fireball.add(data.weapon.fireball, 'damage').min(1).max(100).step(1);
    gui_fireball.add(data.weapon.fireball, 'spawnCD').min(0.01).max(2).step(0.01).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.weapon.fireballSpawnTime.delay = val * 1000
    })
    gui_fireball.add(data.weapon.fireball, 'maxAmount').min(1).max(1000).step(1);
    gui_fireball.add(data.weapon.fireball, 'boundAmount').min(1).max(100).step(1);
    gui_fireball.add(data.weapon.fireball, 'speed').min(1).max(1000).step(1);
    gui_fireball.add(data.weapon.fireball, 'clear');
    gui_fireball.open();

let gui_sword = gui_weapon.addFolder('Sword');
    gui_sword.add(data.weapon.sword, 'active');
    gui_sword.add(data.weapon.sword, 'damage').min(1).max(100).step(1);
    gui_sword.add(data.weapon.sword, 'damageCD').min(0.1).max(3).step(0.01);
    gui_sword.add(data.weapon.sword, 'spawnCD').min(0.01).max(2).step(0.01).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.weapon.swordSpawnTime.delay = val * 1000
    })
    gui_sword.add(data.weapon.sword, 'maxAmount').min(1).max(100).step(1);
    // gui_sword.add(data.weapon.sword, 'speed').min(1).max(1000).step(1);
    gui_sword.add(data.weapon.sword, 'clear');
    gui_sword.open();