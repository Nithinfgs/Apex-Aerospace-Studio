// ====================================================
// 1. SCIENTIFIC CHARTING ENGINE (charts.js)
// ====================================================

class EngineeringChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.title = options.title || '';
    this.xLabel = options.xLabel || 'Time (s)';
    this.yLabel = options.yLabel || '';
    this.lineColor = options.lineColor || '#7B4F36'; // Sienna default
    this.yMin = options.yMin !== undefined ? options.yMin : 0;
    this.yMax = options.yMax !== undefined ? options.yMax : 100;
    this.xMin = options.xMin !== undefined ? options.xMin : 0;
    this.xMax = options.xMax !== undefined ? options.xMax : 10;
    
    this.data = []; // Array of {x, y}
    this.padding = { top: 15, right: 15, bottom: 35, left: 55 };
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  setData(data) {
    this.data = data;
    if (data.length > 0) {
      const maxRealX = Math.max(...data.map(p => p.x));
      this.xMax = Math.max(10, Math.ceil(maxRealX));
      
      const maxRealY = Math.max(...data.map(p => p.y));
      const minRealY = Math.min(...data.map(p => p.y));
      if (maxRealY !== minRealY) {
        const diff = maxRealY - minRealY;
        this.yMax = maxRealY + diff * 0.1;
        this.yMin = Math.min(0, minRealY - diff * 0.05);
      }
    }
    this.render();
  }

  clear() {
    this.data = [];
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const pad = this.padding;

    ctx.clearRect(0, 0, w, h);
    if (w <= 0 || h <= 0) return;

    // Draw Background Panel
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const graphWidth = w - pad.left - pad.right;
    const graphHeight = h - pad.top - pad.bottom;

    const getXPixel = (x) => {
      const pct = (x - this.xMin) / (this.xMax - this.xMin);
      return pad.left + pct * graphWidth;
    };

    const getYPixel = (y) => {
      const pct = (y - this.yMin) / (this.yMax - this.yMin);
      return pad.top + (1 - pct) * graphHeight;
    };

    // Draw Fine Gridlines and Ticks
    ctx.strokeStyle = '#D8D2C7';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#5A5A5A';
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yGridCount = 5;
    for (let i = 0; i <= yGridCount; i++) {
      const pct = i / yGridCount;
      const yVal = this.yMin + pct * (this.yMax - this.yMin);
      const yPix = getYPixel(yVal);

      ctx.beginPath();
      ctx.moveTo(pad.left, yPix);
      ctx.lineTo(w - pad.right, yPix);
      ctx.stroke();

      ctx.fillText(yVal.toFixed(1), pad.left - 8, yPix);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xGridCount = 5;
    for (let i = 0; i <= xGridCount; i++) {
      const pct = i / xGridCount;
      const xVal = this.xMin + pct * (this.xMax - this.xMin);
      const xPix = getXPixel(xVal);

      ctx.beginPath();
      ctx.moveTo(xPix, pad.top);
      ctx.lineTo(xPix, h - pad.bottom);
      ctx.stroke();

      ctx.fillText(xVal.toFixed(1) + 's', xPix, h - pad.bottom + 6);
    }

    ctx.save();
    ctx.translate(14, pad.top + graphHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText(this.yLabel, 0, 0);
    ctx.restore();

    ctx.strokeStyle = '#D8D2C7';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad.left, pad.top, graphWidth, graphHeight);

    if (this.data.length > 1) {
      ctx.strokeStyle = this.lineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      const startX = getXPixel(this.data[0].x);
      const startY = getYPixel(this.data[0].y);
      ctx.moveTo(startX, startY);

      for (let i = 1; i < this.data.length; i++) {
        const px = getXPixel(this.data[i].x);
        const py = getYPixel(this.data[i].y);
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.lineTo(getXPixel(this.data[this.data.length - 1].x), getYPixel(this.yMin));
      ctx.lineTo(getXPixel(this.data[0].x), getYPixel(this.yMin));
      ctx.closePath();
      ctx.fillStyle = this.lineColor === '#7B4F36' ? 'rgba(123, 79, 54, 0.04)' : 'rgba(93, 107, 93, 0.04)';
      ctx.fill();
    }
  }
}

class RadarChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.labels = options.labels || ['Drag', 'Volume', 'Mass', 'Complexity', 'Mach Stability'];
    this.colorA = '#7B4F36';
    this.colorB = '#5D6B5D';
    this.modelA = null;
    this.modelB = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  setModels(modelA, modelB) {
    this.modelA = modelA;
    this.modelB = modelB;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    if (w <= 0 || h <= 0) return;

    const cx = w / 2;
    const cy = h / 2 + 10;
    const maxRadius = Math.min(w, h) * 0.35;
    const numAxes = this.labels.length;

    const levels = 4;
    ctx.strokeStyle = '#D8D2C7';
    ctx.lineWidth = 0.5;

    for (let j = 1; j <= levels; j++) {
      const radius = (j / levels) * maxRadius;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#5A5A5A';
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillText((j / levels * 100).toFixed(0), cx + 4, cy - radius + 2);
    }

    ctx.strokeStyle = '#D8D2C7';
    ctx.font = '9px "Inter", sans-serif';
    ctx.fillStyle = '#222222';
    ctx.textAlign = 'center';

    for (let i = 0; i < numAxes; i++) {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
      const rx = cx + maxRadius * Math.cos(angle);
      const ry = cy + maxRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rx, ry);
      ctx.stroke();

      const labelDistance = maxRadius + 14;
      const lx = cx + labelDistance * Math.cos(angle);
      const ly = cy + labelDistance * Math.sin(angle);
      
      if (Math.abs(Math.cos(angle)) < 0.1) {
        ctx.textAlign = 'center';
      } else if (Math.cos(angle) > 0) {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'right';
      }

      ctx.fillText(this.labels[i], lx, ly);
    }

    const drawRadarShape = (data, strokeColor, fillColor) => {
      if (!data) return;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const val = Math.min(1, Math.max(0, data[i]));
        const radius = val * maxRadius;
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = fillColor;
      ctx.fill();
    };

    drawRadarShape(this.modelB, this.colorB, 'rgba(93, 107, 93, 0.2)');
    drawRadarShape(this.modelA, this.colorA, 'rgba(123, 79, 54, 0.25)');
  }
}

// ====================================================
// 2. FLIGHT SIMULATOR ENGINE (explorer.js)
// ====================================================

class RocketSimulator {
  constructor(config = {}) {
    this.reset(config);
  }

  reset(config = {}) {
    this.windSpeed = config.windSpeed !== undefined ? config.windSpeed : 5.0;
    this.launchAngle = config.launchAngle !== undefined ? config.launchAngle : 85.0;
    this.cgPosition = config.cgPosition !== undefined ? config.cgPosition : 1.2;
    this.cpPosition = config.cpPosition !== undefined ? config.cpPosition : 1.5;
    this.finDamage = config.finDamage !== undefined ? config.finDamage : 0.0;
    this.motorVariance = config.motorVariance !== undefined ? config.motorVariance : 2.0;
    this.recoveryReliability = config.recoveryReliability !== undefined ? config.recoveryReliability : 95.0;
    this.massDistribution = config.massDistribution !== undefined ? config.massDistribution : 'balanced';

    this.length = 2.0;
    this.diameter = 0.12;
    this.dryMass = 6.0;
    this.fuelMass = 2.5;
    
    if (this.massDistribution === 'nose-heavy') {
      this.dryMass += 1.0;
    } else if (this.massDistribution === 'tail-heavy') {
      this.dryMass += 0.5;
    }

    this.wetMass = this.dryMass + this.fuelMass;
    this.mass = this.wetMass;
    
    this.burnTime = 3.5;
    this.avgThrust = 380;
    const varianceFactor = 1.0 + ((Math.random() - 0.5) * 2.0 * (this.motorVariance / 100.0));
    this.thrust = this.avgThrust * varianceFactor;

    this.t = 0.0;
    this.x = 0.0;
    this.y = 0.0;
    this.vx = 0.0;
    this.vy = 0.0;
    this.theta = this.launchAngle * Math.PI / 180.0;
    this.omega = 0.0;
    this.roll = 0.0;
    this.rollRate = 0.0;

    this.cd_base = 0.45;
    this.cl_alpha = 4.0;
    this.area = Math.PI * Math.pow(this.diameter / 2, 2);

    this.history = [{
      x: 0.0,
      y: 0.0,
      vx: 0.0,
      vy: 0.0,
      speed: 0.0,
      acc: 0.0,
      theta: this.theta,
      aoa: 0.0,
      t: 0.0
    }];
    this.events = [];
    this.logs = [];
    
    this.motorActive = true;
    this.parachuteDeployed = false;
    this.drogueDeployed = false;
    this.simulationEnded = false;
    this.failed = false;
    this.failureReason = '';
    this.maxAltitude = 0;
    this.maxVelocity = 0;
    this.maxAcceleration = 0;
    this.stabilityScore = 100;
    this.riskScore = 0;
    
    this.dt = 0.02;

    this.calculateStaticStability();
    this.calculateRiskScore();
    
    this.addLog(0.00, 'SYSTEM', 'SYSTEM INITIALIZATION: APEX FLIGHT COMPUTERS ONLINE', 'success');
    this.addLog(0.00, 'SYSTEM', `STATIC MARGIN: ${this.staticMarginCalibers.toFixed(2)} CALIBERS (${this.staticMarginCalibers >= 1.0 ? 'STABLE' : this.staticMarginCalibers > 0 ? 'MARGINAL' : 'UNSTABLE'})`, this.staticMarginCalibers >= 1.0 ? 'success' : this.staticMarginCalibers > 0 ? 'warning' : 'danger');
  }

