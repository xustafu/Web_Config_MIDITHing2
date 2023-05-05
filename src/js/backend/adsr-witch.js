/**
 * @author Nigel Redmon
 * witch.rebeltech.org
 */

var attack = new Nexus.Slider('#attack', { mode:'absolute', size: [240, 20] });
attack.on('change',function(v) {
    HoxtonOwl.midiClient.sendCc(cc.ATTACK, v*127);
    envADSR.setAttackRate(v*200); drawADSR();
});

var decay = new Nexus.Slider('#decay', { mode:'absolute', size: [240, 20] });
decay.on('change',function(v) {
    HoxtonOwl.midiClient.sendCc(cc.DECAY, v*127);
    envADSR.setDecayRate(v*200); drawADSR();
});

var sustain = new Nexus.Slider('#sustain', { mode:'absolute', size: [240, 20] });
sustain.on('change',function(v) {
    HoxtonOwl.midiClient.sendCc(cc.SUSTAIN, v*127);
    envADSR.setSustainLevel(v); drawADSR();
});

var release = new Nexus.Slider('#release', { mode:'absolute', size: [240, 20] });
release.on('change',function(v) {
    HoxtonOwl.midiClient.sendCc(cc.RELEASE, v*127);
    envADSR.setReleaseRate(v*200); drawADSR();
});

function drawAllADSR() {
    envADSR.setAttackRate(attack.value*200);
    envADSR.setDecayRate(decay.value*200);
    envADSR.setSustainLevel(sustain.value);
    envADSR.setReleaseRate(release.value*200);
    envADSR.setTargetRatioA(0.001 * (Math.exp(12.0*ratioASlider.value)-1.0));
    envADSR.setTargetRatioDR(0.001 * (Math.exp(12.0*ratioDRSlider.value)-1.0));
    drawADSR();
}

function drawADSR() {
    if(!$('#adsr').is(":visible"))
	return;
    var val;
    var envPlot = [];
    envADSR.reset();
    envADSR.gate(1);
    envPlot.push([0, 0]);
    var idx;
    for (idx = 1; idx < 400; idx++)
	envPlot.push([idx, envADSR.process()]);
    envADSR.gate(0);
    for (idx = 400; idx < 600; idx++)
	envPlot.push([idx, envADSR.process()]);
    
    // plot linear
    // colours: nexus azure #22bbbb, bootstrap grey dark: #5a5c69, secondary: #858796
    var options = {
	colors: ['#858796'],
	grid: { show: false },
	xaxis: { showLabels: false },
	yaxis: { max: 1.0, min: 0, showLabels: false }
    };
    Flotr.draw(document.getElementById('adsr'), [ envPlot ], options);
}

function ADSR() {
  this.envState = {
    env_idle: 0,
    env_attack: 1,
    env_decay: 2,
    env_sustain: 3,
    env_release: 4,
  };

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
        if (this.output >= 1.0) {
          this.output = 1.0;
          this.state = this.envState.env_decay;
        }
        break;
      case this.envState.env_decay:
        this.output = this.decayBase + this.output * this.decayCoef;
        if (this.output <= this.sustainLevel) {
          this.output = this.sustainLevel;
          this.state = this.envState.env_sustain;
        }
        break;
      case this.envState.env_sustain:
        break;
      case this.envState.env_release:
        this.output = this.releaseBase + this.output * this.releaseCoef;
        if (this.output <= 0.0) {
          this.output = 0.0;
          this.state = this.envState.env_idle;
        }
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

$(document).ready(function() {

    cc = {
	GAIN:                    7,
	FX_AMOUNT:               OpenWareMidiControl.PATCH_PARAMETER_E,  // 24
	WAVESHAPE:               OpenWareMidiControl.PATCH_PARAMETER_H,  // 13
	STEREO_MIX:              OpenWareMidiControl.PATCH_PARAMETER_H,  // 13
	ATTACK:                  OpenWareMidiControl.PATCH_PARAMETER_AA, // 75
	DECAY:                   OpenWareMidiControl.PATCH_PARAMETER_AB, // 76
	SUSTAIN:                 OpenWareMidiControl.PATCH_PARAMETER_AC, // 77
	RELEASE:                 OpenWareMidiControl.PATCH_PARAMETER_AD, // 78
	ATTACK_CURVE:            OpenWareMidiControl.PATCH_PARAMETER_AE, // 79
	RELEASE_CURVE:           OpenWareMidiControl.PATCH_PARAMETER_AF, // 80
	EXTL_AMOUNT:             OpenWareMidiControl.PATCH_PARAMETER_AG, // 81
	EXTR_AMOUNT:             OpenWareMidiControl.PATCH_PARAMETER_AH, // 82

	ATTENUATE_A:             OpenWareMidiControl.PATCH_PARAMETER_BA, // 83
	ATTENUATE_B:             OpenWareMidiControl.PATCH_PARAMETER_BB, // 84
	ATTENUATE_C:             OpenWareMidiControl.PATCH_PARAMETER_BC, // 85
	ATTENUATE_D:             OpenWareMidiControl.PATCH_PARAMETER_BD, // 86

	LFO1_SHAPE:              OpenWareMidiControl.PATCH_PARAMETER_BE, // 87
	LFO2_SHAPE:              OpenWareMidiControl.PATCH_PARAMETER_BF, // 88

	FX_SELECT:               OpenWareMidiControl.PATCH_PARAMETER_BG, // 89
	DYNAMIC_RANGE:           OpenWareMidiControl.PATCH_PARAMETER_BH, // 90
    };

    connectToOwl();

    // $('#collapse2').collapse('show');
    envADSR = new ADSR;
    attack.value = 0.2;
    decay.value = 0.2;
    sustain.value = 0.8;
    release.value = 0.2;
    // ratioA.value = 1;
    // ratioDR.value = 1;
    ratioA.value = 0.2;
    ratioDR.value = 0.2;
    // $('#collapse2').toggleClass('show');
    // document.getElementById('collapse2').hide();
    // $('#collapse2').hide();
    // $('#accordionMain .accordion-body').hide()
    showPatch(0);
});
