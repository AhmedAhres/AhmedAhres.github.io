// Current dataset depending on what we visualize
let firstTime = true;
let dataset = 'dataset/country_en.csv';
let dataset_2D = 'dataset/pixel_energy.csv';
let current_viz = "Food Energy";
let change_dataset = 'dataset/change_en.csv';
let country_data_2D;

let title_map = document.getElementById("title_2d_change");

document.getElementById("checked3D").disabled = true;
document.getElementById("checked2D").disabled = false;

let region_text = "Pollination Contribution to Food Energy";

// We instantiate the bar chart object for the 2D section
let BarGraphObject = new BarGraph();
let lineGraphObject = new lineGraph();

// Initializing the line graph at the world level
lineGraphObject.updateGraph('WLD');

let checked3D = "true";
let checked2D = "false";

let width = $(".box.box-2").width(),
  height = $(".box.box-2").height(),
  active = d3.select(null);

let previousCountryClicked = 'WLD';
let path, projection, zoom_3D, zoom_2D = null;
let inertia;

let svg = d3.select(".map1").append("svg")
  .attr("id", "svg_map1")
  .attr("width", width)
  .attr("height", height)
  .on("click", stopped, true);

let svg_map2 = d3.select(".map2").append("svg")
  .attr("id", "svg_map2")
  .attr("width", 0)
  .attr("height", 0)
  .on("click", stopped, true);

let g = svg.append('g');
let g_map2 = svg_map2.append('g');

let projection_new = d3.geoNaturalEarth().scale(d3.min([width / 2, height / 2]) * 0.45).translate([width / 2, height / 2]).precision(.1);
let path_new = d3.geoPath().projection(projection_new);

let map1 = document.getElementsByClassName('map1')[0];
let map2 = document.getElementsByClassName('map2')[0];

map1.setAttribute("style", "width: 100%; height: 94%;");
map2.setAttribute("style", "width: 0; height: 0;");

// Add projection to the viz
changeProjection(false);


// Adding tip for hover
let tip = d3.tip()
  .attr('class', 'd3-tip')

  .offset([-10, 0])
  // Here d -> is basically the data which is given to the circle -> right now it is just lat long
  .html(function(d) {
    return "<strong>" + region_text + ": <span>" + d[2] + "</span></strong>" + "%";
  })
// Adding tip to the svg
svg.call(tip);

// Makes the legend
makeLegend(colorScale);

loadGlobalData(dataset);
let data_2D = load(dataset_2D);

let change_data = load(change_dataset);

// Calling the ready function to render everything even chloropleth
ready(g, path);
ready(g_map2, path_new);

let countryName = document.getElementById("box-3-header-2").firstElementChild;
let title = document.getElementById("box-3-header").firstElementChild;
let current_nature_contribution = 35;
let current_unmet_need = 65;


createSlider();

change_percentage_animation(current_nature_contribution, current_unmet_need);

function make2015staticMap() {
  if (firstTime) {
    let coordstoplot = initialize_2D("2015", data_2D);
    showData(g_map2, coordstoplot);
    firstTime = false;
  }
}

