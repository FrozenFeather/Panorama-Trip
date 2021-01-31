class Animator{
  constructor(currentValue){
    this.value = currentValue;
    this.target = currentValue;
    this.lastChange = 0;
    this.hasConstraint = false;

    // default parameter
    this.alpha = 0.05;
    this.maxAcc = 0.01;
  }
  getValue(){
    return this.value;
  }
  setConstraint = function(minValue, maxValue){
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.hasConstraint = true;
  }
  hop = function(value){
    if(this.hasConstraint){
      if(value > this.maxValue) value = this.maxValue;
      if(value < this.minValue) value = this.minValue;
    }
    this.value = value;
    this.target = value;
  }
  setTarget = function(target){
    if(this.hasConstraint){
      if(target > this.maxValue) target = this.maxValue;
      if(target < this.minValue) target = this.minValue;
    }
    this.target = target;
  }
  addOffset = function(offset){
    this.value += offset;
    this.target += offset;

    if(this.hasConstraint){
      if(this.value > this.maxValue) this.value = this.maxValue;
      if(this.value < this.minValue) this.value = this.minValue;
      if(this.target > this.maxValue) this.target = this.maxValue;
      if(this.target < this.minValue) this.target = this.minValue;
    }
  }
  nextStep = function(){
    var change = this.alpha * (this.target - this.value);
    if(Math.abs(change) - Math.abs(this.lastChange) > this.maxAcc){
      var sign = 1;
      if(change - this.lastChange < 0) sign = -1;
      change = this.lastChange + sign * this.maxAcc;
    }
    this.lastChange = change;
    this.value += change;
    return this.value;
  }
}

export { Animator };