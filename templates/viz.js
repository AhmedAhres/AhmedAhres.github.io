

let waypoint = new Waypoint({
  element: document.getElementById('3rd_box'),
  handler: function() {
    PopUp('show')
  }
});

// Current dataset depending on what we visualize
let dataset = 'dataset/country_energy.csv';
let data_population = 'dataset/population.csv';
let data_production = 'dataset/country_energy.csv'
let current_viz = "Food Energy";
let colorScheme = d3.schemeReds[6];
let energy_text = "Did you know? Food energy is extremely high in Bananas, Coffee and Apples.";
let folate_text = "Did you know? Folate is extremely high is Vegetables and Broccolis.";
let vitamin_text = "Did you know? Vitamin A is extremely high in Carrots, Spinaches and Sweet Potatoes.";

// We handle the display of the population part in the story telling
let current_population_data = {}
function initialize_population() {
  d3.csv(data_population, function(error, data) {
    data.forEach(function(d) {
      current_population_data[d.iso3] = population_data[d.iso3]["1980"];
    });
  });
}

function update_population(period) {
  d3.csv(data_population, function(error, data) {
    data.forEach(function(d) {
      current_population_data[d.iso3] = population_data[d.iso3][period];
    });
    if (format_number(current_population_data[previousCountryClicked] == null))
      population.innerHTML = "Population: NM";
    else
      population.innerHTML = "Population: " + format_number(current_population_data[previousCountryClicked]);
  });
}

let population_data = load(data_population);
initialize_population();

let production_data = load(data_production);
initialize_production();

// We handle the display of the production
let current_production_data = {}
function initialize_production() {
  d3.csv(data_production, function(error, data) {
    data.forEach(function(d) {
      current_production_data[d.iso3] = production_data[d.iso3]["1980"];
    });
  });
}

function update_production(period) {
  d3.csv(data_production, function(error, data) {
    data.forEach(function(d) {
      current_production_data[d.iso3] = production_data[d.iso3][period];
    });
    if (current_production_data[previousCountryClicked] == null)
      production.innerHTML = "Production: NM";
    else
      production.innerHTML = "Production: " + parseFloat(current_production_data[previousCountryClicked]).toFixed(2);
  });
}

let selector = document.getElementById("selector");
selector.style.left = 0;
selector.style.width = 10.5 + "vh";
selector.style.backgroundColor = "#777777";
selector.innerHTML = "SSP1";

function format_number(number) {
    if (number > 1000000000) {
        return (number/1000000000).toFixed(2) + 'B'
    }
    if (number > 1000000) {
        return (number/1000000).toFixed(2) + 'M'
    }
     if (number > 1000) {
        return (number/1000).toFixed(2) + 'K'
    }
    return number
}

// For the popup window
function PopUp(hideOrshow) {
    if (hideOrshow == 'hide') {
        document.getElementById('ac-wrapper').style.display = "none";
    }
    else if(localStorage.getItem("popupWasShown") == null) {
        localStorage.setItem("popupWasShown",1);
        document.getElementById('ac-wrapper').removeAttribute('style');
    }
}


function hideNow(e) {
    if (e.target.id == 'ac-wrapper') document.getElementById('ac-wrapper').style.display = 'none';
}
function showNow() {
    document.getElementById('ac-wrapper').style.display = "inline";
}

// End of popup window

var width = $(".box.box-2").width(), height = $(".box.box-2").height(), active = d3.select(null);

var previousCountryClicked = 'WLD';
var path, projection, zoom = null;
var inertia;

var svg = d3.select(".box.box-2").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);
var g = svg.append('g');

// Add projection to the viz
changeProjection(false);

// Adding tip for hover
var tip = d3.tip()
  .attr('class', 'd3-tip')

.offset([-10, 0])
  // Here d -> is basically the data which is given to the circle -> right now it is just lat long
  .html(function(d) {
    return "<strong> Folate: <span>" + d[0] + "</span></strong>";
  })
// Adding tip to the svg
svg.call(tip);

//Data and color scale and legend
var colorScale = d3.scaleThreshold()
    .domain([20, 40, 60, 80, 99, 100])
    .range(colorScheme);
