/** PIR library **/
/** bugsounet **/

var log = (...args) => { /* do nothing */ }

class PIR {
  constructor(config, callback) {
    this.config = config
    this.callback = callback
    this.default = {
      debug: this.config.debug,
      chip: 4,
      line: 2,
      reverseValue: false
    }
    this.config = Object.assign({}, this.default, this.config)
    if (!this.config.libgpiod) return console.error("[MMM-Pir-gpiod] [LIB] [PIR] libgpiod library missing!")
    if (this.config.debug) log = (...args) => { console.log("[MMM-Pir-gpiod] [LIB] [PIR]", ...args) }
    this.pirChip = null
    this.pirLine = null
    this.running = false
    this.callback("PIR_INITIALIZED")
  }

  start () {
    if (this.running) return
    log("Start")
    try {
      this.pirChip = new this.config.libgpiod.Chip(this.config.chip)
      this.pirLine = new this.config.libgpiod.Line(this.pirChip, this.config.line)
      this.pirLine.requestInputMode()
      this.callback("PIR_STARTED")
      console.log("[MMM-Pir-gpiod] [LIB] [PIR] Started!")
    } catch (err) {
      console.error("[MMM-Pir-gpiod] [LIB] [PIR] " + err)
      this.running = false
      return this.callback("PIR_ERROR", err.message)
    }
    this.running = true

    this.pollfunc = function () {
      if (this.running) {
        try {
          var value = this.pir.getValue();
          if (value != this.oldstate) {
            this.oldstate = value;
            log("Sensor read value: " + value)
            if ((value == 1 && !this.config.reverseValue) || (value == 0 && this.config.reverseValue)) {
              this.callback("PIR_DETECTED")
              log("Detected presence (value: " + value + ")")
            }
          }
        } catch (err) {
          console.error("[MMM-Pir-gpiod] [CORE] " + err)
          this.callback("PIR_ERROR", err)
        }
        
        setTimeout(() => this.pollfunc(), 100);
      }
    };

    setTimeout(() => this.pollfunc(), 100);
  }

  stop () {
    if (!this.running) return
    this.pirChip = null
    this.pirLine = null
    this.running = false
    this.callback("PIR_STOP")
    log("Stop")
  }
}

module.exports = PIR
