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
    initVis() {
        let vis = this;
        vis.margin = {top: 25, right: 10, bottom: 80, left: 35};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.left - vis.margin.right;

        vis.colors = ["#36509E", "#91A8EB", "#ABEB26", "#EB3E2A", "#9E1909"];
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
            .range([0, vis.width / 4])
            //.domain([1, 13]);
            .domain([1, 14]);

        vis.y = d3.scaleLinear()
            .range([0, vis.height / 1.4])
            .domain([0, 23]);

        // Draw circles for back legend
        vis.hoursLegend = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
        vis.monthsLegend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        vis.projectionTitle = ['Current', 'Short-Term Projection', 'Medium-Term Projection', 'Long-Term Projection']
        vis.designConditions = ['Sun, No Wind', 'Sun, Wind', 'Shade, No Wind', 'Shade, Wind'];

        vis.hoursText = vis.svg.selectAll(".hours-legend")
            .data(vis.hoursLegend);

        vis.hoursText.enter().append("text")
            .attr("class", "hours-legend")
            .attr("y", (d, i) => i * vis.y(1) + vis.y(0.7))
            .attr("x", -18)
            //.attr("stroke", "white")
            .attr("fill", "white")
            .attr("text-anchor", 'middle')
            //.attr("opacity", 0.8)
            .attr("font-family", 'gravitylight')
            .text((d, i) => (i > 9) ? (d + ":00") : ("0" + d + ":00"))

        vis.monthText = vis.svg.selectAll(".month-legend")
            .data(vis.monthsLegend);

        vis.monthText.enter().append("text")
            .attr("class", "month-legend")
            .attr("x", (d, i) => (i * vis.x(2)) + vis.x(2) / 2)
            .attr("y", vis.y(25))
            .attr("fill", "white")
            .attr("text-anchor", 'middle')
            .attr("font-family", 'gravitylight')
            .text(d => d)

        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData() {
        let vis = this;

        //console.log(vis.data)

        // Filter and group the data
        //console.log(desDCitySelector)
        //console.log(desDComfortSelector)
        //console.log(vis.data[desDCitySelector].filter(d => d.type == 'C'))

        vis.displayDataC = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'C'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({
            name,
            value
        }));
        vis.displayDataSTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'STP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({
            name,
            value
        }));
        vis.displayDataMTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'MTP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({
            name,
            value
        }));
        vis.displayDataLTP = Array.from(d3.group(vis.data[desDCitySelector].filter(d => d.type == 'LTP'), d => monthFormat(d.time) + hourFormat(d.time)), ([name, value]) => ({
            name,
            value
        }));

        // console.log(vis.displayDataC.filter(d => d['UTCI_SEWE'] < 28))
        //console.log(vis.data[desDCitySelector].filter(d => d['UTCI_SEWE'] < 28))

        //console.log(vis.data)
        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let projections = (viewSelector == "ByCond") ? [vis.displayDataC, vis.displayDataC, vis.displayDataC, vis.displayDataC] : [vis.displayDataC, vis.displayDataSTP, vis.displayDataMTP, vis.displayDataLTP]
        //let projections = [vis.displayDataC, vis.displayDataSTP, vis.displayDataMTP, vis.displayDataLTP];
        let designC = ['UTCI_SEWP', 'UTCI_SEWE', 'UTCI_SPWP', 'UTCI_SPWE'];

        //viewSelector

        projections.forEach((v, i) => {

            // Draw rectangles
            let rect = vis.svg.selectAll(".rect" + i.toString())
                .data(v);

            rect.enter().append("rect")
                .attr("class", "rect" + i.toString())
                .merge(rect)
                .attr("transform", d => "translate(" + (i * vis.x(14)) + "," + 0 + ")")
                .attr("fill", d => {
                    let meanUTCI = (viewSelector == "ByCond") ? (d3.mean(d.value.map(d => d[designC[i]]))) : (d3.mean(d.value.map(d => d['UTCI_SEWE'])));
                    let meanCondition = (meanUTCI <= -13) ? 0 : (meanUTCI <= 9) ? 1 : (meanUTCI <= 26) ? 2 : (meanUTCI <= 38) ? 3 : 4;
                    return vis.colors[meanCondition]
                })
                .attr("x", (d, i) => vis.x(monthFormat(d.value[0].time)))
                .attr("width", vis.x(2))
                .attr("height", vis.y(1))
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("y", d => vis.y(hourFormat(d.value[0].time)))
                // .transition.duration(5000)


            rect.exit().remove();

        });

        let baseRect = vis.svg.selectAll(".rectBd")
            .data(projections);

        baseRect.enter().append("rect")
            .attr("class", "rectBd")
            .merge(baseRect)
            .attr("transform", (d, i) => "translate(" + (i * vis.x(14)) + "," + 0 + ")")
            .attr("fill", "none")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.x(13))
            .attr("height", vis.y(24))
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        baseRect.exit().remove();

        let projText = vis.svg.selectAll(".title-proj-legend")
            .data(vis.projectionTitle);

        projText.enter().append("text")
            .attr("class", "title-proj-legend")
            .merge(projText)
            .attr("x", (d, i) => (i * vis.x(14)) + vis.x(7))
            .attr("y", -vis.y(0.8))
            .attr("fill", "white")
            .attr("text-anchor", 'middle')
            .attr("font-size", 16)
            .text((d, i) => (viewSelector == "ByCond") ? vis.designConditions[i] : vis.projectionTitle[i])

        projText.exit().remove();

        vis.p = [];
        vis.t = ['Strong Cold Stress', 'Mild Cold Stress', 'Comfort', 'Mild Heat Stress', 'Strong Heat Stress']
        projections.forEach((v, i) => {
            let desC = (viewSelector == "ByCond") ? designC[i] : 'UTCI_SEWE'
            let SCS = 0, MCS = 0, C = 0, MHS = 0, SHS = 0;
            v.forEach(d => {
                SCS += d.value.filter(n => n[desC] <= -13).length
                MCS += d.value.filter(n => (n[desC] <= 9) && (n[desC] > -13)).length
                C += d.value.filter(n => (n[desC] <= 26) && (n[desC] > 9)).length
                MHS += d.value.filter(n => (n[desC] <= 38) && (n[desC] > 26)).length
                SHS += d.value.filter(n => n[desC] > 38).length
            })
            vis.p.push([SCS * 100 / 8760, MCS * 100 / 8760, C * 100 / 8760, MHS * 100 / 8760, SHS * 100 / 8760])
        })

        //console.log(vis.p)

        // Create percentage text
        let sumText = vis.svg.selectAll(".sum-text-legend")
            .data(vis.p);

        sumText.enter().append("text")
            .attr("class", "sum-text-legend")
            .merge(sumText)
            .attr("x", (d, i) => (i * vis.x(14)) + vis.x(3))
            .attr("y", vis.y(29))
            //.attr("fill", "white")
            .attr("fill", vis.colors[2])
            .attr("text-anchor", 'middle')
            .attr("font-family", 'gravitybold')
            .attr("font-size", 32)
            .text((d, i) => parseInt(d[2]) + "%");

        sumText.exit().remove();

        // Create percentage legend
        let sumTt = vis.svg.selectAll(".sum-t")
            .data(vis.p);

        sumTt.enter().append("text")
            .attr("class", "sum-t")
            .merge(sumTt)
            .attr("x", (d, i) => (i * vis.x(14)) + vis.x(7.5))
            .attr("y", vis.y(29))
            .attr("fill", "white")
            //.attr("fill", vis.colors[2])
            .attr("text-anchor", 'middle')
            .attr("font-size", 12)
            .attr("font-family", 'gravitylight')
            .text("of hours in comfort");

        sumText.exit().remove();

        // Icons

        let sunWindImg = document.createElement("img");
        sunWindImg.src = "img/sun-wind-white.png";
        sunWindImg.style.width = '70px';
        sunWindImg.style.height = '50px';

        let sunNoWindImg = document.createElement("img");
        sunNoWindImg.src = "img/sun-white.png";
        sunNoWindImg.style.width = '70px';
        sunNoWindImg.style.height = '50px';

        let shadeWindImg = document.createElement("img");
        shadeWindImg.src = "img/cloud-wind-white.png";
        shadeWindImg.style.width = '70px';
        shadeWindImg.style.height = '50px';

        let shadeNoWindImg = document.createElement("img");
        shadeNoWindImg.src = "img/day-cloudy-white.png";
        shadeNoWindImg.style.width = '70px';
        shadeNoWindImg.style.height = '50px';

        let sunWindSRC = document.getElementById("sunWind");
        let sunNoWindSRC = document.getElementById("sunNoWind");
        let shadeWindSRC = document.getElementById("shadeWind");
        let shadeNoWindSRC = document.getElementById("shadeNoWind");

        if ((viewSelector == "ByCond") && (sunWindSRC.childElementCount != 1)) {
            sunWindSRC.appendChild(sunWindImg);
            sunNoWindSRC.appendChild(sunNoWindImg);
            shadeWindSRC.appendChild(shadeWindImg);
            shadeNoWindSRC.appendChild(shadeNoWindImg);
        } else if ((viewSelector != "ByCond") && (sunWindSRC.childElementCount > 0)) {
            sunWindSRC.innerHTML = "";
            sunNoWindSRC.innerHTML = "";
            shadeWindSRC.innerHTML = "";
            shadeNoWindSRC.innerHTML = "";
        }
    }
}
