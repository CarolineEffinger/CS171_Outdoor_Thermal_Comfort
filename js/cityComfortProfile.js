
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
        vis.centered;

        vis.outerRadius = Math.min(vis.width, vis.height) / 2;
        vis.innerRadius = 10;

        vis.colors = ["#36509E","#91A8EB", "#ABEB26", "#EB3E2A", "#9E1909"];
        //vis.colors = ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"]
        //vis.colorsExt = ["#0868ac", "#43a2ca", "#7bccc4", "#a8ddb5", "#ccebc5", "#f0f9e8", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"]
        //vis.colorsExtended = ["#0868ac", "#43a2ca", "#7bccc4", "#a8ddb5", "#fc8d59", "#e34a33", "#b30000"]

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

        vis.group = vis.svg.append("g")
            .attr("class", "gp")

        // Draw circles for back legend
        vis.legendNumbers = [-20, -10, 0, 10, 20, 30, 40]

        vis.circles = vis.group.selectAll(".circle-legend")
            .data(vis.legendNumbers);

        vis.circles.enter().append("circle")
            .attr("class", "circle-legend")
            .attr("cy", vis.height/2)
            .attr("cx", vis.width/2)
            .attr("r", d => vis.y(d))
            .attr("stroke", "lightgrey")
            .attr("fill", "none")
            .attr("opacity", 0.5)

        // Add text to the legend
        vis.textlab = vis.group.selectAll(".text-lab")
            .data(vis.legendNumbers);

        vis.textlab.enter().append("text")
            .attr("class", "text-lab")
            .attr("x", vis.width/2)
            .attr("y", d => vis.height/2 + vis.y(d) + 5)
            //.attr("stroke", "lightgrey")
            .attr("text-anchor", 'middle')
            .attr("opacity", 0.5)
            .attr("font-size", 12)
            .attr("fill", "white")
            .attr("font-family", 'gravitylight')
            .text(d => d)

        vis.group.append("text")
            .attr("class", "city-legend")
            .attr("x", vis.width/2)
            .attr("y", vis.height/2)
            .attr("text-anchor", 'middle')
            .attr("font-size", 12)
            .attr("fill", "white")
            .attr("font-family", 'gravityregular')
            .text(vis.data[0].city)

        // Draw circles for back legend
        vis.legendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Add text to the legend
        vis.textmonth = vis.group.selectAll(".text-month")
            .data(vis.legendMonths);

        vis.textmonth.enter().append("text")
            .attr("class", "text-month")
            .attr("x", (d,i) => (vis.width/2) + vis.y(50)*Math.cos((i*Math.PI*2/12) - (Math.PI/2)))
            .attr("y", (d,i) => (vis.height/2) + 10 + vis.y(50)*Math.sin((i*Math.PI*2/12)  - (Math.PI/2)))
            .attr("text-anchor", 'middle')
            .attr("opacity", 0.5)
            .attr("font-size", 10)
            .attr("fill", "white")
            .attr("font-family", 'gravityregular')
            .text(d => d)

        // Draw month text
        vis.monthT = vis.group.append("text")
            .attr("class", "month")
            .attr("stroke", 'white')

        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;

       // console.log('CP - Projection Selected: ', cityProfileSelectedProjection);
        //console.log('CP - Conditions Selected: ', cityProfileSelectedCondition);
        //console.log('CP - UTCI Selected: ', cityProfileSelectedUTCI);
        //console.log(vis.data)

        // Filter and group the data

        vis.filteredData = vis.data.filter(d => d.type == cityProfileSelectedProjection)
        vis.groupByDay = d3.group(vis.filteredData, d => monthFormat(d.time) + dayFormat(d.time));
        vis.array = Array.from(vis.groupByDay, ([name, value]) => ({name, value}));

        // Group by month

        vis.groupByMonth = d3.group(vis.filteredData, d => monthFormat(d.time));

        vis.arr = [];
        vis.groupByMonth.forEach( d => {
            let count = [0,0,0,0,0];
            d.forEach( m => {
                let v = m[cityProfileSelectedCondition];
                (v <= -3) ? count[0] = count[0]+1 : ((v == -2) || (v == -1)) ? count[1] = count[1]+1 : (v == 0) ? count[2] = count[2]+1 : ((v == 1) || (v == 2)) ? count[3] = count[3]+1 : count[4] = count[4]+1
            })
            vis.arr.push(count)
        })

        vis.displayData = vis.array

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Draw arcs
        let paths = vis.group.selectAll(".rad")
            .data(vis.displayData);

        paths.enter().append("path")
            .attr("class", "rad")
            .merge(paths)
            .attr("transform", d =>"translate(" + vis.width/2 + "," + vis.height/2 + ")")
            .attr("fill", d =>
            {
                let val = (hourSelector == "HighestHour") ? d3.max(d.value.map(d => d[cityProfileSelectedCondition])) : d3.min(d.value.map(d => d[cityProfileSelectedCondition]))
                return vis.colors[(val <= -3) ? 0 : ((val == -2) || (val == -1)) ? 1 : (val == 0) ? 2 : ((val == 1) || (val == 2)) ? 3 : 4]
            })
            //.attr("fill", d => vis.colorsExt[(d.value[0][cityProfileSelectedCondition] == -5) ? 0 : ((d.value[0][cityProfileSelectedCondition] == -4) || (d.value[0][cityProfileSelectedCondition] == -3)) ? 1 : ((d.value[0][cityProfileSelectedCondition] == -2) || (d.value[0][cityProfileSelectedCondition] == -1)) ? 2 : (d.value[0][cityProfileSelectedCondition] == 0) ? 3 : ((d.value[0][cityProfileSelectedCondition] == 1) || (d.value[0][cityProfileSelectedCondition] == 2)) ? 4 : ((d.value[0][cityProfileSelectedCondition] == 3) || (d.value[0][cityProfileSelectedCondition] == 4)) ? 5 : 6])
            .attr("d", d3.arc()
                .innerRadius(d => vis.y(((d3.min(d.value.map(d => d[cityProfileSelectedUTCI]))) > -30) ? d3.min(d.value.map(d => d[cityProfileSelectedUTCI])) : -30))
                .outerRadius(d => vis.y(d3.max(d.value.map(d => d[cityProfileSelectedUTCI]))))
                .startAngle(d=> vis.x(d3.min(d.value.map(d => d['hourYear']))/24))
                .endAngle(d=> vis.x(d3.max(d.value.map(d => d['hourYear']))/24 + vis.x(1))))
            .on('mouseover', function(event, d) {
                if(!boolZm)
                {
                    obj.selMonth = parseInt(monthFormat(d.value[0].time))
                    selectedMonth = parseInt(monthFormat(d.value[0].time))
                    d3.selectAll(".rad").attr("stroke", d => (monthFormat(d.value[0].time) == selectedMonth) ? "white" : "none");
                    d3.selectAll(".stsbars")
                        .attr("opacity", 1)
                    vis.monthT.attr("opacity", 1)
                }
            })
            .on('mouseout', function(event, d) {
                obj.selMonth = parseInt(monthFormat(d.value[0].time))
                selectedMonth = parseInt(monthFormat(d.value[0].time))
                //selectedMonth = monthFormat(d.value[0].time)
                d3.selectAll(".rad").attr("stroke", "none");
                d3.selectAll(".stsbars")
                    .attr("opacity", 0)
                vis.monthT.attr("opacity", 0)
                //console.log(selectedMonth)
            })
            .on('click', function(event, d) {
                boolZm = !boolZm
                let moveXX = (selectedMonth <= 3) ? vis.width - 20 : (selectedMonth <= 6) ? vis.width-20 : (selectedMonth <= 9) ? 0+20 : 0+20
                let moveYY = (selectedMonth <= 3) ? 0+20 : (selectedMonth <= 6) ? vis.height-20 : (selectedMonth <= 9) ? vis.height-20 : 0+20
                let labelX = (selectedMonth <= 3) ? vis.width - 50 : (selectedMonth <= 6) ? vis.width-50 : (selectedMonth <= 9) ? 0+50 : 0+50
                let labelY = (selectedMonth <= 3) ? 0+50 : (selectedMonth <= 6) ? vis.height-30 : (selectedMonth <= 9) ? vis.height-30 : 0+50
                let textY = (selectedMonth <= 3) ? 0+50 : (selectedMonth <= 6) ? vis.height-50 : (selectedMonth <= 9) ? vis.height-50 : 0+50
                d3.selectAll(".stsbars")
                    .attr("opacity", 0)
                vis.monthT.attr("opacity", 0)
                if(boolZm)
                {
                    d3.selectAll(".gp")
                        .attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 2 + ")translate(" + -moveXX/2 + "," + -moveYY/2 + ")")
                        .style("stroke-width", 1.5 / 2 + "px")

                    d3.selectAll(".city-legend")
                        .attr("font-size", 6 + "px")
                        .attr("x", labelX)
                        .attr("y", labelY)
                        .attr("text-anchor", 'middle')
                        .attr("font-size", 12)

                    d3.selectAll(".text-lab")
                        .attr("x", vis.width/2)
                        .attr("y", d =>
                        {
                            let val = (selectedMonth <= 3) ? vis.height/2 - vis.y(d) + 8 : (selectedMonth <= 6) ? vis.height/2 + vis.y(d) - 5 : (selectedMonth <= 9) ? vis.height/2 + vis.y(d) - 5 : vis.height/2 - vis.y(d) + 8
                            return val
                        })
                    d3.selectAll(".stsbars")
                        .attr("opacity", 0)
                    vis.monthT.attr("opacity", 0)
                }
                else
                {
                    d3.selectAll(".gp")
                        .attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ")translate(" + 0 + "," + 0 + ")")

                    d3.selectAll(".city-legend")
                        .attr("x", vis.width/2)
                        .attr("y", vis.height/2)
                        .attr("text-anchor", 'middle')

                    d3.selectAll(".text-lab")
                        .attr("x", vis.width/2)
                        .attr("y", d => vis.height/2 + vis.y(d) + 5)

                    d3.selectAll(".stsbars")
                        .attr("opacity", 0)
                    vis.monthT.attr("opacity", 0)
                }
            });

        // Create array of conditions
        vis.v = []
        vis.c = []
        vis.t = ['Strong Cold Stress', 'Mild Cold Stress', 'Comfort', 'Mild Heat Stress', 'Strong Heat Stress']
        vis.arr[selectedMonth-1].forEach( (d,i) => {
            if(d != 0)
            {
                vis.v.push(d)
                vis.c.push(i)
                vis.t = vis.t + d
            }
        })

        vis.total = vis.v.reduce((a,b) => a+b)

        // Draw stacked bar
        let stBars = vis.svg.selectAll(".stsbars")
            .data(vis.v);

        stBars.enter().append("rect")
            .attr("class", "stsbars")
            .merge(stBars)
            .attr("x", (d,i) =>
            {
                let base = 0
                for(let j = 0; j < i; j++)
                {
                    base = base + vis.v[j]
                }
                return (vis.width/2.5) - (vis.width*0.2/1.5) + (base)*vis.width*0.5/vis.total
            })
            .attr("y", vis.height - 5)
            .attr("width", d => d*vis.width*0.5/vis.total)
            .attr("height", 10)
            .attr("fill", (d,i) => vis.colors[vis.c[i]])
            .attr("opacity", 0)

        // Draw month text
        vis.monthT
            .attr("x", 20)
            .attr("y", vis.height + 2)
            .attr("text-anchor", 'left')
            .attr("font-size", 16 + "px")
            .attr("opacity", 0)
            .attr("font-family", 'gravityregular')
            .text(vis.legendMonths[selectedMonth-1])

        stBars.exit().remove();
        paths.exit().remove();

    }
}