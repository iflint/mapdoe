
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

  // part of Cloudinary configuration
  $.cloudinary.config({
    cloud_name: 'pacha'
  });

  Meteor.subscribe('maps');

// ________________main_page_____________________

  Template.mainPage.helpers({
    maps: function () {
      return Maps.find();
    }
  });

// _________________main_page____________________

// _________________map_page_____________________

  Template.mapPage.helpers({
    ownerCheck: function () {
      var whoMadeThis = Maps.findOne(Session.get('currentMap'));

      if (whoMadeThis.createdBy === Meteor.userId()) {
        return true;
      } else {
        return false;
      }
    },

    thisMapInfo: function () {
      return Maps.findOne(Session.get('currentMap'));
    }
  });

  Template.mapPage.events({
    'submit .addPointForm': function (event) {
      var lat = event.target.pointLatInput.value;
      var lon = event.target.pointLonInput.value;
      var desc = event.target.pointDescInput.value;
      var thisUser = Meteor.userId();
      var thisMap = Session.get('currentMap');

      Meteor.call('insertPoint', lat, lon, desc, thisUser, thisMap);
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

    var testIcon = L.icon({
      iconUrl: '/icon55.png'
    });

    // tracker adds points again when Map cursor changes
    Tracker.autorun( function() {

      var thisMap = Maps.findOne(Session.get('currentMap'));

      for (var i = 0; i < thisMap.points.length; i++) {

        var renderedDiv = document.createElement('div');
        Blaze.renderWithData(Template.popupContent, thisMap.points[i], renderedDiv);

        L.marker([thisMap.points[i].pointLat, thisMap.points[i].pointLon], {icon: testIcon}).addTo(map).bindPopup(renderedDiv);
      }
    });
  });

// ________________map_page______________________

// ________________add_map_______________________

  Template.addMap.events({
    'submit .addMapForm': function (event) {
      var title = event.target.mapTitleInput.value;
      var description = event.target.mapDescriptionInput.value;
      var thisUser = Meteor.userId();

      Meteor.call('insertMap',title, description, thisUser);
    }
  });

// ________________add_map_______________________
}


Meteor.methods({


  //creates a new map in the database
  insertMap: function (titleParam, descParam, userParam) {
    Maps.insert({
      title: titleParam,
      description: descParam,
      createdAt: new Date(),
      createdBy: userParam,
      points: []
    });
  },

  insertPoint: function (latParam, lonParam, descParam, userParam, mapParam) {
    var pointObject = {
      pointLat: latParam,
      pointLon: lonParam,
      pointDesc: descParam,
      createdAt: new Date(),
      createdBy: userParam,
      whichMap: mapParam
    }


    ServerSession.set('dfresh', pointObject);
    console.log(pointObject);
  },

  getPic: function (response) {
    var insertPointData = ServerSession.get('dfresh');

    insertPointData.mediaLink = response.upload_data.public_id;

    var theCurrentMap = Maps.findOne(insertPointData.whichMap);

    Maps.update(insertPointData.whichMap, {$push: {points: insertPointData}});

    console.log(theCurrentMap);

  }


});



if (Meteor.isServer) {
  Meteor.startup(function () {

  });

  // part of Cloudinary configuration
  Cloudinary.config({
    cloud_name: 'pacha',
    api_key: '826281595969759',
    api_secret: 'rvE7EWv5ZT8vAUuiCV24jZ76lj8'
  });


  Meteor.publish('maps', function () {

    return Maps.find();
  });
}
