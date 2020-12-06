
// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");
let dayFormat = d3.timeFormat("%d");
let monthFormat = d3.timeFormat("%m");
let hourFormat = d3.timeFormat("%H");
let selectedMonth = "1";
let boolZm = false;

let cityProfDubai, cityProfSingapore, cityProfCairo, cityProfSanDiego, cityProfNewYork, cityProfBerlin, cityProfOslo, cityProfReykjavik;
let mydistVis;
let myComfortMtx;

// Included for Map and Sankey visualizations
let myMapVis, mysankeyVis;

// GeoData
let geoDataFile = 'data/cities.json';

let selectorType = "C";
let selectorUTCI = "UTCI_SEWE";
let selectorCC = "CC_SEWE";


// (1) Load data with promises
let promises = [
	d3.csv("data/CombinedData.csv")
];

Promise.all(promises)
	.then( function(data){ createVis(data)})
	.catch( function (err){console.log(err)} );


function createVis(data){
	let csvData = data[0];
	// console.log(csvData);

	// Format all Data by Location
	let byLocationData = d3.group(csvData, d =>d.Location);

	// Make iterator to access Map keys and values
	let LocationIterator = byLocationData.entries();
	// console.log(byLocationData);

	// Create a new data array with only needed data
	let comfortInfo = {};
	byLocationData.forEach( d => {
		let cityInfo = []
		d.forEach( t => {
			let itemC =
				{
					city: t.Location,
					time: new Date(2020,t.Month-1,t.Day,t.Hour-1),
					hourYear: +t['Annual Hour']-1,
					type: (t.Type == 'Current') ? "C" : (t.Type == 'Short Term Projection') ? "STP" : (t.Type == 'Medium Term Projection') ? "MTP" : "LTP",
					CC_SEWE: +t['Comfort Cond - Sun Exposed Wind Exposed'],
					CC_SEWP: +t['Comfort Cond - Sun Exposed Wind Protected'],
					CC_SPWE: +t['Comfort Cond - Sun Shaded Wind Exposed'],
					CC_SPWP: +t['Comfort Cond - Sun Shaded Wind Protected'],
					UTCI_SEWE: +t['UTCI - Sun Exposed Wind Exposed'],
					UTCI_SEWP: +t['UTCI - Sun Exposed Wind Protected'],
					UTCI_SPWE: +t['UTCI - Sun Shaded Wind Exposed'],
					UTCI_SPWP: +t['UTCI - Sun Shaded Wind Protected'],
				}
			cityInfo.push(itemC)
		});
		comfortInfo[d[0].Location] = cityInfo;
	});

	// Create visualization instances
	mysankeyVis = new sankeyVis("sankey-vis", byLocationData);

	myMapVis = new mapVis("map-vis", byLocationData, geoDataFile);

	cityProfDubai = new CityComfortProfile("city-comfort-dubai", comfortInfo['Dubai']);
	cityProfSingapore = new CityComfortProfile("city-comfort-singapore", comfortInfo['Singapore']);
	cityProfCairo = new CityComfortProfile("city-comfort-cairo", comfortInfo['Cairo']);
	cityProfSanDiego = new CityComfortProfile("city-comfort-san_diego", comfortInfo['San Diego']);
	cityProfNewYork = new CityComfortProfile("city-comfort-new_york", comfortInfo['New York']);
	cityProfBerlin = new CityComfortProfile("city-comfort-berlin", comfortInfo['Berlin']);
	cityProfOslo = new CityComfortProfile("city-comfort-oslo", comfortInfo['Oslo']);
	cityProfReykjavik = new CityComfortProfile("city-comfort-reykjavik", comfortInfo['Reykjavik']);

	mydistVis = new DistVis("distvis", comfortInfo);

	myComfortMtx = new ComfortMatrix("design-vis", comfortInfo);


}

/*// Different hour selector for city profile vis
let selectedMonth = $('#monthChange').val();

function monthChange() {
	selectedMonth = $('#monthChange').val();
	cityProfDubai.wrangleData();
	cityProfSingapore.wrangleData();
	cityProfCairo.wrangleData();
	cityProfSanDiego.wrangleData();
	cityProfNewYork.wrangleData();
	cityProfBerlin.wrangleData();
	cityProfOslo.wrangleData();
	cityProfReykjavik.wrangleData();
};*/

