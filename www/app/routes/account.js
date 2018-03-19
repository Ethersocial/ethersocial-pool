import Ember from 'ember';
import config from '../config/environment';

export default Ember.Route.extend({
	model: function(params) {
		var url = config.APP.ApiUrl + 'api/accounts/' + params.login;
    return Ember.$.getJSON(url).then(function(data) {
      data.login = params.login;

      // setup network hashrate
      var staturl = config.APP.ApiUrl + 'api/stats';
      return Ember.$.getJSON(staturl).then(function(response) {
        var stats = Ember.Object.create(response);
        data.nethashrate = stats.nodes[0].difficulty / config.APP.BlockTime;
        return Ember.Object.create(data);
      });
    });
	},

  setupController: function(controller, model) {
    this._super(controller, model);
    Ember.run.later(this, this.refresh, 5000);
  },

  actions: {
    error(error) {
      if (error.status === 404) {
        return this.transitionTo('not-found');
      }
    }
  }
});
