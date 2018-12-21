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
let path, projection = null;
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
