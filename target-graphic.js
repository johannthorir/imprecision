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
        this.scale = 4.0;
        this.gridSize = 15.0;
        this.bulletSize = 6.0; // mm
        this.mainColor = '#7080A1';
    }
    set showOverlay(show) { this._showOverlay = show; }
    get showOverlay() { return this._showOverlay; }

    radiusFromProbability(probability) {
        return Math.sqrt(-2 * Math.log(1 - probability))
    }

    clear() { this.ctx.clearRect(0, 0, this.target.width, this.target.height); }
    
    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = this.mainColor;
        this.ctx.translate(this.cx, this.cy);        
        this.ctx.scale(this.scale, this.scale);
        this.ctx.lineWidth = 1.25 / this.scale;
        let grid = 

        // draws fine line grid.
        this.ctx.beginPath();
        for(let i=-5; i<=5; i++) {
            this.ctx.moveTo( 5*this.gridSize, i*this.gridSize);
            this.ctx.lineTo(-5*this.gridSize, i*this.gridSize);
            this.ctx.moveTo( i*this.gridSize,-5*this.gridSize);
            this.ctx.lineTo( i*this.gridSize, 5*this.gridSize);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawCenter(fillStyle, size) {
        this.ctx.save();
        this.ctx.translate(this.cx, this.cy);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.rotate(Math.PI / 4);

        this.ctx.fillStyle = fillStyle;
        
        this.ctx.beginPath();
        this.ctx.rect(-size/2,-size/2,size,size);
        this.ctx.fill();
        this.ctx.restore();
    }

    setGridSize(gridSize) { this.gridSize = gridSize; }
    // scale and center should be set from the dimensions of the containing element.
    setScale(scale) { this.scale = scale; }
    setCenter(x, y) { this.cx = x; this.cy = y; }

    makeTarget() {
        this.clear();
        this.drawGrid();    
        let grid = this.gridSize * this.scale;
        this.drawCenter(this.mainColor, this.gridSize * 2);
        this.drawCenter('#FFFFFF', this.gridSize);
    }

    // Draw the probablity circle for the selected probability
    drawProbabilities(sigma, probability) {
        this.ctx.fillStyle   = "rgba(50,0,0, 0.08)";
        this.ctx.strokeStyle = "rgba(50,0,0,0.5)";
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, this.scale * sigma * this.radiusFromProbability(probability), 0, Math.PI*2, true);
        this.ctx.fill();
        this.ctx.stroke();
    }

    // draw a bullet hole
    drawBulletHole(x, y) {
        this.ctx.save();
        this.ctx.translate(this.cx, this.cy);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 0.5 * this.bulletSize, 0, Math.PI*2, true)
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 0.4 * this.bulletSize, 0, Math.PI*2, true)
        this.ctx.fill();
        this.ctx.restore();
    }

    strokeCircle(x,y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI*2, true); 
        this.ctx.stroke();
    }

    drawATC(sigma) {
        this.ctx.save();
        this.ctx.translate(this.cx, this.cy);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.strokeStyle = "#20FF20";
        this.ctx.lineWidth = 1.0/this.scale;
        this.strokeCircle(0, 0, sigma * 1.253314137);
        this.ctx.restore();
    }

    // draw the statistics for a group.
    drawStats(stats)  {
        this.ctx.save();
        this.ctx.translate(this.cx, this.cy);
        this.ctx.scale(this.scale, this.scale);

        this.ctx.strokeStyle = "#ff8822";
        this.ctx.lineWidth = 1.0 / this.scale;
        
        if(this.showOverlay) {
            this.strokeCircle(stats.average.x, stats.average.y, stats.averageToCenter);

            this.ctx.beginPath();
            this.ctx.moveTo(stats.average.x - this.bulletSize/2, stats.average.y);
            this.ctx.lineTo(stats.average.x + this.bulletSize/2, stats.average.y);
            this.ctx.moveTo(stats.average.x, stats.average.y - this.bulletSize/2);
            this.ctx.lineTo(stats.average.x, stats.average.y + this.bulletSize/2);

            this.ctx.moveTo(stats.maxfrom.x , stats.maxfrom.y);
            this.ctx.lineTo(stats.maxto.x, stats.maxto.y);
            this.ctx.rect(stats.min.x, stats.min.y, stats.sizex, stats.sizey);
            this.ctx.stroke();

            this.strokeCircle(0, 0, 3.0);
            this.strokeCircle(0, 0, 1.5);
            
            if(!this.ctx.setLineDash) this.ctx.setLineDash = function () {}

            this.ctx.save();

            this.ctx.beginPath();
            this.ctx.rect(
                (stats.min.x - this.bulletSize/2), 
                (stats.min.y - this.bulletSize/2), 
                (stats.sizex + this.bulletSize), 
                (stats.sizey + this.bulletSize));
            this.ctx.setLineDash([3/this.scale,3/this.scale]);
            this.ctx.moveTo(stats.average.x, stats.average.y);
            this.ctx.lineTo(0, 0);
            this.ctx.stroke();

            this.ctx.restore();
        }
        this.ctx.restore();
        
     
    }
}
