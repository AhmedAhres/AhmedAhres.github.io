let waypoint = new Waypoint({
  element: document.getElementById('3rd_box'),
  handler: function() {
    PopUp('show')
  }
});

// Current dataset depending on what we visualize
let dataset = 'dataset/country_energy.csv';
let current_viz = "Food Energy";
let colorScheme = d3.schemeReds[6];
let unmet_need_dataset = 'dataset/unmet_need_energy.csv'

let global_unmet = load(unmet_need_dataset);
let current_unmet_data = {};
function initialize_unmet() {
    d3.csv(unmet_need_dataset, function(error, data) {
      data.forEach(function(d) {
        current_unmet_data[d.iso3] = global_unmet[d.iso3][current_year];
      });
    });
}

initialize_unmet();

let checked3D = true;
let checked2D = false;


let selector = document.getElementById("selector");
selector.style.left = 0;
selector.style.width = 10.5 + "vh";
selector.style.backgroundColor = "#777777";
selector.innerHTML = "SSP1";

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


loadGlobalData(dataset);

// Calling the ready function to render everything even chloropleth
ready();

// Lat - Long Coordinates for Nigeria - Example
// Data is in Lat Long, but for coding the sequence is Long Lat
var coordinates = {};
coordinates['NGA'] = [[4.5, 13.5], [5.5, 13.5], [9.5, 9.5], [11.5, 8.5], [12.5,11.5]];

let countryName = document.getElementById("box-3-header-2").firstElementChild;
let title = document.getElementById("box-3-header").firstElementChild;
let current_nature_contribution = 28;
let current_unmet_need = 61;

let years = ["1850", "1900", "1950", "2000", "2050", "2100", "2150"];
let actualData = ["1850", "1900", "1910", "1945", "1980", "2015", "2050"];

var formatToData = function(d) {
  // TO BE OPTIMIZED WITH A DICTIONARY
    if (d == 1850 || d == 1900) return d;
    if (d == 1950) return 1910;
    if (d == 2000) return 1945;
    if (d == 2050) return 1980;
    if (d == 2100) return 2015;
    if (d == 2150) return 2050;
}

let current_SSP = "SSP1";
let current_year = "1980"
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
      current_year = "1850";
      removeSSPs();
      select_contribution_energy("1850");
      update_percentages("1850");
      //update_2D("1850");
    }

    if (val == 1900) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1900";
      current_year = "1900";
      removeSSPs();
      select_contribution_energy("1900");
      update_percentages("1900");
      //update_2D("1900");
    }

    if (val == 1950) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1910";
      current_year = "1910";
      removeSSPs();
      select_contribution_energy("1910");
      update_percentages("1910");
      //update_2D("1910");
    }

    if (val == 2000) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1945";
      current_year = "1945";
      removeSSPs();
      select_contribution_energy("1945");
      update_percentages("1945");
      //update_2D("1945");
    }

    if (val == 2050) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 1980";
      current_year = "1980";
      removeSSPs();
      select_contribution_energy("1980");
      update_percentages("1980");
      //update_2D("1980");
    }

    if (val == 2100) {
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 2015";
      current_year = "2015";
      removeSSPs();
      select_contribution_energy("2015");
      update_percentages("2015");
    }

    if (val == 2150) {
      showSSPs();
      title.innerHTML = "Pollination Contribution to " + current_viz + " in 2050 - " + current_SSP;
      select_contribution_energy(current_SSP);
      update_percentages(current_SSP);
      //update_2D(current_SSP);
    }
 });

let group = d3.select(".box.box-2").append("svg")
  .attr("width", 900)
  .attr("height", 70)
  .append("g")
  .attr("transform", "translate(" + 200 + "," + 12 + ")")
  .call(slider);

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

change_percentage_animation(current_nature_contribution, current_unmet_need);

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

function update_percentages(period) {
  d3.csv(dataset, function(error, data) {
    data.forEach(function(d) {
      data_c[d.iso3] = global_data_c[d.iso3][period];
    });
    d3.csv(unmet_need_dataset, function(error, data) {
      data.forEach(function(d) {
        current_unmet_data[d.iso3] = global_unmet[d.iso3][period];
      });
    current_nature_contribution = data_c[previousCountryClicked];
    current_unmet_need = current_unmet_data[previousCountryClicked];
    change_percentage_animation(current_nature_contribution, current_unmet_need);
    g.selectAll("path").attr("fill", function (d) {
          // Pull data for particular iso and set color - Not able to fill it
          if(d.type == 'Feature') {
              d.total = data_c[d.properties.iso3] || 0;
          } else {
          }
          return colorScale(d.total);
      })
  });
  });
}

function hideNow(e) {
  if (e.target.id == 'ac-wrapper') document.getElementById('ac-wrapper').style.display = 'none';
}
function showNow() {
  document.getElementById('ac-wrapper').style.display = "inline";
}
// End of popup window

