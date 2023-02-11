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
        spawnFPS: 100,
        damage: 2,
        moveSpeed: 50,
    },
    player: {
        health: 50,
        moveSpeed: 150,
    },
    weapon: {
        fireball: {
            active: true,
            damage: 5,
            spawnFPS: 30,
            maxAmount: 100,
            speed: 250,
        },
        sword: {
            active: true,
            damage: 6,
            damageFPS: 50,
            spawnFPS: 60,
            maxAmount: 5,
            // speed: 150,
        },
    },
}

const gui = new dat.gui.GUI();
gui.add(data, 'debug').onChange((val)=>{
    let scene = game.scene.keys.gamePlay
    scene.toggleDebug = true
})
let gui_enemy = gui.addFolder('Enemy');
    gui_enemy.add(data.enemy, 'health').min(1).max(1000).step(1).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        for( let i=0; i<scene.enemies.getChildren().length; i++ ){
            scene.enemies.getChildren()[i].health = val
        }
    })
    gui_enemy.add(data.enemy, 'spawnFPS').min(10).max(500).step(1).onChange((val)=>{
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
    gui_enemy.open();
let gui_player = gui.addFolder('Player');
    gui_player.add(data.player, 'health').min(1).max(1000).step(1);
    gui_player.add(data.player, 'moveSpeed').min(1).max(500).step(1);
    gui_player.open();
let gui_weapon = gui.addFolder('Weapon');
    gui_weapon.open();
let gui_fireball = gui_weapon.addFolder('Fireball');
    gui_fireball.add(data.weapon.fireball, 'active');
    gui_fireball.add(data.weapon.fireball, 'damage').min(1).max(100).step(1);
    gui_fireball.add(data.weapon.fireball, 'spawnFPS').min(10).max(3000).step(10).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.weapon.fireballTime.delay = val
    })
    gui_fireball.add(data.weapon.fireball, 'maxAmount').min(1).max(1000).step(1);
    gui_fireball.add(data.weapon.fireball, 'speed').min(1).max(1000).step(1);
    gui_fireball.open();
let gui_sword = gui_weapon.addFolder('Sword');
    gui_sword.add(data.weapon.sword, 'active');
    gui_sword.add(data.weapon.sword, 'damage').min(1).max(100).step(1);
    gui_sword.add(data.weapon.sword, 'damageFPS').min(10).max(200).step(1);
    gui_sword.add(data.weapon.sword, 'spawnFPS').min(10).max(3000).step(10).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.weapon.swordTime.delay = val
    })
    gui_sword.add(data.weapon.sword, 'maxAmount').min(1).max(100).step(1);
    // gui_sword.add(data.weapon.sword, 'speed').min(1).max(1000).step(1);
    gui_sword.open();