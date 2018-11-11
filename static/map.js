var format = function(d) {
    d = d / 1000000;
    return d3.format(',.02f')(d) + 'M';
}

// Creates a choropleth map, loads the geofile, select the column properly
// Do not change unitId
var map = d3.geomap.choropleth()
<<<<<<< HEAD
    .geofile('world/countries.json', static_url_path='/static')
=======
    .geofile('../static/d3-geomap-2.0.0/topojson/world/countries.json')
>>>>>>> 2623d6b6e7d13480d4b9cd8f4aa7382357c9a480
    .colors(colorbrewer.YlGnBu[9])
    .column('X1_en')
    .format(format)
    .legend(true)
    .unitId('name');

// Loads the csv file needed
<<<<<<< HEAD
d3.csv('dataset/data_1850.csv', function(error, data) {
=======
d3.csv('../static/d3-geomap-2.0.0/topojson/dataset/data_1850.csv', function(error, data) {
>>>>>>> 2623d6b6e7d13480d4b9cd8f4aa7382357c9a480
    var selection = d3.select('#map').datum(data);
    map.draw(selection);
});