  calculateStaticStability() {
    this.staticMarginMeters = this.cpPosition - this.cgPosition;
    this.staticMarginCalibers = this.staticMarginMeters / this.diameter;
    
    if (this.staticMarginCalibers <= 0) {
      this.stabilityScore = 0;
    } else if (this.staticMarginCalibers < 1.0) {
      this.stabilityScore = 30 + this.staticMarginCalibers * 50;
    } else if (this.staticMarginCalibers <= 2.5) {
      this.stabilityScore = 90 + (this.staticMarginCalibers - 1.0) * 6.6;
    } else {
      this.stabilityScore = Math.max(50, 100 - (this.staticMarginCalibers - 2.5) * 15);
    }
  }

  calculateRiskScore() {
    let risk = 0;
    if (this.staticMarginCalibers < 0.8) risk += 35;
    if (this.staticMarginCalibers < 0.1) risk += 45;
    if (this.windSpeed > 10) risk += 15;
    if (this.windSpeed > 15) risk += 20;
    risk += this.finDamage * 0.5;
    risk += (100 - this.recoveryReliability) * 0.4;
    if (this.launchAngle < 80) risk += (80 - this.launchAngle) * 1.5;

    this.riskScore = Math.min(99, Math.round(risk));
  }

  addLog(time, source, text, type = 'system') {
    this.logs.push({ time, source, text, type });
  }

  addEvent(time, label, type, description) {
    this.events.push({ time, label, type, description });
    this.addLog(time, 'EVENT', `${label.toUpperCase()}: ${description}`, type === 'danger' ? 'danger' : 'warning');
  }

  step() {
    if (this.simulationEnded) return;

    const rho = 1.225;
    
    if (this.t < this.burnTime) {
      const fuelBurntPct = this.t / this.burnTime;
      this.mass = this.wetMass - fuelBurntPct * this.fuelMass;
      this.motorActive = true;
    } else {
      this.mass = this.dryMass;
      this.motorActive = false;
    }

    const v_rel_x = this.vx - this.windSpeed;
    const v_rel_y = this.vy;
    const v_rel = Math.sqrt(v_rel_x * v_rel_x + v_rel_y * v_rel_y);
    
    const flightAngleAir = Math.atan2(v_rel_y, v_rel_x);
    
    let alpha = 0.0;
    if (v_rel > 1.0) {
      alpha = this.theta - flightAngleAir;
      alpha = Math.atan2(Math.sin(alpha), Math.cos(alpha));
    }

    const q = 0.5 * rho * v_rel * v_rel;
    const cd = (this.cd_base + 1.2 * Math.sin(alpha) * Math.sin(alpha)) * (1.0 + (this.finDamage / 100.0) * 0.4);
    const dragForce = cd * q * this.area;
    const cl = this.cl_alpha * alpha;
    const liftForce = cl * q * this.area;

    const currentThrust = this.motorActive ? this.thrust : 0.0;
    const gravityForce = this.mass * 9.81;

    const dragAngle = flightAngleAir + Math.PI;
    const liftAngle = flightAngleAir + Math.PI / 2.0;

    const fx_thrust = currentThrust * Math.cos(this.theta);
    const fy_thrust = currentThrust * Math.sin(this.theta);
    const fx_drag = dragForce * Math.cos(dragAngle);
    const fy_drag = dragForce * Math.sin(dragAngle);
    const fx_lift = liftForce * Math.cos(liftAngle);
    const fy_lift = liftForce * Math.sin(liftAngle);

    const total_fx = fx_thrust + fx_drag + fx_lift;
    const total_fy = fy_thrust + fy_drag + fy_lift - gravityForce;

    const ax = total_fx / this.mass;
    const ay = total_fy / this.mass;

    if (this.y > 0 || total_fy > 0) {
      this.vx += ax * this.dt;
      this.vy += ay * this.dt;
      this.x += this.vx * this.dt;
      this.y += this.vy * this.dt;
    } else {
      this.vx = 0;
      this.vy = 0;
      this.x = 0;
      this.y = 0;
    }

    const restoringTorque = -liftForce * (this.cpPosition - this.cgPosition);
    const dampingConstant = 0.5 * rho * v_rel * this.area * this.length * this.length;
    const dampingTorque = -dampingConstant * this.omega * 0.15;
    const finTorque = this.finDamage > 0 ? (this.finDamage / 100.0) * q * this.area * this.diameter * 1.5 : 0;
    const motorTorque = this.motorActive ? (this.motorVariance / 10.0) * this.thrust * 0.015 : 0;
    const totalTorque = restoringTorque + dampingTorque + finTorque + motorTorque;
    
    const inertia = (1 / 12) * this.mass * this.length * this.length;
    const angularAcc = totalTorque / inertia;
    
    this.omega += angularAcc * this.dt;
    this.theta += this.omega * this.dt;
    
    const rollTorque = (this.finDamage * 0.05 + this.motorVariance * 0.02) * q * this.area * this.diameter;
    const rollInertia = 0.5 * this.mass * Math.pow(this.diameter / 2, 2);
    const rollAcc = (rollTorque - 0.05 * this.rollRate) / rollInertia;
    this.rollRate += rollAcc * this.dt;
    this.roll += this.rollRate * this.dt;

    this.theta = Math.atan2(Math.sin(this.theta), Math.cos(this.theta));
    this.t += this.dt;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const acc = Math.sqrt(ax * ax + ay * ay);

    if (speed > this.maxVelocity) this.maxVelocity = speed;
    if (acc > this.maxAcceleration) this.maxAcceleration = acc;
    if (this.y > this.maxAltitude) this.maxAltitude = this.y;

    if (this.y > 5.0 && !this.railExit) {
      this.railExit = true;
      this.addLog(this.t, 'SYSTEM', 'LAUNCH RAIL EXIT. APEX GUIDANCE DISENGAGED.', 'system');
      if (this.windSpeed > 8.0 && this.staticMarginCalibers > 2.0 && this.launchAngle < 88) {
        this.addEvent(this.t, 'Weathercocking', 'warning', `High static stability (${this.staticMarginCalibers.toFixed(1)} cal) causing rocket to turn into ${this.windSpeed}m/s crosswind.`);
      }
    }

    if (this.railExit && this.staticMarginCalibers <= 0.05 && !this.hasSpunOut) {
      this.hasSpunOut = true;
      this.failed = true;
      this.failureReason = 'Aerodynamic instability (CG behind CP)';
      this.addEvent(this.t, 'Aerodynamic Instability', 'danger', 'Aerodynamic center of pressure (CP) is ahead of center of gravity (CG). Rocket has lost attitude control.');
    }

    if (this.railExit && speed > 90.0 && this.finDamage > 15.0 && !this.finFlutterEvent) {
      this.finFlutterEvent = true;
      this.failed = true;
      this.failureReason = 'Fin structural failure due to flutter';
      this.addEvent(this.t, 'Fin Flutter', 'danger', `High aerodynamic pressure (Max Q) combined with ${this.finDamage}% fin damage initiated aeroelastic flutter. Fins disintegrated.`);
      this.omega += 15.0 * (Math.random() - 0.5);
      this.cd_base += 1.5;
    }

    if (this.railExit && Math.abs(this.rollRate) > 40.0 && !this.excessiveSpinEvent) {
      this.excessiveSpinEvent = true;
      this.addEvent(this.t, 'Excessive Roll Spin', 'warning', `Roll rate exceeded 40 rad/s (${(Math.abs(this.rollRate) * 9.55).toFixed(0)} RPM). Centrifugal loads rising.`);
    }

    if (this.t >= this.burnTime && !this.burnoutEvent) {
      this.burnoutEvent = true;
      this.addLog(this.t, 'SYSTEM', 'MOTOR BURNOUT (MECO). ENTERING COAST PHASE.', 'system');
    }

    if (this.burnoutEvent && this.vy <= 0.0 && !this.apogeeEvent) {
      this.apogeeEvent = true;
      this.apogeeTime = this.t;
      this.addLog(this.t, 'SYSTEM', `APEX APOGEE DETECTED: ${this.y.toFixed(1)}m`, 'success');

      const deployRoll = Math.random() * 100;
      if (deployRoll < this.recoveryReliability) {
        this.parachuteDeployed = true;
        this.addEvent(this.t, 'Parachute Deployment', 'success', 'Main recovery parachute successfully deployed.');
      } else {
        const scenario = Math.random();
        this.failed = true;
        if (scenario < 0.4) {
          this.failureReason = 'Complete recovery failure';
          this.addEvent(this.t, 'Parachute Failure', 'danger', 'Main deployment charge failed to ignite. Recovery system offline.');
        } else {
          this.failureReason = 'Parachute deployment delay';
          this.addEvent(this.t, 'Deployment Delay', 'warning', 'Drogue separation successful but main parachute lines tangled. Deployment delayed.');
          this.delayedDeployTime = this.t + 5.0;
        }
      }
    }

    if (this.delayedDeployTime && this.t >= this.delayedDeployTime && !this.parachuteDeployed) {
      this.parachuteDeployed = true;
      this.addEvent(this.t, 'Delayed Parachute Deployment', 'warning', 'Tangled lines cleared. Canopy fully inflated at high velocity.');
    }

    if (this.apogeeEvent) {
      if (this.parachuteDeployed) {
        this.cd_base = 2.2; 
        this.area = Math.PI * Math.pow(1.0 / 2, 2);
        this.theta = -Math.PI / 2;
        this.omega = 0;
      } else {
        this.cd_base = 0.6;
      }
    }

    this.history.push({
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      speed: speed,
      acc: acc,
      theta: this.theta,
      aoa: alpha * 180 / Math.PI,
      t: this.t
    });

    if (this.y <= 0 && this.railExit) {
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.simulationEnded = true;
      
      const impactSpeed = Math.abs(speed);
      this.addLog(this.t, 'SYSTEM', `GROUND IMPACT DETECTED. VELOCITY: ${impactSpeed.toFixed(1)} m/s`, impactSpeed > 10.0 ? 'danger' : 'success');
      
      if (impactSpeed > 12.0) {
        this.addEvent(this.t, 'Hull Fracture', 'danger', `High speed ground impact (${impactSpeed.toFixed(1)} m/s) destroyed the vehicle structure.`);
      } else {
        this.addEvent(this.t, 'Soft Landing', 'success', `Vehicle recovered successfully. Impact speed: ${impactSpeed.toFixed(1)} m/s.`);
      }
      this.addLog(this.t, 'SYSTEM', 'FLIGHT SIMULATION COMPLETED.', 'success');
    }

    if (this.t > 45.0) {
      this.simulationEnded = true;
      this.addLog(this.t, 'SYSTEM', 'SIMULATION TIMEOUT: EXCEEDED 45.0 SECONDS.', 'warning');
    }
  }

