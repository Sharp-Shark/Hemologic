class Camera extends PhysEntity {
    constructor (pos) {
        super(PhysEntity);
        this.pos = pos;
        this.vel = new Vector();
        this.angle = 0;
        this.angleVel = 0;
        this.zoom = 1;
        this.zoomVel = 0;
        this.target = undefined;
    };
    updatePhysics (delta) {
        let move = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveDown') - input.getBindState('moveUp'));
        move.angle = move.rotate(0 - this.angle).angle;
        move.scaler = (1/10) / this.zoom * delta;

        this.vel = this.vel.translate(move);
        this.angleVel += (1/3000) * (input.getBindState('rotateClock') - input.getBindState('rotateCounter')) * delta;
        this.zoomVel += (1/4000) * this.zoom * (input.getBindState('zoomIn') - input.getBindState('zoomOut')) * delta;

        if(this.target != undefined) {
            this.pos = this.target.pos.flipY();
        };

        this.pos = this.pos.translate(this.vel.scale(delta));
        this.angle = this.angle + this.angleVel * delta;
        this.zoom = Math.max(this.zoom + this.zoomVel * delta, 0.001);

        this.vel = this.vel.scale(0.9 ** delta);
        this.angleVel = this.angleVel * 0.8 ** delta;
        this.zoomVel = this.zoomVel * 0.9 ** delta;
    };
    isEntityVisible (entity) {
        let pos = entity.pos.worldToScreen(this);
        if(Math.abs(pos.x - screen.width/2) - entity.radius * this.zoom < screen.width/2 && Math.abs(pos.y - screen.height/2) - entity.radius * this.zoom < screen.height/2) {
            return true;
        };
        return false;
    };
};