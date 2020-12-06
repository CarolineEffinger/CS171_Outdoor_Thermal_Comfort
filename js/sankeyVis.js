/*
*  sankeyVis - Object constructor function
*  @param _parentElement   -- HTML element in which to draw the visualization
*  @param _data            -- Array with all data for a selected city
*/

class sankeyVis {

    /*
     *  Constructor method
     */

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;


        this.initVis();
    }


    /*
     *  Initialize sankey vis
     */
    initVis () {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Setup sankey diagram
        vis.sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(10)
            .size([vis.width, vis.height]);

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'sankeyTooltip');


        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;

        // Remove previous sankey diagram
        vis.svg.selectAll('g').remove();
        d3.selectAll('.node-txt').remove();

        // Color scheme for nodes
        vis.colors = ["beige","beige", "beige", "beige", "beige", "beige", "beige", "beige",
            "#9E1909", "#EB3E2A", "#ABEB26", "#91A8EB", "#36509E"];


        // Filter data based on projection and combine extreme comfort categories
        vis.filteredData = {};
        vis.data.forEach(d => {
            let cityData = [];
            d.forEach( t => {
                let itemC =
                    {
                        city: t.Location,
                        time: new Date(2020,t.Month-1,t.Day,t.Hour-1),
                        hourYear: +t['Annual Hour']-1,
                        type: (t.Type == 'Current') ? "C" : (t.Type == 'Short Term Projection') ? "STP" : (t.Type == 'Medium Term Projection') ? "MTP" : "LTP",
                        CC_SEWE: (t['Comfort Cond - Sun Exposed Wind Exposed'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Exposed Wind Exposed'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Exposed Wind Exposed'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Exposed Wind Exposed'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Exposed Wind Exposed'] == -4) ? +-2:
                                            (t['Comfort Cond - Sun Exposed Wind Exposed'] == -5) ? +-2 : +t['Comfort Cond - Sun Exposed Wind Exposed'],
                        CC_SEWP: (t['Comfort Cond - Sun Exposed Wind Protected'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Exposed Wind Protected'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Exposed Wind Protected'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Exposed Wind Protected'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Exposed Wind Protected'] == -4) ? +-2:
                                            (t['Comfort Cond - Sun Exposed Wind Protected'] == -5) ? +-2 : +t['Comfort Cond - Sun Exposed Wind Protected'],
                        CC_SPWE: (t['Comfort Cond - Sun Shaded Wind Exposed'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Shaded Wind Exposed'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Shaded Wind Exposed'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Shaded Wind Exposed'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Shaded Wind Exposed'] == -4) ? +-2:
                                            (t['Comfort Cond - Sun Shaded Wind Exposed'] == -5) ? +-2 : +t['Comfort Cond - Sun Shaded Wind Exposed'],
                        CC_SPWP: (t['Comfort Cond - Sun Shaded Wind Protected'] == 5) ? +2 :
                            (t['Comfort Cond - Sun Shaded Wind Protected'] == 4) ? +2 :
                                (t['Comfort Cond - Sun Shaded Wind Protected'] == 3) ? +2 :
                                    (t['Comfort Cond - Sun Shaded Wind Protected'] == -3) ? +-2 :
                                        (t['Comfort Cond - Sun Shaded Wind Protected'] == -4) ? +-2:
                                            (t['Comfort Cond - Sun Shaded Wind Protected'] == -5) ? +-2 : +t['Comfort Cond - Sun Shaded Wind Protected'],
                    }
                if (sankeySelectedProjection == 'current' && itemC['type'] == 'C') {
                    cityData.push(itemC);
                }
                if (sankeySelectedProjection == 'short' && itemC['type'] == 'STP'){
                    cityData.push(itemC);
                }
                if (sankeySelectedProjection == 'medium' && itemC['type'] == 'MTP'){
                    cityData.push(itemC);
                }
                if (sankeySelectedProjection == 'long' && itemC['type'] == 'LTP'){
                    cityData.push(itemC);
                }
            });
            vis.filteredData[d[0].Location] = cityData;
        });


        // Get number of occurrences at the selected comfort value per city
        vis.cities = Object.keys(vis.filteredData);
        vis.allCityCounts = [];
        for(let i = 0; i < vis.cities.length; i++){
            let city = vis.cities[i];
            let cityCounts = {};
            let cityArray = vis.filteredData[city];
            for (let j = 0; j < cityArray.length; j++) {
                let comfortValue = cityArray[j][sankeySelectedCondition];
                cityCounts[comfortValue] = cityCounts[comfortValue] ? cityCounts[comfortValue] + 1 : 1;
            }
            vis.allCityCounts.push(cityCounts);
        }

        // Rename keys
        for(let i = 0; i < vis.cities.length; i++) {
            let city = vis.cities[i];
            vis.allCityCounts = renameKey(vis.allCityCounts, i, city);
        };

        // Reformat to nodes and links to use in sankey diagram
        vis.displayData = {};

        // Node for each city and endpoint
        let nodeList = vis.cities;
        let endpoints = ["Strong Heat Stress", "Moderate Heat Stress", "Comfort", "Moderate Cold Stress", "Strong Cold Stress"];
        for (const item in endpoints){
            nodeList.push(endpoints[item]);
        }

        let nodes = [];
        for(let i = 0; i < nodeList.length; i++) {
            let node = nodeList[i];
            let nodeInfo = {
                node: i,
                name : node,
            }
            nodes.push(nodeInfo);
        };

        // Links for each city and comfort level
        let links = [];
        for(let i = 0; i < vis.cities.length; i++) {
            let city = vis.cities[i];
            let cityArray = vis.allCityCounts[city];
            for (const item in cityArray){
                let linkInfo = {
                    source: i,
                    target : (item == 2) ? +8 :
                        (item == 1) ? +9 :
                            (item == 0) ? +10 :
                                (item == -1) ? +11 : +12,
                    value: cityArray[item],
                }
                links.push(linkInfo);
            }
        }
        vis.displayData['nodes'] = nodes;
        vis.displayData['links'] = links;


        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Constructs a new Sankey generator
        vis.sankey
            .nodes(vis.displayData.nodes)
            .links(vis.displayData.links)
            .layout(1);


        // Add in the links
        vis.link = vis.svg.append("g")
            .selectAll(".link")
            .data(vis.displayData.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", vis.sankey.link() )
            .style("stroke-width", function(d) {
                return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        // Tooltip on mouseover
        vis.link.on('mouseover', function(event, d){
            let percentFormat = d3.format(".0f");
            let source = "City: " + d.source.name + "\n";
            let target = d.target.name;
            // let rawValue = "Raw hours per year spent in " + target + ": " + d.value + "\n";
            let percent = "Percentage of hours per year spent in " + target + ": " + percentFormat((d.value/8760)*100) + "%";
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
         <div>
             <h4>${source}</h4>
             <h6>${percent}</h6>                      
         </div>`);
        })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style("stroke", function(d) {
                        return d.target.color;
                    });
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


        // Add in the nodes
        vis.node = vis.svg.append("g")
            .selectAll(".node")
            .data(vis.displayData.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        // Add the rectangles for the nodes
        vis.node
            .append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", vis.sankey.nodeWidth())
            .style("fill", function(d, i){
                return d.color = vis.colors[i];})
            .style("stroke", function(d, i) {
                // Prep for highlight statistics here to leverage access to data
                highlightStats(d, i);
                return d3.rgb(d.color).darker(2); })


        // Add in the title for the nodes
        vis.node
            .append("text")
            .attr("class", "node-txt")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr('font-size', '16px')
            .attr('fill', 'white')
            .attr("font-family", 'gravitylight')
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < vis.width / 2; })
            .attr("x", 6 + vis.sankey.nodeWidth())
            .attr("text-anchor", "start");
        //.attr('font-size', '20px');

        // Update colors of links
        d3.selectAll('#sankey-vis svg path.link')
            .style('stroke', function(d){
                // Update color to be color of target
                return d.target.color;
            });

    }
}
// Add in text on side with highlights of data

function highlightStats(d, i) {
    let percentFormat = d3.format(".0f");
    if (i == 8 || i == 12){
        if (i == 8) {
            let hotVal = percentFormat((d.value/70080)*100) + '%';
            $("#hotVal").text(hotVal)
        }
        if (i == 12) {
            let coldVal = percentFormat((d.value/70080)*100) + '%';
            $("#coldVal").text(coldVal);
        }
    }
}

//
// let baseline = [
//     {
//         condition: 'CC_SEWE',
//         str_heat: 14038,
//         mod_heat: 308,
//         comfort: 23652,
//         mod_cold: 98,
//         str_cold: 1943
//     },
//     {
//         condition: 'CC_SEWP',
//         str_heat: 17953,
//         mod_heat: 324,
//         comfort: 34327,
//         mod_cold: 12,
//         str_cold: 224
//     },
//     {
//         condition: 'CC_SPWE',
//         str_heat: 12908,
//         mod_heat: 296,
//         comfort: 24286,
//         mod_cold: 10,
//         str_cold: 1980
//     },
//     {
//         condition: 'CC_SPWP',
//         str_heat: 16280,
//         mod_heat: 326,
//         comfort: 35632,
//         mod_cold: 12,
//         str_cold: 231
//     }
// ];