  runAll() {
    while (!this.simulationEnded) {
      this.step();
    }
    return {
      history: this.history,
      events: this.events,
      logs: this.logs,
      maxAltitude: this.maxAltitude,
      maxVelocity: this.maxVelocity,
      maxAcceleration: this.maxAcceleration,
      riskScore: this.riskScore,
      stabilityScore: this.stabilityScore,
      failed: this.failed,
      failureReason: this.failureReason
    };
  }
}

function drawRocketTelemetry(canvas, sim, frameIndex) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);

  if (!sim.history || sim.history.length === 0) return;
  
  const frame = sim.history[Math.min(frameIndex, sim.history.length - 1)];
  const isPostApogee = frame.t > (sim.apogeeTime || 999);
  
  const maxH = Math.max(10, ...sim.history.map(pt => pt.x));
  const minH = Math.min(-10, ...sim.history.map(pt => pt.x));
  const maxAlt = Math.max(100, sim.maxAltitude);
  
  const padLeft = 40;
  const padRight = 40;
  const padBottom = 40;
  const padTop = 40;
  
  const mapX = (sx) => {
    const range = Math.max(Math.abs(minH), Math.abs(maxH)) * 2 * 1.2;
    const pct = (sx + range/2) / range;
    return padLeft + pct * (w - padLeft - padRight);
  };
  
  const mapY = (sy) => {
    const pct = sy / (maxAlt * 1.1);
    return h - padBottom - pct * (h - padBottom - padTop);
  };

  ctx.strokeStyle = '#A68A64';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(0));
  for (let i = 0; i <= frameIndex && i < sim.history.length; i++) {
    ctx.lineTo(mapX(sim.history[i].x), mapY(sim.history[i].y));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#D8D2C7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, mapY(0));
  ctx.lineTo(w, mapY(0));
  ctx.stroke();
  ctx.fillStyle = '#ECE7DD';
  ctx.fillRect(0, mapY(0), w, h - mapY(0));
  
  ctx.fillStyle = '#5D6B5D';
  ctx.fillRect(mapX(0) - 8, mapY(0) - 4, 16, 4);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(0));
  ctx.lineTo(mapX(0), mapY(10.0));
  ctx.stroke();

  if (Math.abs(sim.windSpeed) > 0) {
    ctx.strokeStyle = '#5D6B5D';
    ctx.lineWidth = 1;
    const windY = 40;
    const windX = w - 80;
    ctx.beginPath();
    ctx.moveTo(windX, windY);
    ctx.lineTo(windX + sim.windSpeed * 4, windY);
    ctx.stroke();
    
    ctx.fillStyle = '#5D6B5D';
    ctx.beginPath();
    const dir = sim.windSpeed > 0 ? 1 : -1;
    ctx.moveTo(windX + sim.windSpeed * 4, windY);
    ctx.lineTo(windX + sim.windSpeed * 4 - dir*4, windY - 3);
    ctx.lineTo(windX + sim.windSpeed * 4 - dir*4, windY + 3);
    ctx.fill();
    
    ctx.fillStyle = '#5A5A5A';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`WIND: ${sim.windSpeed.toFixed(1)} m/s`, windX - 8, windY + 3);
  }

  sim.events.forEach(evt => {
    const matchingPoint = sim.history.find(p => Math.abs(p.t - evt.time) < 0.05);
    if (matchingPoint && sim.history.indexOf(matchingPoint) <= frameIndex) {
      const ex = mapX(matchingPoint.x);
      const ey = mapY(matchingPoint.y);
      
      ctx.fillStyle = evt.type === 'danger' ? '#A24B42' : evt.type === 'success' ? '#5B7153' : '#C58A3A';
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, 2*Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#5A5A5A';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + 15, ey - 15);
      ctx.stroke();
      
      ctx.fillStyle = '#222222';
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(evt.label.toUpperCase(), ex + 18, ey - 13);
    }
  });

  const rx = mapX(frame.x);
  const ry = mapY(frame.y);
  
  ctx.save();
  ctx.translate(rx, ry);
  ctx.rotate(-frame.theta + Math.PI / 2);

  const rocketLength = 36;
  const rocketRadius = 4;
  
  if (sim.parachuteDeployed && isPostApogee) {
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, rocketLength / 2);
    ctx.lineTo(-12, rocketLength + 15);
    ctx.moveTo(0, rocketLength / 2);
    ctx.lineTo(12, rocketLength + 15);
    ctx.stroke();
    
    ctx.fillStyle = '#A24B42';
    ctx.beginPath();
    ctx.arc(0, rocketLength + 15, 14, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(-rocketRadius, -rocketLength / 2, rocketRadius * 2, rocketLength);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7B4F36';
  ctx.beginPath();
  ctx.moveTo(-rocketRadius, rocketLength / 2);
  ctx.quadraticCurveTo(-rocketRadius, rocketLength/2 + 8, 0, rocketLength/2 + 12);
  ctx.quadraticCurveTo(rocketRadius, rocketLength/2 + 8, rocketRadius, rocketLength/2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#5D6B5D';
  ctx.beginPath();
  ctx.moveTo(-rocketRadius, -rocketLength / 2 + 10);
  ctx.lineTo(-rocketRadius - 6, -rocketLength / 2);
  ctx.lineTo(-rocketRadius, -rocketLength / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rocketRadius, -rocketLength / 2 + 10);
  ctx.lineTo(rocketRadius + 6, -rocketLength / 2);
  ctx.lineTo(rocketRadius, -rocketLength / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (sim.motorActive && frame.t < sim.burnTime) {
    ctx.fillStyle = '#A68A64';
    ctx.beginPath();
    ctx.moveTo(-2, -rocketLength / 2);
    ctx.lineTo(0, -rocketLength / 2 - 14 - Math.random() * 8);
    ctx.lineTo(2, -rocketLength / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(123, 79, 54, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-3, -rocketLength / 2);
    ctx.lineTo(0, -rocketLength / 2 - 20 - Math.random() * 10);
    ctx.lineTo(3, -rocketLength / 2);
    ctx.closePath();
    ctx.fill();
  }

  const cgOffset = (sim.cgPosition - sim.length / 2) * (rocketLength / sim.length);
  const cgY = rocketLength / 2 - cgOffset;
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(0, cgY, 2.5, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, cgY);
  ctx.arc(0, cgY, 2.5, 0, Math.PI / 2);
  ctx.lineTo(0, cgY);
  ctx.arc(0, cgY, 2.5, Math.PI, 3 * Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  
  const cpOffset = (sim.cpPosition - sim.length / 2) * (rocketLength / sim.length);
  const cpY = rocketLength / 2 - cpOffset;
  ctx.strokeStyle = '#A24B42';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, cpY, 3, 0, 2*Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#A24B42';
  ctx.beginPath();
  ctx.arc(0, cpY, 1.2, 0, 2*Math.PI);
  ctx.fill();

  ctx.restore();

  ctx.fillStyle = '#222222';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`ALTITUDE: ${frame.y.toFixed(1)} m`, w - 16, h - 45);
  ctx.fillText(`VELOCITY: ${frame.speed.toFixed(1)} m/s`, w - 16, h - 32);
  ctx.fillText(`PITCH: ${(frame.theta * 180 / Math.PI).toFixed(1)}°`, w - 16, h - 19);
}

// ====================================================
// 3. NOSE CONE GEOMETRIES ENGINE (nosecone.js)
// ====================================================

const MATERIALS = {
  pla: { name: 'PLA (3D Printed)', density: 1240 },
  fiberglass: { name: 'Fiberglass (G10)', density: 1800 },
  carbon: { name: 'Carbon Fiber', density: 1550 },
  aluminum: { name: 'Aluminum 6061-T6', density: 2700 }
};

const NOSECONE_TYPES = {
  conical: { name: 'Conical', description: 'Straight cone profile. Easiest to manufacture but higher drag.' },
  ogive: { name: 'Tangent Ogive', description: 'Smooth circular arc profile meeting the body tube tangentially.' },
  vonkarman: { name: 'Von Karman (Haack)', description: 'Mathematical minimum-drag profile for supersonic flight.' },
  parabolic: { name: 'Parabolic', description: 'Parabola profile. Provides high volume and good subsonic characteristics.' },
  elliptical: { name: 'Elliptical', description: 'Ellipsoid profile. Blunt tip, provides maximum internal volume.' }
};

function getNoseConePoints(type, length, radius, numPoints = 100) {
  const points = [];
  const R = radius;
  const L = length;

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * L;
    let y = 0;

    switch (type) {
      case 'conical':
        y = (x / L) * R;
        break;
      case 'ogive':
        const rho = (R * R + L * L) / (2.0 * R);
        y = Math.sqrt(rho * rho - Math.pow(L - x, 2)) + R - rho;
        break;
      case 'vonkarman':
        const theta = Math.acos(1.0 - (2.0 * x) / L);
        y = (R / Math.sqrt(Math.PI)) * Math.sqrt(theta - Math.sin(2.0 * theta) / 2.0);
        break;
      case 'parabolic':
        y = R * (2.0 * (x / L) - Math.pow(x / L, 2));
        break;
      case 'elliptical':
        y = R * Math.sqrt(1.0 - Math.pow(1.0 - x / L, 2));
        break;
      default:
        y = (x / L) * R;
    }
    
    y = Math.min(R, Math.max(0, y));
    points.push({ x, y });
  }
  return points;
}

function calculateVolume(type, length, radius) {
  const points = getNoseConePoints(type, length, radius, 200);
  let vol = 0;
  const dx = length / 200;
  for (let i = 0; i < points.length - 1; i++) {
    const yAvg = (points[i].y + points[i + 1].y) / 2;
    vol += Math.PI * yAvg * yAvg * dx;
  }
  return vol;
}

function calculateSurfaceArea(type, length, radius) {
  const points = getNoseConePoints(type, length, radius, 200);
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const ds = Math.sqrt(dx * dx + dy * dy);
    const yAvg = (p1.y + p2.y) / 2;
    area += 2 * Math.PI * yAvg * ds;
  }
  return area;
}

function estimateDragCoefficients(type, length, radius, mach) {
  const caliber = 2 * radius;
  const fineness = length / caliber;
  const cd_friction = 0.06 / Math.sqrt(fineness);
  let cd_wave = 0.0;
  
  if (mach > 0.8) {
    let machFactor = 0.0;
    if (mach >= 0.8 && mach < 1.05) {
      machFactor = (mach - 0.8) / 0.25;
    } else if (mach >= 1.05 && mach <= 1.5) {
      machFactor = 1.0 - (mach - 1.05) / 0.45 * 0.5;
    } else {
      machFactor = 0.4;
    }

    let shapeConstant = 0.0;
    switch (type) {
      case 'vonkarman': shapeConstant = 0.38; break;
      case 'ogive': shapeConstant = 0.48; break;
      case 'parabolic': shapeConstant = 0.55; break;
      case 'conical': shapeConstant = 0.78; break;
      case 'elliptical': shapeConstant = 1.15; break;
    }
    cd_wave = (shapeConstant / (fineness * fineness)) * machFactor;
  }

  const cd_base = mach > 0.9 && mach < 1.3 ? 0.12 : 0.03;
  return cd_friction + cd_wave + cd_base;
}

function getNoseConeMetrics(type, length, radius, wallThickness, materialKey) {
  const volume = calculateVolume(type, length, radius);
  const surfaceArea = calculateSurfaceArea(type, length, radius);
  const mat = MATERIALS[materialKey] || MATERIALS.pla;
  const innerRadius = Math.max(0, radius - wallThickness);
  const innerLength = Math.max(0, length - wallThickness);
  const innerVolume = calculateVolume(type, innerLength, innerRadius);
  const solidVolume = Math.max(0, volume - innerVolume);
  const mass = solidVolume * mat.density;

  const dragSubsonic = estimateDragCoefficients(type, length, radius, 0.4);
  const dragTransonic = estimateDragCoefficients(type, length, radius, 1.05);
  const dragSupersonic = estimateDragCoefficients(type, length, radius, 1.6);

  let simplicity = 100;
  if (type === 'conical') simplicity = 95;
  else if (type === 'ogive') simplicity = 75;
  else if (type === 'elliptical') simplicity = 70;
  else if (type === 'parabolic') simplicity = 45;
  else if (type === 'vonkarman') simplicity = 30;

  const aeroRating = Math.min(100, Math.max(10, Math.round(100 - dragSupersonic * 300)));
  const volPct = volume / (Math.PI * radius * radius * length);
  const volumeRating = Math.round(volPct * 100);

  let strengthRating = 80;
  if (type === 'conical') strengthRating = 60;
  if (type === 'elliptical') strengthRating = 90;
  if (materialKey === 'carbon') strengthRating += 10;
  if (materialKey === 'pla') strengthRating -= 15;

  return {
    volume,
    surfaceArea,
    mass,
    dragSubsonic,
    dragTransonic,
    dragSupersonic,
    ratings: {
      simplicity,
      dragRating: aeroRating,
      volumeRating,
      strengthRating: Math.min(98, strengthRating),
      massRating: Math.min(98, Math.max(10, Math.round(100 - (mass / 2.0) * 100)))
    }
  };
}

function drawCADBlueprint(canvas, type, length, radius, wallThickness, isCompared = false, typeComp = '', lengthComp = 0, radiusComp = 0) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = '#ECE7DD';
  ctx.lineWidth = 0.5;
  const grid = 20;
  for (let x = 0; x < w; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  ctx.strokeStyle = '#A68A64';
  ctx.lineWidth = 0.75;
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.beginPath();
  ctx.moveTo(10, h / 2);
  ctx.lineTo(w - 10, h / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const maxL = Math.max(length, isCompared ? lengthComp : 0);
  const maxR = Math.max(radius, isCompared ? radiusComp : 0);
  
  const padLeft = 40;
  const padRight = 60;
  const graphWidth = w - padLeft - padRight;
  const scale = graphWidth / maxL;
  
  const mapX = (sx) => padLeft + sx * scale;
  const mapY = (sy) => h / 2 - sy * scale;

  const points = getNoseConePoints(type, length, radius, 100);
  const innerRadius = Math.max(0, radius - wallThickness);
  const innerLength = Math.max(0, length - wallThickness);
  const innerPoints = getNoseConePoints(type, innerLength, innerRadius, 100);

  ctx.strokeStyle = '#7B4F36';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(mapX(points[0].x), mapY(points[0].y));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(mapX(points[i].x), mapY(points[i].y));
  }
  ctx.lineTo(mapX(length), mapY(-radius));
  for (let i = points.length - 1; i >= 0; i--) {
    ctx.lineTo(mapX(points[i].x), mapY(-points[i].y));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(123, 79, 54, 0.03)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(123, 79, 54, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  const xOffset = length - innerLength;
  ctx.moveTo(mapX(innerPoints[0].x + xOffset), mapY(innerPoints[0].y));
  for (let i = 1; i < innerPoints.length; i++) {
    ctx.lineTo(mapX(innerPoints[i].x + xOffset), mapY(innerPoints[i].y));
  }
  ctx.lineTo(mapX(length), mapY(-innerRadius));
  for (let i = innerPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(mapX(innerPoints[i].x + xOffset), mapY(-innerPoints[i].y));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#5A5A5A';
  ctx.fillStyle = '#5A5A5A';
  ctx.lineWidth = 0.75;
  ctx.font = '9px "IBM Plex Mono", monospace';

  const dimY = h / 2 + maxR * scale + 24;
  ctx.beginPath();
  ctx.moveTo(mapX(0), dimY);
  ctx.lineTo(mapX(length), dimY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(mapX(0), dimY - 4); ctx.lineTo(mapX(0), dimY + 4);
  ctx.moveTo(mapX(length), dimY - 4); ctx.lineTo(mapX(length), dimY + 4);
  ctx.stroke();
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`L = ${(length * 1000).toFixed(0)} mm`, mapX(length / 2), dimY + 6);

  const dimX = mapX(length) + 15;
  ctx.beginPath();
  ctx.moveTo(dimX, mapY(radius));
  ctx.lineTo(dimX, mapY(-radius));
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(dimX - 4, mapY(radius)); ctx.lineTo(dimX + 4, mapY(radius));
  ctx.moveTo(dimX - 4, mapY(-radius)); ctx.lineTo(dimX + 4, mapY(-radius));
  ctx.stroke();
  
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Ø ${(radius * 2 * 1000).toFixed(0)} mm`, dimX + 6, h / 2);

  if (isCompared && typeComp) {
    const compPoints = getNoseConePoints(typeComp, lengthComp, radiusComp, 100);
    ctx.strokeStyle = '#5D6B5D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const scaleCompX = mapX;
    ctx.moveTo(scaleCompX(compPoints[0].x), mapY(compPoints[0].y));
    for (let i = 1; i < compPoints.length; i++) {
      ctx.lineTo(scaleCompX(compPoints[i].x), mapY(compPoints[i].y));
    }
    ctx.lineTo(scaleCompX(lengthComp), mapY(-radiusComp));
    for (let i = compPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(scaleCompX(compPoints[i].x), mapY(-compPoints[i].y));
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = '#5D6B5D';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`COMP: ${typeComp.toUpperCase()}`, padLeft, 20);
  }

  ctx.fillStyle = '#7B4F36';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`ACTIVE: ${type.toUpperCase()}`, padLeft, 10);
}

// ====================================================
// 4. MISSION PATCH SVG BUILDER ENGINE (patch.js)
// ====================================================

const PATCH_STYLES = {
  nasa: { name: 'NASA Heritage', desc: 'Classic vintage circular composition.' },
  university: { name: 'University Rocketry', desc: 'Crest-shield layout.' },
  experimental: { name: 'Experimental Vehicle', desc: 'Hexagonal technical layout.' },
  deepspace: { name: 'Deep Space Mission', desc: 'Planetary silhouette.' },
  student: { name: 'Student Engineering', desc: 'Industrial circular design.' }
};

function generatePatchSVG(config) {
  const {
    missionName = 'APEX-1',
    vehicleName = 'PHOENIX IV',
    launchYear = '2026',
    crewNames = 'SELVARAJ, GEMINI',
    objective = 'LUNAR TELEMETRY',
    style = 'nasa'
  } = config;

  const cleanMission = missionName.toUpperCase();
  const cleanVehicle = vehicleName.toUpperCase();
  const cleanYear = launchYear.toUpperCase();
  const cleanCrew = crewNames.toUpperCase();
  const cleanObjective = objective.toUpperCase();

  const makeStar = (cx, cy, r) => {
    return `<polygon points="${cx},${cy-r} ${cx+r*0.3},${cy-r*0.3} ${cx+r},${cy} ${cx+r*0.3},${cy+r*0.3} ${cx},${cy+r} ${cx-r*0.3},${cy+r*0.3} ${cx-r},${cy} ${cx-r*0.3},${cy-r*0.3}" fill="#A68A64" />`;
  };

  switch (style) {
    case 'nasa':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <circle cx="200" cy="200" r="185" fill="#222222" stroke="#7B4F36" stroke-width="6" />
        <circle cx="200" cy="200" r="150" fill="#ECE7DD" stroke="#D8D2C7" stroke-width="2" />
        <circle cx="200" cy="200" r="148" fill="#F4F1EA" />
        <circle cx="200" cy="200" r="130" fill="#5D6B5D" opacity="0.85" stroke="#D8D2C7" stroke-width="1.5" />
        <circle cx="130" cy="250" r="60" fill="#A68A64" opacity="0.9" />
        <path d="M 70,250 A 60,60 0 0,0 190,250 A 60,60 0 0,1 70,250" fill="#222222" opacity="0.3" />
        <path d="M 90,290 C 130,230 270,110 320,150 C 370,190 230,310 90,290" fill="none" stroke="#F4F1EA" stroke-width="3" stroke-linecap="round" />
        <g transform="translate(290, 160) rotate(-35) scale(0.6)">
          <path d="M 0,-30 L 10,-5 L 8,20 L -8,20 L -10,-5 Z" fill="#7B4F36" />
          <path d="M -8,20 L -15,30 L -8,30 L 0,20 Z" fill="#222222" />
          <path d="M 8,20 L 15,30 L 8,30 L 0,20 Z" fill="#222222" />
          <path d="M 0,20 L -4,35 L 4,35 Z" fill="#A68A64" />
        </g>
        ${makeStar(120, 110, 6)}
        ${makeStar(280, 120, 4)}
        ${makeStar(240, 90, 5)}
        ${makeStar(170, 140, 3)}
        ${makeStar(300, 240, 5)}
        <defs>
          <path id="path-top" d="M 35,200 A 165,165 0 0,1 365,200" fill="none" />
          <path id="path-bottom" d="M 365,200 A 165,165 0 0,1 35,200" fill="none" />
        </defs>
        <text font-family="'IBM Plex Sans', sans-serif" font-weight="600" font-size="14" letter-spacing="3" fill="#ECE7DD">
          <textPath href="#path-top" startOffset="50%" text-anchor="middle">${cleanMission} • ${cleanVehicle}</textPath>
        </text>
        <text font-family="'IBM Plex Sans', sans-serif" font-weight="600" font-size="11" letter-spacing="2" fill="#ECE7DD">
          <textPath href="#path-bottom" startOffset="50%" text-anchor="middle">${cleanCrew} • ${cleanYear}</textPath>
        </text>
        <rect x="110" y="300" width="180" height="20" fill="#222222" rx="4" stroke="#A68A64" stroke-width="1" />
        <text x="200" y="314" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="bold" fill="#ECE7DD" text-anchor="middle" letter-spacing="1">
          ${cleanObjective}
        </text>
      </svg>`;

    case 'university':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <path d="M 80,40 L 320,40 L 320,230 Q 200,350 80,230 Z" fill="#F4F1EA" stroke="#7B4F36" stroke-width="8" stroke-linejoin="round" />
        <path d="M 92,52 L 308,52 L 308,225 Q 200,332 92,225 Z" fill="#222222" stroke="#D8D2C7" stroke-width="2" stroke-linejoin="round" />
        <g opacity="0.1">
          <line x1="80" y1="100" x2="320" y2="100" stroke="#FFFFFF" stroke-width="1"/>
          <line x1="80" y1="150" x2="320" y2="150" stroke="#FFFFFF" stroke-width="1"/>
          <line x1="80" y1="200" x2="320" y2="200" stroke="#FFFFFF" stroke-width="1"/>
          <line x1="140" y1="40" x2="140" y2="300" stroke="#FFFFFF" stroke-width="1"/>
          <line x1="200" y1="40" x2="200" y2="350" stroke="#FFFFFF" stroke-width="1"/>
          <line x1="260" y1="40" x2="260" y2="300" stroke="#FFFFFF" stroke-width="1"/>
        </g>
        <g transform="translate(200, 180) scale(1.1)">
          <polygon points="0,70 -8,110 0,100 8,110" fill="#A68A64" />
          <rect x="-4" y="20" width="8" height="50" fill="#ECE7DD" />
          <path d="M -4,70 L -12,85 L -4,85 Z" fill="#7B4F36" />
          <path d="M 4,70 L 12,85 L 4,85 Z" fill="#7B4F36" />
          <rect x="-3" y="-30" width="6" height="50" fill="#ECE7DD" />
          <polygon points="-3,-30 0,-48 3,-30" fill="#7B4F36" />
          <path d="M -3,20 L -8,32 L -3,32 Z" fill="#7B4F36" />
          <path d="M 3,20 L 8,32 L 3,32 Z" fill="#7B4F36" />
        </g>
        ${makeStar(120, 110, 5)}
        ${makeStar(280, 110, 5)}
        ${makeStar(140, 220, 4)}
        ${makeStar(260, 220, 4)}
        ${makeStar(200, 80, 6)}
        <rect x="92" y="52" width="216" height="36" fill="#7B4F36" />
        <text x="200" y="74" font-family="'IBM Plex Sans', sans-serif" font-weight="bold" font-size="13" fill="#F4F1EA" text-anchor="middle" letter-spacing="2">
          ${cleanMission}
        </text>
        <path d="M 110,130 Q 115,180 135,220" fill="none" stroke="#5D6B5D" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 290,130 Q 285,180 265,220" fill="none" stroke="#5D6B5D" stroke-width="2.5" stroke-linecap="round" />
        <polygon points="80,285 200,270 320,285 320,312 200,297 80,312" fill="#5D6B5D" stroke="#7B4F36" stroke-width="2" />
        <text x="200" y="295" font-family="'IBM Plex Sans', sans-serif" font-weight="700" font-size="10" fill="#F4F1EA" text-anchor="middle" letter-spacing="1.5">
          ${cleanVehicle}
        </text>
        <text x="200" y="328" font-family="'IBM Plex Mono', monospace" font-size="8.5" fill="#222222" text-anchor="middle" font-weight="bold">
          ${cleanObjective} • ${cleanYear}
        </text>
        <text x="200" y="340" font-family="'IBM Plex Mono', monospace" font-size="7.5" fill="#5A5A5A" text-anchor="middle">
          ${cleanCrew}
        </text>
      </svg>`;

    case 'experimental':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <polygon points="200,30 365,125 365,315 200,390 35,315 35,125" fill="#222222" stroke="#D8D2C7" stroke-width="4" stroke-linejoin="round" />
        <polygon points="200,40 355,130 355,310 200,380 45,310 45,130" fill="#F4F1EA" stroke="#7B4F36" stroke-width="2" stroke-linejoin="round" />
        <g stroke="#D8D2C7" stroke-width="0.5" opacity="0.6">
          <circle cx="200" cy="210" r="100" fill="none" stroke-dasharray="4,4" />
          <line x1="200" y1="40" x2="200" y2="380" />
          <line x1="45" y1="210" x2="355" y2="210" />
        </g>
        <g transform="translate(200, 205) scale(1.15)">
          <line x1="0" y1="45" x2="0" y2="90" stroke="#7B4F36" stroke-width="2" stroke-dasharray="4,4" />
          <path d="M 0,-60 L 5,-40 L 4,10 L 32,32 L 35,42 L 8,38 L 5,45 L -5,45 L -8,38 L -35,42 L -32,32 L -4,10 L -5,-40 Z" fill="#FFFFFF" stroke="#222222" stroke-width="2" />
          <path d="M 0,-60 L 3,-40 L 3,10 L 0,15 L -3,10 L -3,-40 Z" fill="#7B4F36" />
        </g>
        <rect x="70" y="80" width="85" height="18" fill="#FFFFFF" stroke="#D8D2C7" stroke-width="1" />
        <text x="112.5" y="92" font-family="'IBM Plex Mono', monospace" font-size="8" font-weight="bold" fill="#7B4F36" text-anchor="middle">SYS: ${cleanVehicle.split(' ')[0]}</text>
        <rect x="245" y="80" width="85" height="18" fill="#FFFFFF" stroke="#D8D2C7" stroke-width="1" />
        <text x="287.5" y="92" font-family="'IBM Plex Mono', monospace" font-size="8" font-weight="bold" fill="#7B4F36" text-anchor="middle">YEAR: ${cleanYear}</text>
        <text x="200" y="335" font-family="'IBM Plex Sans', sans-serif" font-weight="700" font-size="18" fill="#222222" text-anchor="middle" letter-spacing="4">
          ${cleanMission}
        </text>
        <text x="200" y="352" font-family="'IBM Plex Mono', monospace" font-size="8.5" fill="#5A5A5A" text-anchor="middle" letter-spacing="1">
          ${cleanObjective}
        </text>
        <text x="200" y="365" font-family="'IBM Plex Mono', monospace" font-size="7.5" fill="#5D6B5D" text-anchor="middle">
          ${cleanCrew}
        </text>
      </svg>`;

    case 'deepspace':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <circle cx="200" cy="200" r="185" fill="#222222" stroke="#A68A64" stroke-width="5" />
        <circle cx="200" cy="200" r="172" fill="#5D6B5D" opacity="0.3" />
        <circle cx="200" cy="200" r="95" fill="#7B4F36" opacity="0.9" stroke="#D8D2C7" stroke-width="1" />
        <path d="M 108,180 Q 200,210 292,180 A 95,95 0 0,1 294,195 Q 200,225 106,195 Z" fill="#A68A64" opacity="0.7" />
        <path d="M 100,110 A 25,25 0 1,0 140,140 A 20,20 0 1,1 100,110" fill="#ECE7DD" />
        <g stroke="#D8D2C7" stroke-width="0.75" opacity="0.5">
          <line x1="80" y1="80" x2="110" y2="60" /><line x1="110" y1="60" x2="150" y2="70" />
          <circle cx="80" cy="80" r="2" fill="#FFFFFF" /><circle cx="180" cy="50" r="3" fill="#FFFFFF" />
        </g>
        ${makeStar(290, 70, 4)}${makeStar(320, 100, 6)}${makeStar(75, 230, 5)}
        <defs>
          <path id="deep-top" d="M 40,200 A 160,160 0 0,1 360,200" fill="none" />
          <path id="deep-bottom" d="M 360,200 A 160,160 0 0,1 40,200" fill="none" />
        </defs>
        <text font-family="'IBM Plex Sans', sans-serif" font-weight="700" font-size="14" fill="#ECE7DD" letter-spacing="3">
          <textPath href="#deep-top" startOffset="50%" text-anchor="middle">${cleanMission} • ${cleanVehicle}</textPath>
        </text>
        <text font-family="'IBM Plex Mono', monospace" font-size="10.5" fill="#A68A64" letter-spacing="2">
          <textPath href="#deep-bottom" startOffset="50%" text-anchor="middle">${cleanCrew} • ${cleanYear}</textPath>
        </text>
        <rect x="120" y="302" width="160" height="22" fill="#222222" rx="0" stroke="#7B4F36" stroke-width="1.5" />
        <text x="200" y="316" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="bold" fill="#F4F1EA" text-anchor="middle" letter-spacing="1">
          ${cleanObjective}
        </text>
      </svg>`;

    case 'student':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
        <circle cx="200" cy="200" r="185" fill="#ECE7DD" stroke="#222222" stroke-width="2" />
        <g stroke="#7B4F36" stroke-width="1.5">
          ${Array.from({ length: 24 }).map((_, idx) => {
            const angle = (idx * 2 * Math.PI) / 24;
            return `<line x1="${200 + 178 * Math.cos(angle)}" y1="${200 + 178 * Math.sin(angle)}" x2="${200 + 185 * Math.cos(angle)}" y2="${200 + 185 * Math.sin(angle)}" />`;
          }).join('\n')}
        </g>
        <circle cx="200" cy="200" r="165" fill="#222222" stroke="#D8D2C7" stroke-width="4" />
        <circle cx="200" cy="200" r="130" fill="#FFFFFF" stroke="#5D6B5D" stroke-width="2.5" />
        <g stroke="rgba(93, 107, 93, 0.15)" stroke-width="0.5">
          <line x1="70" y1="200" x2="330" y2="200" /><line x1="200" y1="70" x2="200" y2="330" />
        </g>
        <g transform="translate(200, 195) scale(0.9)">
          <polygon points="0,50 -35,110 35,110" fill="rgba(166, 138, 100, 0.25)" stroke="#A68A64" stroke-width="1.5" />
          <path d="M -15,10 L 15,10 L 22,50 L -22,50 Z" fill="#222222" stroke="#7B4F36" stroke-width="2" />
          <circle cx="0" cy="-10" r="18" fill="#ECE7DD" stroke="#222222" stroke-width="2" />
          <circle cx="0" cy="-10" r="10" fill="#7B4F36" />
        </g>
        <defs>
          <path id="stud-top" d="M 45,200 A 148,148 0 0,1 355,200" fill="none" />
          <path id="stud-bottom" d="M 355,200 A 148,148 0 0,1 45,200" fill="none" />
        </defs>
        <text font-family="'IBM Plex Sans', sans-serif" font-weight="700" font-size="12" fill="#ECE7DD" letter-spacing="2.5">
          <textPath href="#stud-top" startOffset="50%" text-anchor="middle">${cleanMission} • ${cleanVehicle}</textPath>
        </text>
        <text font-family="'IBM Plex Mono', monospace" font-size="9" fill="#A68A64" letter-spacing="1">
          <textPath href="#stud-bottom" startOffset="50%" text-anchor="middle">${cleanCrew} • ${cleanYear}</textPath>
        </text>
        <text x="200" y="320" font-family="'IBM Plex Mono', monospace" font-size="8.5" font-weight="bold" fill="#7B4F36" text-anchor="middle">${cleanObjective}</text>
      </svg>`;
  }
}

// ====================================================
// 5. APPLICATION CONTROLLER (main.js)
// ====================================================

let activeTab = 'overview';
let activeDesign = {
  explorer: {
    windSpeed: 5.0,
    launchAngle: 85.0,
    cgPosition: 1.15,
    cpPosition: 1.45,
    finDamage: 0.0,
    motorVariance: 2.0,
    recoveryReliability: 95.0,
    massDistribution: 'balanced'
  },
  nosecone: {
    modelA: { type: 'vonkarman', length: 0.5, radius: 0.06, wallThickness: 0.003, material: 'carbon' },
    modelB: { type: 'conical', length: 0.5, radius: 0.06, wallThickness: 0.003, material: 'pla' }
  },
  patch: {
    missionName: 'APEX-1',
    vehicleName: 'PHOENIX IV',
    launchYear: '2026',
    crewNames: 'SELVARAJ, GEMINI',
    objective: 'LUNAR TELEMETRY',
    style: 'nasa'
  }
};

let savedDesigns = [];

let simulatorInstance = null;
let simulationResult = null;
let animationFrameId = null;
let currentFrameIndex = 0;
let isAnimating = false;

let chartAltitude = null;
let chartVelocity = null;
let chartAcceleration = null;
let chartAoA = null;
let noseconeRadarChart = null;

window.addEventListener('DOMContentLoaded', () => {
  loadSavedDesigns();
  initNavigation();
  initExplorerControls();
  initNoseConeControls();
  initPatchControls();
  initDocsNavigation();
  initSavedDesignsWidget();
  switchTab('overview');
  renderOverviewBlueprint();
  updateNoseConeLab();
  renderMissionPatch();
});

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('active', section.id === `tab-${tabId}`);
  });

  if (tabId === 'explorer') {
    setTimeout(() => {
      initExplorerCharts();
      resizeExplorerCanvases();
      updateExplorerMetricsHUD();
    }, 50);
  } else if (tabId === 'nosecone') {
    setTimeout(() => {
      updateNoseConeLab();
    }, 50);
  } else if (tabId === 'overview') {
    renderOverviewBlueprint();
  }
}