function loadGlobalData(dataset) {
    global_data_c = load(dataset);
    data_c = {};
    data_2D = {};
    d3.csv(dataset, function(error, data) {
      data.forEach(function(d) {
        data_c[d.iso3] = global_data_c[d.iso3][current_year];
        data_2D[d.iso3] = [global_data_c[d.iso3]['lat'],global_data_c[d.iso3]['long'],global_data_c[d.iso3][current_year]];
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

function updateData(data_type) {
  switch(data_type) {
    case "Vitamin":
      current_viz = "Vitamin A";
      title.innerHTML = "Pollination Contribution to Vitamin A in " + current_year;
      colorScheme = d3.schemeGreens[6];
      dataset = 'dataset/country_va.csv';
      dataset_graph = 'dataset/plot_vitamin.csv';
      unmet_need_dataset = 'dataset/unmet_need_vitamin.csv';
      color = d3.scaleOrdinal(d3.schemeSet2);
      updateGraph(previousCountryClicked);
      break;
    case "Energy":
      current_viz = "Energy";
      title.innerHTML = "Pollination Contribution to Energy in " + current_year;
      colorScheme = d3.schemeReds[6];
      dataset = 'dataset/country_energy.csv';
      dataset_graph = 'dataset/plot_energy.csv';
      unmet_need_dataset = 'dataset/unmet_need_energy.csv';
      color = d3.scaleOrdinal(d3.schemeSet1);
      updateGraph(previousCountryClicked);
      break;
    case "Folate":
      current_viz = "Folate";
      title.innerHTML = "Pollination Contribution to Folate in " + current_year;
      colorScheme = d3.schemePurples[6];
      dataset = 'dataset/country_fo.csv';
      dataset_graph = 'dataset/plot_folate.csv';
      unmet_need_dataset = 'dataset/unmet_need_folate.csv';
      color = d3.scaleOrdinal(d3.schemeCategory20b);
      updateGraph(previousCountryClicked);
      break;
  }
  colorScale = d3.scaleThreshold()
    .domain([20, 40, 60, 80, 99, 100])
    .range(colorScheme);
  updateLegend(colorScale);
  let promise = new Promise(function(resolve, reject) {
    global_unmet = load(unmet_need_dataset);
    loadGlobalData(dataset);
    setTimeout(() => resolve(1), 10);
  });
  promise.then(function(result) {
    update_percentages(current_year);
    accessData();
  });
}

function accessData() {
  g.selectAll("path").attr("fill", function (d){
    // Pull data for particular iso and set color - Not able to fill it
    d.total = data_c[d.properties.iso3] || 0;
    return colorScale(d.total);
  })
  .attr("d", path);
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

function updateLegend(colorScale) {
  svg_legend.selectAll('*').remove();
  makeLegend(colorScale);
}

function projection3D() {
  checked3D = document.getElementById("checked3D").value;
  checked2D = document.getElementById("checked2D").value;
  if(checked3D === 'true') {
    changeProjection(false);
    checked3D = "true";
    check2D = "false";
  }
}

function projection2D() {
  checked2D = document.getElementById("checked2D").value;
  checked3D = document.getElementById("checked3D").value;
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
      $('.box-container').css({
        'background': 'radial-gradient(circle at 37%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)'
      });

      // Make the map black
      g.selectAll('path').attr('fill', '000').on("click", null);
  } else {
    projection = d3.geoOrthographic()
      .scale(planet_radius*0.844)
      .translate([width / 2, height / 2])
      .precision(.1);
    $('.box-container').css({'background':''});
    // inertia versor dragging after everything has been rendered
    inertia = d3.geoInertiaDrag(svg, function() { render(); }, projection);

    // Make the map coloful again
    g.selectAll('path').attr('fill', function(d) {
      let promise = new Promise(function(resolve, reject) {
        setTimeout(() => resolve(1), 10);
      });
      promise.then(function(result) {
        d.total = data_c[d.properties.iso3] || 0;
      });
      return colorScale(d.total);
    }).attr("d", path).on("click", clicked);
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

  $('.box-container').css({
    'background': 'radial-gradient(circle at 37%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)'
  });

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
  current_unmet_need = current_unmet_data[active_info.__data__.properties.iso3];
  change_percentage_animation(current_nature_contribution, current_unmet_need);
  updateGraph(previousCountryClicked);
}
// plot points on the map
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
        .attr("r", "1px")
        .attr("fill", function (d) {
          // console.log(d);
          color = d[2] || 0 ;
          return colorScale(color);
        })
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

    $('.box-container').css({'background':''});

    countryName.innerHTML = "World";
    previousCountryClicked = 'WLD';
    change_percentage_animation(data_c[previousCountryClicked], current_unmet_data[previousCountryClicked]);
    updateGraph(previousCountryClicked);
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }

function select_contribution_energy(period) {
  if(checked3D == "true") {
    d3.csv(dataset, function(error, data) {
      data.forEach(function(d) {
        data_c[d.iso3] = global_data_c[d.iso3][period];
      });
      current_nature_contribution = data_c[previousCountryClicked];
      change_percentage_animation(current_nature_contribution, current_unmet_need);
        g.selectAll("path").attr("fill", function (d) {
              // Pull data for particular iso and set color - Not able to fill it
              if(d.type == 'Feature') {
                  d.total = data_c[d.properties.iso3] || 0;
              } else {
              }
              return colorScale(d.total);
          });
    });
  }
  if(checked2D == "true") {
    d3.csv('dataset/pixel_energy.csv', function(error, data) {
      let promise = new Promise(function(resolve, reject) {
        loadGlobalData('dataset/pixel_energy.csv');
        setTimeout(() => resolve(1), 10);
      });
      promise.then(function(result) {
        coordstoplot = [];
        for (var key in data_2D) {
          coordstoplot.push([data_2D[key][0],data_2D[key][1],data_2D[key][2]]);
        }
        showData(coordstoplot);
        // setTimeout(function() {
        //     showData(coordstoplot);
        // }, 800);
      });
    });

}
}

// let global_2D = load('dataset/pixel_energy.csv');
// let coordstoplot = [];
// function initialize_2D() {
//   for (var key in data_2D) {
//       coordstoplot.push([global_2D[key][0],global_2D[key][1],global_2D[key][2]]);
//     }
// }
//
// function update_2D(period) {
//   d3.csv(data_production, function(error, data) {
//     data.forEach(function(d) {
//       coordstoplot[d.iso3] = global_2D[d.iso3][period];
//     });
//   });
// }

function change_percentage_animation(contribution, unmet) {
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
    update_percentages(current_SSP);
    //update_2D(current_SSP);
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

let dataset_graph = "dataset/plot_energy.csv";

// Set the dimensions of the canvas / graph
let margin = {top: 10, right: 20, bottom: 80, left: 50},
    width_plot = 500 - margin.left - margin.right,
    height_plot = 300 - margin.top - margin.bottom;


// Set the ranges
let x_graph = d3.scaleLinear().range([0, width_plot]);
let y_graph = d3.scaleLinear().range([height_plot, 0]);
updateGraph('WLD');

// set the colour scale
let color = d3.scaleOrdinal(d3.schemeSet1);

function updateGraph(country) {
  var svg_remove = d3.select(".graph");
  svg_remove.selectAll("*").remove();

let line_draw = d3.line()
      .x(function(d) { return x_graph(d.date); })
      .y(function(d) { return y_graph(d[country]); });


  // Adds the svg canvas
let svg_plot = d3.select(".graph")
      .append("svg")
          .attr("width", width_plot + margin.left + margin.right)
          .attr("height", height_plot + margin.top + margin.bottom)
      .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.csv(dataset_graph, function(error, data) {

      // Scale the range of the data
      x_graph.domain(d3.extent(data, function(d) { return d.date; }));
      y_graph.domain([0, 100]);

      // Nest the entries by symbol
      let dataNest = d3.nest()
          .key(function(d) {return d.name;})
          .entries(data);

      legendSpace = width_plot / dataNest.length; // spacing for the legend

      // Loop through each symbol / key
      dataNest.forEach(function(d,i) {

          svg_plot.append("path")
              .attr("class", "line2")
              .style("stroke", function() { // Add the colours dynamically
                  return d.color = color(d.key); })
              .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign an ID
              .attr("d", line_draw(d.values));

          // Add the Text
          svg_plot.append("text")
              .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
              .attr("y", height_plot + (margin.bottom/2)+ 5)
              .attr("class", "legend")    // style the legend
              .style("fill", function() { // Add the colours dynamically
                  return d.color = color(d.key); })
              .text(d.key);

      });

  let numbers = [1,2,3,4,5,6,7,8,9];
  let formatToYears = function(d) {
    // TO BE OPTIMIZED WITH A DICTIONARY
      if (d == 1) return 1850;
      if (d == 2) return 1900;
      if (d == 3) return 1910;
      if (d == 4) return 1945;
      if (d == 5) return 1980;
      if (d == 6) return 2015;
      if (d == 7) return "SSP1";
      if (d == 8) return "SSP3";
      if (d == 9) return "SSP5";
  }

  // Add the X Axis
  svg_plot.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height_plot + ")")
      .call(d3.axisBottom(x_graph).tickValues(numbers).tickFormat(formatToYears));

  // Add the Y Axis
  svg_plot.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y_graph));

  });
}
