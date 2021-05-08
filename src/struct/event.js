class Event {
  /**
   * @param {Object} options options for your events.
   * @param {String} [options.id]
   * @param {Boolean} [options.once]
   * @param {String} [options.emitter]
   */
  constructor(options) {
    this.id = options.id || "";
    this.type = options.once || false;
    this.emitter = options.emitter || null;
  }
}

module.exports = Event;