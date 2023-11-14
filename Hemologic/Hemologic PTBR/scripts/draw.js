class draw {
    static width = 1;
    static color = 'black';
    static font = '"Lucida Console", "Courier New", monospace'
    static clear() {
        ctx.clearRect(0, 0, screen.width, screen.height);
        //ctx.beginPath();
    };
    static circle(vector, radius) {
        ctx.arc(vector.x, vector.y, radius, 0, Math.PI*2);
    };
    static circleStroke(vector, radius) {
        ctx.lineWidth = draw.width;
        ctx.strokeStyle = draw.color;
        ctx.beginPath();
        draw.circle(vector, radius);
        ctx.stroke()
    };
    static circleFill(vector, radius) {
        ctx.fillStyle = draw.color;
        ctx.beginPath();
        draw.circle(vector, radius);
        ctx.fill();
    };
    static line(vectorStart, vectorEnd) {
        ctx.moveTo(vectorStart.x, vectorStart.y);
        ctx.lineTo(vectorEnd.x, vectorEnd.y);
    };
    static lineStroke(vectorStart, vectorEnd, cap=false) {
        ctx.lineWidth = draw.width;
        ctx.strokeStyle = draw.color;
        ctx.beginPath();
        draw.line(vectorStart, vectorEnd);
        ctx.stroke();
        if(cap) {
            draw.circleFill(vectorStart, draw.width/2);
            draw.circleFill(vectorEnd, draw.width/2);
        };
    };
    static fillText(text, size, align, vector) {
        ctx.beginPath();
        ctx.fillStyle = draw.color;
        ctx.font = (size || 24) + 'px ' + draw.font;
        ctx.textAlign = align || 'left';
        ctx.fillText(text, vector.x, vector.y);
    };
};