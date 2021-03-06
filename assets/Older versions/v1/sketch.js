// Setting
let debug_logs = false

let play_on_click = false
let autoplay = true
let speed = 1
let reload_draws = true
let free_camera = false
let player_count = 3

let show_numbers = false
let draw_shapes = 'hybrid' // 'false' : 'true' : 'hybrid'
let gray_checker = true

// Game variables
let atomics = []
let game = new Morpion(4)
let player = 1
let last_zone = null

// Camera
let cam_scale = 1
let cam_offset = {x: 0, y: 0}

p5.disableFriendlyErrors = true

function setup() {
    createCanvas(600, 600)
    angleMode(DEGREES)
    textAlign(CENTER, CENTER)
    textSize(200)

    if(!autoplay) {
        noLoop()
        game.draw()
    }

    print(game)

    if(play_on_click) {
        noLoop()
    }
}

function draw() {
    if(!autoplay) {
        return
    }

    for(let i = 0; i < speed; i++) {
        randomMove()
    }

    background(255)
    noFill()
    strokeWeight(4)
    rect(0,0,width-1,height-1)

    push()
    translate(cam_offset.x, cam_offset.y)
    scale(cam_scale)
    game.draw()
    pop()

    if(mouseIsPressed && free_camera) {
        updateCamera()
    }
}

function updateCamera() {
    if(mouseButton === LEFT) {
        cam_scale *= 1.01
    } else {
        cam_scale *= 0.99
    }

    const move_x = width/2 - mouseX
    const move_y = height/2 - mouseY
    cam_offset.x += move_x * 0.1
    cam_offset.y += move_y * 0.1

    cam_offset.x = min(cam_offset.x, 0)
    cam_offset.y = min(cam_offset.y, 0)
}

function randomMove() {    
    if(atomics.length === 0) {
        gameOver()
        return
    }

    let random_index = last_zone === null ? floor(random(atomics.length)) : getRandomPlayableIndex() 

    if(atomics[random_index].click()) {
        switchPlayers()
    } else {
        atomics.splice(random_index, 1)
    }
}

function mouseClicked() {
    if(autoplay) {
        redraw()
        return
    }

    if(game.isClicked(0, 0, width)) {
        background(255)
        game.draw()
        switchPlayers()
    }
}

function switchPlayers() {
    player++

    if(player > player_count) {
        player = 1
    }
}

function gameOver(winner) {
    if(!winner && reload_draws) {
        let removed_draw = false

        game.grid.forEach( child => {
            if(child.value === -1) {
                removed_draw = true
                child.removeDraws(!child.getValues().includes(-1))
            }
        })

        if(removed_draw) {
            return
        }
    }

    speed = 0
    free_camera = true
    last_zone = ''
}

function debug(str) {
    if(debug_logs) {
        print(str)
    }
}

function getRandomPlayableIndex() {
    const playables = game.getChild(pathStringToArray(last_zone)).getPlayables()
    // console.log(playables)

    if(playables === null) {
        last_zone = null
        return floor(random(atomics.length))
    }

    return playables[floor(random(playables.length))]
}

function bruteForce() {
    const playables = last_zone === null ? _.cloneDeep(atomics) : _.cloneDeep(game.getPlayables(last_zone))

    // If the whole field is playable. Note that a change to playbles will affect atomics.
    if (playables === null) playables = _.cloneDeep(atomics)

    let time = 0
    let clone_game = _.cloneDeep(game)

    let paths = calculateBruteForce(time, playables)

    console.log(playables)
}

function calculateBruteForce(time, playables) {

    if (time <= 1) {

        

        return calculateBruteForce(time + 1)
    }

}

function pathStringToArray(str) {
    let path = str.split('->').map( elm => {
        return Number(elm.trim())
    })

    return path
}

function checkNextZoneAvailability() {
    let path = pathStringToArray(last_zone)
    let morpion = game.getChild(path)

    while(morpion.getEmptyCases() === 0 && last_zone.length > 0) {
        if(reload_draws && morpion.parent && morpion.parent.master && morpion.value === -1) {
            const contain_draws = morpion.getValues().includes(-1)
            
            morpion.removeDraws(!contain_draws)
            checkNextZoneAvailability()
            return
        }

        last_zone = last_zone.slice(0, -5)
        path = pathStringToArray(last_zone)
        morpion = game.getChild(path)
    }

    if(last_zone.length === 0) {
        last_zone = null
    }
}