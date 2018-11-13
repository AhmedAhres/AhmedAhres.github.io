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
