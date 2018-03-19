import Ember from 'ember';
import config from '../config/environment';

export function formatBalance(value) {
	value = value * 0.000000001;
	return value.toFixed(8) + " " + config.APP.Unit;
}

export default Ember.Helper.helper(formatBalance);