// Getting the Legend and setting the color scale on the legend
var svg_legend = d3.select(".box.box-1").append("svg");
makeLegend(colorScale);

// // Loading the data for the testing file - Chloropleth
// let global_data_c = load(dataset);
// let data_c = {};
// d3.csv(dataset, function(error, data) {
//   data.forEach(function(d) {
//     data_c[d.iso3] = global_data_c[d.iso3]["1945"];
//   });
// });

  loadGlobalData(dataset);

// Calling the ready function to render everything even chloropleth
ready();

// Lat - Long Coordinates for Nigeria - Example
// Data is in Lat Long, but for coding the sequence is Long Lat
var coordinates = {};
coordinates['NGA'] = [[4.5, 13.5], [5.5, 13.5], [9.5, 9.5], [11.5, 8.5], [12.5,11.5]];

  function loadGlobalData(dataset) {
    global_data_c = load(dataset);
    data_c = {};
    d3.csv(dataset, function(error, data) {
      data.forEach(function(d) {
        data_c[d.iso3] = global_data_c[d.iso3]["1945"];
      });
    });
  }

  function load(dataset) {
    let result = {};
    d3.csv(dataset, function(error, data) {
      data.forEach(function(d) {
        result[d.iso3] = d;
        });
      });
  return result;
}


  function updateDataFolate() {
  d3.json("world/countries.json", function(error, data) {
    current_viz = "Folate";

    colorScheme = d3.schemeBlues[6];
    colorScale = d3.scaleThreshold()
      .domain([20, 40, 60, 80, 99, 100])
      .range(colorScheme);

    updateLegend(colorScale);
    // g.selectAll("path").attr("fill", '#fff')// function (d){
    //   // // Pull data for particular iso and set color - Not able to fill it
    //   // d.total = data_c[d.properties.iso3] || 0;
    //   // return colorScale(d.total);
    // // })
    // .attr("d", path);
  });
}

function updateDataVitamin() {
  d3.json("world/countries.json", function(error, data) {
    current_viz = "Vitamin A";

    // loadGlobalData('');
    colorScheme = d3.schemeGreens[6];
    colorScale = d3.scaleThreshold()
      .domain([20, 40, 60, 80, 99, 100])
      .range(colorScheme);

    updateLegend(colorScale);
    // g.selectAll("path").attr("fill", '#fff')// function (d){
    //   // // Pull data for particular iso and set color - Not able to fill it
    //   // d.total = data_c[d.properties.iso3] || 0;
    //   // return colorScale(d.total);
    // // })
    // .attr("d", path);
  });
}


