export default class Repository {
  constructor(name, ctor) {
    this._name = name;
    this._templates = {};
    this._ctor = ctor;
  }

  define(name, template) {
    this._templates[name] = template;
  }

  create(name) {
    const template = this._templates[name];
    if (!template) {
      throw new Error(`No template named '${template}' in repository '${this._name}'.`);
    }
    return new this._ctor(template);
  }

  createRandom() {
    return this.create(Object.keys(this._templates).random());
  }
}
