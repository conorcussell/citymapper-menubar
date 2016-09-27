const ipc = require('electron').ipcRenderer;
const $ = require('jquery');
const open = require("open");

const citymapperApiKey = require('../secrets').key;

const fromInput = document.querySelector('.js-from-input');
fromInput.addEventListener('input', updateFrom);

const toInput = document.querySelector('.js-to-input');
toInput.addEventListener('input', updateTo);

ipc.on('show', () => {
  fromInput.focus()
});

const googleurl = 'http://maps.googleapis.com/maps/api/geocode/json?address=';

let fromPos = {};
let toPos = {};

function getCoordsFromPostCode(postcode, position) {
  $.getJSON(googleurl + postcode, (response) => {
    if (response.results) {
      position.lat = response.results[0].geometry.location.lat;
      position.lng = response.results[0].geometry.location.lng;
    }
  });
}

function updateFrom(e) {
  getCoordsFromPostCode(e.currentTarget.value, fromPos);
}

function updateTo(e) {
  getCoordsFromPostCode(e.currentTarget.value, toPos);
}

const getTime = document.querySelector('.js-go');
getTime.addEventListener('click', getTravelTime);

function checkApiCoverage(coord) {
  console.log()
  const url = `https://developer.citymapper.com/api/1/singlepointcoverage/?coord=${coord}&key=${citymapperApiKey}`;
  return new Promise((resolve, reject) => {
    $.getJSON(url, (response) => {
      if (response.points[0].covered) {
        resolve();
      } else {
        reject('Sorry, we have no data for that journey!');
      }
    });
  });
}

function routeApiUrl(startcoord, endcoord) {
  return `https://developer.citymapper.com/api/1/traveltime/?startcoord=${startcoord}&endcoord=${endcoord}&key=${citymapperApiKey}`;
}

function makeLocation(pos) {
  return `${pos.lat},${pos.lng}`;
}

function getTravelTime() {
  const start = makeLocation(fromPos);
  const end = makeLocation(toPos);

  const startCovered = checkApiCoverage(start);
  const endCovered = checkApiCoverage(end);
  Promise.all([startCovered, endCovered])
  .then(values => {
    $.getJSON(routeApiUrl(start, end), (response) => {
      if (response.travel_time_minutes) {
        document.querySelector('.js-mins').innerHTML = `${response.travel_time_minutes} minutes by 🚌`;
        addUrlToLink(start, end);
      }
    });
  })
  .catch((err) => {
    handleError(err);
  });
}

function handleError(error) {
  document.querySelector('.js-mins').innerHTML = `<div>🙅</div> <span style="font-size:1rem">${error}</span>`;
  citymapperLink.style.display = 'none';
}

function cityMapperUrl(fromLocation, toLocation) {
  return `https://citymapper.com/directions?startcoord=${fromLocation}&endcoord=${toLocation}`;
}

const citymapperLink = document.querySelector('.js-city-mapper');
citymapperLink.addEventListener('click', visitCitymapper);

function addUrlToLink(start, end) {
  citymapperLink.setAttribute('href', cityMapperUrl(start, end));
  citymapperLink.style.display = 'block';
}

function visitCitymapper(e) {
  e.preventDefault();
  open(this.getAttribute('href'));
}
