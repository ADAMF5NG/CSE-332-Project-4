const margin = {top: 30, right: 200, bottom: 150, left: 200},
width = 1500 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

let defaultColor = "#69b3a2"

const units = [
    { varName: 'Last Round Single Time', unit: "seconds"},
    { varName: 'Last Round Average Time', unit: "seconds"},
    { varName: 'Completed Solves', unit: "Solves"},
    { varName: 'Rounds Competed', unit: "Rounds"},
    { varName: 'Best Single Time', unit: "seconds"},
    { varName: 'Best Average Time', unit: "seconds"},
    { varName: 'Number of Competitors', unit: "Competitors"},
    { varName: 'Number of Penalties', unit: "Penalties"},
    { varName: 'Number of Competitions', unit: "Competitions"},
]

function getUnit(varName) {
    const found = units.find(function(i){
        console.log(i.unit)
        return i.varName == varName
    });
    console.log("FOUND", found)
    return found ? found.unit : ''; 
}


export default function displayBar(colorMap, colorChangeMap){
    document.getElementById("graph-container").innerHTML =
    `
        <h1>
            Bar Chart/Histogram Visualization
        </h1>
            <label for="cars">Choose a variable:</label>
            <!-- categorical
            name
            gender
            representation
            competition
            lastround
            -->
            <!-- numerical
            completed solves
            rank
            last round time
            last round avg time
            how many rounds
            single time
            avg time
            number of comp
            competitors
            penalties-->
            <div>
            <select name="variables" id="variables">
                <option value="Name">Name</option>
                <option value="Gender">Gender</option>
                <option value="Representation">Representation</option>
                <option value="Competition">Competition</option>
                <option value="Last Round">Last Round</option>
                <option value="Rank">Rank</option>
                <option value="Last Round Single Time">Last Round Single Time</option>
                <option value="Last Round Average Time">Last Round Average Time</option>
                <option value="Completed Solves">Completed Solves</option>
                <option value="Rounds Competed">Rounds Competed</option>
                <option value="Best Single Time">Best Single Time</option>
                <option value="Best Average Time">Best Average Time</option>
                <option value="Number of Competitions">Number of Competitions</option>
                <option value="Number of Competitors">Number of Competitors</option>
                <option value="Number of Penalties">Number of Penalties</option>
            </select>
            </div>
            <div id="graph"> 
        </div>
    `
    //got function of using .csv from https://stackoverflow.com/questions/42285441/how-to-read-in-csv-with-d3-v4
    //Another source used: https://www.codecademy.com/resources/docs/d3/selection/csv
    d3.csv("../csvData/updatedData.csv?timestamp=" + new Date().getTime()).then(function(data) {
        console.log(data);
        updateGraph('Name', data, colorMap, colorChangeMap);

        d3.select("#variables").on('change', function(){
            const varName = document.getElementById('variables').value;

            //console.log(varName);
            for (let key in colorMap) {
                if (colorMap.hasOwnProperty(key)) {
                    delete colorMap[key];
                }
            }
            colorChangeMap.clear();

            d3.select("#graph").html("");

            console.log("Variable changed to:", varName);
            console.log("Resetting colorMap and colorChangeMap");

            updateGraph(varName, data, colorMap, colorChangeMap);
        });
    })
}