function renderOverviewBlueprint() {
  const canvas = document.getElementById('overview-blueprint-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#ECE7DD';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const rx = w / 2;
  const ry = h / 2;
  const rl = w * 0.7;
  const rD = 32;

  ctx.save();
  ctx.translate(rx - rl/2, ry);

  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(rD * 2, -rD/2, rl - rD * 2, rD);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F4F1EA';
  ctx.beginPath();
  ctx.moveTo(rD * 2, -rD/2);
  ctx.quadraticCurveTo(0, -rD/2, 0, 0);
  ctx.quadraticCurveTo(0, rD/2, rD * 2, rD/2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ECE7DD';
  ctx.beginPath();
  ctx.moveTo(rl - rD * 3, -rD/2); ctx.lineTo(rl - rD, -rD * 1.5); ctx.lineTo(rl, -rD * 1.5); ctx.lineTo(rl, -rD/2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rl - rD * 3, rD/2); ctx.lineTo(rl - rD, rD * 1.5); ctx.lineTo(rl, rD * 1.5); ctx.lineTo(rl, rD/2); ctx.closePath(); ctx.fill(); ctx.stroke();

  const cgPos = rD * 6;
  const cpPos = rD * 8.5;

  ctx.fillStyle = '#222222';
  ctx.beginPath(); ctx.arc(cgPos, 0, 5, 0, 2*Math.PI); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(cgPos, 0); ctx.arc(cgPos, 0, 5, 0, Math.PI / 2); ctx.lineTo(cgPos, 0); ctx.arc(cgPos, 0, 5, Math.PI, 3 * Math.PI / 2); ctx.closePath(); ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace'; ctx.fillStyle = '#222222'; ctx.textAlign = 'center'; ctx.fillText('C.G.', cgPos, -12);

  ctx.strokeStyle = '#A24B42'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cpPos, 0, 6, 0, 2*Math.PI); ctx.stroke();
  ctx.fillStyle = '#A24B42'; ctx.beginPath(); ctx.arc(cpPos, 0, 2, 0, 2*Math.PI); ctx.fill(); ctx.fillText('C.P.', cpPos, -12);

  ctx.strokeStyle = '#5A5A5A'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, rD * 2); ctx.lineTo(rl, rD * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, rD * 2 - 4); ctx.lineTo(0, rD * 2 + 4); ctx.moveTo(rl, rD * 2 - 4); ctx.lineTo(rl, rD * 2 + 4); ctx.stroke();
  ctx.font = '9px "IBM Plex Mono", monospace'; ctx.fillStyle = '#5A5A5A'; ctx.fillText(`L = 2000 mm`, rl / 2, rD * 2 + 12);

  ctx.restore();
}

