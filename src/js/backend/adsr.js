import { q, qA } from '../globals.js';

export function ADSR() {
  this.envState = {
    env_idle: 0,
    env_attack: 1,
    env_decay: 2,
    env_sustain: 3,
    env_release: 4,
  };

  this.plotA = [];
  this.plotD = [];
  this.plotR = []; 

  this.state = this.envState.env_idle;
  this.output = 0.0;
  this.attackRate = 0;
  this.decayRate = 0;
  this.releaseRate = 0;
  this.attackCoef = 0.0;
  this.decayCoef = 0.0;
  this.releaseCoef = 0.0;
  this.sustainLevel = 1.0;
  this.targetRatioA = 0.01;
  this.targetRatioDR = 0.0001;
  this.attackBase = (1.0 + this.targetRatioA) * (1.0 - this.attackCoef);
  this.decayBase =
    (this.sustainLevel - this.targetRatioDR) * (1.0 - this.decayCoef);
  this.releaseBase = -this.targetRatioDR * (1.0 - this.releaseCoef);

  this.process = function () {
    switch (this.state) {
      case this.envState.env_idle:
        break;
      case this.envState.env_attack:
        this.output = this.attackBase + this.output * this.attackCoef;
        //console.log(this.output+"="+this.decayBase+"+"+this.output+"*"+this.decayCoef);
        if (this.output >= 1.0) {
          this.output = 1.0;
          this.state = this.envState.env_decay;
        }
        this.plotA.push(this.output);
        break;
      case this.envState.env_decay:
        this.output = this.decayBase + this.output * this.decayCoef;
        //console.log(this.output+"="+this.decayBase+"+"+this.output+"*"+this.decayCoef);
        if (this.output <= this.sustainLevel) {
          this.output = this.sustainLevel;
          this.state = this.envState.env_sustain;
        }
        this.plotD.push(this.output);
        break;
      case this.envState.env_sustain:
        break;
      case this.envState.env_release:
        this.output = this.releaseBase + this.output * this.releaseCoef;
        if (this.output <= 0.0) {
          this.output = 0.0;
          this.state = this.envState.env_idle;
        }
        this.plotR.push(this.output);
        break;
    }
    return this.output;
  };

  this.gate = function (gate) {
    if (gate > 0) this.state = this.envState.env_attack;
    else {
      if (this.state != this.envState.env_idle)
        this.state = this.envState.env_release;
    }
  };

  this.setAttackRate = function (rate) {
    this.attackRate = rate;
    this.attackCoef = this.calcCoef(rate, this.targetRatioA);
    this.attackBase = (1.0 + this.targetRatioA) * (1.0 - this.attackCoef);
  };

  this.setDecayRate = function (rate) {
    this.decayRate = rate;
    this.decayCoef = this.calcCoef(rate, this.targetRatioDR);
    this.decayBase =
      (this.sustainLevel - this.targetRatioDR) * (1.0 - this.decayCoef);
  };

  this.setReleaseRate = function (rate) {
    this.releaseRate = rate;
    this.releaseCoef = this.calcCoef(rate, this.targetRatioDR);
    this.releaseBase = -this.targetRatioDR * (1.0 - this.releaseCoef);
  };

  this.calcCoef = function (rate, targetRatio) {
    return Math.exp(-Math.log((1.0 + targetRatio) / targetRatio) / rate);
  };

  this.setSustainLevel = function (level) {
    this.sustainLevel = level;
    this.decayBase =
      (this.sustainLevel - this.targetRatioDR) * (1.0 - this.decayCoef);
  };

  this.setTargetRatioA = function (targetRatio) {
    if (targetRatio < 0.000000001) targetRatio = 0.000000001; // -180 dB
    this.targetRatioA = targetRatio;
    this.attackCoef = this.calcCoef(this.attackRate, this.targetRatioA);
    this.attackBase = (1.0 + this.targetRatioA) * (1.0 - this.attackCoef);
  };

  this.setTargetRatioDR = function (targetRatio) {
    if (targetRatio < 0.000000001) targetRatio = 0.000000001; // -180 dB
    this.targetRatioDR = targetRatio;
    this.decayCoef = this.calcCoef(this.decayRate, targetRatio);
    this.releaseCoef = this.calcCoef(this.releaseRate, targetRatio);
    this.decayBase =
      (this.sustainLevel - this.targetRatioDR) * (1.0 - this.decayCoef);
    this.releaseBase = -this.targetRatioDR * (1.0 - this.releaseCoef);
  };

  this.getOutput = function () {
    return this.output;
  };

  this.reset = function () {
    this.state = this.envState.idle;
    this.output = 0.0;
  };
}

