let waypoint = new Waypoint({
  element: document.getElementById('3rd_box'),
  handler: function() {
    PopUp('show')
  }
});

// Current dataset depending on what we visualize
let firstTime = true ;
let dataset = 'dataset/country_en.csv';
let dataset_2D = 'dataset/pixel_energy.csv';
let current_viz = "Food Energy";
let colorScheme = d3.schemeReds[6];
let unmet_need_dataset = 'dataset/unmet_need_energy.csv'

let global_unmet = load(unmet_need_dataset);
let current_unmet_data = {};
let title_map = document.getElementById("title_2d_change");
function initialize_unmet() {
    d3.csv(unmet_need_dataset, function(error, data) {
      data.forEach(function(d) {
        current_unmet_data[d.iso3] = global_unmet[d.iso3][current_year];
      });
    });
}

let region_text = "Pollination Contribution to Food Energy";

// We instantiate the bar chart object for the 2D section
let BarGraphObject = new BarGraph();

initialize_unmet();

let checked3D = "true";
let checked2D = "false";

let width = $(".box.box-2").width(), height = $(".box.box-2").height(), active = d3.select(null);

let previousCountryClicked = 'WLD';
let path, projection, zoom = null;
let inertia;

let svg = d3.select(".map1").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

let svg_map2 = d3.select(".map2").append("svg")
    .attr("width", 0)
    .attr("height", 0)
    .on("click", stopped, true);

let g = svg.append('g');
let g_map2 = svg_map2.append('g');

let projection_new = d3.geoNaturalEarth().scale(d3.min([width / 2, height / 2])*0.45).translate([width / 2, height / 2]).precision(.1);
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

//Data and color scale and legend
let colorScale = d3.scaleThreshold()
    .domain([20, 40, 60, 80, 99, 100])
    .range(colorScheme);
// Getting the Legend and setting the color scale on the legend
let svg_legend = d3.select(".box.box-1").append("svg");
makeLegend(colorScale);


loadGlobalData(dataset);
let data_2D = load(dataset_2D);

// Calling the ready function to render everything even chloropleth
ready(g, path);
ready(g_map2, path_new);

let countryName = document.getElementById("box-3-header-2").firstElementChild;
let title = document.getElementById("box-3-header").firstElementChild;
let current_nature_contribution = 35;
// Change unmet need with the world data in 1945 !!!
let current_unmet_need = 57;

let years = ["1850", "1900", "1950", "2000", "2050", "2100", "2150"];
let sliderSSPs=['50','100','150']
let actualData = ["1850", "1900", "1910", "1945", "1980", "2015", "2050"];

let formatToData = function(d) {
  // TO BE OPTIMIZED WITH A DICTIONARY
    if (d == 1850 || d == 1900) return d;
    else if (d == 1950) return 1910;
    else if (d == 2000) return 1945;
    else if (d == 2050) return 1980;
    else if (d == 2100) return 2015;
    else if (d == 2150) return 2050;
    else if (d == 50) return "SSP1";
    else if (d == 100) return "SSP3";
    else return "SSP5";
}

let current_SSP = "SSP1";
let current_year = "1945"
createSlider();

// Pollination contribution percentage starts here
let width_circle = 20,
    height_circle = 20,
    twoPi = 2 * Math.PI,
    progress = 0,
    progress_unmet = 0,
    formatPercent = d3.format(".0%");

let arc = d3.arc()
    .startAngle(0)
    .innerRadius(55)
    .outerRadius(62);

let svg1 = d3.select(".docsChart").append("svg")
    .attr("class", "percentage")
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + width_circle * 4 + "," + height_circle * 3.5 + ")");

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
    .attr("class", "percentage")
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + width_circle * 4.4 + "," + height_circle * 3.5 + ")");

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
    if ( checked3D == 'true'){
        g.selectAll("path").attr("fill", function (d) {
            // Pull data for particular iso and set color - Not able to fill it
            if(d.type == 'Feature') {
                d.total = data_c[d.properties.iso3] || 0;
            } else {
            }
            return colorScale(d.total);
        }
    )}
  });
  });
}

