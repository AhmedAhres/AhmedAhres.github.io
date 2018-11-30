import fiona
import pandas as pd 
import geopandas as gpd

layers = fiona.listlayers('ipbes_pollination_summary_hg_2018-08-16_12_21_-0700_036a5f15f926.gpkg')

# Get the grid 1 degree dataset
unxncp_info_country = gpd.read_file(
    "ipbes_pollination_summary_hg_2018-08-16_12_21_-0700_036a5f15f926.gpkg", layer='unxncp'
)[['fid', 'GRIDCODE', 'region', 'country']]

# Get the relation between fid and lat long
latlong_pollination = pd.read_csv('latlong_pollination.csv')
mock_data = pd.read_csv('mock_data.csv')
mock_data = mock_data[['name', 'iso3']]

# Change name of columns
mock_data.columns = ['country', 'iso3']

# Setting index to 'fid' for each of the Dataframes
# unxncp_info_country.set_index('fid')
# latlong_pollination.set_index('fid')

# The joined (inner join) dataset on fid and lat,lon
joined_fid_lat_lon = unxncp_info_country.merge(latlong_pollination, on='fid', how='inner')
# joined_fid_lat_lon.reset_index()
joined_fid_lat_lon = joined_fid_lat_lon.merge(mock_data, on='country', how='inner')

# Write the file to the current directory
joined_fid_lat_lon.to_csv('fid_lat_lon.csv')

