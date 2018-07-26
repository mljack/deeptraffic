var ghostColor = "undefined" != typeof colorScheme && null != colorScheme ? colorScheme : "#FF0000"
  , showFullMap = !1
  , showSafetySystem = !1
  , showInput = !1;
"undefined" == typeof headless && (headless = !1);
var n = [0, 1, 2, 3, 4];
function RandomGenerator(a) {
    this.g = a % 2147483647;
    0 >= this.g && (this.g += 2147483646)
}
RandomGenerator.prototype = {
    next: function() {
        return this.g = 16807 * this.g % 2147483647
    }
};
function rand(a) {
    return (a.next() - 1) / 2147483646
}
var seedA = 1
  , seedB = 1
  , genA = new RandomGenerator(seedA)
  , genB = new RandomGenerator(seedB);
"undefined" === typeof otherAgents && (otherAgents = 0);
nOtherAgents = Math.min(otherAgents, 9);
var w = !1;
function x(a) {
    var b;
    var d = Array.isArray(a) ? [] : {};
    for (b in a) {
        var c = a[b];
        d[b] = "object" === typeof c ? x(c) : c
    }
    return d
}
function cloneAgents() {
    var a = nOtherAgents
      , b = vehicles;
    console.log("cloning");
    for (var d = [], c = 0; c < a; c++)
        d.push(x(brain));
    for (c = 0; 20 > c; c++)
        b[c].isControlledAgent = !1;
    for (c = 0; c < a; c++)
        b[c + 1].isControlledAgent = !0;
    b[0].isControlledAgent = !0;
    return d
}
function A(a) {
    var b = "var tmpLearn = " + learn.toString();
    b = b.replace(/brain.backward\(lastReward\);/g, "");
    b = b.replace(/draw_net\(\);/g, "");
    b = b.replace(/draw_stats\(\);/g, "");
    return b.replace(/brain/g, "brains[" + (a - 1) + "]")
}
function Map(a, b, d) {
    this.data = [];
    this.defaultValue = d;
    for (var c = 0; c < a; c++) {
        for (var f = [], l = 0; l < b; l++)
            f.push(d);
        this.data.push(f)
    }
    this.reset = function() {
        for (var a = 0; a < this.data.length; a++)
            for (var b = 0; b < this.data[a].length; b++)
                this.data[a][b] = this.defaultValue
    }
    ;
    this.set = function(x, y, value) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (0 <= x && x < this.data.length && 0 <= y && y < this.data[x].length)
            this.data[x][y] = value;
    }
    ;
    this.get = function(x, y, defaultValue) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (0 <= x && x < this.data.length && 0 <= y && y < this.data[x].length)
            return this.data[x][y];
        else if ("undefined" == typeof defaultValue)
            return this.defaultValue;
        else
            return defaultValue;
    }
    ;
    this.sense = function(id, input) {
        var c = lanesSide
          , d = patchesAhead
          , f = patchesBehind;
        if (id == 0)
            C = vehicles[0].gridX;
        for (var offsetX = -c; offsetX <= c; offsetX++)
            for (var offsetY = -d; offsetY < f; offsetY++)
                input.data[offsetX + c][offsetY + d] = this.get(vehicles[id].gridX + offsetX, Math.floor(vehicles[id].y) / 10 + offsetY, 0)
    }
    ;
    this.flat = function() {
        for (var a = Array(this.data.length * this.data[0].length), b = 0; b < this.data.length; b++)
            for (var c = 0; c < this.data[b].length; c++)
                a[this.data.length * c + b] = this.data[b][c] / 100;
        return a
    }
}
function Vehicle() {
    this.y = this.x = this.reward = this.action = 0;
    this.actionSeq = [];
    this.actionSeqId = 0;
    this.accumulatedReward = 0;
    this.speedFactor = this.followingSpeed = 2;
    this.gridX = 0;
    this.speedHistory = Array(60);
    this.randomSpawn = function() {
        var locX = Math.floor(140 * rand(genB) / 20);
        this.x = 20 * locX + 4;
        switch (locX) {
        case 5 < locX:
            gasPedalModulator = function() {return .5 * rand(genB)}; break;
        case 3 < locX:
            gasPedalModulator = function() {return .5 * rand(genB) + .3}; break;
        case 5 < locX:
            gasPedalModulator = function() {return .5 * rand(genB) + .4}; break;
        case 6 == locX:
            gasPedalModulator = function() {return .6 * rand(genB) + .4}; break;
        default:
            gasPedalModulator = function() {return .5 * rand(genB)}
        }

        if (!this.isControlledAgent)
            // random accelerate/brake for NPC vehicles
            this.speedFactor = 1 + .7 * gasPedalModulator();
        this.gridX = locX;
    }
    ;
    this.randomSpawn();
    this.y = 10 * Math.floor(700 * Math.random() / 10);
    this.move = function(a) {
        var newY = this.y - (this.followingSpeed * this.speedFactor - E);

        // count passed vehicles
        if (a && 525 > this.y && 525 <= newY) {
            passed++;
            vehicles[0].reward += 1.0;
            if (!headless) {
                document.getElementById("passed").innerText = passed;
            }
        }
        else if (a && 525 < this.y && 525 >= newY) {
            passed--;
            vehicles[0].reward -= 1.0;
            if (!headless) {
                document.getElementById("passed").innerText = passed;
            }
        }
        if (!headless) {
            document.getElementById("frame").innerText = gFrameCount;
        }
    
        this.y = newY;
        this.speedHistory[gFrameCount % this.speedHistory.length] = this.followingSpeed * this.speedFactor * 20;

        // lateral movement (apply max lateral speed)
        deltaX = 20 * this.gridX + 4 - this.x;
        if (Math.abs(deltaX) < 20 / 30)
             this.x = 20 * this.gridX + 4
        else if (deltaX > 0)
            this.x += 20 / 30
        else // deltaX < 0
            this.x -= 20 / 30;
        
        // looping the road for NPC vehicles
        if (0 > this.y + 68) {
            this.y = 734;
            this.randomSpawn();
        }
        if (700 < this.y - 68) {
            this.y = -34;
            this.randomSpawn();
        }
    }
    ;
    this.isControlledAgent = !1;
    this.updateFullMap = function() {
        for (var a = 0; 15 > a; a += 10)
            for (var b = 0; 34 > b; b += 5)
                fullMap.set((this.x + a) / 20, (this.y + b) / 10, 1 * this.followingSpeed * this.speedFactor)
    }
    ;
    this.followLeader = function() {
        var v = 2;
        for (var distance = 1; distance < 5; distance++) {
            var speed = fullMap.get((this.x + 7.5) / 20, (this.y - 10 * distance) / 10, 100);
            if (speed < 100) {
                v = Math.min(v, .5 * (distance - 1));
                v = Math.min(v, speed / this.speedFactor);
            }
        }
        this.followingSpeed = v;
    }
    ;
    this.followLeaderEgo = function() {
        var v = 2;
        var oldFollowSpeed = this.followingSpeed;
        for (var distance = 1; distance < 5; distance++) {
            var speed = fullMap.get((this.x + 7.5) / 20, (this.y - 10 * distance) / 10, 100);
            if (speed < 100) {
                v = Math.min(v, .5 * (distance - 1));
                v = Math.min(v, speed / this.speedFactor);
            }
        }
        this.followingSpeed = v < this.followingSpeed ? v : this.followingSpeed;
        if (!headless) {
            document.getElementById("followingSpeed").innerText = this.followingSpeed.toFixed(3);
        }
    }
    ;
    this.turn = function(direction) {
        // apply safety system
        var allowed = Math.abs(this.x - (20 * this.gridX + 4)) < 0.5;
        for (var xx = (this.x + 7.5) / 20 + direction, yy = this.y / 10, offsetY = -3 * this.speedFactor; offsetY < 4; offsetY++)
            allowed = (allowed && fullMap.get(xx, yy + offsetY, 0) >= 100);

        if (allowed)
            this.gridX += direction;
        return allowed;
    }
    ;
    this.updateSafety = function() {
        // accelerate
        for (var a = !0, b = 1; 5 > b; b++)
            a = a && 100 <= fullMap.get((this.x + 7.5) / 20, (this.y - 10 * b) / 10, a ? 0 : 2);
        for (b = 1; 5 > b; b++)
            safety.set((this.x + 7.5) / 20, (this.y - 10 * b) / 10, a ? 0 : 2);
            
        var d = this.y / 10;

        // turn left
        b = (this.x + 7.5) / 20 + -1;
        a = .5 > Math.abs(this.x - (20 * this.gridX + 4));
        for (var c = 3 * -this.speedFactor; 4 > c; c++)
            a = a && 100 <= fullMap.get(b, d + c, 0);
        for (c = 3 * -this.speedFactor; 4 > c; c++)
            safety.set(b, d + c, a ? 0 : vehicles[0].action==3 ? 4 : 2);

        // turn right
        b = (this.x + 7.5) / 20 + 1;
        a = .5 > Math.abs(this.x - (20 * this.gridX + 4));
        for (c = 3 * -this.speedFactor; 4 > c; c++)
            a = a && 100 <= fullMap.get(b, d + c, 0);
        for (c = 3 * -this.speedFactor; 4 > c; c++)
            safety.set(b, d + c, a ? 0 : vehicles[0].action==4 ? 4 : 2);
    }
    ;
    this.updateHUD = function() {
        if (!headless && this == vehicles[0]) {
            document.getElementById("speedFactor").innerText = this.speedFactor.toFixed(3);
        }
    }
    ;
    this.execute = function(action) {
        switch (action) {
        case 1:
            if (this.followingSpeed < 2) {
                this.followingSpeed += 0.02;
            }
            else
                ;//this.reward -= 0.02;
            break;
        case 2:
            if (this.followingSpeed > 0) {
                this.followingSpeed -= 0.01;
            }
            else
                ;//this.reward -= 0.02;
            break;
        case 3:
            if (this.turn(-1)) {
                this.action = 0;
                manualAction = 0;
            }
            else
                ;//this.reward -= 0.01;
            break;
        case 4:
            if (this.turn(1)) {
                this.action = 0;
                manualAction = 0;
            }
            else if (this == vehicles[0])
                ;//this.reward -= 0.01;
        }
        this.updateHUD();
    }
    ;
    this.getRecentAvgSpeed = function() {
        for (var a = 0, b = 0; b < this.speedHistory.length; b++)
            a += this.speedHistory[b];
        //return Math.floor(a / this.speedHistory.length);
        return this.speedHistory[this.speedHistory.length-1];
    }
}
for (var fullMap = new Map(7,70,100), safety = new Map(7,70,100), input = new Map(1 + 2 * lanesSide,patchesAhead + patchesBehind,0), C = 0, vehicles = [], L = 0; 20 > L; L++)
    vehicles.push(new Vehicle);