function updateDataEnergy() {
  d3.json("world/countries.json", function(error, data) {
    current_viz = "Energy";

    // loadGlobalData('');
    colorScheme = d3.schemeReds[6];
    colorScale = d3.scaleThreshold()
      .domain([20, 40, 60, 80, 99, 100])
      .range(colorScheme);

    updateLegend(colorScale);
    // g.selectAll("path").attr("fill", '#fff')// function (d){
    //   // // Pull data for particular iso and set color - Not able to fill it
    //   // d.total = data_c[d.properties.iso3] || 0;
    //   // return colorScale(d.total);
    // // })
    // .attr("d", path);
  });
}

  function updateLegend(colorScale) {
    svg_legend.selectAll('*').remove();
    makeLegend(colorScale);
  }

  function makeLegend(colorScale) {
    // Getting the Legend and setting the color scale on the legend
    var g_legend = svg_legend.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(10,20)");

    g_legend.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -4)
        .text("% contribution");

    var labels = ['1-20', '21-40', '41-60', '61-80', '81-99', '100'];
    var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
    svg_legend.select(".legendThreshold")
        .call(legend);
  }

  function projection3D() {
    var checked3D = document.getElementById("checked3D").value;
    var checked2D = document.getElementById("checked2D").value;
    if(checked3D === 'true') {
      changeProjection(false);
      checked3D = "true";
      check2D = "false";
    }
  }

  function projection2D() {
    var checked2D = document.getElementById("checked2D").value;
    var checked3D = document.getElementById("checked3D").value;
    if(checked2D === 'false') {
      changeProjection(true);
      checked2D = "true";
      checked3D = "false";
    }
  }

  function changeProjection(sliderChecked) {
    // Add background to the globe
    let planet_radius = d3.min([width / 2, height / 2]);

    // Can change the scale and extent of the zoom
    zoom = d3.zoom()
        .scaleExtent([1, 12])
        .on("zoom", zoomed);

    // Changing the scale will change the size - height and width of globe
    if(sliderChecked) {
        projection = d3.geoNaturalEarth()
          .scale(planet_radius*0.45)
          .translate([width / 2, height / 2])
          .precision(.1);
    } else {
      projection = d3.geoOrthographic()
        .scale(planet_radius*0.844)
        .translate([width / 2, height / 2])
        .precision(.1);

      // inertia versor dragging after everything has been rendered
      inertia = d3.geoInertiaDrag(svg, function() { render(); }, projection);
    }

    path = d3.geoPath()
      .projection(projection);

    // Redraw the all projections
    svg.selectAll('path').transition().duration(500).attr('d', path);
  }

  function ready() {
    d3.json("world/countries.json", function(error, data) {
      if (error) throw error;

      var features = topojson.feature(data, data.objects.units).features;
      g.selectAll("path")
        .data(features)
        .enter().append("path")
          // Chloropleth code
        .attr("fill", function (d){
              // Pull data for particular iso and set color - Not able to fill it
              d.total = data_c[d.properties.iso3] || 0;
              return colorScale(d.total);
          })
          // End of Chloropleth code
          .attr("d", path)
          .attr("class", "feature")
          .on("click", clicked);
      // Creates a mesh around the border
      g.append("path")
          .datum(topojson.mesh(data, data.objects.units, function(a, b) { return a !== b; }))
          .attr("class", "mesh")
          .attr("d", path);
    });
  }

  function render(){
    update(projection.rotate());
  }

  function update(eulerAngles){
    projection.rotate(eulerAngles);
    svg.selectAll("path").attr("d", path);
    svg.selectAll(".plot-point")
      .attr("cx", d => projection(d)[0])
      .attr("cy", d => projection(d)[1]);
  }

  let countryName = document.getElementById("box-3-header-2").firstElementChild;
  let title = document.getElementById("box-3-header").firstElementChild;
  let population = document.getElementById("box_population").firstElementChild;
  let production = document.getElementById('box_production').firstElementChild;
  let current_nature_contribution = 28;
  let current_unmet_need = 45;

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    // Get info of the active country/feature
    let active_info = active.node();

    // For centering the globe to that particular country
    geo_centroid = d3.geoCentroid(active_info.__data__);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,

        // Change the scale to change the zoom when you select a country
        scale = Math.max(1, Math.min(12, 0.9 / Math.max(dx / width, dy / height)));
        // translate = [width / 2 - scale * geo_centroid[0], height / 2 - scale * geo_centroid[1]];

    // For disabling the toggle button when you are zoomed in
    document.getElementById("checked3D").disabled = true;
    document.getElementById("checked2D").disabled = true;

    svg.transition()
        .duration(750)
        .tween('rotate', function() {
          var r = d3.interpolate(projection.rotate(), [-geo_centroid[0], -geo_centroid[1]]);
          return function(t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path);
          }
        })
        // TODO: Need to set it on the basis of the size of the country to fit in the whole svg
        .call(zoom.scaleTo, scale);

    countryName.innerHTML = active_info.__data__.properties.name;

    if(active_info.__data__.properties.iso3 in coordinates) {
      if(previousCountryClicked !== null) {
          svg.selectAll('.plot-point').remove();
      }
      // The regions should appear after we zoom in the country
      setTimeout(function() {
          showData(coordinates[active_info.__data__.properties.iso3]);
      }, 751) // Should be more than 750 -> more than duration
    } else {
      if(previousCountryClicked !== null) {
          svg.selectAll('.plot-point').remove();
      }
    }
    previousCountryClicked = active_info.__data__.properties.iso3
    current_nature_contribution = data_c[active_info.__data__.properties.iso3];
    change_nature_percentage(current_nature_contribution);
    population.innerHTML = "Population: " + format_number(current_population_data[active_info.__data__.properties.iso3]);
  }