function initExplorerCharts() {
  const cAlt = document.getElementById('chart-altitude');
  const cVel = document.getElementById('chart-velocity');
  const cAcc = document.getElementById('chart-acceleration');
  const cAoa = document.getElementById('chart-aoa');
  
  if (cAlt && !chartAltitude) chartAltitude = new EngineeringChart(cAlt, { yLabel: 'Altitude (m)', lineColor: '#7B4F36' });
  if (cVel && !chartVelocity) chartVelocity = new EngineeringChart(cVel, { yLabel: 'Velocity (m/s)', lineColor: '#5D6B5D' });
  if (cAcc && !chartAcceleration) chartAcceleration = new EngineeringChart(cAcc, { yLabel: 'Acceleration (m/s²)', lineColor: '#A68A64' });
  if (cAoa && !chartAoA) chartAoA = new EngineeringChart(cAoa, { yLabel: 'Angle of Attack (°)', lineColor: '#7B4F36' });
}

function resizeExplorerCanvases() {
  const canvases = ['explorer-hud-canvas', 'chart-altitude', 'chart-velocity', 'chart-acceleration', 'chart-aoa'];
  canvases.forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const rect = canvas.parentNode.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (id === 'explorer-hud-canvas') {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
        }
      }
    }
  });
}

function initExplorerControls() {
  const inputs = [
    { id: 'windSpeed', key: 'windSpeed', valId: 'val-windSpeed', scale: 1 },
    { id: 'launchAngle', key: 'launchAngle', valId: 'val-launchAngle', scale: 1 },
    { id: 'cgPosition', key: 'cgPosition', valId: 'val-cgPosition', scale: 1 },
    { id: 'cpPosition', key: 'cpPosition', valId: 'val-cpPosition', scale: 1 },
    { id: 'finDamage', key: 'finDamage', valId: 'val-finDamage', scale: 1 },
    { id: 'motorVariance', key: 'motorVariance', valId: 'val-motorVariance', scale: 1 },
    { id: 'recoveryReliability', key: 'recoveryReliability', valId: 'val-recoveryReliability', scale: 1 }
  ];

  inputs.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / item.scale;
      activeDesign.explorer[item.key] = val;
      document.getElementById(item.valId).innerText = val.toFixed(item.id.includes('Position') ? 2 : 0);
      updateExplorerMetricsHUD();
    });
  });

  const massDistSelect = document.getElementById('massDistribution');
  if (massDistSelect) {
    massDistSelect.addEventListener('change', (e) => {
      activeDesign.explorer.massDistribution = e.target.value;
      updateExplorerMetricsHUD();
    });
  }

  const btnTraj = document.getElementById('btn-view-trajectory');
  const btnPlots = document.getElementById('btn-view-plots');
  const viewTraj = document.getElementById('viewport-trajectory');
  const viewPlots = document.getElementById('viewport-plots');

  if (btnTraj && btnPlots) {
    btnTraj.addEventListener('click', () => {
      btnTraj.classList.add('btn-primary'); btnTraj.classList.remove('btn-outline');
      btnPlots.classList.remove('btn-primary'); btnPlots.classList.add('btn-outline');
      viewTraj.style.display = 'flex';
      viewPlots.style.display = 'none';
    });
    btnPlots.addEventListener('click', () => {
      btnPlots.classList.add('btn-primary'); btnPlots.classList.remove('btn-outline');
      btnTraj.classList.remove('btn-primary'); btnTraj.classList.add('btn-outline');
      viewTraj.style.display = 'none';
      viewPlots.style.display = 'grid';
      setTimeout(() => {
        if (chartAltitude) chartAltitude.resize();
        if (chartVelocity) chartVelocity.resize();
        if (chartAcceleration) chartAcceleration.resize();
        if (chartAoA) chartAoA.resize();
      }, 50);
    });
  }

  const btnRun = document.getElementById('btn-run-simulation');
  if (btnRun) btnRun.addEventListener('click', runExplorerSimulation);
  updateExplorerMetricsHUD();
}

