
// For the popup window
function PopUp(hideOrshow) {

    if (hideOrshow == 'hide') {
        document.getElementById('ac-wrapper').style.display = "none";
    }

    else  if(localStorage.getItem("popupWasShown") == null) {
        localStorage.setItem("popupWasShown",1);
        document.getElementById('ac-wrapper').removeAttribute('style');
    }

}
window.onload = function () {
    setTimeout(function () {
        PopUp('show');
    }, 0);
}


function hideNow(e) {
    if (e.target.id == 'ac-wrapper') document.getElementById('ac-wrapper').style.display = 'none';
}
function showNow() {
    document.getElementById('ac-wrapper').style.display = "inline";
}

// End of popup window

  var width = $(".box.box-2").width(), height = $(".box.box-2").height(), active = d3.select(null);

  var previousCountryClicked = 'WRD';
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
  var colorScheme = d3.schemeRdYlGn[6];
  colorScheme.unshift("#eee");
  var colorScale = d3.scaleThreshold()
      .domain([0, 1, 20, 40, 60, 80, 100])
      .range(colorScheme);

  // Getting the Legend and setting the color scale on the legend
  var svg_legend = d3.select(".box.box-1").append("svg")
  var g_legend = svg_legend.append("g")
      .attr("class", "legendThreshold")
      .attr("transform", "translate(10,20)");

  g_legend.append("text")
      .attr("class", "caption")
      .attr("x", 0)
      .attr("y", -4)
      .text("% change");

  var labels = ['0', '1-20', '21-40', '41-60', '61-80', '81-99', '100'];
  var legend = d3.legendColor()
      .labels(function (d) { return labels[d.i]; })
      .shapePadding(4)
      .scale(colorScale);
  svg_legend.select(".legendThreshold")
      .call(legend);

  let global_folate = load("dataset/folate_data.csv");

  let data_folate = {};
  d3.csv('dataset/folate_data.csv', function(error, data) {
      data.forEach(function(d) {
        data_folate[d.iso3] = global_folate[d.iso3]["2015"];
      });
  });
    // Loading the data for the testing file - Chloropleth
  let global_data_c = load('dataset/country_energy.csv');
  let data_c = {};
  d3.csv('dataset/country_energy.csv', function(error, data) {
    data.forEach(function(d) {
      data_c[d.iso3] = global_data_c[d.iso3]["1945"];
    });
  });

  // Calling the ready function to render everything even chloropleth
  ready();

  // Lat - Long Coordinates for Nigeria - Example
  // Data is in Lat Long, but for coding the sequence is Long Lat
  var coordinates = {};
  coordinates['NGA'] = [[4.5, 13.5], [5.5, 13.5], [9.5, 9.5], [11.5, 8.5], [12.5,11.5]];

  function load(dataset) {
    let result = {};
    d3.csv(dataset, function(error, data) {
      data.forEach(function(d) {
        result[d.iso3] = d;
        });
      });
    return result;
  }

  function projectionChecked() {
    var projectionSlider = document.getElementById("projectionChangeChecked");
    changeProjection(projectionSlider.checked);
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

  let countryName = document.getElementById("box-3-header-2");
  let title = document.getElementById("box-3-header");
  let folateProduction = document.getElementById("folate_production");

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
    document.getElementById("projectionChangeChecked").disabled = true;

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

    //popData.innerHTML = "Population: " + active_info.__data__.properties.name;
    countryName.innerHTML = active_info.__data__.properties.name;
    if (data_folate[active_info.__data__.properties.iso3] != null)
      folateProduction.innerHTML = "Folate Production: " + data_folate[active_info.__data__.properties.iso3] + " mcg";
    else
      folateProduction.innerHTML = "Folate Production: Not Measured"

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
    document.getElementById("projectionChangeChecked").disabled = false;

    countryName.innerHTML = "World";
    //folateProduction.innerHTML = "Folate Production: 10B mcg";
    previousCountryClicked = 'WRD';
    display_folate();
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

function display_folate() {
  if (data_folate[previousCountryClicked] != null)
    folateProduction.innerHTML = "Folate Production: " + data_folate[previousCountryClicked] + " mcg";
  else
    folateProduction.innerHTML = "Folate Production: Not Measured"
}

function select_folate(period) {
  d3.csv('dataset/folate_data.csv', function(error, data) {
    data.forEach(function(d) {
      data_folate[d.iso3] = global_folate[d.iso3][period];
    });
    display_folate();
  });
}

function select_contribution_energy(period) {
  d3.csv('dataset/country_energy.csv', function(error, data) {
    data.forEach(function(d) {
      data_c[d.iso3] = global_data_c[d.iso3][period];
    });
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

let current_SSP = "SSP1";

let slider = d3.sliderHorizontal()
  .min(1850)
  .max(2150)
  .step(50)
  .default("2000")
  .width(400)
  .tickValues(years)
  .tickFormat(formatToData)
  .on("onchange", val => {
    // Here, the value we check for is still the original one, not the formatted one
    if (val == 1850) {
      title.innerHTML = "Nature's Contribution to Pollination in 1850";
      removeSSPs();
      select_folate("1850");
      select_contribution_energy("1850");
    }

    if (val == 1900) {
      title.innerHTML = "Nature's Contribution to Pollination in 1900";
      removeSSPs();
      select_folate("1900");
      select_contribution_energy("1900");
    }

    if (val == 1950) {
      title.innerHTML = "Nature's Contribution to Pollination in 1910";
      removeSSPs();
      select_folate("1910");
      select_contribution_energy("1910");
    }

    if (val == 2000) {
      title.innerHTML = "Nature's Contribution to Pollination in 1945";
      removeSSPs();
      select_folate("1945");
      select_contribution_energy("1945");
    }

    if (val == 2050) {
      title.innerHTML = "Nature's Contribution to Pollination in 1980";
      removeSSPs();
      select_folate("1980");
      select_contribution_energy("1980");
    }

    if (val == 2100) {
      title.innerHTML = "Nature's Contribution to Pollination in 2015";
      removeSSPs();
      select_folate("2015");
      select_contribution_energy("2015");
    }

    if (val == 2150) {
      showSSPs();
      title.innerHTML = "Nature's Contribution to Pollination in 2050 - " + current_SSP;
      select_folate(current_SSP);
      select_contribution_energy(current_SSP);
    }
  });

function change_period(period){
    var ssp1 = document.getElementById("ssp1");
    var ssp3 = document.getElementById("ssp3");
    var ssp5 = document.getElementById("ssp5");
    var selector = document.getElementById("selector");
    if (period === "ssp1") {
      title.innerHTML = "Nature's Contribution to Pollination in 2050 - SSP1";
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
      title.innerHTML = "Nature's Contribution to Pollination in 2050 - SSP5";
      selector.style.left = ssp1.clientWidth + ssp3.clientWidth + 1 + "px";
      selector.style.width = ssp5.clientWidth + "px";
      selector.innerHTML = "SSP5";
      selector.style.backgroundColor = "#4d7ea9";
      current_SSP = "SSP5";
    }
    select_folate(current_SSP);
    select_contribution_energy(current_SSP);
    title.innerHTML = "Nature's Contribution to Pollination 2050 - " + current_SSP;
  }

function showSSPs() {
  document.getElementsByClassName('switch_3_ways')[0].style.display = "block";
}

function removeSSPs() {
  document.getElementsByClassName('switch_3_ways')[0].style.display = "none";
}

var group = d3.select(".box.box-2").append("svg")
  .attr("width", 900)
  .attr("height", 70)
  .append("g")
  .attr("transform", "translate(" + 200 + "," + 12 + ")")
  .call(slider);