export function drawAllADSR(port_id, max_level) {
  const attack = Number(q("#adsr-attack-input-"+port_id).value);
  const decay = Number(q("#adsr-decay-input-"+port_id).value);
  const sustain = Number(q("#adsr-sustain-input-" + port_id).value);
  const release = Number(q("#adsr-release-input-" + port_id).value);
  var max_level = Number(q("#adsr-maxlevel-input-" + port_id).value);
  var predelay = Number(q("#adsr-predelay-input-" + port_id).value);
  //envADSR.setAttackRate(200);
  envADSR.setAttackRate(attack);   
  //envADSR.setDecayRate(200);   
  envADSR.setDecayRate(decay*2);   
  //envADSR.setSustainLevel(0.6);
  envADSR.setSustainLevel(sustain/100);
  //envADSR.setReleaseRate(200);   
  envADSR.setReleaseRate(release*2);   
  envADSR.plotA = [];
  envADSR.plotD = [];
  envADSR.plotR = [];
  
  //now the curve type
  var curve = q("#adsr-lineal-input-" + port_id).value;
  var is_slow_curve = false;
  switch (Number(curve)) {
    case 0: //LINEAL
      curve = 200;
      break;
    case 1: //EXP.
      curve = 20;
      break;
    case 2: //SLOW
      curve = 20;
      is_slow_curve = true; //TO DO
      break;
    default:
      break;
  }
  envADSR.setTargetRatioA(
    0.001 *
      (Math.exp((12.0 * curve) / 200) -
        1.0)
  );
  envADSR.setTargetRatioDR(
    0.001 *
      (Math.exp((12.0 * curve) / 200) -
        1.0)
  );
  _drawADSR(port_id, attack, decay, sustain, release, predelay, max_level, is_slow_curve);
}

function _drawADSR(port_id, attack, decay, sustain, release, predelay, max_level, is_slow_curve) {
  var limitAD = attack + decay;
  var envPlot = [];
  envADSR.reset();
  envADSR.gate(1);
  envPlot.push([0, 0]);
  var plotA = [];
  var plotD = [];
  var plotR = [];
  var idx;
  var idy;
  for (idx = 0; idx < limitAD; idx++){
    envADSR.process();
  }
  plotA = envADSR.plotA;
  plotD = envADSR.plotD;
  for (idx = 1; idx <= plotA.length; idx++) {
    idy = (is_slow_curve) ? (1 - plotA[plotA.length - idx]) : plotA[idx];
    envPlot.push([idx, idy]);
  }
  var slow_param = (sustain+100)/100;
  for (idx = plotA.length + 1; idx <= plotA.length + 1 + plotD.length; idx++) {
    idy = (is_slow_curve) ? (slow_param - plotD[plotD.length - (idx - plotA.length)]) : plotD[idx - (plotA.length + 1)];
    envPlot.push([idx, idy]);
  }
  envADSR.gate(0);
  var limitS = (limitAD + release) * 0.25;
  limitAD = limitAD + limitS;
  for (idx = limitAD; idx < limitAD + release; idx++) {
    envADSR.process();
  }
  plotR = envADSR.plotR;
  slow_param = sustain/100;
  for (idx = limitAD; idx < limitAD + release; idx++) {
    idy = is_slow_curve
      ? slow_param - plotR[plotR.length - (idx - limitAD) - 1]
      : plotR[idx - limitAD];
    envPlot.push([idx, idy]);
  }


  max_level = _convertMaxLevel(max_level);
  predelay = -(predelay*65/100);

  // plot linear
  Flotr.draw(document.getElementById("adsr-container-"+port_id), [envPlot], {
    grid: { horizontalLines: false, verticalLines: false}, 
    xaxis: { showLabels: false, min: predelay},
    yaxis: { showLabels: false, max: max_level, min: 0}
  });
}

function _convertMaxLevel(max_level){
  if (max_level > 50) {
    return 3-((max_level-50)/25);
  } else if (max_level > 25) {
    return 5-((max_level-25)/25);
  } else {
    return 10-((max_level-0)/25);
  }
}
