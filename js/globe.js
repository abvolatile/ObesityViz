//GLOBE - influenced by http://bl.ocks.org/KoGor/5994804
function buildGlobe(mapData, path, globe, projection) {
  var sens = 0.25,
  focused;

  // DRAWING THE 'WATER'
  globe.append('path')
    .datum({type: 'Sphere'})
      .attr('class', 'water')
      .attr('d', path)
    .call(d3.drag()
      .subject(function() {
        var r = projection.rotate();
        return {x: r[0]/sens, y: -r[1]/sens};
      })
      .on('drag', function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -(d3.event.y * sens), rotate[2]]);
        globe.selectAll('path.land')
          .attr('d', path);
        globe.selectAll('.focused').classed('focused', focused = false);
      }));


  d3.json('assets/countries-topo_50m.json', function(error, json) {
    if (error) { console.log(error); }

    var countries = topojson.feature(json, json.objects.countries).features;
    var currentMapData = getCurrentMapData(mapData);
    console.log(currentMapData);

    for(var i=0; i<currentMapData.length; i++) {
      var dataId = mapData[i].location;
      var mean = mapData[i].mean;

      for(var j=0; j<countries.length; j++) {
        var jsonId = countries[j].id;
      }
    }

    var countryInfo = d3.select('body')
      .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'countryInfo');

    var ctyTitle = d3.select('#countryInfo')
      .append('h3')
        .attr('class', 'tipTitle');
    var ctyBody = countryInfo.append('p')
        .attr('class', 'tipBody');

    // DRAWING COUNTRIES
    var land = globe.selectAll('path.land')
      .data(countries)
      .enter()
      .insert('path')
        .attr('class', 'land')
        .attr('d', path)
        .attr('stroke', "#ddd")
        .attr('stroke-width', 1)
        .attr('id', function(d) { return d.id; });

    // SETTING Afghanistan (1st in countryList) to have focused class  on load
    d3.select('#AFG').classed('focused', true);

    //COLOR FOR ALL COUNTRIES BY YEAR (BOTH M & F)
    var color = d3.scaleSequential(d3.interpolateRainbow)
      .domain([
        d3.min(getCurrentMapData(mapData), function(d) { return d.mean*100; }),
        d3.max(getCurrentMapData(mapData), function(d) { return d.mean*100; })
      ]);

    //THE LEGEND!!
    var legendData = [];
    countries.forEach(function(d) {
      var country = d.id;
      var countryName = "";
      var mean = [];
      var year = d3.select('#yearList').property('value');
      for(var i=0; i<mapData.length; i++) {
        if(country == mapData[i].location && year == mapData[i].year) {
          countryName = mapData[i].location_name;
          mean.push(parseFloat(mapData[i].mean));
        }
      }
      var meanLength = mean.length;
      var totalMean = ((mean.reduce(function(a, b) { return a + b; }, 0))/meanLength)*100;

      if (!isNaN(totalMean)) {
        legendData.push(parseFloat(totalMean.toFixed(1)));
      }
    });

    var legendW = document.getElementById('chartDiv').getBoundingClientRect().width - 20;
    legendData.sort(function(a, b) { return a - b; });
console.log(legendData);
    var legend = d3.select('#legendDiv').append('svg')
        .attr('width', document.getElementById('chartDiv').getBoundingClientRect().width)
        .attr('height', 80)
        .attr('id', 'legend');
    legend.selectAll('rect')
      .data(legendData)
      .enter().append('rect')
        .attr('x', function(d,i) { return i * (legendW/legendData.length); })
        .attr('y', 20)
        .attr('width', function(d, i) { return (legendW/legendData.length); })
        .attr('height', 20)
        .attr('fill', function(d) { return color(d); })
        .attr('class', 'legend');
    legend.selectAll('text')
      .data([legendData[0], legendData[legendData.length-1]])
      .enter().append('text')
        .text(function(d) { return d+'%'; })
        .attr('x', function(d,i) { return (legendW-25) * i; })
        .attr('y', 60)
        .attr('fill', '#fff');


    //THE MAP COLORS
    land.attr('fill', function(d) {
      var country = d.id;
      var countryName = "";
      var mean = [];
      var year = d3.select('#yearList').property('value');
      for(var i=0; i<mapData.length; i++) {
        if(country == mapData[i].location && year == mapData[i].year) {
          countryName = mapData[i].location_name;
          mean.push(parseFloat(mapData[i].mean));
        }
      }
      var meanLength = mean.length;
      var totalMean = ((mean.reduce(function(a, b) { return a + b; }, 0))/meanLength)*100;

      return color(totalMean.toFixed(1));
    });


    //MOUSE EVENTS!
    land.on('mouseover', function(d) {
      var country = d.id;
      var countryName = "";
      var mean = [];
      var year = d3.select('#yearList').property('value');
      for(var i=0; i<mapData.length; i++) {
        if(country == mapData[i].location && year == mapData[i].year) {
          countryName = mapData[i].location_name;
          mean.push(parseFloat(mapData[i].mean));
        }
      }
      var meanLength = mean.length;
      var totalMean = ((mean.reduce(function(a, b) { return a + b; }, 0))/meanLength)*100;

      var titleText = function() {
        if (countryName == "") { return 'No Information'; }
        else { return countryName+' - '+year; }
      }
      var bodyText = function() {
        if (countryName == "") { return 'No Information'; }
        else { return (totalMean).toFixed(1)+'% obese (all ages)'; }
      }

      countryInfo.style('display', 'block')
          .style('opacity', 0.95)
          .style('left', (d3.event.pageX+10)+'px')
          .style('top', (d3.event.pageY-20)+'px');
      ctyTitle.text(titleText());
      ctyBody.text(bodyText());
    })
    .on('mouseout', function(d) {
      countryInfo.style('opacity', 0).style('display', 'none');
    })
    .on('mousemove', function(d) {
      countryInfo.style('left', (d3.event.pageX+10)+'px').style('top', (d3.event.pageY-20)+'px')
    });

    //CHANGE COUNTRY LIST SELECTION ON CLICK:
    land.on('click', function(d) {
      d3.select('#countryList')
        .property('value', d.id)
        .dispatch('change'); //this will rotate the globe over in chart.js!!
    });

  });
}

function getCurrentMapData(mapData) {
  var currentMapData = [];
  for(var i=0; i<mapData.length; i++) {
    if(d3.select('#yearList').property('value') == mapData[i].year) {
      currentMapData.push(mapData[i]);
    }
  }
  return currentMapData;
}