function updateExplorerMetricsHUD() {
  const tempSim = new RocketSimulator(activeDesign.explorer);
  const stabScoreEl = document.getElementById('hud-stability-score');
  const stabilityMarginEl = document.getElementById('hud-stability-margin');
  if (stabScoreEl) stabScoreEl.innerText = tempSim.stabilityScore.toFixed(0);
  if (stabilityMarginEl) stabilityMarginEl.innerText = `${tempSim.staticMarginCalibers.toFixed(2)} cal`;
  
  const stabilityCard = document.getElementById('hud-stability-card');
  if (stabilityCard) {
    stabilityCard.className = 'metric-card';
    if (tempSim.staticMarginCalibers < 0.2) stabilityCard.classList.add('border-danger');
    else if (tempSim.staticMarginCalibers < 1.0) stabilityCard.classList.add('border-warning');
  }

  const riskScoreEl = document.getElementById('hud-risk-score');
  const riskBarEl = document.getElementById('hud-risk-bar');
  if (riskScoreEl) riskScoreEl.innerText = `${tempSim.riskScore}%`;
  if (riskBarEl) {
    riskBarEl.style.width = `${tempSim.riskScore}%`;
    riskBarEl.className = 'metric-gauge-bar';
    if (tempSim.riskScore > 70) riskBarEl.classList.add('danger');
    else if (tempSim.riskScore > 35) riskBarEl.classList.add('warning');
    else riskBarEl.classList.add('success');
  }

  const canvas = document.getElementById('explorer-hud-canvas');
  if (canvas) {
    if (!isAnimating) {
      const rect = canvas.parentNode.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      drawRocketTelemetry(canvas, tempSim, 0);
    }
  }
}