var brains = cloneAgents()
  , gFrameCount = 0
  , E = 1.5
  , M = 0
  , avgSpeedInMPH = 0
  , manualAction = 0
  , passed = 0
  , fast = !1;
initializeMap = function(gen) {
    function b(b) {
        var c = Math.floor(b.length * rand(gen));
        return b[c]
    }
    function d(x, y) {
        for (var c = Array(12), d = 0, f, g = -4; g < 12; g++) {
            if (y + g >= 0) {
                f = 7 * (y + g) + x % 7;
                c[d] = f;
                d += 1;
            }
        }
        return c
    }
    vehicles[0].y = 525;
    vehicles[0].x = 64;
    vehicles[0].gridX = 3;
    legalLocations = Array(490).fill().map(function(a, b) {
        return b
    });
    var xx = Math.floor(vehicles[0].x / 20)
    var yy = Math.floor(vehicles[0].y / 10 + 4)
    var loc = d(xx, yy);
    for (var h = 0; h < loc.length; h++)
        legalLocations.splice(legalLocations.indexOf(loc[h]), 1);
    for (var g = 1; g < vehicles.length; g++) {
        xx = b(legalLocations);
        yy = Math.floor(xx / 7);
        xx %= 7;
        l = d(xx, yy);
        for (h = 0; h < loc.length; h++)
            legalLocations.splice(legalLocations.indexOf(loc[h]), 1);
        vehicles[g].x = Math.floor(20 * xx + 4);
        vehicles[g].y = Math.floor(yy / 70 * 700);
        vehicles[g].gridX = xx;
        if (vehicles[g].isControlledAgent)
            vehicles[g].speedFactor = 1.7;
    }
    vehicles[0].speedFactor = 2
}
;
reset = function() {
    nOtherAgents != Math.min(otherAgents, 10) && (nOtherAgents = Math.min(otherAgents, 10),
    brains = cloneAgents(),
    w = !1);
    fullMap = new Map(7,70,100);
    safety = new Map(7,70,100);
    input = new Map(1 + 2 * lanesSide,patchesAhead + patchesBehind,0);
    vehicles = [];
    for (var a = 0; 20 > a; a++) {
        vehicles.push(new Vehicle);
        if (a < nOtherAgents + 1)
            vehicles[a].isControlledAgent = !0;
    }
    seedA += 1;
    seedB += 1;
    genA = new RandomGenerator(seedA);
    genB = new RandomGenerator(seedB);
    initializeMap(genA);
    gFrameCount = 0;
    E = 1.5;
    passed = manualAction = avgSpeedInMPH = M = 0
}
;
setFast = function(b) {
    fast = b
}
;
function keyboardHander(event, released) {
    var action = 0;
    if (3 == manualAction || 4 == manualAction)
        action = manualAction;
    switch (event.keyCode) {
    case 38:    // up
    case 104:   // numpad 8
        event.preventDefault();
        action = 1;
        break;
    case 40:    // down
    case 101:   // numpad 5
        event.preventDefault(),
        action = 2
        break;
    case 37:    // left
    case 100:   // numpad 4
        event.preventDefault();
        action = 3;
        break;
    case 39:    // right
    case 102:   // numpad 6
        event.preventDefault();
        action = 4;
        break;
    case 97:    // numpad 1
        event.preventDefault();
        action = 5;
        break;
    case 99:    // numpad 3
        event.preventDefault();
        action = 6;
        break;
    }
    if (released)
        manualAction = action;
}
if (!headless) {
    document.addEventListener("keyup", function(a) {
        keyboardHander(a, !1)
    });
    document.addEventListener("keydown", function(a) {
        keyboardHander(a, !0)
    });
}
setDrawingStyle = function(a) {
    showInput = showSafetySystem = showFullMap = !1;
    switch (a.value) {
    case "cutout":
        showInput = !0;
        break;
    case "safety":
        showSafetySystem = !0;
        break;
    case "full":
        showFullMap = !0
    }
}
;
var S = Array(100)
  , T = null;