let obj = {
	value: '',
	letMeKnow() {
		console.log(`The variable has changed to ${this.selMonth}`);
		cityProfDubai.updateVis();
		cityProfSingapore.updateVis();
		cityProfCairo.updateVis();
		cityProfSanDiego.updateVis();
		cityProfNewYork.updateVis();
		cityProfBerlin.updateVis();
		cityProfOslo.updateVis();
		cityProfReykjavik.updateVis();
	},
	get selMonth() {
		return this.value;
	},
	set selMonth(value) {
		this.value = value;
		this.letMeKnow();
	}
}

console.log(obj.selMonth)

//obj.selMonth = 5;
console.log(obj.selMonth)

//obj.selMonth = 15;
console.log(obj.selMonth)




// Different hour selector for city profile vis
let hourSelector = $('#hourSelector').val();

function hourSelectorChange() {
	hourSelector = $('#hourSelector').val();
	cityProfDubai.wrangleData();
	cityProfSingapore.wrangleData();
	cityProfCairo.wrangleData();
	cityProfSanDiego.wrangleData();
	cityProfNewYork.wrangleData();
	cityProfBerlin.wrangleData();
	cityProfOslo.wrangleData();
	cityProfReykjavik.wrangleData();
};


// Different projections for city profile vis
let cityProfileSelectedProjection = $('#cityProfileProjectionSelector').val();

function cityProfileProjectionChange() {
	cityProfileSelectedProjection = $('#cityProfileProjectionSelector').val();
	cityProfDubai.wrangleData();
	cityProfSingapore.wrangleData();
	cityProfCairo.wrangleData();
	cityProfSanDiego.wrangleData();
	cityProfNewYork.wrangleData();
	cityProfBerlin.wrangleData();
	cityProfOslo.wrangleData();
	cityProfReykjavik.wrangleData();
};

// Different conditions for city profile vis
let cityProfileSelectedCondition = "CC_" + $('#cityProfileConditionSelector').val();
let cityProfileSelectedUTCI = "UTCI_" + $('#cityProfileConditionSelector').val();

function cityProfileConditionChange() {
	cityProfileSelectedCondition = "CC_" + $('#cityProfileConditionSelector').val();
	cityProfileSelectedUTCI = "UTCI_" + $('#cityProfileConditionSelector').val();
	cityProfDubai.wrangleData();
	cityProfSingapore.wrangleData();
	cityProfCairo.wrangleData();
	cityProfSanDiego.wrangleData();
	cityProfNewYork.wrangleData();
	cityProfBerlin.wrangleData();
	cityProfOslo.wrangleData();
	cityProfReykjavik.wrangleData();
};

// Different cities for design comfort vis
let desDCitySelector = $('#desDCitySelector').val();

function desDCityChange() {
	desDCitySelector = $('#desDCitySelector').val();
	myComfortMtx.wrangleData();
};

// Different UTCIs for design comfort vis
let viewSelector = $('#viewSelector').val();

function viewChange() {
	viewSelector = $('#viewSelector').val();
	myComfortMtx.wrangleData();
};

// Different locations for dist vis
let distSelectedLocation = $('#distLocSelector').val();

function distLocationChange() {
	distSelectedLocation = $('#distLocSelector').val();
	distSelectedProjection = "C";
	$(document).ready(()=>{
		$('#distProjSelector').val('C');
	});
	mydistVis.wrangleData();
};

// Different projections for dist vis
let distSelectedProjection = $('#distProjSelector').val();

function distProjectionChange() {
	distSelectedProjection = $('#distProjSelector').val();
	mydistVis.wrangleData();
};

// Included for Map and Sankey visualizations

// Update map based on slider

let sliderVal = 1;
$("#mapSlider").slider()
$("#mapSlider").on("change", function(slideEvt) {
	let changeVal = slideEvt.value;
	sliderVal = changeVal['newValue'];
	myMapVis.wrangleData();
});

