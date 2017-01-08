export default class Repository {
  constructor(name, ctor) {
    this._name = name;
    this._templates = {};
    this._ctor = ctor;
    this._randomTemplates = {};
  }

  define(name, template, options) {
    this._templates[name] = template;

    const disableRandomCreation = options && options.disableRandomCreation;
    if (!disableRandomCreation) {
      this._randomTemplates[name] = template;
    }
  }

  create(name, extraProperties = {}) {
    const template = this._templates[name];
    if (!template) {
      throw new Error(`No template named '${template}' in repository '${this._name}'.`);
    }
    return new this._ctor(Object.assign({}, template, extraProperties));
  }

  createRandom() {
    return this.create(Object.keys(this._randomTemplates).random());
  }
}