function draw() {
    var canvas = document.getElementById("canvas").getContext("2d");
    canvas.globalCompositeOperation = "destination-over";
    canvas.clearRect(-30, 0, 1E3, 1E3);
    var imgV = document.getElementById("vehicle");
    var imgNPC = document.getElementById("whiteCarSmall");
    for (c = 1; c < nOtherAgents + 1; c++)
        canvas.drawImage(imgV, vehicles[c].x, vehicles[c].y, 15, 34);
    for (c = nOtherAgents + 1; c < vehicles.length; c++)
        canvas.drawImage(imgNPC, vehicles[c].x, vehicles[c].y, 15, 34);
    canvas.drawImage(imgV, vehicles[0].x, vehicles[0].y, 15, 34);

    // draw the recent trajectory of main vehicle
    if (null !== T) {
        for (b = S.length - 1; 0 <= b; b--) {
            d = (b + T) % S.length;
            if (void 0 === S[d])
                break;
            S[d].y += vehicles[0].followingSpeed;
            d = S[d];
            canvas.globalAlpha = Math.min(.1, Math.pow(b / S.length, 5));
            0 == b % 1 && (canvas.beginPath(),
            canvas.arc(d.x + 7.5, d.y + 20, 5, 0, 2 * Math.PI, !1),
            canvas.fillStyle = ghostColor,
            canvas.fill())
        }
        T = (T + 1) % S.length
    } else
        T = 0;
    S[T] = {
        x: vehicles[0].x,
        y: vehicles[0].y
    };
    canvas.globalAlpha = 1;
    canvas.fillStyle = "rgba(120,120,120,0.4)";
    canvas.fillRect(140, 0, 2, 1000);
    canvas.fillRect(1, 0, 2, 1000);
    M += E;
    M %= 20;

    // road line
    for (c = 1; 7 > c; c++)
        for (b = 0; 36 > b; b++)
            canvas.fillRect(20 * c, 20 * b + 2 + M - 10, 2, 8);
            
    if (showFullMap)
        for (c = 0; c < fullMap.data.length; c++)
            for (b = 0; b < fullMap.data[c].length; b++)
                d = fullMap.get(c, b, 0),
                canvas.fillStyle = 0 < d ? "rgba(250,120,0," + d / 100 + ")" : "rgba(0,120,250," + -d / 100 + ")",
                canvas.fillRect(20 * c + 2, 10 * b + 2, 18, 8);
    if (showSafetySystem)
        for (c = 0; c < fullMap.data.length; c++)
            for (b = 0; b < fullMap.data[c].length; b++) {
                d = safety.get(c, b, 100);
                if (0 == d) {
                    canvas.fillStyle = "rgba(250,120,0,0.5)";
                    canvas.fillRect(20 * c + 2, 10 * b + 2, 18, 8);
                }
                else if (2 == d) {
                    canvas.fillStyle = "rgba(250,0,0,0.5)";
                    canvas.fillRect(20 * c + 2, 10 * b + 2, 18, 8);
                }
                else if (4 == d) {
                    canvas.fillStyle = "rgba(250,0,250,0.8)";
                    canvas.fillRect(20 * c + 2, 10 * b + 2, 18, 8);
                }
            }
    if (showInput)
        for (c = -lanesSide; c <= lanesSide; c++)
            for (b = -patchesAhead; b < patchesBehind; b++)
                d = input.get(c + lanesSide, b + patchesAhead, 0),
                canvas.fillStyle = 100 < d ? "rgba(120,250,120," + (d / 10 / 103 + .1) + ")" : 0 < d ? "rgba(250,120,0," + (d / 101 + .1) + ")" : "rgba(0,120,250," + (-d / 101 + .1) + ")",
                canvas.fillRect(20 * Math.floor(C + c) + 2, 10 * Math.floor(52.5 + b) + 2, 18, 8);
    canvas.save();
    canvas.restore()
}
function stepFrame() {
    !w && void 0 !== brain.forward_passes && brain.forward_passes > brain.temporal_window && (brains = cloneAgents(),
    w = !0);
    fullMap.reset();
    for (var a = 0; a < vehicles.length; a++) {
        vehicles[a].move(0 != a, a);
        vehicles[a].updateFullMap();
    }
    E = 1.5 - (vehicles[0].y - 525);

    vehicles[0].followLeaderEgo();
    for (i = 1; i < vehicles.length; i++) {
        vehicles[i].followLeader();
        if (i > nOtherAgents && rand(genB) > .99 + .004 * vehicles[i].followingSpeed) {
            // NPC vehicles occasionally turn left or right.
            var action = rand(genB) > 0.5 ? -1 : 1;
            vehicles[i].turn(action)
        }
    }

    // control other agents
    for (i = 1; i <= nOtherAgents; i++) {
        if (gFrameCount % 30 == 3 * i) {
            var input2 = new Map(1 + 2 * lanesSide,patchesAhead + patchesBehind,0);
            fullMap.sense(i, input2);
            eval(A(i));
            action = tmpLearn(input2.flat());
            if (action < 0 || action >= n.length)
                action = manualAction;
        }
        vehicles[i].execute(action);
    }

    vehicles[0].updateFullMap();
    if (showSafetySystem) {
        safety.reset();
        vehicles[0].updateSafety();
    }

    // control the main vehicle agent
    //var myAction;
    avgSpeedInMPH += vehicles[0].followingSpeed * vehicles[0].speedFactor;
    if (0 == gFrameCount % 30) {
        fullMap.sense(0, input);
        //var reward = (avgSpeedInMPH - 60) / 20;
        //var reward = (avgSpeedInMPH * 30) / 40;
        var reward = vehicles[0].reward;
        //var reward = (avgSpeedInMPH - 40) / 20;
        
        if (vehicles[0].actionSeqId == 0) {
            reward += vehicles[0].accumulatedReward;
            action = learn(input.flat(), reward);
            if (action < 0 || action >= n.length)
                action = manualAction;
            if (manualAction != 0)
                action = manualAction;
            if (!headless) {
                document.getElementById("reward").innerText = reward.toFixed(3)+(vehicles[0].accumulatedReward == 0 ? "" : " !");
            }
            vehicles[0].accumulatedReward = 0;
            vehicles[0].reward = 0;
        }
        else {
            vehicles[0].accumulatedReward += reward;
            vehicles[0].reward = 0;
            if (!headless) {
                document.getElementById("reward").innerText = reward.toFixed(3) +"+";
            }
        }
       
        // action sequence
        if (manualAction == 5) {
            manualAction = 0;
            vehicles[0].actionSeq = [2,2,1,3,3,1,1,1,1];
            vehicles[0].actionSeqId = 5;
        }
        if (vehicles[0].actionSeq.length > 0) {
            vehicles[0].action = vehicles[0].actionSeq.shift();
        }
        else {
            vehicles[0].actionSeqId = 0;
            vehicles[0].action = action;
        }
        //myAction = vehicles[0].action;

        avgSpeedInMPH = 0;
        if (!headless) {
            switch (vehicles[0].action) {
                case 1:
                    s = "/\\";
                    break;
                case 2:
                    s = "\\/";
                    break;
                case 3:
                    s = "<<";
                    break;
                case 4:
                    s = ">>";
                    break;
                default:
                    s = "--";
            }
            if (manualAction != 0)
                s += " M";
            if (vehicles[0].actionSeqId > 0)
                s += " S" + vehicles[0].actionSeqId + "["+ vehicles[0].actionSeq.length + "]";
            //manualAction = 0;
            
            document.getElementById("action").innerText = s;
        }
    }

    vehicles[0].execute(vehicles[0].action);
    //vehicles[0].execute(myAction);

    gFrameCount++;
    if (0 == gFrameCount % 10000)
        console.log(gFrameCount);

    if (!headless) {
        if (gFrameCount % 30) {
            mph = vehicles[0].getRecentAvgSpeed();
            if (!isNaN(mph))
                document.getElementById("mph").innerText = Math.max(0, mph).toFixed(3);
            draw();
        }
    }
}
evalRun = !1;
doEvalRun = function(numRuns, framesPerRun, useFixedSeed, callback, f) {
    if (!0 === useFixedSeed) {
        if ("undefined" != typeof brain)
            brain.reset_seed(0);
        t = r = 0;
        for (d = 0; d < brains.length; d++)
            brains[d].reset_seed(0);
    }
    else {
        if ("undefined" != typeof brain)
            brain.reset_seed(Math.floor(1E7 * Math.random()));
        for (d = 0; d < brains.length; d++)
            brains[d].reset_seed(Math.floor(1E7 * Math.random()));
        r = Math.floor(1E7 * Math.random());
        t = Math.floor(1E7 * Math.random())
    }
    d = NaN;
    if ("undefined" != typeof callback)
        d = f;
    headless = !0;
    var l = fast;
    evalRun = fast = !0;
    avgSpeeds = [];
    for (var frameCount = 0, g = 0; g < numRuns; g++) {
        console.log("run: " + (g + 1) + "/" + numRuns);
        reset();
        for (var avgSpeed = 0, i = 0; i < framesPerRun; i++) {
            if (0 == frameCount % d)
                callback();
            stepFrame();
            for (var j = 0; j < nOtherAgents + 1; j++)
                avgSpeed += Math.max(0, vehicles[j].followingSpeed * vehicles[j].speedFactor) / (nOtherAgents + 1);
            frameCount++;
        }
        avgSpeeds.push(Math.floor(avgSpeed / framesPerRun * 2000) / 100)
    }
    reset();
    fast = l;
    evalRun = headless = !1;
    avgSpeeds.sort();
    console.log(avgSpeeds);
    for (c = v = 0; c < avgSpeeds.length; c++)
        v += avgSpeeds[c];
    console.log("avg: " + v / numRuns + " median: " + avgSpeeds[numRuns / 2]);
    return avgSpeeds[numRuns / 2]
}
;
initializeMap(genA);
function redraw() {
    stepFrame();
    fast ? setTimeout(redraw, 0) : window.requestAnimationFrame(redraw)
}
headless || (document.getElementById("canvas").getContext("2d").scale(2, 2),
document.getElementById("canvas").getContext("2d").translate(30, 0),
redraw());
