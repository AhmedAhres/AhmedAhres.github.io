let current_html = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);

// Function to load the pollination visualization
function load_pollination() {
  document.getElementsByClassName("box box-3-global")[0].style.display = "none";
  document.getElementsByClassName("box box-2-global")[0].style.display = "none"
  document.getElementsByClassName("box box-1-global")[0].style.display = "none";
  if (checked3D == "true") {
    document.getElementsByClassName("box box-3")[0].style.display = "flex";
  }
  if (checked2D == "true") {
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

ready(g_global, path_global, true);

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
