let screen = document.getElementById('screen');
screen.x = screen.getBoundingClientRect().left;
screen.y = screen.getBoundingClientRect().top;
let ctx = screen.getContext("2d");

function lerp (n, min=0, max=1) {
    return min*(1-n) + max*(n);
};
function invLerp (n, min=0, max=1) {
    return (n-min)/(max-min);
};

function resizeCanvas () {
    screen.width = document.documentElement.clientWidth - 4;
    screen.height = document.documentElement.clientHeight - 4;
};
resizeCanvas();

// Scaling
let simulationScale = 1;

// Optimizations
let useQuadtree = true;
let useCulling = true;

// Edge
let edge = new Vector(50_000 * simulationScale, 5_000 * simulationScale);
let edgeWidth = 500 * simulationScale;

// Red and white blood cell count
let bloodCount = 0;
let bloodSpawnCooldown = 0;
let bloodCap = 500 * simulationScale;
let whiteCount = 0;
let whiteSpawnCooldown = 0;
let whiteCap = 20 * simulationScale;
let bacteriaCount = 0;
let immunoResponse = 0;
let immunoBonus = 0;

// Generate objects
for(let i = 0; i < bloodCap; i++) {
    let entity = getNewCell(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 'blood')
    entity.duration -= 10
    entity.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5).setScaler(10);
    entityManager.initEntity(entity);
    entity.vel = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
};
for(let i = 0; i < whiteCap; i++) {
    let entity = getNewCell(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 'white')
    entity.duration -= 10
    entityManager.initEntity(entity);
    entity.vel = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
};
for(let i = 0; i < 20 * simulationScale; i++) {
    let entity = getNewCell(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 'fat')
    entityManager.initEntity(entity);
    entity.vel = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
};
for(let i = 0; i < 400 * simulationScale; i++) {
    let entity = new Platelet(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), Math.random() * 5 + 15);
    entityManager.decoEntities.push(entity);
    entity.vel = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4)
};

// Define camera
let cam = new Camera(new Vector());

// Objected selected by cursor
let selected = undefined;

// Stops main loop
let noLoop = false;
let windowWasOutOfFocus = false;

// Pause and slowndown
let paused = false;
let simulationSpeed = 1;

// Time keeping
let previousTime = 0;
let frame = 0;

