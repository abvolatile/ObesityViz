//CHART
function buildChart(data, mapData, countryIDs, path, globe, projection) {
  var w = document.getElementById('chartDiv').getBoundingClientRect().width - 15,
  h = 250,
  pad = 35,
  yLength = h - 2*pad,
  xLength = w - pad; //adding some padding on all sides

//Drawing the SVG container for the chart, and year select list
  for(var i=2013; i>2002; i--) {
    var yearOption = d3.select('#yearList').append('option')
      .text(i)
      .property('value', i);
  }
  var chart = d3.select('#chartDiv')
    .append('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('id', 'chart');

  //selected Country Name!
  var countryName = function(d) {
    var country = d3.select('#countryList').property('value');
    for (var code in countryIDs) {
      if (country === code) { return countryIDs[code]; }
    }
  }

  //initiating #chartTitle with Afghanistan
  d3.select('#chartTitle').text(countryName());

  // X
  var ageGroups = ['2 to 4', '5 to 9', '10 to 14', '15 to 19', '20 to 24', '25 to 29', '30 to 34', '35 to 39', '40 to 44', '45 to 49', '50 to 54', '55 to 59', '60 to 64', '65 to 69', '70 to 74', '75 to 79', '80+'];

  var xScale = d3.scalePoint()
    .domain(ageGroups.map(function(d) { return d; }))
    .rangeRound([0, xLength]);

  var xAxis = d3.axisBottom(xScale);

  chart.append('g')
    .classed('x-axis', true)
    .attr('transform', function() {
      return 'translate('+pad+','+(h-pad)+')';
    }).call(xAxis);

  // Y
  var yScale = d3.scaleLinear()
    .domain([d3.max(data, function(d) {
      if (d3.select('#countryList').property('value') == d.location) {
        return d.mean;
      }
    }), 0])
    .range([0, yLength]);

  var yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickFormat(d3.format('.0%'));

  chart.append('g')
    .classed('y-axis', true)
    .attr('transform', function() {
      return 'translate('+pad+','+pad+')';
    }).call(yAxis);

  drawGraph(data, chart, pad, xScale, yScale);

  // UPDATE CHART WHEN COUNTRY SELECTED
  d3.select('#countryList').on('change', function() {
    d3.select('#lineG').remove();
    rescaleY(data, yScale, yAxis);

    drawGraph(data, chart, pad, xScale, yScale);

    d3.select('#chartTitle')
        .text(countryName());

    d3.json('./assets/countries-topo_50m.json', function(error, json) {
      if (error) { console.log(error); }

      var countries = topojson.feature(json, json.objects.countries).features;
      var focusedCountry = countryLand(countries, d3.select('#countryList').property('value'));
      var p = d3.geoCentroid(focusedCountry);

      globe.selectAll('.focused')
        .classed('focused', focused = false);

      //rotating the globe
      if (focusedCountry == undefined) { //countries-topo_50m.json somehow left out a couple ISO-A3 codes... (like Norway)
        d3.transition()
        .tween('rotate', function() {
          var r = d3.interpolate(projection.rotate(), [0, 0]);
          return function(t) {
            projection.rotate(r(t));
            globe.selectAll('path')
              .attr('d', path)
              .classed('focused', false);
            }
        });
        d3.select('#countryInfo').html("<strong>Sorry, can't find "+countryName()+" on the map right now...</strong>")
          .style('left', '170px')
          .style('top', '350px')
          .style('display', 'block')
          .style('opacity', 0.95);
      } else {
      d3.transition()
        .duration(2000)
        .tween('rotate', function() {
          var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            globe.selectAll('path')
              .attr('d', path)
              .classed('focused', function(d, i) {
                return d.id == focusedCountry.id ? focused = d : false;
              });
          }
        });
      }
    });
  });

  // UPDATE CHART & COLORS WHEN YEAR SELECTED
  d3.select('#yearList').on('change', function() {
    d3.select('#lineG').remove();
    rescaleY(data, yScale, yAxis);

    drawGraph(data, chart, pad, xScale, yScale);

    var color = d3.scaleSequential(d3.interpolateRainbow)
      .domain([
        d3.min(getCurrentMapData(mapData), function(d) { return d.mean*100; }),
        d3.max(getCurrentMapData(mapData), function(d) { return d.mean*100; })
      ]);
    //globe colors
    d3.selectAll('.land').attr('fill', function(d) {
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
      //EVENTUALLY GET LEGEND COLORS/TEXT TO CHANGE TOO!!
  });

}

function drawGraph(data, chart, pad, xScale, yScale) {
  var maleData = [];
  var femaleData = [];
  var countryCode = d3.select('#countryList').property('value');
  var year = d3.select('#yearList').property('value');
  data.forEach(function(d) {
    if (d.location === countryCode && d.sex === "male" && d.year === year) {
      //374 records per country, 34 per year
      maleData.push({
        countryCode: d.location,
        countryName: d.location_name,
        sex: d.sex,
        year: d.year,
        ageGroup: d.age_group,
        prevalence: parseFloat(d.mean)
      });
    } else if (d.location === countryCode && d.sex === "female" && d.year === year) {
      femaleData.push({
        countryCode: d.location,
        countryName: d.location_name,
        sex: d.sex,
        year: d.year,
        ageGroup: d.age_group,
        prevalence: parseFloat(d.mean)
      });
    }
  });
  // console.log(maleData);
  // console.log(femaleData);

  var g = chart.append('g')
  .attr('id', 'lineG')
    .attr('transform', 'translate('+pad+','+pad+')');

  var line = d3.area()
    .x(function(d) { return xScale(d.ageGroup.slice(0, -4)); })
    .y0(yScale(0))
    .y1(function(d) { return yScale(d.prevalence); })
    .curve(d3.curveLinear);

  g.append("path")
    .datum(maleData)
    .attr('id', 'maleLine')
    .attr('class', 'line')
    .attr("d", line)
    .attr('opacity', 0.6);

  g.append("path")
    .datum(femaleData)
    .attr('id', 'femaleLine')
    .attr('class', 'line')
    .attr("d", line)
    .attr('opacity', 0.6);

  lineHover(xScale);
}

function rescaleY (data, yScale, yAxis) {
  yScale.domain([d3.max(data, function(d) {
    if (d3.select('#countryList').property('value') == d.location) {
      return d.mean;
    }
  }), 0]);

  d3.select('.y-axis')
    .transition()
    .call(yAxis);
}

// https://github.com/wbkd/d3-extended = function to bring svg elements to front
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
// d3.selection.prototype.moveToBack = function() {
//     return this.each(function() {
//         var firstChild = this.parentNode.firstChild;
//         if (firstChild) {
//             this.parentNode.insertBefore(this, firstChild);
//         }
//     });
// };

function countryLand(countries, value) {
  for(var i=0; i<countries.length; i++) {
    if(countries[i].id == value) {
      return countries[i];
    }
  }
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
