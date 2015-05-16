
Maps = new Mongo.Collection('maps');



Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function () { return Meteor.subscribe('maps'); }
});

Router.route('/', { name: 'mainPage'});

Router.route('/add/map', {name: 'addMap'});

Router.route('/maps/:_id', {
  name: 'mapPage',
  data: function () {
    Session.set('currentMap', this.params._id);
    return Maps.findOne(this.params._id);
  }
});




if (Meteor.isClient) {

  Meteor.subscribe('maps');

  Template.mainPage.helpers({
    maps: function () {
      return Maps.find();
    }
  });








  Template.mapPage.helpers({
    ownerCheck: function () {
      var whoMadeThis = Maps.findOne(Session.get('currentMap'));

      if (whoMadeThis.createdBy === Meteor.userId()) {
        return true;
      } else {
        return false;
      }
    }
  });

  Template.map.onRendered( function () {

    map = L.map('map');

    map.setView([20.505, -20.09], 2);

    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18,
        minZoom: 1
    }).addTo(map);

  });








  Template.addMap.events({
    'submit .addMapForm': function (event) {
      var title = event.target.title.value;

      Maps.insert({
        title: title,
        createdAt: new Date(),
        createdBy: Meteor.userId()
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });


  Meteor.publish('maps', function () {
    return Maps.find();
  });
}