function make2015staticMap() {
  if(firstTime){
    let coordstoplot = initialize_2D("2015", data_2D);
    showData(g_map2, coordstoplot);
    firstTime = false ;
  }
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
let unmet_text = document.getElementsByClassName("title-unmet")[0];
let colorScale_energy = d3.scaleOrdinal()
        .domain(["contribution", "unmet"])
        .range(["#d73027", "#4fb1fe"]);
let colorScale_vitamin = d3.scaleOrdinal()
        .domain(["contribution", "unmet"])
        .range(["#91cf60", "#4fb1fe"]);
let colorScale_folate = d3.scaleOrdinal()
        .domain(["contribution", "unmet"])
        .range(["#41037e", "#4fb1fe"]);

function updateData(data_type) {
  switch(data_type) {
    case "Vitamin":
      current_viz = "Vitamin A";
      region_text = "Pollination Contribution to Vitamin A";
      title.innerHTML = "Pollination Contribution to Nutrition (Vitamin A) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to "
      + current_viz  + " in " + current_year + "?";
      unmet_text.innerHTML = "What is the percentage of people who's need in " + current_viz + " is not met?";
      colorScheme = d3.schemeGreens[6];
      title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs " + current_SSP + " (Bottom)";
      dataset = 'dataset/country_va.csv';
      dataset_graph = 'dataset/plot_vitamin.csv';
      dataset_2D = 'dataset/pixel_va.csv';
      unmet_need_dataset = 'dataset/unmet_need_vitamin.csv';
      color_graph = colorScale_vitamin;
      updateGraph(previousCountryClicked);

      break;
    case "Energy":
      current_viz = "Food Energy";
      region_text = "Pollination Contribution to Food Energy";
      title.innerHTML = "Pollination Contribution to Nutrition (Food Energy) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to "
      + current_viz  + " in " + current_year + "?";
      unmet_text.innerHTML = "What is the percentage of people who's need in " + current_viz + " is not met?";
      title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs " + current_SSP + " (Bottom)";
      colorScheme = d3.schemeReds[6];
      dataset = 'dataset/country_en.csv';
      dataset_graph = 'dataset/plot_energy.csv';
      dataset_2D = 'dataset/pixel_energy.csv';
      unmet_need_dataset = 'dataset/unmet_need_energy.csv';
      color_graph = colorScale_energy;
      updateGraph(previousCountryClicked);
      break;
    case "Folate":
      current_viz = "Folate";
      region_text = "Pollination Contribution to Folate";
      title.innerHTML = "Pollination Contribution to Nutrition (Folate) in " + current_year;
      contribution_text.innerHTML = "What is the percentage of pollination contribution to "
      + current_viz  + " in " + current_year + "?";
      unmet_text.innerHTML = "What is the percentage of people who's need in " + current_viz + " is not met?"
      title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs " + current_SSP + " (Bottom)";
      colorScheme = d3.schemePurples[6];
      dataset = 'dataset/country_fo.csv';
      dataset_graph = 'dataset/plot_folate.csv';
      unmet_need_dataset = 'dataset/unmet_need_folate.csv';
      dataset_2D = 'dataset/pixel_fo.csv';
      color_graph = colorScale_folate;
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
    select_contribution_energy(current_year);
    accessData();
  });
}

function accessData() {
  g.selectAll("path").attr("fill", function (d){
    // Pull data for particular iso and set color - Not able to fill it
    if (checked3D == 'true'){
      d.total = data_c[d.properties.iso3] || 0;
      return colorScale(d.total);
    }else{
      return '#D3D3D3';
    }

  })
  .attr("d", path);
}

function makeLegend(colorScale) {
  // Getting the Legend and setting the color scale on the legend
  let g_legend = svg_legend.append("g")
      .attr("class", "legendThreshold")
      .attr("transform", "translate(0,20)");

  g_legend.append("text")
      .attr("class", "caption")
      .attr("x", 0)
      .attr("y", -4)
      .text("% contrib.");

  let labels = ['1-20', '21-40', '41-60', '61-80', '81-99', '100'];
  let legend = d3.legendColor()
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
    svg.selectAll('.plot-point').remove();
    document.getElementsByClassName('box box-3')[0].style.display = "flex";
    document.getElementsByClassName('box box-3')[1].style.display = "none";
    changeProjection(false);
    checked3D = "true";
    check2D = "false";

    map2.setAttribute("style", "width: 0; height: 0;");
    map1.setAttribute("style", "width: 100%; height: 94%;");
    svg.attr("transform", "translate(0, 0)");
    svg_map2.attr("width", 0).attr("height", 0);

    document.getElementById("checked3D").disabled = true;
    document.getElementById("checked2D").disabled = false;
    d3.select(".map-slider").html("");
    runSlider("1945", false)
    createSlider();
  }
}

