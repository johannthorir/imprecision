
// Normal distribution generator.
function Normal(mean, stdev) {
    let y2;
    let use_last = false;

    return function() {
        let y1;
        if(use_last) {
            y1 = y2;
            use_last = false;
        } 
        else {
            let x1;
            let x2;
            let w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while(w >= 1.0);

            w = Math.sqrt( (-2.0 * Math.log(w) ) / w );
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }
        return mean + stdev * y1;
    }
}


// calculate the statistics for the group
function calculateStats(shots) {
    let avg = new shot(0,0);
    let min = new shot(0,0);
    let max = new shot(0,0);
    let M = new shot(shots[0].x, shots[0].y);
    let Q = new shot(0,0);
    for(let i=0; i<shots.length; i++) {
        let s = shots[i];
        avg.x += s.x / shots.length;
        avg.y += s.y / shots.length;
        Q.x = Q.x + (i * (s.x - M.x)*(s.x - M.x))/(i+1);
        Q.y = Q.y + (i * (s.y - M.y)*(s.y - M.y))/(i+1);
        M.x = M.x + (s.x - M.x)/(i+1)
        M.y = M.y + (s.y - M.y)/(i+1)

        if(s.x < min.x) min.x = s.x;
        if(s.x > max.x) max.x = s.x;
        if(s.y < min.y) min.y = s.y;
        if(s.y > max.y) max.y = s.y;
    }
    
    if(shots.length > 1) {
        Q.x = Math.sqrt(Q.x/(shots.length-1));
        Q.y = Math.sqrt(Q.y/(shots.length-1));
    }
    else {
        Q.x = 0;
        Q.y = 0;
    }

    let from = 0;
    let to = 0;
    let maxdist = 0;
    for(let i=0; i<(shots.length-1); i++) {
        for(let j=i+1; j<shots.length; j++) {
            let d = shots[i].distance(shots[j]);
            if(d > maxdist) {
                maxdist = d;
                from = i;
                to   = j;
            }
        }
    }

    let atc = shots.reduce((total, shot) => { return total + shot.distance(avg)}, 0) / shots.length;
    return {
        average         : avg,
        maxfrom         : shots[from],
        maxto           : shots[to],
        averageToCenter : atc,
        min             : min,
        max             : max, 
        stdev           : Q,
        sizex           : max.x - min.x,
        sizey           : max.y - min.y
    }
}

var shots = [];
var tgt = null;


function refreshGraphics() {
    if(tgt == null) tgt = new TargetGraphic('target');
    tgt.setGridSize(14);
    tgt.setScale(4);
    tgt.setCenter(300.5, 300.5);
    tgt.makeTarget();
    let prob  = parseFloat(document.getElementById('prob-select').value);
    let sigma = parseFloat(document.getElementById('sigma').value);
    tgt.showOverlay = document.getElementById('show-stats').checked;

    if(document.getElementById('show-atc').checked)  tgt.drawATC(sigma);
    if(document.getElementById('show-probs').checked) tgt.drawProbabilities(sigma, prob)

    for(var i=0; i<shots.length; i++) tgt.drawBulletHole(shots[i].x, shots[i].y);
    let stats = calculateStats(shots);
    document.getElementById("max").innerText = `${stats.maxfrom.distance(stats.maxto).toFixed(0)} mm`;
    document.getElementById("atc").innerText = `${stats.averageToCenter.toFixed(1)} mm`;
    document.getElementById("width").innerText = `${stats.sizex.toFixed(0)} mm`;
    document.getElementById("height").innerText = `${stats.sizey.toFixed(0)} mm`;
    document.getElementById("vert").innerText = `${(stats.average.y).toFixed(0)} mm`;
    document.getElementById("horiz").innerText = `${stats.average.x.toFixed(0)} mm`;
    document.getElementById("estimated-sigma").innerText = `${(0.5*(stats.stdev.x + stats.stdev.y)).toFixed(0)} mm`;        
    
    tgt.drawStats(stats); 
}

// Generate a group
function generateNewGroup() {
    let count = parseInt(document.getElementById('group').value);
    let sigma = parseFloat(document.getElementById('sigma').value);
    
    var xvar = Normal(0, sigma);
    var yvar = Normal(0, sigma);
    shots = [];
    for(var i=0; i<count; i++) shots[i] = new shot(xvar(), yvar());
    
    refreshGraphics();
}

window.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById('draw-group' ).addEventListener('click', generateNewGroup);
    document.getElementById('show-atc'   ).addEventListener('change', refreshGraphics);
    document.getElementById('show-stats' ).addEventListener('change', refreshGraphics);
    document.getElementById('show-probs' ).addEventListener('change', refreshGraphics);
    document.getElementById('prob-select').addEventListener('change', refreshGraphics);
    document.getElementById('sigma'      ).addEventListener('change', refreshGraphics);
    generateNewGroup();
});
