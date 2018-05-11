'use strict'

///////////////////////////////////////////////////////////////////////////////////////
// shot object.
class shot {
    constructor(x, y) {
        this.x = x;
        this.y = y;

    }

    distance(other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}

///////////////////////////////////////////////////////////////////////////////////////
//
class TargetGraphic {
    constructor(element) {
        this.target = document.getElementById(element);
        this.ctx = this.target.getContext('2d');
        this.bulletSize = 6.0; // mm
    }
    set showOverlay(show) { this._showOverlay = show; }
    get showOverlay() { return this._showOverlay; }

    radiusFromProbability(probability) {
        return Math.sqrt(-2 * Math.log(1 - probability))
    }

    clear() { this.ctx.clearRect(0, 0, this.target.width, this.target.height); }
    
    drawGrid() {
        
        this.ctx.strokeStyle = '#0A50A1';
        this.ctx.lineWidth = 0.5;
        
        let grid = this.gridSize * this.scale;

        // draws fine line grid.
        this.ctx.beginPath();
        for(let i=-5; i<=5; i++) {
            this.ctx.moveTo(this.cx - 5*grid, this.cy + i*grid);
            this.ctx.lineTo(this.cx + 5*grid, this.cy + i*grid);
    
            this.ctx.moveTo(this.cx + i*grid, this.cy - 5*grid);
            this.ctx.lineTo(this.cx + i*grid, this.cy + 5*grid);
        }
        this.ctx.stroke();
    }

    drawCenter(fillStyle, size) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        this.ctx.moveTo(this.cx,        this.cy - size);
        this.ctx.lineTo(this.cx + size, this.cy       );
        this.ctx.lineTo(this.cx,        this.cy + size);
        this.ctx.lineTo(this.cx - size, this.cy       );
        this.ctx.lineTo(this.cx,        this.cy - size);
        this.ctx.fill();
    }

    setGridSize(gridSize) { this.gridSize = gridSize; }
    // scale and center should be set from the dimensions of the containing element.
    setScale(scale) { this.scale = scale; }
    setCenter(x, y) { this.cx = x; this.cy = y; }

    makeTarget() {
        this.clear();
        this.drawGrid();
        let grid = this.gridSize * this.scale;
        this.drawCenter('#0A50A1', 2 * grid / Math.sqrt(2));
        this.drawCenter('#FFFFFF', grid/Math.sqrt(2));
    }

    // Draw the probablity circle for the selected probability
    drawProbabilities(sigma, probability) {
        this.ctx.fillStyle="rgba(50,0,0, 0.08)";
        this.ctx.strokeStyle="rgba(50,0,0,0.5)";
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, this.scale * sigma * this.radiusFromProbability(probability), 0, Math.PI*2, true);
        this.ctx.fill();
        this.ctx.stroke();
    }

    // draw a bullet hole
    drawBulletHole(x, y) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.cx + x * this.scale, this.cy + y * this.scale, 0.5 * this.bulletSize * this.scale, 0, Math.PI*2, true)
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.beginPath();
        this.ctx.arc(this.cx + x * this.scale, this.cy + y*this.scale, 0.4 * this.bulletSize * this.scale, 0, Math.PI*2, true)
        this.ctx.fill();
    }

    strokeCircle(x,y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI*2, true); 
        this.ctx.stroke();
    }

    drawATC(sigma) {
        this.ctx.strokeStyle = "#20FF20";
        this.ctx.lineWidth = 1.0;
        this.strokeCircle(this.cx, this.cy, sigma * 1.253314137 * this.scale);
    }

    // draw the statistics for a group.
    drawStats(stats)  {
        this.ctx.strokeStyle = "#ff8822";
        this.ctx.lineWidth = 1.0;

        let x = this.cx + stats.average.x * this.scale;
        let y = this.cy + stats.average.y * this.scale;
        let sizex = stats.max.x - stats.min.x;
        let sizey = stats.max.y - stats.min.y;
        
        if(this.showOverlay) {
            this.strokeCircle(x, y, stats.averagegToCenter*this.scale);

            this.ctx.beginPath();
            this.ctx.moveTo(x - 3*this.scale, y);
            this.ctx.lineTo(x + 3*this.scale, y);
            this.ctx.moveTo(x, y - 3*this.scale);
            this.ctx.lineTo(x, y + 3*this.scale);

            this.ctx.moveTo(this.cx + stats.maxfrom.x * this.scale, this.cy + stats.maxfrom.y * this.scale);
            this.ctx.lineTo(this.cx + stats.maxto.x * this.scale, this.cy + stats.maxto.y * this.scale);
            this.ctx.rect(this.cx + stats.min.x*this.scale, this.cy + stats.min.y * this.scale, sizex * this.scale, sizey * this.scale);
            this.ctx.stroke();

            this.strokeCircle(this.cx, this.cy, 3*this.scale);
            this.strokeCircle(this.cx, this.xy, 1.5*this.scale);
            
            if(!this.ctx.setLineDash) this.ctx.setLineDash = function () {}

            this.ctx.save();

            this.ctx.beginPath();
            this.ctx.rect(this.cx + stats.min.x*this.scale - 4*this.scale, this.cy + stats.min.y * this.scale - 4*this.scale, sizex * this.scale + 8*this.scale, sizey * this.scale + 8*this.scale);
            this.ctx.setLineDash([2,2]);
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(this.cx ,this.cy);
            this.ctx.stroke();

            this.ctx.restore();
        }
        let line = 60;
        let dy = 22;
        this.ctx.font="11pt sans-serif";
        this.ctx.fillStyle = 'rgba(0,0,0,1)';
        this.ctx.fillText("Max: ",    10, line    ); this.ctx.fillText(Math.round(stats.maxfrom.distance(stats.maxto))  + "mm", 60, line);
        this.ctx.fillText("ATC: ",    10, line+=dy); this.ctx.fillText(Math.round(stats.averageToCenter*10)/10          + "mm", 60, line);
        this.ctx.fillText("Width: ",  10, line+=dy); this.ctx.fillText(Math.round(sizex)                                + "mm", 60, line);
        this.ctx.fillText("Height: ", 10, line+=dy); this.ctx.fillText(Math.round(sizey)                                + "mm", 60, line);
        this.ctx.fillText("Vert:",    10, line+=dy); this.ctx.fillText(Math.round(stats.average.y)                      + "mm", 60, line);
        this.ctx.fillText("Horiz:",   10, line+=dy); this.ctx.fillText(Math.round(stats.average.x)                      + "mm", 60, line);
        this.ctx.fillText("Sigma:",   10, line+=dy); this.ctx.fillText(Math.round(5*(stats.stdev.x + stats.stdev.y))/10 + "mm", 60, line);
    }
}