function projection2D() {
  checked2D = document.getElementById("checked2D").value;
  checked3D = document.getElementById("checked3D").value;
  if(checked2D === 'false') {
    BarGraphObject.updateBarGraph('dataset/ssp1_impacted.csv');
    title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs SSP1 (Bottom)";
    changeProjection(true);
    document.getElementsByClassName('box box-3')[0].style.display = "none";
    document.getElementsByClassName('box box-3')[1].style.display = "flex";
    checked2D = "true";
    checked3D = "false";
    let coordstoplot = initialize_2D(current_year, data_2D);

    // Change the size of the maps
    svg.attr("width", $(".map1").width())
    .attr("height", $(".map1").height())
    .attr("transform", "translate(0, -200) scale(0.8)");
    map1.setAttribute("style", "width: 100%; height: 47%;");

    map2.setAttribute("style", "width: 100%; height: 47%;");
    svg_map2.attr("width", $(".map1").width())
    .attr("height", $(".map1").height() * 1.5)
    .attr("transform", "translate(0, -180) scale(0.8)");

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
      g.selectAll('path').attr('fill', '#D3D3D3').on("click", null);
      g_map2.selectAll('path').attr('fill', '#D3D3D3').on("click", null);
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

function ready(g, path) {
  d3.json("world/countries.json", function(error, data) {
    if (error) throw error;

    let features = topojson.feature(data, data.objects.units).features;
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
      .call(zoom.scaleTo, scale);

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

  if(Object.keys(country_data_2D).length != 0) {
    if(previousCountryClicked !== null) {
        svg.selectAll('.plot-point').remove();
    }

    // The regions should appear after we zoom in the country
    setTimeout(function() {
        showData(g, coordstoplot);
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
function showData(the_g, coordinates) {
    // Add circles to the country which has been selected
    // Removing part is within
    if(checked3D == 'true') {
    the_g.selectAll(".plot-point")
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
          color = d[2] || 0 ;
          return colorScale(color);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
      } else {
        the_g.selectAll(".plot-point")
            .data(coordinates).enter()
            .append("rect")
            .classed('plot-point', true)
            .attr("x", function (d) {
                return projection(d)[0];
            })
            .attr("y", function (d) {
                return projection(d)[1];
            })
            .attr("width", "3")
            .attr("height", "3")
            .attr("fill", function (d) {
              color = d[2] || 0 ;
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
                  return colorScale(d.total);

              } else {
              }
          });
          // Update the regions data with the slider when zoomed in
          let coordstoplot = initialize_2D(period, country_data_2D);
          g.selectAll(".plot-point").data(coordstoplot).attr("fill", function (d) {
            color = d[2] || 0 ;
            return colorScale(color);
          });
    });
  }
  if(checked2D == "true") {
    d3.csv(dataset_2D, function(error, data) {
      let promise = new Promise(function(resolve, reject) {
        // loadGlobalData('dataset/pixel_energy.csv');
        setTimeout(() => resolve(1), 10);
      });
      promise.then(function(result) {
        // TODO: Make the year not hard coded
          let coordstoplot = initialize_2D(period, data_2D);
          g.selectAll(".plot-point").data(coordstoplot).attr("fill", function (d) {
            color = d[2] || 0 ;
            return colorScale(color);
          });
          let coordstoplot_static = initialize_2D('2015', data_2D);
          g_map2.selectAll(".plot-point").data(coordstoplot_static).attr("fill", function (d) {
            color = d[2] || 0 ;
            return colorScale(color);
          });
            });
      });

}
}

function initialize_2D(period, data_) {
  let coordstoplot = [];
  for (let key in data_) {
    coordstoplot.push([data_[key]['lat'], data_[key]['long'], data_[key][period]]);
  }
  return coordstoplot;
}


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

let ssp1 = document.getElementById("ssp1");
let ssp3 = document.getElementById("ssp3");
let ssp5 = document.getElementById("ssp5");
let selector = document.getElementById("selector");
selector.style.left = 0;
selector.style.width = 10.5 + "vh";
selector.style.backgroundColor = "#777777";
selector.innerHTML = "SSP1";

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
      selector.style.left = ssp1.clientWidth  + ssp3.clientWidth + 1 + "px";
      selector.style.width = ssp5.clientWidth + "px";
      selector.innerHTML = "SSP5";
      selector.style.backgroundColor = "#4d7ea9";
      current_SSP = "SSP5";
    }
    select_contribution_energy(current_SSP);
    title.innerHTML = "Pollination Contribution to Nutrition (" + current_viz + ") in 2050 - " + current_SSP;
    update_percentages(current_SSP);
    contribution_text.innerHTML = "What is the percentage of pollination contribution to "
    + current_viz  + " in " + current_SSP + "?";
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

function createSlider() {
  let min_year, max_year, width, default_, tickvalues;
  if(checked2D == "false") {
    min_year = 1850;
    max_year = 2150;
    width = 400;
    default_ =  "2000";
    tickvalues = years;

  } else {
    min_year = 50;
    max_year = 150;
    width = 400;
    default_ = "50";
    tickvalues = sliderSSPs;
  }
  let slider = d3.sliderHorizontal()
    .min(min_year)
    .max(max_year)
    .step(50)
    .default(default_)
    .width(width)
    .tickValues(tickvalues)
    .tickFormat(formatToData)
    .on("onchange", val => {
      if(checked3D == "true") {
        // Here, the value we check for is still the original one, not the formatted one
        if (val == 1850) runSlider("1850", false);
        if (val == 1900) runSlider("1900", false);
        if (val == 1950) runSlider("1910", false);
        if (val == 2000) runSlider("1945", false);
        if (val == 2050) runSlider("1980", false);
        if (val == 2100) runSlider("2015", false);
        if (val == 2150) runSlider("2050", true);
      } else {
        if (val == 50) {
          runSlider("SSP1", false);
          BarGraphObject.updateBarGraph('dataset/ssp1_impacted.csv');
          title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs SSP1 (Bottom)";
          current_SSP = "SSP1";
          }
        if (val == 100) {
          runSlider("SSP3", false);
          BarGraphObject.updateBarGraph('dataset/ssp3_impacted.csv');
          title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs SSP3 (Bottom)";
          current_SSP = "SSP3";
        }
        if (val == 150) {
          runSlider("SSP5", false);
          BarGraphObject.updateBarGraph('dataset/ssp5_impacted.csv');
          title_map.innerHTML = "Pollination Contribution to " +  current_viz + " in 2015 (Top) vs SSP5 (Bottom)";
          current_SSP = "SSP5";
      }
    }
   });

  let group = d3.select(".map-slider").append("svg")
    .attr("width", 900)
    .attr("height", 70)
    .append("g")
    .attr("transform", "translate(" + 200 + "," + 12 + ")")
    .call(slider);
}

function runSlider(period, if_ssp) {
  if(!if_ssp) {
    title.innerHTML = "Pollination Contribution to Nutrition (" + current_viz + ") in " + period;
    contribution_text.innerHTML = "What is the percentage of pollination contribution to "
    + current_viz  + " in " + period + "?";
    current_year = period;
    removeSSPs();
    select_contribution_energy(period);
    update_percentages(period);
  } else {
    if (checked3D == "true") showSSPs();
    if (checked2D == "true") change_period(period);
    title.innerHTML = "Pollination Contribution to Nutrition (" + current_viz + ") in 2050 - " + current_SSP;
    contribution_text.innerHTML = "What is the percentage of pollination contribution to "
    + current_viz  + " in " + current_SSP + "?";
    select_contribution_energy(current_SSP);
    update_percentages(current_SSP);
    current_year = current_SSP;
  }
}

let dataset_graph = "dataset/plot_energy.csv";

// Set the dimensions of the canvas / graph
let margin = {top: 30, right: 30, bottom: 80, left: 50},
    width_plot = 500 - margin.left - margin.right,
    height_plot = 300 - margin.top - margin.bottom;


// Set the ranges
let x_graph = d3.scaleLinear().range([0, width_plot]);
let y_graph = d3.scaleLinear().range([height_plot, 0]);
updateGraph('WLD');

// set the colour scale
let color_graph = colorScale_energy;

function updateGraph(country) {
  let svg_remove = d3.select(".graph");
  svg_remove.selectAll("*").remove();

let line_draw = d3.line()
      .x(function(d) { return x_graph(d.date); })
      .y(function(d) { return y_graph(d[country]); });


  // Adds the svg canvas
let svg_plot = d3.select(".graph")
      .append("svg")
          .attr("class", "svg_graph")
          .attr("preserveAspectRatio", "xMinYMin meet")
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

                  return d.color_graph = color_graph(d.key); })
              .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign an ID
              .attr("d", line_draw(d.values));

          // Add the Text
          svg_plot.append("text")
              .attr("x", (legendSpace/2)+i*legendSpace + 5)  // space legend
              .attr("y", height_plot + (margin.bottom/2) + 5)
              .attr("class", "legend")    // style the legend
              .style("fill", function() { // Add the colours dynamically
                  return d.color_graph = color_graph(d.key);

                   })
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