function loadGlobalData(dataset) {
  global_data_c = load(dataset);
  data_c = {};
  d3.csv(dataset, function(error, data) {
    data.forEach(function(d) {
      data_c[d.iso3] = global_data_c[d.iso3][current_year];
      // data_2D[d.iso3] = [global_data_c[d.iso3]['lat'],global_data_c[d.iso3]['long'],global_data_c[d.iso3][current_year]];
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

let contribution_text = document.getElementsByClassName("small-title")[0];
let colorScale_energy = d3.scaleOrdinal()
  .domain(["contribution", "unmet"])
  .range(["#d73027", "#4fb1fe"]);
let colorScale_vitamin = d3.scaleOrdinal()
  .domain(["contribution", "unmet"])
  .range(["#91cf60", "#4fb1fe"]);
let colorScale_folate = d3.scaleOrdinal()
  .domain(["contribution", "unmet"])
  .range(["#41037e", "#4fb1fe"]);

// set the colour scale
let color_graph = colorScale_energy;

function updateData(data_type) {
  switch (data_type) {
    case "Vitamin":
      current_viz = "Vitamin A";
      region_text = "Pollination Contribution to Vitamin A";
      title.innerHTML = "Pollination Contribution to Nutrition (Vitamin A) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to " +
        current_viz + " in " + current_year + "?";
      colorScheme = d3.schemeGreens[6];
      title_map.innerHTML = "Pollination Contribution to " + current_viz + " in 2015 (Bottom) vs " + current_SSP + " (Top)";
      dataset = 'dataset/country_va.csv';
      dataset_graph = 'dataset/plot_vitamin.csv';
      dataset_2D = 'dataset/pixel_vitamin.csv';
      change_dataset = 'dataset/change_va.csv';
      color_graph = colorScale_vitamin;
      lineGraphObject.updateGraph(previousCountryClicked);

      break;
    case "Energy":
      current_viz = "Food Energy";
      region_text = "Pollination Contribution to Food Energy";
      title.innerHTML = "Pollination Contribution to Nutrition (Food Energy) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to " +
        current_viz + " in " + current_year + "?";
      title_map.innerHTML = "Pollination Contribution to " + current_viz + " in 2015 (Bottom) vs " + current_SSP + " (Top)";
      colorScheme = d3.schemeReds[6];
      dataset = 'dataset/country_en.csv';
      dataset_graph = 'dataset/plot_energy.csv';
      dataset_2D = 'dataset/pixel_energy.csv';
      color_graph = colorScale_energy;
      change_dataset = 'dataset/change_en.csv';
      lineGraphObject.updateGraph(previousCountryClicked);
      break;
    case "Folate":
      current_viz = "Folate";
      region_text = "Pollination Contribution to Folate";
      title.innerHTML = "Pollination Contribution to Nutrition (Folate) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to " +
        current_viz + " in " + current_year + "?";
      title_map.innerHTML = "Pollination Contribution to " + current_viz + " in 2015 (Bottom) vs " + current_SSP + " (Top)";
      colorScheme = d3.schemePurples[6];
      dataset = 'dataset/country_fo.csv';
      dataset_graph = 'dataset/plot_folate.csv';
      dataset_2D = 'dataset/pixel_folate.csv';
      color_graph = colorScale_folate;
      change_dataset = 'dataset/change_fo.csv';
      lineGraphObject.updateGraph(previousCountryClicked)
      break;
  }
  colorScale = d3.scaleThreshold()
    .domain([20, 40, 60, 80, 99, 100])
    .range(colorScheme);
  updateLegend(colorScale);
  let promise = new Promise(function(resolve, reject) {
    loadGlobalData(dataset);
    data_2D = load(dataset_2D);
    change_data = load(change_dataset)
    setTimeout(() => resolve(1), 10);
  });
  promise.then(function(result) {
    update_percentages(current_year);
    change_pollination_contribution(current_year);
    accessData();
  });
}

function accessData() {
  g.selectAll("path").attr("fill", function(d) {
      // Pull data for particular iso and set color - Not able to fill it
      if (checked3D == 'true') {
        d.total = data_c[d.properties.iso3] || 0;
        return colorScale(d.total);
      } else {
        return '#D3D3D3';
      }

    })
    .attr("d", path);
}

function projection3D() {
  checked3D = document.getElementById("checked3D").value;
  checked2D = document.getElementById("checked2D").value;
  if (checked3D === 'true') {
    zoom_2D = null;

    svg.selectAll('.plot-point').remove();
    document.getElementsByClassName('box box-3')[0].style.display = "flex";
    document.getElementsByClassName('box box-3')[1].style.display = "none";
    document.getElementById("svg_map2").style.overflow = "";

    changeProjection(false);
    checked3D = "true";
    checked2D = "false";
    svg.on(".zoom", null)
    // svg.call(zoom_3D)
    svg.call(zoom_3D.transform, d3.zoomIdentity);
    $('.map1, .map2, #svg_map1, #svg_map2').bind(
      'mousewheel DOMMouseScroll',
      function(e) {}
    );

    updateLegendPosition(false);
    map2.setAttribute("style", "width: 0; height: 0;");
    map1.setAttribute("style", "width: 100%; height: 94%;");

    svg.attr("transform", "translate(0, 0)");
    svg_map2.attr("width", 0).attr("height", 0);

    document.getElementById("checked3D").disabled = true;
    document.getElementById("checked2D").disabled = false;
    document.getElementsByClassName('map-diff-line')[0].style.width = "0";

    // Removes slider for 2D in order to put in the one for 3D
    d3.select(".map-slider").html("");
    runSlider("1945", false)
    createSlider();
  }
}

function projection2D() {
  checked2D = document.getElementById("checked2D").value;
  checked3D = document.getElementById("checked3D").value;
  if (checked2D === 'false') {
    zoom_3D = null;
    BarGraphObject.updateBarGraph('dataset/ssp1_impacted.csv');
    title_map.innerHTML = "Pollination Contribution to " + current_viz + " in 2015 (Bottom) vs SSP1 (Top)";
    changeProjection(true);
    updateLegendPosition(true);
    document.getElementsByClassName('box box-3')[0].style.display = "none";
    document.getElementsByClassName('box box-3')[1].style.display = "flex";
    document.getElementsByClassName('map-diff-line')[0].style.width = "85%";

    checked2D = "true";
    checked3D = "false";



    svg.call(zoom_2D);
    svg_map2.call(zoom_2D);

    let coordstoplot = initialize_2D(current_year, data_2D);

    // Change the size of the maps
    svg.attr("width", $(".map1").width())
      .attr("height", $(".map1").height())
      .attr("transform", "translate(0, -200) scale(0.8)");
    map1.setAttribute("style", "width: 100%; height: 47%;");

    map2.setAttribute("style", "width: 100%; height: 47%;");
    svg_map2.attr("width", $(".map1").width())
      .attr("height", $(".map1").height())
      .attr("transform", "translate(0, -130) scale(0.7)");

    map2.setAttribute(
      "style",
      "width: 100%; height: 46%; overflow-x:hidden; overflow-y:hidden;"
    );
    document.getElementById('svg_map2').style.overflow = "initial";

    map1.setAttribute(
      "style",
      "width: 100%; height: 46%; overflow-x:hidden; overflow-y:hidden;"
    );
    document.getElementById('svg_map1').style.overflow = "initial";

    make2015staticMap();

    document.getElementById("checked2D").disabled = true;
    document.getElementById("checked3D").disabled = false;
    d3.select(".map-slider").html("");
    runSlider("SSP1", false)
    createSlider();
    // Plot points on the map
    showData(g, coordstoplot);
  }
}

function zoomed_2D() {
  g.attr("transform", d3.event.transform);
  g_map2.attr("transform", d3.event.transform);
}

function changeProjection(sliderChecked) {
  // Add background to the globe
  let planet_radius = d3.min([width / 2, height / 2]);

  // Can change the scale and extent of the zoom
  if (sliderChecked) {
    zoom_2D = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([
        [0, 0],
        [$(".map1").width(), $(".map1").height()]
      ])
      .extent([
        [0, 0],
        [$(".map1").width(), $(".map1").height()]
      ])
      .on("zoom", zoomed_2D);
  } else {
    zoom_3D = d3.zoom()
      .scaleExtent([1, 12])
      .on("zoom", zoomed);
  }


  // Changing the scale will change the size - height and width of globe
  if (sliderChecked) {
    projection = d3.geoNaturalEarth()
      .scale(planet_radius * 0.45)
      .translate([width / 2, height / 2])
      .precision(.1);
    $('.box-container').css({
      'background': 'radial-gradient(circle at 37%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)'
    });

    // Make the map black
    g.selectAll('path').attr('fill', '#D3D3D3').on("click", null);
    g_map2.selectAll('path').attr('fill', '#D3D3D3').on("click", null);
  } else {
    projection = d3.geoOrthographic()
      .scale(planet_radius * 0.844)
      .translate([width / 2, height / 2])
      .precision(.1);
    $('.box-container').css({
      'background': ''
    });
    // inertia versor dragging after everything has been rendered
    inertia = d3.geoInertiaDrag(svg, function() {
      render();
    }, projection);

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

function ready(g, path) {
  d3.json("world/countries.json", function(error, data) {
    if (error) throw error;

    let features = topojson.feature(data, data.objects.units).features;
    g.selectAll("path")
      .data(features)
      .enter().append("path")
      // Chloropleth code
      .attr("fill", function(d) {
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
      .datum(topojson.mesh(data, data.objects.units, function(a, b) {
        return a !== b;
      }))
      .attr("class", "mesh")
      .attr("d", path);
  });
}

function render() {
  update(projection.rotate());
}

function update(eulerAngles) {
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

  let bounds = path.bounds(d),
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
      let r = d3.interpolate(projection.rotate(), [-geo_centroid[0], -geo_centroid[1]]);
      return function(t) {
        projection.rotate(r(t));
        svg.selectAll("path").attr("d", path);
      }
    })
    // TODO: Need to set it on the basis of the size of the country to fit in the whole svg
    .call(zoom_3D.scaleTo, scale);

  $('.box-container').css({
    'background': 'radial-gradient(circle at 37%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)'
  });

  countryName.innerHTML = active_info.__data__.properties.name;

  country_data_2D = Object.keys(data_2D).filter(function(k) {
    return k.indexOf(active_info.__data__.properties.iso3) == 0;
  }).reduce(function(newData, k) {
    newData[k] = data_2D[k];
    return newData;
  }, {});

  // Get 2D points for the map
  let coordstoplot = initialize_2D(current_year, country_data_2D);

  if (Object.keys(country_data_2D).length != 0) {
    if (previousCountryClicked !== null) {
      svg.selectAll('.plot-point').remove();
    }

    // The regions should appear after we zoom in the country
    setTimeout(function() {
      showData(g, coordstoplot);
    }, 751) // Should be more than 750 -> more than duration
  } else {
    if (previousCountryClicked !== null) {
      svg.selectAll('.plot-point').remove();
    }
  }

  previousCountryClicked = active_info.__data__.properties.iso3
  current_nature_contribution = data_c[active_info.__data__.properties.iso3];
  current_unmet_need = 100 - current_nature_contribution;
  change_percentage_animation(current_nature_contribution, current_unmet_need);
  lineGraphObject.updateGraph(previousCountryClicked);
}
// plot points on the map
function showData(the_g, coordinates) {
  // Add circles to the country which has been selected
  // Removing part is within
  if (checked3D == 'true') {
    the_g.selectAll(".plot-point")
      .data(coordinates).enter()
      .append("circle")
      .classed('plot-point', true)
      .attr("cx", function(d) {
        return projection(d)[0];
      })
      .attr("cy", function(d) {
        return projection(d)[1];
      })
      .attr("r", "1px")
      .attr("fill", function(d) {
        color = d[2] || 0;
        return colorScale(color);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  } else {
    the_g.selectAll(".plot-point")
      .data(coordinates).enter()
      .append("rect")
      .classed('plot-point', true)
      .attr("x", function(d) {
        return projection(d)[0];
      })
      .attr("y", function(d) {
        return projection(d)[1];
      })
      .attr("width", "3")
      .attr("height", "3")
      .attr("fill", function(d) {
        color = d[2] || 0;
        return colorScale(color);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  }
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
    .call(zoom_3D.transform, d3.zoomIdentity);

  // Change the toggle back to enabled
  document.getElementById("checked3D").disabled = false;
  document.getElementById("checked2D").disabled = false;

  $('.box-container').css({
    'background': ''
  });

  countryName.innerHTML = "World";
  previousCountryClicked = 'WLD';
  current_unmet_need = 100 - data_c[previousCountryClicked];
  change_percentage_animation(data_c[previousCountryClicked], current_unmet_need);
  lineGraphObject.updateGraph(previousCountryClicked);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}


function initialize_2D(period, data_) {
  let coordstoplot = [];
  for (let key in data_) {
    coordstoplot.push([data_[key]['lat'], data_[key]['long'], data_[key][period]]);
  }
  return coordstoplot;
}

let ssp1 = document.getElementById("ssp1");
let ssp3 = document.getElementById("ssp3");
let ssp5 = document.getElementById("ssp5");
let selector = document.getElementById("selector");
selector.style.left = 0;
selector.style.width = 10.5 + "vh";
selector.style.backgroundColor = "#777777";
selector.innerHTML = "SSP1";

// For 3D
function change_period(period) {
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
  change_pollination_contribution(current_SSP);
  title.innerHTML = "Pollination Contribution to Nutrition (" + current_viz + ") in 2050 - " + current_SSP;
  update_percentages(current_SSP);
  contribution_text.innerHTML = "What is the percentage of pollination contribution to " +
    current_viz + " in " + current_SSP + "?";
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
