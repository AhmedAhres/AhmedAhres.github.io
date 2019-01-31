let current_html = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
let dataset_global = 'dataset/pixel_energy.csv';
let colorSchemeX = d3.schemeGreens[3];
let colorSchemeY = d3.schemeReds[3];
let gradient_blue = 'radial-gradient( circle at 37%, rgb(105, 190, 255) 29%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)';
let gradient_white = 'radial-gradient(circle at 37%, rgb(236, 246, 255) 36%, rgb(228, 255, 255) 42%, rgb(215, 254, 255) 49%, rgb(204, 245, 255) 56%, rgb(191, 234, 255) 63%, rgb(147, 193, 227) 70%, rgb(147, 193, 227) 77%, rgb(147, 193, 227) 84%, rgb(81, 119, 164) 91%)';
let colorScale2DGlobalX = d3.scaleThreshold()
  .domain([20, 40, 60, 80, 99, 100])
  .range(colorSchemeX);
let colorScale2DGlobalY = d3.scaleThreshold()
  .domain([20, 40, 60, 80, 99, 100])
  .range(colorSchemeY);

document.getElementsByClassName("box-container")[0].style.background = gradient_white;

// Function to load the pollination visualization
function load_pollination() {
  document.getElementsByClassName("box box-3-global")[0].style.display = "none";
  document.getElementsByClassName("box box-2-global")[0].style.display = "none"
  document.getElementsByClassName("box box-1-global")[0].style.display = "none";
  if (checked3D == "true") {
    document.getElementsByClassName("box-container")[0].style.background = gradient_blue;
    document.getElementsByClassName("box box-3")[0].style.display = "flex";
  }
  if (checked2D == "true") {
    document.getElementsByClassName("box-container")[0].style.background = gradient_white;
    document.getElementsByClassName("box box-3")[1].style.display = "flex";
  }
  document.getElementsByClassName("info-button")[0].style.display = "block";
  document.getElementsByClassName("back-button")[0].style.display = "block";
  document.getElementsByClassName("switch-proj")[0].style.display = "flex";
  document.getElementsByClassName("parent-button-div")[0].style.display = "block";
  document.getElementsByClassName("box box-1")[0].style.visibility = "visible";
  document.getElementsByClassName("box box-2")[0].style.display = "flex";
}

// Function for the back button in pollination
function load_global() {
  if (current_html == "index.html") {
  document.getElementsByClassName("box-container")[0].style.background = gradient_white;
  document.getElementsByClassName("box box-3-global")[0].style.display = "flex";
  document.getElementsByClassName("box box-2-global")[0].style.display = "flex"
  document.getElementsByClassName("box box-1-global")[0].style.display = "flex";
  document.getElementsByClassName("box box-3")[0].style.display = "none";
  document.getElementsByClassName("box box-3")[1].style.display = "none";
  document.getElementsByClassName("info-button")[0].style.display = "none";
  document.getElementsByClassName("switch-proj")[0].style.display = "none";
  document.getElementsByClassName("parent-button-div")[0].style.display = "none";
  document.getElementsByClassName("box box-1")[0].style.visibility = "collapse";
  document.getElementsByClassName("box box-2")[0].style.display = "none";
  } else {
    location.href='index.html';
    return false;
  }
}

let width_global = $(".box.box-2-global").width(),
  height_global = $(".box.box-2-global").height();

let svg_global = d3.select(".map-global").append("svg")
  .attr("id", "svg_map_global")
  .attr("width", width_global)
  .attr("height", height_global)
  .on("click", stopped, true);

let g_global = svg_global.append('g');

let projection_global = d3.geoNaturalEarth().scale(d3.min([width_global / 2, height_global / 2]) * 0.45).translate([width_global / 2, height_global / 2]).precision(.1);
let path_global = d3.geoPath().projection(projection_global);
let map_global = document.getElementsByClassName('map-global')[0];

map_global.setAttribute("style", "width: 100%; height: 100%;");

ready_global(g_global, path_global);

let pollination_box = document.getElementById("pollination-box");
let water_box = document.getElementById("water-quality-box");
let coastal_box = document.getElementById("coastal-risk-box");

function load_pollination_data() {
  if (pollination_box.checked == true) {
    console.log("pollination checked")
  }
}

function load_waterquality_data() {
  if (water_box.checked == true) {
    console.log("waterquality checked")
  }
}

function load_coastalrisk_data() {
  if (coastal_box.checked == true) {
    console.log("coastal risk checked")
  }
}

// Load pollination data 2D
function ready_global(g, path) {
  d3.json("world/countries.json", function(error, data) {
    if (error) throw error;

    let features = topojson.feature(data, data.objects.units).features;
    g.selectAll("path")
      .data(features)
      .enter().append("path")
      .attr("d", path)
      // .attr("fill", function(d) {
      //   // Pull data for particular iso and set color - Not able to fill it
      //   d.total = data_c[d.properties.iso3] || 0;
      //   return colorScale(d.total);
      // })
      .attr("fill", "#D3D3D3")
      .attr("class", "feature");
    // Creates a mesh around the border
    g.append("path")
      .datum(topojson.mesh(data, data.objects.units, function(a, b) {
        return a !== b;
      }))
      .attr("class", "mesh")
      .attr("d", path);
  });
}

let data_2D_global = load(dataset_2D);
let promise_global = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(1), 100);
});
promise_global.then(() => {
  let coordstoplot_global = initialize_2D("2015", data_2D_global);
  showDataGlobal(g_global, coordstoplot_global, colorSchemeX);
  showDataGlobal(g_global, coordstoplot_global, colorSchemeY);
});

// plot points on the map for 2D global map
function showDataGlobal(the_g, coordinates, ColorScaleSelect) {
    // This is just for 2D, we are creating a raster by creating a rectangle
    the_g.selectAll(".plot-point")
      .data(coordinates).enter()
      .append("rect")
      .classed('plot-point', true)
      .attr("x", function(d) {
        return projection_global(d)[0];
      })
      .attr("y", function(d) {
        return projection_global(d)[1];
      })
      .attr("width", "3")
      .attr("height", "3")
      .attr("fill", function(d) {
        color = d[2] || 0;
        return ColorScaleSelect(color);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
}
