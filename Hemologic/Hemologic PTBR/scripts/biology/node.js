class Node extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'node';
        this.pos = pos;
        this.targetPos = pos;
        this.vel = new Vector();
        this.radius = radius || 100;
    };
    updateLogic (delta) {
        this.pos = this.targetPos;
        this.vel = new Vector();
        //this.vel = this.vel.translate(this.targetPos.subtract(this.pos).scale(0.005));
    };
    render (delta) {
        draw.color = '#9B1010';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
    };
    onCollision (delta, entity) {
        this.pos = this.targetPos;
        if(entity.eType == 'node') {
            entity.pos = entity.targetPos;
        };
    };
    onEdgeCollide (delta) {
        this.pos = this.targetPos;
    };
    onWrap (delta) {
        this.pos = this.targetPos;
    };
};

class Fat extends PhysEntity {
    constructor (pos, radius) {
        super(PhysEntity);
        this.eType = 'fat';
        this.pos = pos;
        //this.targetPos = pos;
        this.vel = new Vector();
        this.radius = radius || 100;
        this.sugarCap = 100;
        this.sugar = this.sugarCap;
        this.stickCooldown = 0;
    };
    updateLogic (delta) {
        this.stickCooldown -= delta * (1/5);

        if(this.targetPos != undefined) {
            if(this.targetPos.subtract(this.pos).scaler > this.radius) {
                this.targetPos = undefined;
                this.stickCooldown = 100;
            } else {
                this.vel = this.vel.translate(this.targetPos.subtract(this.pos).scale(0.005));
            };
        };

        //this.sugar = Math.max(0, this.sugar - (1/1000) * delta);
    };
    render (delta) {
        if(this.targetPos != undefined) {
            draw.color = 'rgba(255, 255, 155, 0.2)';
            draw.width = this.radius * cam.zoom * (1/5);
            draw.lineStroke(this.pos.worldToScreen(cam), this.targetPos.worldToScreen(cam), true);
        };
        draw.color = 'rgba(255, 255, 155, 0.4)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
        draw.color = 'rgba(255, 255, 100, 0.4)';
        if(this.sugar > 0) {
            draw.circleFill(this.pos.worldToScreen(cam), this.radius * (this.sugar/this.sugarCap) * 0.9 * cam.zoom);
        };
    };
    onEdgeCollide (delta) {
        if(this.stickCooldown > 0) {return;};

        this.targetPos = this.pos;
        this.stickCooldown = 100;
    };
    onCollision (delta, entity) {
        if(this.stickCooldown > 0) {return;};

        if(entity.eType != 'bacteria') {
            let thisConnections = 0;
            let otherConnections = 0;
            let create = true;
            for(let connection of entityManager.connections) {
                if((connection.entity1 == this) || (connection.entity2 == this)) {
                    thisConnections = thisConnections + 1;
                    if((connection.entity1 == entity) || (connection.entity2 == entity)) {
                        create = false;
                    };
                };
                if((connection.entity1 == entity) || (connection.entity2 == entity)) {
                    otherConnections = otherConnections + 1;
                };
            };
            let connectionCap = 8;
            if((thisConnections > connectionCap - 1) || (otherConnections > connectionCap - 1)) {
                create = false;
            };
            if(create) {
                let damp = (entity.eType == 'fat' || entity.eType == 'node') ? (1/2) : (1/10) ;
                entityManager.connections.push(new Spring(this, entity, (this.radius + entity.radius) * 1.6, damp));
                this.stickCooldown = 100;
            };
        };
    };
    onWrap (delta) {
        for(let connection of entityManager.connections) {
            if((connection.entity1 == this) || (connection.entity2 == this)) {
                connection.active = !connection.active;
            };
        };
    };
};