// Different projections for sankey vis
let projectionLookup = {
	current: 'Current',
	short: 'Short-Term',
	medium: 'Medium-Term',
	long: 'Long-Term'

}
let sankeySelectedProjection = $('#sankeyProjectionSelector').val();

function sankeyProjectionChange() {
	sankeySelectedProjection = $('#sankeyProjectionSelector').val();
	let projectionTxt = 'Projection: '
	let projection = projectionLookup[sankeySelectedProjection]
	let text = projectionTxt + projection
	$("#sankey-stat-projection").text(text);
	mysankeyVis.wrangleData();
};

// Different conditions for sankey vis
let conditionLookup = {
	CC_SEWE : 'Sun Exposed and Wind Exposed',
	CC_SEWP : 'Sun Exposed and Wind Protected',
	CC_SPWE : 'Sun Protected and Wind Exposed',
	CC_SPWP : 'Sun Protected and Wind Protected'

}

let sankeySelectedCondition = $('#sankeyConditionSelector').val();

function sankeyConditionChange() {
	sankeySelectedCondition = $('#sankeyConditionSelector').val();
	let conditionTxt = 'Condition: '
	let condition = conditionLookup[sankeySelectedCondition]
	let text = conditionTxt + condition
	$("#sankey-stat-condition").text(text);
	mysankeyVis.wrangleData();
}
// Helper functions

// Rename keys

let renameKey = (object, key, newKey) => {

	let clonedObj = clone(object);

	let targetKey = clonedObj[key];

	delete clonedObj[key];

	clonedObj[newKey] = targetKey;

	return clonedObj;

};

// Cloning
let clone = (obj) => Object.assign({}, obj);


// add below here (code for legend)
// create static legend for "how hot is too hot" section
createLegend();

// define legend
function createLegend(){
	let margin = { top: 25, right: 25, bottom: 25, left: 25 };

	let width = $("#legendID").width() - margin.left - margin.right
	let height = $("#legendID").height() - margin.top - margin.bottom;

	// SVG drawing area
	let legendcontainer = d3.select("#legendID").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	let colors = ["#36509E","#91A8EB", "#ABEB26", "#EB3E2A", "#9E1909"];
	let cat = ['Strong Cold Stress', 'Mild Cold Stress', 'Comfort', 'Mild Heat Stress', 'Strong Heat Stress'];
	let ranges = ["<-13", "-13 to 9", "9 to 26", "26 to 32", ">32"];

	// legend and value tooltip
	let valuetool = legendcontainer.append("g")
		.attr('class', 'valuetool')
		.attr("transform", "translate(" + 0 + "," + 2*margin.top + ")")
		.attr("font-family", 'gravityregular');

	valuetool.selectAll("rect")
		.data(colors)
		.enter()
		.append("rect")
		.attr("width", 110)
		.attr("height", 20)
		.attr("y", (d,i)=> (i*50)+10)
		.style("fill", function(d){return d});

	valuetool.selectAll(".categories")
		.data(cat)
		.enter()
		.append("text")
		.attr("class", "categories")
		.attr("y", (d,i)=> (i*50)+5)
		.attr("font-size", 12)
		.attr("fill", "white")
		.attr("font-family", 'gravityregular')
		.text(function (d){return d});

	valuetool.append("text")
		.attr("fill", "white")
		.attr("font-size", 16)
		.attr("font-family", 'gravityultralight')
		.attr("y", -20)
		.attr("x", 115)
		.text("Degrees (°C):")

	valuetool.append("text")
		.attr("fill", "white")
		.attr("font-size", 16)
		.attr("font-family", 'gravityultralight')
		.attr("y", -20)
		.text("Stress:")

	valuetool.selectAll(".ranges")
		.data(ranges)
		.enter()
		.append("text")
		.attr("class", "ranges")
		.attr("x", 117)
		.attr("y", (d,i)=> (i*50)+23)
		.attr("font-size", 13)
		.attr("fill", "white")
		.attr("font-family", 'gravitylight')
		.text(function (d){return d});
}