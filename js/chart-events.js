function lineHover(xScale) {
  //Chart tooltip
  var chartInfo = d3.select('body')
    .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'chartInfo')
      .style('display', 'none');

  // MALE LINE HOVER EVENTS
  d3.select('#maleLine').on('mouseover', function(d,i) {
    d3.select(this)
      .attr('opacity', 1)
      .moveToFront();

    var scale = xScale(d[1].ageGroup.slice(0, -4)); //getting the x distance apart!
    var mouseX = d3.mouse(this)[0]; //get current x position of mouse
    var age = Math.round(mouseX/scale); //index of maleData

    chartInfo.style('display', 'block')
      .style('opacity', 0.95)
      .style('left', d3.event.pageX + 'px')
      .style('top', (d3.event.pageY-50) + 'px')
      .html('<h3 class="tipTitle">Males ' +d[age].ageGroup+ ':</h3><p class="tipBody">' +(d[age].prevalence*100).toFixed(1)+ '% obese</p>');

    d3.select('#femaleLine')
      .attr('opacity', 0.2);
  })
  .on('mouseleave', function() {
    d3.select(this)
      .attr('opacity', 0.6);

    chartInfo.style('opacity', 0).style('display', 'none');

    d3.select('#femaleLine')
      .attr('opacity', 0.6);
  })
  .on('mousemove', function(d) {
    var scale = xScale(d[1].ageGroup.slice(0, -4)); //getting the x distance apart!
    var mouseX = d3.mouse(this)[0]; //get current x position of mouse
    var age = Math.round(mouseX/scale); //index of maleData

    chartInfo.style('left', d3.event.pageX+'px')
      .style('top', (d3.event.pageY-50)+'px')
      .html('<h3 class="tipTitle">Males ' +d[age].ageGroup+ ':</h3><p class="tipBody">' +(d[age].prevalence*100).toFixed(1)+ '% obese</p>');
  });

  // FEMALE LINE HOVER EVENTS
  d3.select('#femaleLine').on('mouseover', function(d) {
    d3.select(this)
      .attr('opacity', 1)
      .moveToFront();

    var scale = xScale(d[1].ageGroup.slice(0, -4)); //getting the x distance apart!
    var mouseX = d3.mouse(this)[0]; //get current x position of mouse
    var age = Math.round(mouseX/scale); //index of femaleData

    chartInfo.style('display', 'block')
      .style('opacity', 0.95)
      .style('left', d3.event.pageX + 'px')
      .style('top', (d3.event.pageY-50) + 'px')
      .html('<h3 class="tipTitle">Females ' +d[age].ageGroup+ ':</h3><p class="tipBody">' +(d[age].prevalence*100).toFixed(1)+ '% obese</p>');

    d3.select('#maleLine')
      .attr('opacity', 0.2);
  })
  .on('mouseleave', function() {
    d3.select(this)
      .attr('opacity', 0.6);

    chartInfo.style('opacity', 0);

    d3.select('#maleLine')
      .attr('opacity', 0.6)
      .moveToFront();
  })
  .on('mousemove', function(d) {
    var scale = xScale(d[1].ageGroup.slice(0, -4)); //getting the x distance apart!
    var mouseX = d3.mouse(this)[0]; //get current x position of mouse
    var age = Math.round(mouseX/scale); //index of maleData

    chartInfo.style('left', d3.event.pageX+'px')
      .style('top', (d3.event.pageY-50)+'px')
      .html('<h3 class="tipTitle">Females ' +d[age].ageGroup+ ':</h3><p class="tipBody">' +(d[age].prevalence*100).toFixed(1)+ '% obese</p>');
  });
}
