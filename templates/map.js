var format = function(d) {
    d = d / 100000000000000;
    return d3.format(',.02f')(d) + 'M';
}

// Creates a choropleth map, loads the geofile, select the column properly
// Do not change unitId
let map = d3.geomap.choropleth()
    .geofile('world/countries.json')
    .colors(colorbrewer.RdYlGn[11])
    .column('result')
    //.projection(d3.geoGilbert)
    .format(format)
    .scale(300)
    .legend(true)
    .unitId('iso3');

// Loads the csv file needed
d3.csv('dataset/data_1850_iso3.csv', function(error, data) {
    var selection = d3.select('#map').datum(data);
    map.draw(selection);
});

var data3 = ["1850", "1900", "1950", "2000", "2050", "2100", "2150", "2200", "2250", "2300"]
var actualData = ["1850", "1900", "1910", "1945", "1980", "Curr", "Pot", "SSP1", "SSP3", "SSP5"]

var formatToData = function(d) {
  // TO BE OPTIMIZED
    if (d == 1850 || d == 1900) return d;
    if (d == 1950) return 1910;
    if (d == 2000) return 1945;
    if (d == 2050) return 1980;
    if (d == 2100) return "Curr";
    if (d == 2150) return "Potential";
    if (d == 2200) return "SSP1";
    if (d == 2250) return "SSP3";
    if (d == 2300) return "SSP5";
}

var slider3 = d3.sliderHorizontal()
  .min(1850)
  .max(2300)
  .step(50)
  .width(400)
  .tickValues(data3)
  .tickFormat(formatToData)
  .displayValue(false)
  .on("onchange", val => {
    // Here, the value we check for is still the original one, not the formatted one
    if (val == 1850) {
      // Change the data here, we need to make the correct columns
      map.column('result').update();
    }
    if (val == 1900) {
      map.column('X1_va').update();
    }
    if (val == 1950) {
      map.column('X1_fo').update();
    }
  });


var group3 = d3.select("div#slider3").append("svg")
  .attr("width", 1500)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(900,50)")
  .call(slider3);
