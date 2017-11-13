(function main() {
  var projection = d3.geoOrthographic()
    .translate([300, 300])
    .scale(300)
    .rotate([-66,-34]) //where Afghanistan is centered! (first in countryList)
    .clipAngle(90);

  var path = d3.geoPath()
    .projection(projection);

  var globe = d3.select('#globeDiv')
    .append('svg')
      .attr('width', 600)
      .attr('height', 600)
      .attr('id', 'globe');

  var countryIDs = {};

  d3.csv("assets/obesity_countries_m-f_2003-2013.csv", function(error, data) {
    if (error) { console.log(error); }

  //Building the dropdown list of countries
    data.forEach(function(d) {
      countryIDs[d.location] = d.location_name;
    });
    // console.log(countryIDs);

    for(var code in countryIDs) {
      var countryOption = d3.select('#countryList')
        .append('option')
        .text(countryIDs[code])
        .property('value', code);
    }

    d3.csv("assets/obesity_countries_both_2003-2013.csv", function(error, mapData) {
      if (error) { console.log(error); }

      buildGlobe(mapData, path, globe, projection);
      buildChart(data, mapData, countryIDs, path, globe, projection);
    });

  });

})();
