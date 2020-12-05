/*
 *  mapVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Object with climate information for all cities
 *  @param _geoDataPath     -- File path name with geoJson data for all cities in world
 */

class mapVis {

    /*
     *  Constructor method
     */
    constructor(parentElement, data, geoDataPath) {
        this.parentElement = parentElement;
        this.data = data;
        this.geoDataPath = geoDataPath;


        this.initVis();
    }


    /*
     *  Initialize station map
     */
    initVis() {
        let vis = this;


        // Create map and set view
        vis.map = L.map(vis.parentElement);

        vis.map.setView([20, 0], 1.9);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);


        // Add in circles to highlight each city on big map
        vis.circleBerlin = L.circleMarker([52.520008, 13.404954], {
            color: "#3289ED",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleCairo = L.circleMarker([30.075, 31.2355], {
            color: "#E0773A",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleDubai = L.circleMarker([25.29, 55.3], {
            color: "#EB3E2A",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleNewYork = L.circleMarker([40.8, -74], {
            color: "#8FF0AC",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleOslo = L.circleMarker([59.913868, 10.752245], {
            color: "#0C1461",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleReykjavik = L.circleMarker([64.15, -21.9], {
            color: "#0c2c84",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleSanDiego = L.circleMarker([32.715736, -117.161087], {
            color: "#E0F09E",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.circleSingapore = L.circleMarker([1.290270, 103.851959], {
            color: "#9E1909",
            fillOpacity: 0.75,
            radius: 25,
            className: 'mapCircle'
        }).addTo(vis.map);

        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData() {

        let vis = this;

        vis.filteredData = {};
        vis.data.forEach(d => {
            let cityData = [];
            d.forEach(t => {
                let itemC =
                    {
                        city: t.Location,
                        time: new Date(2020, t.Month - 1, t.Day, t.Hour - 1),
                        hourYear: +t['Annual Hour'] - 1,
                        type: (t.Type == 'Current') ? "C" : (t.Type == 'Short Term Projection') ? "STP" : (t.Type == 'Medium Term Projection') ? "MTP" : "LTP",
                        CC_SEWE: (t['Comfort Cond - Sun Exposed Wind Exposed'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Exposed Wind Exposed'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Exposed Wind Exposed'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Exposed Wind Exposed'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Exposed Wind Exposed'] == -4) ? +-2 :
                                            (t['Comfort Cond - Sun Exposed Wind Exposed'] == -5) ? +-2 : +t['Comfort Cond - Sun Exposed Wind Exposed'],
                        CC_SEWP: (t['Comfort Cond - Sun Exposed Wind Protected'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Exposed Wind Protected'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Exposed Wind Protected'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Exposed Wind Protected'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Exposed Wind Protected'] == -4) ? +-2 :
                                            (t['Comfort Cond - Sun Exposed Wind Protected'] == -5) ? +-2 : +t['Comfort Cond - Sun Exposed Wind Protected'],
                        CC_SPWE: (t['Comfort Cond - Sun Shaded Wind Exposed'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Shaded Wind Exposed'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Shaded Wind Exposed'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Shaded Wind Exposed'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Shaded Wind Exposed'] == -4) ? +-2 :
                                            (t['Comfort Cond - Sun Shaded Wind Exposed'] == -5) ? +-2 : +t['Comfort Cond - Sun Shaded Wind Exposed'],
                        CC_SPWP: (t['Comfort Cond - Sun Shaded Wind Protected'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Shaded Wind Protected'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Shaded Wind Protected'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Shaded Wind Protected'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Shaded Wind Protected'] == -4) ? +-2 :
                                            (t['Comfort Cond - Sun Shaded Wind Protected'] == -5) ? +-2 : +t['Comfort Cond - Sun Shaded Wind Protected'],
                    }
                if (itemC['type'] == 'C') {
                    cityData.push(itemC);
                }
            });
            vis.filteredData[d[0].Location] = cityData;
        });

        // Get number of occurrences at the selected comfort value per city
        vis.cities = Object.keys(vis.filteredData);
        vis.allCityCounts = [];
        for (let i = 0; i < vis.cities.length; i++) {
            let city = vis.cities[i];
            let cityCounts = {};
            let cityArray = vis.filteredData[city];
            for (let j = 0; j < cityArray.length; j++) {
                let comfortValue = cityArray[j][sankeySelectedCondition];
                cityCounts[comfortValue] = cityCounts[comfortValue] ? cityCounts[comfortValue] + 1 : 1;
            }
            vis.allCityCounts.push(cityCounts);
        }
        ;

        // Rename keys
        for (let i = 0; i < vis.cities.length; i++) {
            let city = vis.cities[i];
            vis.allCityCounts = renameKey(vis.allCityCounts, i, city);
            let text = 'Explore the current comfort conditions in eight cities.'
            $("#map-highlight-stats").text(text);
        }
        ;



        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let percentFormat = d3.format(".0f");

        // Zoom in on map based on country selected
        // All View
        if (sliderVal === 1) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "visible");

            // Zoom out
            vis.map.flyTo([20, 0], 1.7, {
                animate: true,
                duration: 5
            });

            $("#map-highlight-stats-cold").text('');
            $("#map-highlight-stats-hot").text('');

        }
        ;

        // Berlin
        if (sliderVal === 4) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([52.520008, 13.404954], 10, {
                animate: true,
                duration: 5
            });

            // Draw city outline
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["BERLIN"];
                let data = jsonData.features;

                // Draw city polygon
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }
            });


            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['Berlin']['-2'] / 8760) * 100;
            let hotPct = (vis.allCityCounts['Berlin']['2'] / 8760) * 100;
            let city = "City: Berlin";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }

        // Cairo
        if (sliderVal === 7) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            //Zoom in
            vis.map.flyTo([30.075, 31.3], 11, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["EL-QAHIRA (CAIRO)"];
                let data = jsonData.features;

                // Draw polygon
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }})

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['Cairo']['-2'] / 8760) * 100;
            let hotPct = (vis.allCityCounts['Cairo']['2'] / 8760) * 100;
            let city = "City: Cairo";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // Dubai
        if (sliderVal === 8) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([25.27, 55.3], 13, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["DUBAYY"];
                let data = jsonData.features;

                // Draw polygon
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }})

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = 0;
            let hotPct = (vis.allCityCounts['Dubai']['2'] / 8760) * 100;
            let city = "City: Dubai";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // New York
        if (sliderVal === 5) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([40.8, -73.8], 10, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let data = jsonData.features;
                let nyData = data.filter(function (d) {
                    return d.properties.NAME === "NEW YORK";
                });
                // Draw polygons
                for (let k = 0; k < 5; k++) {
                    let coordinates = nyData[k].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }})

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['New York']['-2'] / 8760) * 100;
            let hotPct = (vis.allCityCounts['New York']['2'] / 8760) * 100;
            let city = "City: New York";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // Oslo
        if (sliderVal === 2) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([59.913868, 10.752245], 10, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["OSLO"];
                let data = jsonData.features;

                // Draw polygons
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);

                    for (let j = 0; j < city.length; j++) {
                        let filteredData = data.filter(function (d) {
                            return d.properties.NAME === city[j];
                        })
                        let coordinates = filteredData[1].geometry.coordinates;
                        let flipped_coordinates = []
                        coordinates[0].forEach(function (coord) {
                            let flip = [];
                            flip.push(coord[1]);
                            flip.push(coord[0]);
                            flipped_coordinates.push(flip);
                        });

                        L.polygon(
                            flipped_coordinates,
                            {
                                color: "red",
                                fillOpacity: 0.2,
                                weight: 3,
                                className: 'mapCity'
                            }
                        ).addTo(vis.map);
                    }}});

            // Add in highlight stats
            console.log(vis.allCityCounts['Oslo']['-2'])
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['Oslo']['-2'] / 8760) * 100;
            let hotPct = 0;
            let city = "City: Oslo";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // Reykjavik
        if (sliderVal === 3) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([64.15, -21.9], 12, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["REYKJAVIK"];
                let data = jsonData.features;

                // Draw first polygon for all cities
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }})

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['Reykjavik']['-2'] / 8760) * 100;
            let hotPct = 0;
            let city = "City: Reykjavik";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // San Diego
        if (sliderVal === 6) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([32.715736, -117.05], 10, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["SAN DIEGO"];
                let data = jsonData.features;

                // Draw polygons
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);

                    for (let j = 0; j < city.length; j++) {
                        let filteredData = data.filter(function (d) {
                            return d.properties.NAME === city[j];
                        })
                        let coordinates = filteredData[1].geometry.coordinates;
                        let flipped_coordinates = []
                        coordinates[0].forEach(function (coord) {
                            let flip = [];
                            flip.push(coord[1]);
                            flip.push(coord[0]);
                            flipped_coordinates.push(flip);
                        });

                        L.polygon(
                            flipped_coordinates,
                            {
                                color: "red",
                                fillOpacity: 0.2,
                                weight: 3,
                                className: 'mapCity'
                            }
                        ).addTo(vis.map);
                    }}});

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = (vis.allCityCounts['San Diego']['-2'] / 8760) * 100;
            let hotPct = (vis.allCityCounts['San Diego']['2'] / 8760) * 100;
            let city = "City: San Diego";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;

        // Singapore
        if (sliderVal === 9) {
            // Remove all other map city outlines and hide city circles
            d3.selectAll('.mapCity').remove();
            d3.selectAll('.mapCircle')
                .attr("visibility", "hidden");

            // Zoom out
            vis.map.flyTo([20, 0], 1.9, {
                animate: true,
                duration: 5
            });

            // Zoom in
            vis.map.flyTo([1.290270, 103.851959], 10.5, {
                animate: true,
                duration: 5
            });

            // Draw city polygon
            d3.json(vis.geoDataPath).then(jsonData => {
                let city = ["SINGAPORE"];
                let data = jsonData.features;

                // Draw polygon
                for (let i = 0; i < city.length; i++) {
                    let filteredData = data.filter(function (d) {
                        return d.properties.NAME === city[i];
                    })
                    let coordinates = filteredData[0].geometry.coordinates;
                    let flipped_coordinates = []
                    coordinates[0].forEach(function (coord) {
                        let flip = [];
                        flip.push(coord[1]);
                        flip.push(coord[0]);
                        flipped_coordinates.push(flip);
                    });

                    L.polygon(
                        flipped_coordinates,
                        {
                            color: "red",
                            fillOpacity: 0.2,
                            weight: 3,
                            className: 'mapCity'
                        }
                    ).addTo(vis.map);
                }})

            // Add in highlight stats
            let percentFormat = d3.format(".0f");
            let coldPct = 0;
            let hotPct = (vis.allCityCounts['Singapore']['2'] / 8760) * 100;
            let city = "City: Singapore";
            let textCold = "Strong cold stress " + percentFormat(coldPct) + "% of the year";
            let textHot = "Strong heat stress " + percentFormat(hotPct) + "% of the year";
            $("#map-highlight-stats").text(city);
            $("#map-highlight-stats-cold").text(textCold);
            $("#map-highlight-stats-hot").text(textHot);
        }
        ;


    }
}