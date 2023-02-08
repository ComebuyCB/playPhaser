const cw = 1000;
const ch = 560;
const preKeyDown = {
    down: false,
    left: false,
    right: false,
    up: false,
    new: null,
}

let data = {
    debug: false,
    enemy: {
        health: 20,
        spawnPerMS: 2000,
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
            spawnPerMS: 300,
            maxAmount: 100,
            speed: 150,
        },
    },
}

const gui = new dat.gui.GUI();
// gui.add(data, 'debug').onChange((val)=>{
//     game.config.physics.arcade.debug = val
// })
let gui_enemy = gui.addFolder('Enemy');
    gui_enemy.add(data.enemy, 'health').min(1).max(1000).step(1).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        for( let i=0; i<scene.enemies.getChildren().length; i++ ){
            scene.enemies.getChildren()[i].update()
        }
    })
    gui_enemy.add(data.enemy, 'spawnPerMS').min(100).max(10000).step(100).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.enemyTime.delay = val
    })
    gui_enemy.add(data.enemy, 'moveSpeed').min(1).max(200).step(1);
    gui_enemy.add(data.enemy, 'damage').min(1).max(300).step(1);

let gui_player = gui.addFolder('Player');
    gui_player.add(data.player, 'health').min(1).max(1000).step(1);
    gui_player.add(data.player, 'moveSpeed').min(1).max(500).step(1);

let gui_weapon = gui.addFolder('Weapon');
let gui_fireball = gui_weapon.addFolder('Fireball');
    gui_fireball.add(data.weapon.fireball, 'active');
    gui_fireball.add(data.weapon.fireball, 'damage').min(1).max(100).step(1);
    gui_fireball.add(data.weapon.fireball, 'spawnPerMS').min(10).max(3000).step(10).onChange((val)=>{
        let scene = game.scene.keys.gamePlay
        scene.fireballTime.delay = val
    })
    gui_fireball.add(data.weapon.fireball, 'maxAmount').min(1).max(1000).step(1);
    gui_fireball.add(data.weapon.fireball, 'speed').min(1).max(1000).step(1);