var format = function(d) {
    d = d / 1000000;
    return d3.format(',.02f')(d) + 'M';
}

// Creates a choropleth map, loads the geofile, select the column properly
// Do not change unitId
var map = d3.geomap.choropleth()
    .geofile('countries.json')
    .colors(colorbrewer.YlGnBu[9])
    .column('X1_en')
    .legend(true)
    .format(format)
    .unitId('name')

// Loads the csv file needed
d3.csv('data_1850.csv', function(error, data) {
    var selection = d3.select('#map').datum(data);
    map.draw(selection);
});

map.addEventListener("click", () => {
  console.log("Hello");
});
