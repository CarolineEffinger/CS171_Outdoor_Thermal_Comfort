
/*
 * DistVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class DistVis {


    constructor (_parentElement, _data, _metaData){
        this.parentElement = _parentElement;
        this.data = _data;
        this.metaData = _metaData;
        // so I can change filteredData as required without impacting other Vis
        this.filteredData = this.data;
        // could let DisplayData, but will equal filteredData

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis(){
        let vis = this;

        vis.margin = { top: 20, right: 100, bottom: 75, left: 180 };

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.colors = ["#36509E","#91A8EB", "#ABEB26", "#EB3E2A", "#9E1909"];
        vis.colorScale = d3.scale.linear()
            .range(vis.colors);


        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height,0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("color", "white")
            .attr("transform", "translate(0," + vis.height + ")")
            .attr("font-family", 'gravityultralight')

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("color", "white")
            .attr("font-family", 'gravityultralight')

        // Axis title
        vis.svg.append("text")
            .attr("x", vis.width-15)
            .attr("y", vis.height+15)
            .attr("fill", "white")
            .attr("font-family", 'gravityultralight')
            .text("Degrees (°C)")

        vis.svg.append("text")
            .attr("x", -25)
            .attr("y", -12)
            .attr("fill", "white")
            .attr("font-family", 'gravityultralight')
            .text("Hours")

        // legend and value tooltip
        vis.valuetool = vis.svg.append("g")
            .attr('class', 'valuetool')
            .attr('transform', `translate(${vis.width-60}, ${vis.margin.top})`)
            .attr("color", "white")
            .attr("font-family", 'gravityultralight');

        vis.valuetool.selectAll("rect")
            .data(vis.colors)
            .enter()
            .append("rect")
            .attr("width", 110)
            .attr("height", 20)
            .attr("y", (d,i)=> (i*50)+10)
            .style("fill", function(d){return d});

        let categories = ['Strong Cold Stress', 'Mild Cold Stress', 'Comfort', 'Mild Heat Stress', 'Strong Heat Stress'];

        vis.valuetool.selectAll(".categories")
            .data(categories)
            .enter()
            .append("text")
            .attr("class", "categories")
            .attr("y", (d,i)=> (i*50)+5)
            .attr("font-size", 12)
            .attr("fill", "white")
            .attr("font-family", 'gravityregular')

            .text(function (d){return d});

        vis.valuetool.append("text")
            .attr("id", "value_title")
            .attr("font-size", 16)
            .attr("y", -20)
            .attr("x", 117)
            .attr("fill", "white")
            .attr("font-family", 'gravityultralight')
            .text("Days")

        vis.valuetool.append("text")
            .attr("id", "value-title")
            .attr("font-size", 16)
            .attr("y", -20)
            .attr("fill", "white")
            .attr("font-family", 'gravityultralight')
            .text("Stress")

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData(){
        let vis = this;

        // Filter by city
        vis.curLocData =  vis.data[distSelectedLocation]

        vis.max =
            {
                "Berlin": 300,
                "Cairo": 450,
                "Dubai": 450,
                "New York": 280,
                "Oslo": 350,
                "Reykjavik": 400,
                "San Diego": 550,
                "Singapore": 1500
            }
        distSelectedLocation.replace(/ /g,"_");

        console.log(distSelectedLocation)
        console.log(vis.max[distSelectedLocation])


        // Filter by sel projection
        vis.curLocFiltered = vis.curLocData.filter(function(d){
            return (d.type == distSelectedProjection)
        })

        // make hour data
        vis.tempperhour = []
        vis.curLocFiltered.forEach(function (d,i){
            vis.tempperhour[i] = vis.curLocFiltered[i].UTCI_SEWE
        })

        // make domain data for specific city
        vis.tempfordomain = []
        vis.curLocData.forEach(function(d,i){
            vis.tempfordomain[i] = vis.curLocData[i].UTCI_SEWE
        });

        // cap domain
        vis.tempfordomain = vis.tempfordomain.filter(function(d){
            return (d > -40 && d < 80);
        })

        // cap values (some errors in data such as -1200 degrees)
        vis.tempperhour = vis.tempperhour.filter(function (d){
            return (d > -40 && d < 80);
        })

        // bin data
        let bin1 = d3.bin().thresholds(d3.range(d3.min(vis.tempperhour), d3.max(vis.tempperhour), 1));
        vis.binData = bin1(vis.tempperhour);

        vis.displayData = vis.binData

        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis(){
        let vis = this;

        // Update domains
        //vis.x.domain([d3.min(vis.tempperhour),d3.max(vis.tempperhour)]);
        // keep domain steady for all projections for comparison change only when city changes
        vis.x.domain([d3.min(vis.tempfordomain),d3.max(vis.tempfordomain)]);

        // coherent domain for city
        vis.y.domain([0, vis.max[distSelectedLocation]])

        // variable domain adjusted to wrangled data
        // vis.y.domain([0, d3.max(vis.binData, function(d) { return d.length; })]);

        vis.histogram = d3.histogram()
            .value(function(d){return d.UTCI_SEWE})
            .domain(vis.x.domain());
        //.thresholds(vis.x.ticks(vis.binData.length))


        vis.rect = vis.svg.selectAll(".temprect")
            .data(vis.binData)
            .attr("class", "temprect");

        vis.rect.enter()
            .append("rect")
            .attr("class", "temprect")
            .merge(vis.rect)
            .transition()
            .duration(1000)
            .attr("transform", function(d) { return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
            .attr("width", function(d) { return Math.abs(vis.x(d.x1) - vis.x(d.x0) -1) ; })
            .attr("height", function(d) { return vis.height - vis.y(d.length); })
            .attr("fill", function(d){
                // categories for very cold, cold, neutral, hot, very hot
                if (d.x0 < -13){
                    return vis.colors[0]
                }
                if (d.x0 < 9){
                    return vis.colors[1]
                }
                if (d.x0 < 26){
                    return vis.colors[2]
                }
                if (d.x0 < 32){

                    return vis.colors[3]
                }
                else {
                    return vis.colors[4]
                }

            });

        vis.tempperCategory = []
        vis.tempperCategory[0] = vis.binData.filter(function(d){
            return (d.x0 < -13)
        });
        vis.tempperCategory[1] = vis.binData.filter(function(d){
            return (d.x0 < 9 && d.x0 > -13)
        });
        vis.tempperCategory[2] = vis.binData.filter(function(d){
            return (d.x0 < 26 && d.x0 > 9)
        });
        vis.tempperCategory[3] = vis.binData.filter(function(d){
            return (d.x0 < 32 && d.x0 > 26)
        });
        vis.tempperCategory[4] = vis.binData.filter(function(d){
            return (d.x0 > 32)
        });

        vis.sum = []
        vis.tempperCategory.forEach(function(d,i) {
            let count = 0
            d.forEach(function (dat) {
                count += (dat.length)
            })
            if (count < 24){
                vis.sum[i]=count+"h"
            }
            else {
                vis.sum[i]=(count/24).toFixed(1)+"d"
            }
            //vis.sum[i]=count
        })
        console.log(vis.sum)

        //vis.svg.selectAll(".values").remove();

        vis.values = vis.valuetool.selectAll(".values")
            .data(vis.sum)
            .attr("class", "values");

        vis.values.enter()
            .append("text")
            .attr("class", "values")
            .merge(vis.values)
            .transition()
            .duration(800)
            .attr("y", (d,i)=> (i*50)+23)
            .attr("x", 118)
            .attr("font-size", 13)
            .attr("fill", "white")
            .attr("font-family", 'gravitylight')
            .text(function (d){return d});

        vis.values.exit().remove();

        // Call axis function with the new domain
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.svg.select(".x-axis").call(vis.xAxis)
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        vis.rect.exit().remove();
    }


    // mean calculation (for distribution) unused as we use binning
    getMean(data) {
        let meanval = 0
        data.forEach(function (d){
            meanval += d.UTCI_SEWE
        });
        let mean = meanval/(data.length)
        return mean
    }
}