function runExplorerSimulation() {
  if (isAnimating) {
    cancelAnimationFrame(animationFrameId);
    isAnimating = false;
  }
  const modal = document.getElementById('sim-loader-modal');
  const loaderText = document.getElementById('sim-loader-text');
  modal.style.display = 'flex';
  const loadingSteps = ['CALCULATING AERODYNAMIC STABILITY MARGIN...', 'INTEGRATING TRAJECTORY FLIGHT PATHS...', 'RUNNING MONTE CARLO STABILITY SIMULATIONS...', 'COMPILING TELEMETRY PLOTS...'];
  let stepIdx = 0;
  loaderText.innerText = loadingSteps[0];
  const loaderInterval = setInterval(() => {
    stepIdx++;
    if (stepIdx < loadingSteps.length) {
      loaderText.innerText = loadingSteps[stepIdx];
    } else {
      clearInterval(loaderInterval);
      modal.style.display = 'none';
      executeSimulationTimeline();
    }
  }, 450);
}

function executeSimulationTimeline() {
  simulatorInstance = new RocketSimulator(activeDesign.explorer);
  simulationResult = simulatorInstance.runAll();
  const terminal = document.getElementById('explorer-log-terminal');
  terminal.innerHTML = '';
  const timelineProgress = document.getElementById('sim-timeline-progress');
  if (timelineProgress) timelineProgress.style.width = '0%';
  const timelineBar = document.getElementById('sim-timeline-bar');
  const markers = timelineBar.querySelectorAll('.timeline-event-marker');
  markers.forEach(m => m.remove());

  simulationResult.events.forEach(evt => {
    const pct = (evt.time / simulatorInstance.t) * 100;
    const marker = document.createElement('div');
    marker.className = 'timeline-event-marker';
    if (evt.type === 'warning') marker.classList.add('warning');
    marker.style.left = `${pct}%`;
    marker.setAttribute('data-label', evt.label);
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      jumpToFrame(Math.round(evt.time / simulatorInstance.dt));
    });
    timelineBar.appendChild(marker);
  });

  initExplorerCharts();
  const tHistory = simulationResult.history;
  chartAltitude.setData(tHistory.map(p => ({ x: p.t, y: p.y })));
  chartVelocity.setData(tHistory.map(p => ({ x: p.t, y: p.speed })));
  chartAcceleration.setData(tHistory.map(p => ({ x: p.t, y: p.acc })));
  chartAoA.setData(tHistory.map(p => ({ x: p.t, y: p.aoa })));

  currentFrameIndex = 0;
  isAnimating = true;
  animateSimulationFrame();
}

function animateSimulationFrame() {
  if (!isAnimating || !simulatorInstance) return;
  const history = simulatorInstance.history;
  if (currentFrameIndex >= history.length) {
    isAnimating = false;
    document.getElementById('hud-max-altitude').innerText = `${simulatorInstance.maxAltitude.toFixed(0)} m`;
    document.getElementById('hud-max-velocity').innerText = `${simulatorInstance.maxVelocity.toFixed(0)} m/s`;
    document.getElementById('hud-max-gforce').innerText = `${(simulatorInstance.maxAcceleration / 9.81).toFixed(1)} G`;
    const statusVal = document.getElementById('hud-flight-status');
    if (statusVal) {
      if (simulatorInstance.failed) {
        statusVal.innerText = 'FAILURE DETECTED';
        statusVal.style.color = 'var(--color-danger)';
      } else {
        statusVal.innerText = 'NOMINAL MISSION';
        statusVal.style.color = 'var(--color-success)';
      }
    }
    return;
  }

  const canvas = document.getElementById('explorer-hud-canvas');
  drawRocketTelemetry(canvas, simulatorInstance, currentFrameIndex);
  document.getElementById('sim-timeline-progress').style.width = `${(currentFrameIndex / history.length) * 100}%`;

  const currentT = history[currentFrameIndex].t;
  const terminal = document.getElementById('explorer-log-terminal');
  const logsToRender = simulatorInstance.logs.filter(log => log.time <= currentT);
  const currentLogsShownCount = terminal.querySelectorAll('.log-entry').length;
  
  if (logsToRender.length > currentLogsShownCount) {
    for (let i = currentLogsShownCount; i < logsToRender.length; i++) {
      const entry = logsToRender[i];
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `<span class="log-time">[T+${entry.time.toFixed(2)}s]</span> <span class="log-text ${entry.type}">${entry.text}</span>`;
      terminal.appendChild(div);
    }
    terminal.scrollTop = terminal.scrollHeight;
  }

  document.getElementById('hud-max-altitude').innerText = `${history[currentFrameIndex].y.toFixed(0)} m`;
  document.getElementById('hud-max-velocity').innerText = `${history[currentFrameIndex].speed.toFixed(0)} m/s`;
  document.getElementById('hud-max-gforce').innerText = `${(history[currentFrameIndex].acc / 9.81).toFixed(1)} G`;

  currentFrameIndex += 2;
  animationFrameId = requestAnimationFrame(animateSimulationFrame);
}

