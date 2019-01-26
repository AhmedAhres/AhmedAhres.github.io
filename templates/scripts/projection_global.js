// Function to load the pollination visualization
function load_pollination() {
  document.getElementsByClassName("box box-2")[0].style.display = "flex";
  document.getElementsByClassName("box box-3-global")[0].style.display = "none";
  document.getElementsByClassName("box box-2-global")[0].style.display = "none"
  document.getElementsByClassName("box box-3")[0].style.display = "flex";
  document.getElementsByClassName("info-button")[0].style.display = "block";
  document.getElementsByClassName("switch-proj")[0].style.display = "flex";
  document.getElementsByClassName("parent-button-div")[0].style.display = "block";
}

// Function for the back button in pollination
function load_global() {
  document.getElementsByClassName("box box-3-global")[0].style.display = "flex";
  document.getElementsByClassName("box box-3")[0].style.display = "none";
  document.getElementsByClassName("info-button")[0].style.display = "none";
  document.getElementsByClassName("switch-proj")[0].style.display = "none";
  document.getElementsByClassName("parent-button-div")[0].style.display = "none";
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
