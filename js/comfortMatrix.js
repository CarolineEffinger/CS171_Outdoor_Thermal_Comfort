
/*
 *  ComfortMatrix - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all data for a selected city
 */

class ComfortMatrix {

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
        vis.margin = {top: 20, right: 10, bottom: 50, left: 20};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).width()/4 - vis.margin.left - vis.margin.right;

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
            .range([0, vis.width/4])
            .domain([1, 13]);

        vis.y = d3.scaleLinear()
            .range([0, vis.height])
            .domain([0, 23]);

        // Draw circles for back legend
        vis.hoursLegend = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
        vis.monthsLegend = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        vis.projectionTitle = ['Current', 'Short-Term Projection', 'Medium-Term Projection', 'Long-Term Projection']

        vis.hoursText = vis.svg.selectAll(".hours-legend")
            .data(vis.hoursLegend);

        vis.hoursText.enter().append("text")
            .attr("class", "hours-legend")
            .attr("y", (d,i) => i*vis.y(1) + 11)
            .attr("x", -10)
            .attr("stroke", "white")
            .attr("fill", "none")
            .attr("text-anchor", 'middle')
            .attr("opacity", 0.5)
            .attr("font-family", "Calibri Light")
            .text(d => d)

        vis.projText = vis.svg.selectAll(".title-proj-legend")
            .data(vis.projectionTitle);

        vis.projText.enter().append("text")
            .attr("class", "title-proj-legend")
            .attr("x", (d,i) =>(i*vis.x(13))+vis.x(7))
            .attr("y", -10)
            .attr("fill", "white")
            .attr("text-anchor", 'middle')
            .attr("font-size", 16)
            .attr("font-family", "Calibri Black")
            .text(d => d)

        vis.monthText = vis.svg.selectAll(".month-legend")
            .data(vis.monthsLegend);

        vis.monthText.enter().append("text")
            .attr("class", "month-legend")
            .attr("x", (d,i) =>(i*vis.x(2))+vis.x(2)/2)
            .attr("y", vis.height + 28)
            .attr("fill", "white")
            .attr("text-anchor", 'middle')
            .attr("font-family", "Calibri Light")
            .text(d => d)


        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;


        // Filter and group the data
        vis.displayDataC = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'C'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({name, value}));
        vis.displayDataSTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'STP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({name, value}));
        vis.displayDataMTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'MTP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({name, value}));
        vis.displayDataLTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'LTP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({name, value}));


        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let projections = [vis.displayDataC, vis.displayDataSTP, vis.displayDataMTP, vis.displayDataLTP];

        projections.forEach( (v,i) => {
            // Draw rectangles for
            let rect = vis.svg.selectAll(".rect" + i.toString())
                .data(v);

            rect.enter().append("rect")
                .attr("class", "rect" + i.toString())
                .merge(rect)
                .attr("transform", d =>"translate(" + (i*vis.x(13)) + "," + 0 + ")")
                .attr("fill", d =>
                {
                    let meanUTCI = d3.mean(d.value.map(d => d[desDComfortSelector]));
                    let meanCondition = (meanUTCI <= -13) ? 0 : ((meanUTCI > -13) && (meanUTCI <= 0)) ? 1 : ((meanUTCI > 0) && (meanUTCI <= 9)) ? 2 : ((meanUTCI > 9) && (meanUTCI <= 26)) ? 3 : ((meanUTCI >= 26) && (meanUTCI <= 28))  ? 4 : ((meanUTCI >= 28) && (meanUTCI <= 32))  ? 5 : 6;
                    return vis.colorsExt[meanCondition]
                })
                .attr("x", (d,i) => vis.x(monthFormat(d.value[0].time)))
                .attr("y", d => vis.y(hourFormat(d.value[0].time)))
                .attr("width", vis.x(2))
                .attr("height", vis.y(1))
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

            rect.exit().remove();

        });

        let baseRect = vis.svg.selectAll(".rectBd")
            .data(projections);

        baseRect.enter().append("rect")
            .attr("class", "rectBd")
            .merge(baseRect)
            .attr("transform", (d,i) =>"translate(" + (i*vis.x(13)) + "," + 0 + ")")
            .attr("fill", "none")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.x(13))
            .attr("height", vis.y(24))
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        baseRect.exit().remove();



        // vis.displayDataC.forEach( d => {
        //     console.log(d3.mean(d.value.map(d => d[desDComfortSelector])))
        // })


    }
}