function showData(coordinates) {
    // Add circles to the country which has been selected
    // Removing part is within

    g.selectAll(".plot-point")
        .data(coordinates).enter()
        .append("circle")
        .classed('plot-point', true)
        .attr("cx", function (d) {
            return projection(d)[0];
        })
        .attr("cy", function (d) {
            return projection(d)[1];
        })
        .attr("r", "0.8px")
        .attr("fill", "#F0B0EE")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
  }

  function zoomed() {
    // 1.5 here refers to the stroke width of the borders
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform);
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    // Remove everything from map which is not selected anymore
    svg.selectAll('.plot-point').remove();

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

    // Change the toggle back to enabled
    document.getElementById("checked3D").disabled = false;
    document.getElementById("checked2D").disabled = false;

    countryName.innerHTML = "World";
    previousCountryClicked = 'WLD';
    change_nature_percentage(data_c[previousCountryClicked]);
    if (current_population_data[previousCountryClicked] == null)
      population.innerHTML = "Population: NM" + format_number(current_population_data[previousCountryClicked]);
    else
      population.innerHTML = "Population: " + format_number(current_population_data[previousCountryClicked]);
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }

let years = ["1850", "1900", "1950", "2000", "2050", "2100", "2150"]
let actualData = ["1850", "1900", "1910", "1945", "1980", "2015", "2050"]

var formatToData = function(d) {
  // TO BE OPTIMIZED WITH A DICTIONARY
    if (d == 1850 || d == 1900) return d;
    if (d == 1950) return 1910;
    if (d == 2000) return 1945;
    if (d == 2050) return 1980;
    if (d == 2100) return 2015;
    if (d == 2150) return 2050;
}

function select_contribution_energy(period) {
  d3.csv(dataset, function(error, data) {
    data.forEach(function(d) {
      data_c[d.iso3] = global_data_c[d.iso3][period];
    });
    current_nature_contribution = data_c[previousCountryClicked];
    change_nature_percentage(current_nature_contribution, 50);
    g.selectAll("path").attr("fill", function (d) {
          // Pull data for particular iso and set color - Not able to fill it
          if(d.type == 'Feature') {
              d.total = data_c[d.properties.iso3] || 0;
          } else {
          }
          return colorScale(d.total);
      })
  });
}

function change_nature_percentage(contribution, unmet) {
  let contrib_interpolation = d3.interpolate(progress, contribution);
  let unmet_interpolation = d3.interpolate(progress_unmet, unmet);
  d3.transition().duration(1000).tween("contribution", function() {
    return function(t) {
      progress = contrib_interpolation(t);
      progress_unmet = unmet_interpolation(t);
      foreground.attr("d", arc.endAngle(twoPi * progress / 100));
      foreground2.attr("d", arc.endAngle(twoPi * progress_unmet / 100));
      // In case the data is measured, we put "NM" for "Not Measured"
      if (contribution == null)
        percentComplete.text("NM");
      else
        percentComplete.text(formatPercent(progress / 100));
      if (unmet == null)
        percentComplete2.text("NM");
      else
        percentComplete2.text(formatPercent(progress_unmet / 100));
    };
  });
}

