var ipc = require('electron').ipcRenderer
var searchInput = document.querySelector('.js-search');
var $ = require('jquery');

searchInput.addEventListener('input', search);

ipc.on('show', function (event, message) {
  searchInput.focus()
});

const googleurl = 'http://maps.googleapis.com/maps/api/geocode/json?address=';

function search(e) {
  $.getJSON(googleurl + e.currentTarget.value, (response) => {
    if (response && response.results) {
      document.querySelector('.js-results').textContent = response.results[0].geometry.location.lat + ' ' + response.results[0].geometry.location.lng;
    }
  });
}

const mapurl = 'https://developer.citymapper.com/api/1/traveltime/?startcoord=51.525246%2C0.084672&endcoord=51.559098%2C0.074503&time=2014-11-06T19%3A00%3A02-0500&time_type=arrival&key=0365e072d0b665923245fa37d281f2f8'
