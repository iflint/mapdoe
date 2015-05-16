
Maps = new Mongo.Collection('maps');



Router.configure({
  layoutTemplate: 'layout',
  waitOn: function () { }
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

      return whoMadeThis.createdBy === Meteor.userId();
    }
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