let current_SSP = "SSP1";
let slider = d3.sliderHorizontal()
  .min(1850)
  .max(2150)
  .step(50)
  .default("2050")
  .width(400)
  .tickValues(years)
  .tickFormat(formatToData)
  .on("onchange", val => {
    // Here, the value we check for is still the original one, not the formatted one
    if (val == 1850) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1850";
      removeSSPs();
      select_contribution_energy("1850");
      change_unmet_percentage(30);
      update_population("1850");
      update_production("1850");
    }

    if (val == 1900) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1900";
      removeSSPs();
      select_contribution_energy("1900");
      update_population("1900");
      update_production("1900");
    }

    if (val == 1950) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1910";
      removeSSPs();
      select_contribution_energy("1910");
      update_population("1910");
      update_production("1910");
    }

    if (val == 2000) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1945";
      removeSSPs();
      select_contribution_energy("1945");
      update_population("1945");
      update_production("1945");
    }

    if (val == 2050) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1980";
      removeSSPs();
      select_contribution_energy("1980");
      update_population("1980");
      update_production("1980");
    }

    if (val == 2100) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 2015";
      removeSSPs();
      select_contribution_energy("2015");
      update_population("2015");
      update_production("2015");
    }

    if (val == 2150) {
      showSSPs();
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 2050 - " + current_SSP;
      select_contribution_energy(current_SSP);
      update_population(current_SSP);
      update_production(current_SSP);
    }
 });

let group = d3.select(".box.box-2").append("svg")
  .attr("width", 900)
  .attr("height", 70)
  .append("g")
  .attr("transform", "translate(" + 200 + "," + 12 + ")")
  .call(slider);

function change_period(period){
    var ssp1 = document.getElementById("ssp1");
    var ssp3 = document.getElementById("ssp3");
    var ssp5 = document.getElementById("ssp5");
    var selector = document.getElementById("selector");
    if (period === "ssp1") {
      selector.style.left = 0;
      selector.style.width = ssp1.clientWidth + "px";
      selector.style.backgroundColor = "#777777";
      selector.innerHTML = "SSP1";
      current_SSP = "SSP1";
    } else if (period === "ssp3") {
      selector.style.left = ssp1.clientWidth + "px";
      selector.style.width = ssp3.clientWidth + "px";
      selector.innerHTML = "SSP3";
      selector.style.backgroundColor = "#418d92";
      current_SSP = "SSP3";
    } else {
      selector.style.left = ssp1.clientWidth + ssp3.clientWidth + 1 + "px";
      selector.style.width = ssp5.clientWidth + "px";
      selector.innerHTML = "SSP5";
      selector.style.backgroundColor = "#4d7ea9";
      current_SSP = "SSP5";
    }
    select_contribution_energy(current_SSP);
    title.innerHTML = "Pollination Contribution to " + current_viz + " in 2050 - " + current_SSP;
    update_population(current_SSP);
    update_production(current_SSP);
  }

// Function to show the different SSP scenarios when the slider is on 2050
function showSSPs() {
  document.getElementsByClassName('switch_3_ways')[0].style.display = "block";
  document.getElementsByClassName('nav-bar-hidden')[0].style.display = "block";
}

// Function to show the hide the different SSP scenarios when the slider is not on 2050
function removeSSPs() {
  document.getElementsByClassName('switch_3_ways')[0].style.display = "none";
  document.getElementsByClassName('nav-bar-hidden')[0].style.display = "none";
}

// Pollination contribution percentage starts here
let width_circle = 65,
    height_circle = 65,
    twoPi = 2 * Math.PI,
    progress = 0,
    progress_unmet = 0,
    formatPercent = d3.format(".0%");

let arc = d3.arc()
    .startAngle(0)
    .innerRadius(58)
    .outerRadius(66);

let svg1 = d3.select(".docsChart").append("svg")
    .append("g")
    .attr("transform", "translate(" + width_circle * 1.1 + "," + height_circle * 1.1 + ")");

svg1.append("path")
    .attr("fill", "#E6E7E8")
    .attr("d", arc.endAngle(twoPi));

let foreground = svg1.append("path")
    .attr("fill", "#00D2B6");

let percentComplete = svg1.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em");

// Unmet need percentage starts here
let svg2 = d3.select(".docsChart2").append("svg")
    .append("g")
    .attr("transform", "translate(" + width_circle * 1.3 + "," + height_circle * 1.1 + ")");

svg2.append("path")
      .attr("fill", "#E6E7E8")
      .attr("d", arc.endAngle(twoPi));

let foreground2 = svg2.append("path")
      .attr("fill", "#00D2B6");

let percentComplete2 = svg2.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em");

change_nature_percentage(current_nature_contribution, current_unmet_need);