function jumpToFrame(frameIdx) {
  if (isAnimating) {
    cancelAnimationFrame(animationFrameId);
    isAnimating = false;
  }
  currentFrameIndex = Math.min(frameIdx, simulatorInstance.history.length - 1);
  const canvas = document.getElementById('explorer-hud-canvas');
  drawRocketTelemetry(canvas, simulatorInstance, currentFrameIndex);
  document.getElementById('sim-timeline-progress').style.width = `${(currentFrameIndex / simulatorInstance.history.length) * 100}%`;

  const currentT = simulatorInstance.history[currentFrameIndex].t;
  const terminal = document.getElementById('explorer-log-terminal');
  terminal.innerHTML = '';
  simulatorInstance.logs.filter(log => log.time <= currentT).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span class="log-time">[T+${entry.time.toFixed(2)}s]</span> <span class="log-text ${entry.type}">${entry.text}</span>`;
    terminal.appendChild(div);
  });
  terminal.scrollTop = terminal.scrollHeight;
}

function initNoseConeControls() {
  const configs = [{ prefix: 'ncA-', model: 'modelA' }, { prefix: 'ncB-', model: 'modelB' }];
  configs.forEach(conf => {
    const typeSel = document.getElementById(`${conf.prefix}type`);
    if (typeSel) {
      typeSel.addEventListener('change', (e) => {
        activeDesign.nosecone[conf.model].type = e.target.value;
        updateNoseConeLab();
      });
    }
    const lenInput = document.getElementById(`${conf.prefix}length`);
    if (lenInput) {
      lenInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        activeDesign.nosecone[conf.model].length = val;
        document.getElementById(`val-${conf.prefix}length`).innerText = `${(val * 1000).toFixed(0)}mm`;
        updateNoseConeLab();
      });
    }
    const radInput = document.getElementById(`${conf.prefix}radius`);
    if (radInput) {
      radInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        activeDesign.nosecone[conf.model].radius = val;
        document.getElementById(`val-${conf.prefix}radius`).innerText = `${(val * 2 * 1000).toFixed(0)}mm`;
        updateNoseConeLab();
      });
    }
    const wallInput = document.getElementById(`${conf.prefix}wall`);
    if (wallInput) {
      wallInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        activeDesign.nosecone[conf.model].wallThickness = val;
        document.getElementById(`val-${conf.prefix}wall`).innerText = `${(val * 1000).toFixed(1)}mm`;
        updateNoseConeLab();
      });
    }
    const matSel = document.getElementById(`${conf.prefix}material`);
    if (matSel) {
      matSel.addEventListener('change', (e) => {
        activeDesign.nosecone[conf.model].material = e.target.value;
        updateNoseConeLab();
      });
    }
  });

  const btnExport = document.getElementById('btn-export-nosecone-report');
  if (btnExport) btnExport.addEventListener('click', exportNoseConeReport);
}

function updateNoseConeLab() {
  const modelA = activeDesign.nosecone.modelA;
  const modelB = activeDesign.nosecone.modelB;
  const metricsA = getNoseConeMetrics(modelA.type, modelA.length, modelA.radius, modelA.wallThickness, modelA.material);
  const metricsB = getNoseConeMetrics(modelB.type, modelB.length, modelB.radius, modelB.wallThickness, modelB.material);

  const updateTableStats = (prefix, metrics) => {
    document.getElementById(`${prefix}hud-volume`).innerText = `${(metrics.volume * 1000).toFixed(2)} L`;
    document.getElementById(`${prefix}hud-surface`).innerText = `${(metrics.surfaceArea * 10000).toFixed(0)} cm²`;
    document.getElementById(`${prefix}hud-mass`).innerText = `${(metrics.mass * 1000).toFixed(0)} g`;
    document.getElementById(`${prefix}hud-drag-sub`).innerText = metrics.dragSubsonic.toFixed(3);
    document.getElementById(`${prefix}hud-drag-sup`).innerText = metrics.dragSupersonic.toFixed(3);
  };
  updateTableStats('ncA-', metricsA);
  updateTableStats('ncB-', metricsB);

  const canvasA = document.getElementById('nosecone-viewport-a');
  const canvasB = document.getElementById('nosecone-viewport-b');
  
  if (canvasA) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasA.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvasA.width = rect.width * dpr; canvasA.height = rect.height * dpr;
    }
    drawCADBlueprint(canvasA, modelA.type, modelA.length, modelA.radius, modelA.wallThickness, true, modelB.type, modelB.length, modelB.radius);
  }
  if (canvasB) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasB.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvasB.width = rect.width * dpr; canvasB.height = rect.height * dpr;
    }
    drawCADBlueprint(canvasB, modelB.type, modelB.length, modelB.radius, modelB.wallThickness, true, modelA.type, modelA.length, modelA.radius);
  }

  const radarCanvas = document.getElementById('nosecone-radar-canvas');
  if (radarCanvas) {
    if (!noseconeRadarChart) {
      noseconeRadarChart = new RadarChart(radarCanvas, {
        labels: ['Drag Efficiency', 'Volumetric Space', 'Mass Simplicity', 'Structure Strength', 'Mach Stability']
      });
    }
    noseconeRadarChart.setModels(
      [metricsA.ratings.dragRating/100, metricsA.ratings.volumeRating/100, metricsA.ratings.massRating/100, metricsA.ratings.strengthRating/100, metricsA.ratings.simplicity/100],
      [metricsB.ratings.dragRating/100, metricsB.ratings.volumeRating/100, metricsB.ratings.massRating/100, metricsB.ratings.strengthRating/100, metricsB.ratings.simplicity/100]
    );
  }
}

function exportNoseConeReport() {
  const modelA = activeDesign.nosecone.modelA;
  const modelB = activeDesign.nosecone.modelB;
  const metricsA = getNoseConeMetrics(modelA.type, modelA.length, modelA.radius, modelA.wallThickness, modelA.material);
  const metricsB = getNoseConeMetrics(modelB.type, modelB.length, modelB.radius, modelB.wallThickness, modelB.material);

  const reportText = `==================================================
APEX AEROSPACE STUDIO: NOSE CONE OPTIMIZATION REPORT
==================================================
MODEL A: Type ${modelA.type.toUpperCase()}, Mass: ${(metricsA.mass*1000).toFixed(0)}g, Drag Sub/Sup: ${metricsA.dragSubsonic.toFixed(3)}/${metricsA.dragSupersonic.toFixed(3)}
MODEL B: Type ${modelB.type.toUpperCase()}, Mass: ${(metricsB.mass*1000).toFixed(0)}g, Drag Sub/Sup: ${metricsB.dragSubsonic.toFixed(3)}/${metricsB.dragSupersonic.toFixed(3)}
==================================================`;
  
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Apex_Aerospace_Nosecone_Report.txt`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function initPatchControls() {
  const fields = [
    { id: 'patch-mission', key: 'missionName' },
    { id: 'patch-vehicle', key: 'vehicleName' },
    { id: 'patch-year', key: 'launchYear' },
    { id: 'patch-crew', key: 'crewNames' },
    { id: 'patch-objective', key: 'objective' }
  ];
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) {
      el.addEventListener('input', (e) => {
        activeDesign.patch[f.key] = e.target.value;
        renderMissionPatch();
      });
    }
  });

  const styleSel = document.getElementById('patch-style');
  if (styleSel) {
    styleSel.addEventListener('change', (e) => {
      activeDesign.patch.style = e.target.value;
      renderMissionPatch();
    });
  }

  const btnExport = document.getElementById('btn-export-patch');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const container = document.getElementById('patch-svg-viewport');
      const blob = new Blob([container.innerHTML], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Apex_Mission_Patch_${activeDesign.patch.missionName}.svg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });
  }
}

function renderMissionPatch() {
  const container = document.getElementById('patch-svg-viewport');
  if (container) container.innerHTML = generatePatchSVG(activeDesign.patch);
}

function initDocsNavigation() {
  const docLinks = document.querySelectorAll('.docs-nav-link');
  docLinks.forEach(link => {
    link.addEventListener('click', () => {
      const secId = link.dataset.section;
      docLinks.forEach(l => l.classList.toggle('active', l.dataset.section === secId));
      document.querySelectorAll('.docs-section').forEach(sec => sec.classList.toggle('active', sec.id === `docs-${secId}`));
    });
  });
}

function loadSavedDesigns() {
  const saved = localStorage.getItem('apex_saved_designs');
  if (saved) {
    try { savedDesigns = JSON.parse(saved); } catch(e) { savedDesigns = []; }
  } else {
    savedDesigns = [
      {
        id: 'design-default-stable',
        name: 'Apex Sounding Beta',
        timestamp: '2026-06-25',
        design: JSON.parse(JSON.stringify(activeDesign))
      }
    ];
    saveDesignsToStorage();
  }
}

function saveDesignsToStorage() {
  localStorage.setItem('apex_saved_designs', JSON.stringify(savedDesigns));
}

function initSavedDesignsWidget() {
  const btnSave = document.getElementById('btn-save-current-design');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = prompt('Workspace Name:', `Apex Project ${savedDesigns.length + 1}`);
      if (!name) return;
      savedDesigns.push({ id: `design-${Date.now()}`, name, timestamp: new Date().toISOString().split('T')[0], design: JSON.parse(JSON.stringify(activeDesign)) });
      saveDesignsToStorage();
      renderSavedDesignsList();
    });
  }
  renderSavedDesignsList();
}

function renderSavedDesignsList() {
  const container = document.getElementById('saved-designs-container');
  if (!container) return;
  container.innerHTML = '';
  savedDesigns.forEach(item => {
    const div = document.createElement('div');
    div.className = 'saved-design-item';
    div.innerHTML = `<div class="title">${item.name}</div><div class="subtitle">${item.timestamp}</div>`;
    div.addEventListener('click', () => {
      loadWorkspaceDesign(item.design);
    });
    container.appendChild(div);
  });
}

function loadWorkspaceDesign(designData) {
  activeDesign = JSON.parse(JSON.stringify(designData));
  // Sync sliders
  const syncSlider = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      const vEl = document.getElementById(`val-${id}`); if (vEl) vEl.innerText = val.toFixed(id.includes('Position') ? 2 : 0);
    }
  };
  const exp = activeDesign.explorer;
  syncSlider('windSpeed', exp.windSpeed);
  syncSlider('launchAngle', exp.launchAngle);
  syncSlider('cgPosition', exp.cgPosition);
  syncSlider('cpPosition', exp.cpPosition);
  syncSlider('finDamage', exp.finDamage);
  syncSlider('motorVariance', exp.motorVariance);
  syncSlider('recoveryReliability', exp.recoveryReliability);
  
  updateExplorerMetricsHUD();
  updateNoseConeLab();
  renderMissionPatch();
  renderOverviewBlueprint();
}
