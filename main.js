var audio_context = window.AudioContext || window.webkitAudioContext;
var con = new audio_context();
var hat;
var snare;
var kick;
var kick2;
var lastVolume;
var muted = false;

var seq = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

var step = 0;
var interval = 0.125;
var matrix;
//var metro;

nx.onload = function () {
    speed.on('*', speedChanged);
    volume.on('*', volumeChanged);
    volumeValue = 0.80;
    speedValue = 0.30;
    
    volume.val.value = volumeValue;
    speed.val.value = speedValue;
    volume.draw();
    speed.draw();
    
    matrix.col = seq[0].length;
    matrix.row = seq.length;
    matrix.init();

    matrix.on('*', function (data) {
        if (data.row !== undefined) {
            seq[data.row][data.col] = data.level;
        }
    });
};

var volumeValue=0.0;
var speedValue=0.0;


loadSample('hihat.wav', function (buffer) {
    hat = buffer;
});
loadSample('rim.wav', function (buffer) {
    snare = buffer;
});
loadSample('kick1.wav', function (buffer) {
    kick2 = buffer;
});
loadSample('kick2.wav', function (buffer) {
    kick = buffer;
});


function reset() {
    seq = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    for (var r = 0; r < matrix.row; r++) {
        for (var c = 0; c < matrix.col; c++) {
            matrix.setCell(c, r, false);
        }
    }
    matrix.init();
}

function playSound(buffer, time, vol) {
    var player = con.createBufferSource();
    var amp = con.createGain();
    amp.gain.value = vol;
    player.buffer = buffer;
    player.loop = false;
    player.connect(amp);
    amp.connect(con.destination);
    player.start(time);
/*    if (metro.beat === 1){
        metro.beat = 0;
    }else{
        metro.beat = 1;
    }
    */
}


// this code will wake up every (wait_time) ms 
// and schedule a load of drum triggers on the clock
// each time, remembering where it scheduled to in the future
// so it does not repeat anything
var wait_time = 0.25;
var got_up_to;
setInterval(function () {
    var now = con.currentTime;

    matrix.jumpToCol(step % seq[0].length);

    // how far into the future will we schedule? 
    // we schedule beyond the next wait time as we cannot 
    // rely on it being exactly 'wait_time' ms before 
    // we get woken up again, therefore put in a few
    // extra events on the scheduler to cover any delays
    var max_future_time = now + (wait_time * 1.5);
    if (got_up_to > now) { // already scheduled up to this point
        now = got_up_to;
    }

    while (now <= max_future_time) {
        step++;
        if (seq[0][step % seq[0].length]) {
            playSound(hat, now, volumeValue);
        }

        if (seq[1][step % seq[1].length]) {
            playSound(snare, now, volumeValue);
        }
        if (seq[2][step % seq[2].length]) {
            playSound(kick, now, volumeValue);
        }
        if (seq[3][step % seq[3].length]) {
            playSound(kick2, now, volumeValue);
        }

        now += interval;
    }
    got_up_to = now;

}, wait_time * 1000);


function loadSample(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        var audioData = request.response;
        con.decodeAudioData(audioData, function (buffer) {
            console.log(buffer);
            callback(buffer);
        });
    };
    request.send();
}


function randomizer()
{
    var zeroOrOne = false;
    var randomNumber = 0;
    for (var r = 0; r < matrix.row; r++) {
        for (var c = 0; c < matrix.col; c++) {
            randomNumber = Math.random();
            
            if (randomNumber > .5)
            {
                zeroOrOne = true; 
            }else{
                    zeroOrOne = false;
            }
            matrix.setCell(c, r, zeroOrOne);
            
        }
    }
    matrix.init();
    
}



function speedChanged(data)
{
    if (data.value > 0.1){
       interval = data.value;    
    } else {
       interval = 0.1;
    }     
    
}

function mute(){
    if (muted === false){
        lastVolume = volumeValue;
        volumeValue = 0;
        volume.val.value = volumeValue;
        volume.draw();
        muted = true;
        this.value = "UNMUTE";
    }else{
        volumeValue = lastVolume;
        volume.val.value = volumeValue;
        volume.draw();
        muted = false;
        this.value = "MUTE";
    }    

}



function volumeChanged(data)
{
    volumeValue = data.value;
    
}