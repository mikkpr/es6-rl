// import Game from './index';
import Item from './item';

export const Edible = {
  name: 'Edible',
  init(template) {
    this._foodValue = template.foodValue || 5;
    this._maxConsumptions = template.consumptions || 1;
    this._remainingConsumptions = this._maxConsumptions;
  },
  eat(entity) {
    if (entity.hasMixin('Hunger')) {
      if (this.hasRemainingConsumptions()) {
        entity.modifyFullnessBy(this._foodValue);
        this._remainingConsumptions--;
      }
    }
  },
  hasRemainingConsumptions() {
    return this._remainingConsumptions > 0;
  },
  describe() {
    if (this._maxConsumptions > 1 && this._remainingConsumptions < this._maxConsumptions) {
      return `partly eaten ${Item.prototype.describe.call(this)}`;
    } else {
      return this._name;
    }
  },
};

export const Equippable = {
  name: 'Equippable',
  init(template) {
    this._attackValue = template.attackValue || 0;
    this._defenseValue = template.defenseValue || 0;
    this._wieldable = template.wieldable || false;
    this._wearable = template.wearable || false;
  },
  getAttackValue() {
    return this._attackValue;
  },
  getDefenseValue() {
    return this._defenseValue;
  },
  isWieldable() {
    return this._wieldable;
  },
  isWearable() {
    return this._wearable;
  },
};