function updateGraph(varName, data, colorMap, colorChangeMap){
    d3.select("#chart-container").selectAll("*").remove();
    const tooltip = document.getElementById('tooltip')
    const tooltipColor = document.getElementById('tooltipColor')

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const counts = new Map();
    data.forEach(function(d) {
        const value = d[varName];
        if(counts.has(value)){
            counts.set(value, counts.get(value)+ 1);
        }
        else{
            counts.set(value, 1);
        }
    });

    let countsArray = Array.from(counts, function(array){
        return {value: array[0], count: array[1]}
    })
    //console.log("COUNT ARRAY");
    //console.log(countsArray);
    
    const isNumerical = !isNaN(+data[0][varName]);
    //console.log(isNumerical, +data[0][varName]);
    if(!isNumerical){
        //Template from: https://d3-graph-gallery.com/graph/barplot_basic.html
        let orderedCounts = Array.from(counts).sort(function(a, b){
            return b[1] - a[1];
        }).map(function(array){
            return {value: array[0], count: array[1]}
        })

        const top11 = orderedCounts.slice(0,11);
        let sum = 0;
        for(const x of top11){
            console.log(x.count);
            sum += x.count;
        }
        
        const other = data.length - sum;

        console.log(other)

        if(other > 0){
            top11.push({value: 'Others', count: other});
        }

        if(varName == 'Competition'){countsArray = top11};
        //console.log("TOP 11", top11);
        //console.log(countsArray);

        const x = d3.scaleBand()
            .range([ 0, width ])
            .domain(countsArray.map(function(d) {
                return d.value; }))
            .padding(0.2);
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text(varName)
            .style("font-size", "17px")
            .style("font-weight", "bold");
        
        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(countsArray, function(d){
                return d.count;
            })])
            .range([ height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y));
        //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2) 
            .attr("y", -margin.left+150) 
            .attr("transform", "rotate(-90)")
            .text("Frequency")
            .style("font-size", "17px")
            .style("font-weight", "bold");
        
        // Bars
        svg.selectAll("rect")
            .data(countsArray)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                //console.log(d);
                return x(d.value);
            })
            .attr("y", function(d) { return y(d.count); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.count); })
            .each(function(d) {
                const color = colorMap[d.id] || defaultColor;  // Default color if no color is assigned
                d3.select(this).style("fill", color);  // Apply the color
            })
            //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
            .on("mouseover", function(event, d){
                let num =  d.value + ', ' + d.count;
                console.log(num, d);
                tooltip.innerHTML = `${num} <br> Click to Assign Color`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .attr('stroke', 'black') 
                    .attr('stroke-width', 2);
                })
            .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('stroke', 'none')
                    tooltip.style.visibility="hidden";
                })
                .on("click", function(event, d) {
                    // Update the selected bar

                    const currentColor = d3.select(event.target).style("fill");

                    console.log(currentColor)

                    tooltipColor.innerHTML = `<input type="color" id="color-picker"/>`
                    tooltip.style.visibility="hidden";
                    tooltipColor.style.visibility="visible";
                    tooltipColor.style.left=(event.pageX + 15)  + "px";
                    tooltipColor.style.top= (event.pageY - 28)  + "px";

                    function rgbToHex(rgb) {
                        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                        if (!match) return "#000000"; // Default to black if no match
                        return "#" + match.slice(1).map(x => {
                            const hex = parseInt(x).toString(16);
                            return hex.length === 1 ? "0" + hex : hex;
                        }).join("");
                    }

                    document.getElementById("color-picker").value = rgbToHex(currentColor);
                    document.getElementById('color-picker').addEventListener('input', function(event) {
                        const level = d.value;
                        const colorChanged = event.target.value;
    
                        if (!colorMap[level]) {
                            const index = Object.keys(colorMap).length;
                            colorMap[level] = colorChanged;
                        }

                        console.log("Checking for", level)
                
                        const selectedArr = data.filter(row => {
                            //console.log("filtering", row[varName])
                            return row[varName] === level});

                        const selectedSet = new Set(selectedArr.map(r => r[varName]));


                        console.log(selectedSet)
                        const newArr = [];
                        data.forEach((row, index) => {
                            if (selectedSet.has(row[varName])) {
                                newArr.push(index);
                            }
                        });

                        console.log(newArr)
    
                        colorChangeMap.set(colorChanged, newArr);
    
                        //console.log("COLOR CHANGE MAP", colorChangeMap)
                        
                        d3.selectAll("rect")
                            .filter(function(datum) {
                                return datum === d;  
                            })
                            .style("fill", colorChanged);
    
                        
                    });
    
                    document.addEventListener('click', function(e) {
                        if (!tooltipColor.contains(e.target)) {
                            console.log("HIDING")
                            tooltipColor.style.visibility = "hidden";
                        }
                    });
    
                    event.stopPropagation();

            });

                console.log("IN THE WRONG PLACE")
    }
    else{
        //Template from: https://d3-graph-gallery.com/graph/histogram_binSize.html
        const unit = ' ' + getUnit(varName)
        const thresholds = [];
        const valueArray = Array.from(counts, function(array){
            if(Number(array[0]) == 0){
                console.log(array)
            }
            return Number(array[0]);
        });
        //console.log("VALUE ARRAY");
        //console.log(valueArray);

        const max = Math.max(...valueArray);
        const min = Math.min(...valueArray);
        const binSize = ((max - min)/11);
        console.log("BINSIZE", binSize)
        let newBinSize;
        let domainMax = max + binSize;
        
        //Used source to understand binning and creating my own thresholds: https://observablehq.com/@d3/d3-bin
        //Another Source used: https://d3js.org/d3-array/bin#bin_thresholds
        if(varName == 'Rank' || varName == 'Completed Solves'|| varName == 'Rounds Competed' 
            || varName == 'Number of Competitions' || varName == 'Number of Competitors' || varName == 'Number of Penalties'){
            if(varName == 'Rounds Competed' || varName == 'Number of Penalties'){
                newBinSize = 1;
                domainMax = max + newBinSize;
            }
            else{
                newBinSize = Math.round(binSize);
                domainMax = max + newBinSize;
                console.log(newBinSize)
            }

            for (let i = min; i <= domainMax; i += newBinSize) {
                //console.log(i);
                thresholds.push(i);
            }
        }
        else{
            for (let i = min; i <= domainMax; i += binSize) {
                thresholds.push(parseFloat(i.toFixed(2)));
            }
        }

        const x = d3.scaleLinear() 
            .range([0, width])
            .domain([min, domainMax]);
        //Used this source to create tick marks on X axis based on my thresholds: https://www.geeksforgeeks.org/d3-js-axis-tickvalues-function/#
        //Another Source used: https://d3js.org/d3-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(thresholds.length).tickValues(thresholds));

        //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 20)
            .text(varName + ' (' + unit.substring(1) + ')')
            .style("font-size", "17px")
            .style("font-weight", "bold");

        console.log("THRESHOLDS", thresholds);
        
        const histogram = d3.histogram()
            .value(function(d) { 
                //console.log(varName);
                return d[varName]; })   // I need to give the vector of value
            .domain(x.domain())  // then the domain of the graphic
            .thresholds(thresholds);
        
        const bins = histogram(data);
        console.log("BINS: ", bins)
        //const bins = d3.bin(data);
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(bins, function(d){
                console.log(d.count);
                return d.length;
            })]);

        svg.append("g")
            .call(d3.axisLeft(y));
        
        //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2) 
            .attr("y", -margin.left+150) 
            .attr("transform", "rotate(-90)")
            .text("Frequency")
            .style("font-size", "17px")
            .style("font-weight", "bold");

            //console.log(bins);
        svg.selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
            .attr("width", function(d) {
                console.log("WIDTH", d)
                if(x(d.x1) - x(d.x0) -1 < 0){
                    return binSize-1;
                }
                return x(d.x1) - x(d.x0) -1})
            .attr("height", function(d) { return height - y(d.length); })
            .each(function(d) {
                const color = colorMap[d.id] || defaultColor;  // Default color if no color is assigned
                d3.select(this).style("fill", color);  // Apply the color
            })
            //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
            .on("mouseover", function(event, d){
                let num = '[' + d.x0 + ' - '+  parseFloat(d.x1.toFixed(2)) + ')' + unit + ', ' + d.length;
                console.log(num);
                tooltip.innerHTML = `${num} <br> Click to Assign Color`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                    d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .attr('stroke', 'black') 
                    .attr('stroke-width', 2);
                })
            .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('opacity', '1')
                        .attr('stroke', 'none')
                    tooltip.style.visibility="hidden";
                })
            .on("click", function(event, d) {
                const currentColor = d3.select(event.target).style("fill");

                console.log(currentColor)

                tooltipColor.innerHTML = `<input type="color" id="color-picker"/>`
                tooltip.style.visibility="hidden";
                tooltipColor.style.visibility="visible";
                tooltipColor.style.left=(event.pageX + 15)  + "px";
                tooltipColor.style.top= (event.pageY - 28)  + "px";

                function rgbToHex(rgb) {
                    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if (!match) return "#000000"; // Default to black if no match
                    return "#" + match.slice(1).map(x => {
                        const hex = parseInt(x).toString(16);
                        return hex.length === 1 ? "0" + hex : hex;
                    }).join("");
                }

                document.getElementById("color-picker").value = rgbToHex(currentColor);
                document.getElementById('color-picker').addEventListener('input', function(event) {
                    const level = `${d.length} - ${d.x0}`;
                    const colorChanged = event.target.value;

                    if (!colorMap[level]) {
                        const index = Object.keys(colorMap).length;
                        //const color = d3.interpolateRainbow(index / bins.length); // Change 50 as needed for spread
                        colorMap[level] = colorChanged;
                    }
                    
                    //console.log('Selected color:', colorChanged);
            
                    const selectedArr = [...d];

            // Set for quick lookup based on varName
                    const selectedSet = new Set(selectedArr.map(r => r[varName]));

                    // Use a single loop over the data to find matching indices
                    const newArr = [];
                    data.forEach((row, index) => {
                        if (selectedSet.has(row[varName])) {
                            newArr.push(index);
                        }
                    });

                    colorChangeMap.set(colorChanged, newArr);

                    console.log("COLOR CHANGE MAP", colorChangeMap)
                    
                    d3.selectAll("rect")
                        .filter(function(datum) {
                            return datum === d;  
                        })
                        .style("fill", colorChanged);

                    
                });

                // function assignColor(level) {
                //     if (!colorMap[level]) {
                //         const index = Object.keys(colorMap).length;
                //         const color = d3.interpolateRainbow(index / bins.length); // Change 50 as needed for spread
                //         colorMap[level] = color;
                //     }
                //     return colorMap[level];
                // }
                    
                // const level = `${d.length} - ${d.x0}`;
                // //let colorChanged = assignColor(level);
                // const selectedArr = [...d];

                // // Set for quick lookup based on varName
                // const selectedSet = new Set(selectedArr.map(r => r[varName]));

                // // Use a single loop over the data to find matching indices
                // const newArr = [];
                // data.forEach((row, index) => {
                //     if (selectedSet.has(row[varName])) {
                //         newArr.push(index);
                //     }
                // });

                // colorChangeMap.set(colorChanged, newArr);

                // console.log("COLOR CHANGE MAP", colorChangeMap)
                
                // d3.selectAll("rect")
                //         .filter(function(datum) {
                //             return datum === d;  
                //         })
                //         .style("fill", colorChanged);
            
                // Hide tooltip if user clicks anywhere outside the color picker
                document.addEventListener('click', function(e) {
                    if (!tooltipColor.contains(e.target)) {
                        console.log("HIDING")
                        tooltipColor.style.visibility = "hidden";
                    }
                });

                event.stopPropagation();
                
                // selectedVariable = d;
                // console.log("SELECTED VALUES:", colorMap, selectedVariable)
        });
    }
}