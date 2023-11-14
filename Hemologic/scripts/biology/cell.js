class Platelet extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'platelet';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
    };
    updatePhysics (delta) {
        // Apply velocity
        this.pos = this.pos.translate(this.vel.scale(delta));
        // Border collision
        if(Math.abs(this.pos.x) + this.radius + edgeWidth/2 > edge.x/2) {
            if(this.pos.x > 0) {
                this.pos.x = this.pos.x - (Math.abs(this.pos.x) + this.radius + edgeWidth/2 - edge.x/2) * (this.pos.x / Math.abs(this.pos.x));
                this.pos.x = 0 - this.pos.x;
                this.onWrap(delta);
            } else {
                this.pos.x = this.pos.x - (Math.abs(this.pos.x) + this.radius + edgeWidth/2 - edge.x/2) * (this.pos.x / Math.abs(this.pos.x));
                this.vel = this.vel.flipX().scale(this.friction);
            };
        };
        if(Math.abs(this.pos.y) + this.radius + edgeWidth/2 > edge.y/2) {
            this.pos.y = this.pos.y - (Math.abs(this.pos.y) + this.radius + edgeWidth/2 - edge.y/2) * (this.pos.y / Math.abs(this.pos.y));
            this.vel = this.vel.flipY().scale(this.friction);
        };
        // Apply friction
        this.vel = this.vel.scale(this.friction);
        // Blood flow
        if(this.targetPos == undefined) {
            this.vel = this.vel.translate(new Vector(1, (Math.random() - 0.5) * 2).scale(1/this.radius * delta));
        };
    };
    render (delta) {
        draw.color = 'rgba(200, 255, 255, 0.2)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
    };
};

class White extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'white';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.duration = 10 + Math.random() * 90;
    };
    updateLogic (delta) {
        this.duration -= delta * (1/500);
        if(this.duration <= 0) {
            entityManager.deleteEntity(this);
        };

        whiteCount += 1;
    };
    render (delta) {
        draw.color = 'rgba(255, 255, 255, 0.4)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
    };
    onCollision (delta, entity) {
        if(entity.eType == 'bacteria') {
            this.duration -= entity.oxygen / 10;
            entity.oxygen = 0;
            entityManager.deleteEntity(entity);
            if(this.duration <= 0) {
                entityManager.deleteEntity(this);
            };
        };
    };
};

class Blood extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'blood';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.duration = 10 + Math.random() * 90;
        this.oxygenCap = 100;
        this.oxygen = this.oxygenCap;
    };
    updateLogic (delta) {
        this.duration -= delta * (1/500);
        if(this.duration <= 0) {
            entityManager.deleteEntity(this);
        };

        this.oxygen -= delta * (1/500);
        if(this.oxygen <= 0) {
            entityManager.deleteEntity(this);
        };

        bloodCount += 1;
    };
    render (delta) {
        draw.color = 'rgba(' + (100 + this.oxygen*(155/this.oxygenCap)) + ', ' + (100 - this.oxygen*(100/this.oxygenCap)) + ', ' + (100 - this.oxygen*(100/this.oxygenCap)) + ', 0.2)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
        draw.color = 'rgba(' + (100 + this.oxygen*(155/this.oxygenCap)) + ', ' + (100 - this.oxygen*(100/this.oxygenCap)) + ', ' + (100 - this.oxygen*(100/this.oxygenCap)) + ', 0.2)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * 0.65 * cam.zoom);
    };
    onCollision (delta, entity) {
        if(entity.oxygen != undefined) {
            let totalCap = this.oxygenCap + entity.oxygenCap;
            let pool = this.oxygen + entity.oxygen;
            this.oxygen = pool * (this.oxygenCap / totalCap);
            entity.oxygen = pool * (entity.oxygenCap / totalCap);
        };
    };
    onWrap (delta) {
        this.oxygen = this.oxygenCap;
    };
};

class Bacteria extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'bacteria';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.oxygenCap = 50;
        this.oxygen = this.oxygenCap;
        this.breedCooldown = 0;
    };
    updateLogic (delta) {
        this.breedCooldown -= delta * (1/50);

        this.oxygen -= (1/1000) * delta;
        if((this.oxygen > this.oxygenCap/2) && (this.breedCooldown <= 0)) {
            this.oxygen = this.oxygen / 2;
            let entity = getNewCell(this.pos.translate(new Vector(Math.random() - 0.5, Math.random() - 0.5)), 'bacteria');
            entity.oxygen = this.oxygen;
            entityManager.initEntity(entity);
            this.breedCooldown = 100;
        };
        if(this.oxygen <= 0) {
            entityManager.deleteEntity(this);
        };

        bacteriaCount += 1;
    };
    render (delta) {
        draw.color = 'rgba(100, 255, 100, ' + (this.oxygen*(0.5/this.oxygenCap)) +')';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
    };
    onCollision (delta, entity) {
        if((entity.eType != 'bacteria') && (entity.oxygen != undefined)) {
            let totalCap = this.oxygenCap + entity.oxygenCap;
            let pool = this.oxygen + entity.oxygen;
            this.oxygen = Math.min(this.oxygenCap, pool);
            entity.oxygen = pool - this.oxygen;
        };
    };
};