// Main function
function main (time) {
    if(windowWasOutOfFocus) {
        previousTime = time;
        windowWasOutOfFocus = false;
        requestAnimationFrame(main);
        return;
    };
    delta = time - previousTime;
    delta = delta * simulationSpeed;
    previousTime = time;
    ctx.clearRect(0, 0, screen.width, screen.height);
    
    if(selected != undefined) {
        selected.pos = selected.pos.translate(input.mouse.worldPos.subtract(selected.pos).scale(1/50 * delta));
        if(selected.eType == 'node') {
            selected.targetPos = selected.pos;
        };
    };

    if(input.getBindState('delete')) {
        let closestEntity = undefined;
        let closestDist = 5 / cam.zoom;
        for(let entity of entityManager.entities) {
            let dist = entity.pos.getDistTo(input.mouse.worldPos) - entity.radius;
            if(dist <= closestDist) {
                closestEntity = entity;
                closestDist = dist;
            };
        };
        if(closestEntity != undefined) {
            entityManager.deleteEntity(closestEntity);
        };
    };
    if(input.getBindState('selectFat')) {
        spawnType = 'fat';
    };
    if(input.getBindState('selectWhite')) {
        spawnType = 'white';
    };
    if(input.getBindState('selectBlood')) {
        spawnType = 'blood';
    };
    if(input.getBindState('selectBacteria')) {
        spawnType = 'bacteria';
    };
    if(input.getBindState('selectWall')) {
        spawnType = 'wall';
    };
    if(input.getBindState('create')) {
        let entity
        entity = getNewCell(input.mouse.worldPos.translate(new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)), spawnType);
        entityManager.initEntity(entity);
    };

    cam.update(delta);
    
    input.updateWorldMouse();
    
    bloodCount = 0;
    whiteCount = 0;
    bacteriaCount = 0;
    if(!paused) {
        entityManager.updateEntities(delta);
    };
    entityManager.renderEntities(delta);

    if((bloodCount < bloodCap) && (bloodSpawnCooldown <= 0)) {
        let entity = getNewCell(new Vector(0 - edge.x, (Math.random() - 0.5) * edge.y), 'blood')
        entityManager.initEntity(entity);
        bloodSpawnCooldown = 100;
    } else {
        bloodSpawnCooldown -= delta * 4 * simulationScale;
    };
    if(bacteriaCount > 0) {
        immunoBonus += (1 / 100_000 ) * bacteriaCount * delta;
    } else {
        immunoBonus = 0;
    };
    immunoResponse += ((bacteriaCount + immunoBonus + (bloodCap - bloodCount))/2 - immunoResponse) * (1/50000) * delta;
    if((whiteCount < whiteCap + immunoResponse) && (whiteSpawnCooldown <= 0)) {
        let entity = getNewCell(new Vector(0 - edge.x, (Math.random() - 0.5) * edge.y), 'white')
        entityManager.initEntity(entity);
        whiteSpawnCooldown = 100;
    } else {
        whiteSpawnCooldown -= delta * (1/8) * Math.max(1, immunoResponse/50) * simulationScale;
    };

    // Edge
    draw.width = edgeWidth * cam.zoom;
    draw.color = '#9B1010';
    let pos = new Vector();
    draw.lineStroke(pos.translate(edge.scale(0.5)).worldToScreen(cam), pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), pos.translate(edge.scale(0.5)).worldToScreen(cam), true);

    //draw.color = 'rgb(255, 255, 255, 0.5)';
    //draw.circleFill(new Vector().worldToScreen(cam), 10);

    draw.color = 'black';
    draw.circleFill(input.mouse.pos, 5);

    if((cam.target != undefined) || (selected != undefined)) {
        let entity = cam.target || selected;
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.arc(entity.pos.worldToScreen(cam).x, entity.pos.worldToScreen(cam).y, entity.radius * cam.zoom + 5, 0, Math.PI*2);
        ctx.stroke();
    };

    let spacing = 1;
    draw.color = 'white';
    draw.fillText('Pressione [H] para Ajuda.', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    draw.fillText('Quadtree: ' + localize(useQuadtree) + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    draw.fillText('Culling: ' + localize(useCulling) + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    draw.fillText('Tipo: ' + localize(spawnType) + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    draw.fillText('Células Brancas: ' + whiteCount + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    draw.fillText('Células Vermelhas: ' + bloodCount + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    if(bacteriaCount > 0) {
        draw.fillText('Bacteria: ' + bacteriaCount + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
        draw.fillText('Imuno-Resposta: ' + Math.floor(immunoResponse*2/bacteriaCount*100) + '%' + ';', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    };
    if(paused) {
        draw.fillText(localize('PAUSED'), 24 * 2, 'center', new Vector(screen.width / 2, screen.height / 2 + 24 / 2));
    };
    if(simulationSpeed != 1.0) {
        draw.fillText(simulationSpeed + 'x', 24 * 2, 'left', new Vector(10, screen.height - 24 ));
    };

    gui.update(delta);

    frame++;
    if(!noLoop) {requestAnimationFrame(main);};
};

function localize (content) {
    let tbl = {
        true: 'ativado',
        false: 'desativado',
        'fat': 'colesterol',
        'white': 'célula branca',
        'blood': 'célula vermelha',
        'bacteria': 'bacteria',
        'wall': 'parede',
        'node': 'parede',
        'PAUSED': 'PAUSADO',
        'moveUp': 'mover-se para cima',
        'moveDown': 'mover-se para baixo',
        'moveRight': 'mover-se para direita',
        'moveLeft': 'mover-se para esquerda',
        'rotateClock': 'rodar sentido horário', // rotate camera clockwise
        'rotateCounter': 'rodar sentido anti-horário', // rotate camera counterclockwise
        'zoomIn': 'aumentar zoom', // increase camera zoom level (+)
        'zoomOut': 'diminuir zoom', // decrease camera zoom level (-)
        'create': 'criar', // hold to create entities continuously - to create a single entity just click
        'delete': 'deletar', // delete entities at mouse cursor
        'deleteAll': 'deletar tudo', // deletes all entities
        'refresh': 'resetar página', // equivalent to F5
        'target': 'seguir', // makes camera target and follow a specific entity
        'resetCam': 'resetar camera', // resets camera
        'grab': 'segurar', // grabs an entity and makes it follow the cursor
        'showQuadtree': 'mostrar quadtree', // hold to show quadtrees
        'toggleQuadtree': 'toggle da quadtree', // toggles between using and not using quadtrees
        'toggleCulling': 'toggle do culling', // toggles culling (doesn't render objects out of camera view)
        'selectFat': 'selecionar colesterol', // select fat for spawning
        'selectWhite': 'selecionar célula branca', // select white for spawning
        'selectBlood': 'selecionar célula vermelha', // select blood for spawning
        'selectBacteria': 'selecionar bacteria', // select bacteria for spawning
        'selectWall': 'selecionar parede', // select wall for spawning
        'help': 'ajuda', // gets list of keybinds
        'togglePause': 'pausar', // toggle pause
        'slowdown': 'desacelerar', // makes simulation run at 0.5x speed
        'speedup': 'acelerar' // makes simulation run at 2.0x speed
    };
    return tbl[content];
};

requestAnimationFrame(main);


window.onresize = () => {
    resizeCanvas();
};

window.addEventListener('keydown', (event) => {
    if((input.keybinds['togglePause'] == event.code.toLowerCase()) && !input.getBindState('togglePause')) {
        paused = !paused;
    };
    if((input.keybinds['slowdown'] == event.key.toLowerCase()) && !input.getBindState('slowdown')) {
        if(simulationSpeed != 0.5) {
            simulationSpeed = 0.5;
        } else {
            simulationSpeed = 1.0;
        };
    };
    if((input.keybinds['speedup'] == event.key.toLowerCase()) && !input.getBindState('speedup')) {
        if(simulationSpeed != 2.0) {
            simulationSpeed = 2.0;
        } else {
            simulationSpeed = 1.0;
        };
    };
    if((input.keybinds['toggleQuadtree'] == event.key.toLowerCase()) && !input.getBindState('toggleQuadtree')) {
        useQuadtree = !useQuadtree;
    };
    if((input.keybinds['toggleCulling'] == event.key.toLowerCase()) && !input.getBindState('toggleCulling')) {
        useCulling = !useCulling;
    };
    if((input.keybinds['help'] == event.key.toLowerCase()) && !input.getBindState('help')) {
        windowWasOutOfFocus = true;
        let text = '';
        for(let index in input.keybinds) {
            if(index != '') {
                text = text + '[' + input.keybinds[index] + '] = ' + localize(index) + ';\n';
            };
        };
        window.alert(text);
    };
    if((input.keybinds['deleteAll'] == event.key.toLowerCase()) && !input.getBindState('deleteAll')) {
        entityManager.entities = [];
        entityManager.connections = [];
    };
    if((input.keybinds['refresh'] == event.key.toLowerCase()) && !input.getBindState('refresh')) {
        location.reload()
    };
    if((input.keybinds['target'] == event.key.toLowerCase()) && !input.getBindState('target')) {
        selected = undefined;

        let closestEntity = undefined;
        let closestDist = 5 / cam.zoom;
        for(let entity of entityManager.entities) {
            let dist = entity.pos.getDistTo(input.mouse.worldPos) - entity.radius;
            if(dist <= closestDist) {
                closestEntity = entity;
                closestDist = dist;
            };
        };
        if(cam.target == closestEntity) {
            cam.target = undefined;
        } else {
            cam.target = closestEntity;
        };
    };
    if((input.keybinds['grab'] == event.key.toLowerCase()) && !input.getBindState('grab')) {
        cam.target = undefined;

        let closestEntity = undefined;
        let closestDist = 5 / cam.zoom;
        for(let entity of entityManager.entities) {
            let dist = entity.pos.getDistTo(input.mouse.worldPos) - entity.radius;
            if(dist <= closestDist) {
                closestEntity = entity;
                closestDist = dist;
            };
        };
        if(selected == closestEntity) {
            selected = undefined;
        } else {
            selected = closestEntity;
        };
    };
    if((input.keybinds['resetCam'] == event.key.toLowerCase()) && !input.getBindState('resetCam')) {
        cam = new Camera(new Vector());
    };
    /*
    if((input.keybinds['create'] == event.key.toLowerCase()) && !input.getBindState('create')) {
        entityManager.initEntity(new Fat(input.mouse.worldPos.translate(new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)), Math.random() * 50 + 200));
    };
    */
    if(event.code == 'Space') {
        input.setKeyDown(event.code);
    } else {
        input.setKeyDown(event.key);
    };
});

window.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        input.setKeyUp(event.code);
    } else {
        input.setKeyUp(event.key);
    };
});

window.addEventListener('mousedown', (event) => {
    input.mouse.down = true;
    let entity
    entity = getNewCell(input.mouse.worldPos.translate(new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)), spawnType);
    entityManager.initEntity(entity);
});

window.addEventListener('mouseup', (event) => {
    input.mouse.down = false;
});

window.addEventListener('mousemove', (event) => {
    input.updateMouse(event);
});

window.addEventListener('wheel', (event) => {
    cam.zoomVel += (cam.zoom/200) * event.deltaY * -0.02;

    updateMouse(event);
});

window.addEventListener("visibilitychange", (event) => {
    if(document.hidden) {
        noLoop = true;
    } else {
        noLoop = false;
        windowWasOutOfFocus = true;
        requestAnimationFrame(main);
    };
});

let spawnType = 'fat';
function getNewCell (pos, eType) {
    if(eType == 'fat') {
        return new Fat(pos, Math.random() * 50 + 200);
    } else if(eType == 'white') {
        return new White(pos, Math.random() * 15 + 75);
    } else if(eType == 'blood') {
        return new Blood(pos, Math.random() * 10 + 50);
    } else if(eType == 'bacteria') {
        return new Bacteria(pos, Math.random() * 5 + 25);
    } else if(eType == 'wall') {
        return new Node(pos, Math.random() * 50 + 200);
    } else {
        return new PhysEntity(pos, Math.random() * 50 + 200);
    };
};