

class Command {
/**
 * @param {Object} options options for your commands.
 * @param {String} [options.id]
 * @param {Array} [options.aliases]
 * @param {String} [options.description]
 * @param {String} [options.usage]
 * @param {String} [options.category]
 * @param {Boolean} [options.guildOnly]
 * @param {Boolean} [options.ownerOnly]
 * @param {Number} [options.requiredArgs]
 * @param {Number} [options.ratelimit]
 * @param {Array} [options.userPermissions]
 * @param {Array} [options.clientPermissions]
 */
  constructor(options) {
    this.id = options.id || "";
    this.aliases = options.aliases || [];
    this.description = options.description || null;
    this.usage = options.usage || null;
    this.category = options.category || null;
    this.guildOnly = Boolean(options.guildOnly) || true;
    this.ownerOnly = Boolean(options.ownerOnly) || false;
    this.requiredArgs = Number(options.requiredArgs) || 0;
    this.ratelimit = Number(options.ratelimit) || 0;
    this.userPermissions = options.userPermissions || [];
    this.clientPermissions = options.clientPermissions || [];
  }
}

module.exports = Command;