class input {
    static mouse = {pos: new Vector(), worldPos: new Vector(), down: false};
    static keyStates = {};
    static keybinds = {
        'moveUp': 'w',
        'moveDown': 's',
        'moveRight': 'd',
        'moveLeft': 'a',
        'rotateClock': 'z', // rotate camera clockwise
        'rotateCounter': 'x', // rotate camera counterclockwise
        'zoomIn': 'q', // increase camera zoom level (+)
        'zoomOut': 'e', // decrease camera zoom level (-)
        'create': 'c', // hold to create entities continuously - to create a single entity just click
        'delete': 'v', // delete entities at mouse cursor
        'deleteAll': 'b', // deletes all entities
        'refresh': 'r', // equivalent to F5
        'target': 't', // makes camera target and follow a specific entity
        'resetCam': 'f', // resets camera
        'grab': 'g', // grabs an entity and makes it follow the cursor
        'showQuadtree': 'i', // hold to show quadtrees
        'toggleQuadtree': 'o', // toggles between using and not using quadtrees
        'toggleCulling': 'p', // toggles culling (doesn't render objects out of camera view)
        'selectFat': '1', // select fat for spawning
        'selectWhite': '2', // select white for spawning
        'selectBlood': '3', // select blood for spawning
        'selectBacteria': '4', // select bacteria for spawning
        'selectWall': '5', // select wall for spawning
        'help': 'h', // gets list of keybinds
        'togglePause': 'space', // toggle pause
        'slowdown': 'control', // makes simulation run at 0.5x speed
        'speedup': 'shift' // makes simulation run at 2.0x speed
    };
    static updateMouse(event) {
        screenX = screen.getBoundingClientRect().left;
        screenY = screen.getBoundingClientRect().top;
        this.mouse.pos.x = event.clientX - screenX;
        this.mouse.pos.y = event.clientY - screenY;
    };
    static updateWorldMouse() {
        this.mouse.worldPos = this.mouse.pos.screenToWorld(cam);
    };
    static getBindState(bind) {
        return this.isKeyDown(this.keybinds[bind]);
    };
    static isKeyDown(key) {
        if(this.keyStates[key.toLowerCase()]) {return true;};
        return false;
    };
    static setKeyDown(key) {
        this.keyStates[key.toLowerCase()] = true;
    };
    static setKeyUp(key) {
        this.keyStates[key.toLowerCase()] = false;
    };
};