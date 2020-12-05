
/*
 *  CityComfortProfile - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all data for a selected city
 */

class CityComfortProfile {

    /*
     *  Constructor method
     */

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }


    /*
     *  Initialize station map
     */
    initVis () {
        let vis = this;
        vis.margin = {top: 5, right: 5, bottom: 20, left: 5};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.left - vis.margin.right;

        vis.outerRadius = Math.min(vis.width, vis.height) / 2;
        vis.innerRadius = 10;

        vis.colors = ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"]
        vis.colorsExt = ["#0868ac", "#43a2ca", "#7bccc4", "#a8ddb5", "#ccebc5", "#f0f9e8", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"]
        vis.colorsExtended = ["#0868ac", "#43a2ca", "#7bccc4", "#a8ddb5", "#fc8d59", "#e34a33", "#b30000"]

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales
        vis.x = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .domain([0, 365]);

        vis.xx = d3.scaleLinear()
            .range([0, 360])
            .domain([0, 365]);

        vis.y = d3.scaleLinear()
            .range([vis.innerRadius, vis.outerRadius])
            .domain([-40, 60]);

        // Draw circles for back legend
        vis.legendNumbers = [-20, -10, 0, 10, 20, 30, 40]

        vis.circles = vis.svg.selectAll(".circle-legend")
            .data(vis.legendNumbers);

        vis.circles.enter().append("circle")
            .attr("class", "circle-legend")
            .attr("cy", vis.height/2)
            .attr("cx", vis.width/2)
            .attr("r", d => vis.y(d))
            .attr("stroke", "lightgrey")
            .attr("fill", "none")
            .attr("opacity", 0.2)

        // Add text to the legend
        vis.textlab = vis.svg.selectAll(".text-lab")
            .data(vis.legendNumbers);

        vis.textlab.enter().append("text")
            .attr("class", "text-lab")
            .attr("y", d => vis.height/2 + vis.y(d) + 5)
            .attr("x", vis.width/2)
            .attr("stroke", "lightgrey")
            .attr("text-anchor", 'middle')
            .attr("opacity", 0.5)
            .attr("font-family", "Calibri Light")
            .text(d => d)

        vis.svg.append("text")
            .attr("class", "city-legend")
            .attr("y", vis.height/2)
            .attr("x", vis.width/2)
            .attr("text-anchor", 'middle')
            .attr("stroke", 'white')
            .text(vis.data[0].city)


        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;

        console.log('CP - Projection Selected: ', cityProfileSelectedProjection);
        console.log('CP - Conditions Selected: ', cityProfileSelectedCondition);
        console.log('CP - UTCI Selected: ', cityProfileSelectedUTCI);
        //console.log(vis.data)

        // Filter and group the data

        vis.filteredData = vis.data.filter(d => d.type == cityProfileSelectedProjection)
        vis.groupByDay = d3.group(vis.filteredData, d => monthFormat(d.time) + dayFormat(d.time));
        vis.array = Array.from(vis.groupByDay, ([name, value]) => ({name, value}));

        vis.displayData = vis.array

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Draw arcs
        let paths = vis.svg.selectAll(".rad")
            .data(vis.displayData);

        paths.enter().append("path")
            .attr("class", "rad")
            .merge(paths)
            .attr("transform", d =>"translate(" + vis.width/2 + "," + vis.height/2 + ")")
            .attr("fill", d => vis.colorsExt[d.value[0][selectorCC]+5])
            //.attr("fill", d => vis.colorsExt[(d.value[0][cityProfileSelectedCondition] == -5) ? 0 : ((d.value[0][cityProfileSelectedCondition] == -4) || (d.value[0][cityProfileSelectedCondition] == -3)) ? 1 : ((d.value[0][cityProfileSelectedCondition] == -2) || (d.value[0][cityProfileSelectedCondition] == -1)) ? 2 : (d.value[0][cityProfileSelectedCondition] == 0) ? 3 : ((d.value[0][cityProfileSelectedCondition] == 1) || (d.value[0][cityProfileSelectedCondition] == 2)) ? 4 : ((d.value[0][cityProfileSelectedCondition] == 3) || (d.value[0][cityProfileSelectedCondition] == 4)) ? 5 : 6])
            .attr("d", d3.arc()
                .innerRadius(d => vis.y(((d3.min(d.value.map(d => d[cityProfileSelectedUTCI]))) > -30) ? d3.min(d.value.map(d => d[cityProfileSelectedUTCI])) : -30))
                .outerRadius(d => vis.y(d3.max(d.value.map(d => d[cityProfileSelectedUTCI]))))
                .startAngle(d=> vis.x(d3.min(d.value.map(d => d['hourYear']))/24))
                .endAngle(d=> vis.x(d3.max(d.value.map(d => d['hourYear']))/24 + vis.x(1))));

        paths.exit().remove();

    }
}