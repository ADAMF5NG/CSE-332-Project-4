const units = [
            { varName: 'Last Round Single Time', unit: "seconds", type: "Num"},
            { varName: 'Last Round Average Time', unit: "seconds", type: "Num"},
            { varName: 'Best Single Time', unit: "seconds", type: "Num"},
            { varName: 'Best Average Time', unit: "seconds", type: "Num"},
            { varName: "Rank", unit: "place", type:"Num"},
            { varName: 'Name', type: "Cat"},
            { varName: 'Representation', type: "Cat"},
        ]

const abbrevs = [
    { countName: 'Ireland', abbrev: "IRE"},
    { countName: 'Germany', abbrev: "GER"},
    { countName: 'Republic of Korea', abbrev: "KOR"},
    { countName: 'Canada', abbrev: "CAN"},
    { countName: "Philippines", abbrev: "PHIL"},
    { countName: 'Romania', abbrev: "ROM"},
    { countName: 'Thailand', abbrev: "THA"},
    { countName: 'Australia', abbrev: "AUS"},
    { countName: 'Chile', abbrev: "CHL"},
    { countName: 'Poland', abbrev: "POL"},
    { countName: 'United States', abbrev: "USA"},
    { countName: 'China', abbrev: "CHN"},
]

function getabbrevs(varName) {
    const found = abbrevs.find(function(i){
        //console.log(i.unit)
        return i.countName == varName
    });
    const abbrevName = varName[0] + '.' + varName[varName.indexOf(' ') +1]
    //console.log("FOUND", found)
    return found ? found.abbrev : abbrevName; 
}

function getUnit(varName) {
            const found = units.find(function(i){
                //console.log(i.unit)
                return i.varName == varName
            });
            //console.log("FOUND", found)
            return found ? found.unit : ''; 
        }

function getType(varName){
    const found = units.find(function(i){
        //console.log(i.type)
        return i.varName == varName
    });
    //console.log("FOUND", found)
    return found ? found.type : ''; 
}


export default function displayScatterMatrix() {
    const size = 200, // size of each cell in the matrix
      padding = 50 // padding between the cells

    const x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    const y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    const xAxis = d3.axisBottom(x)
        .ticks(6);

    const yAxis = d3.axisLeft(y)
        .ticks(6);
    
    d3.csv("../pandas/dataFromPython/scatter_attributes.csv?timestamp=" + new Date().getTime()).then(function (data) {
        console.log("THIS IS THE DATA I AM GETTING", data); 
        if (data.length === 0){
            console.log("Data is empty");
        }
        
        const domainByTrait = {};
        console.log(data[0]); 
        const traits = Object.keys(data[0]) //.filter(function (d) { return d !== "Name" &&  d !== "Representation"; });
        console.log(traits);
        const n = traits.length;

        traits.forEach(function (trait) {
            domainByTrait[trait] = d3.extent(data, function (d) { return +d[trait]; });
        });

        // xAxis.tickSize(size * n);
        // yAxis.tickSize(-size * n);

        const svg = d3.select("#chart-container").append("svg")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        // svg.selectAll(".x.axis")
        //     .data(traits)
        //     .enter().append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", function (d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        //     .each(function (d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

        // svg.selectAll(".y.axis")
        //     .data(traits)
        //     .enter().append("g")
        //     .attr("class", "y axis")
        //     .attr("transform", function (d, i) { return "translate(0," + i * size + ")"; })
        //     .each(function (d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

        const cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function (d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
            .each(function (d) {
                console.log(d);
                const var1 = {
                    selectedX: d.x,
                    xClass: getType(d.x)
                };
        
                const var2 = {
                    selectedY: d.y, 
                    yClass: getType(d.y) 
                };
                updateScatter(var1, var2, data, d3.select(this), size, padding);
            });

        cell.filter(function (d) { return d.i === d.j; }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function (d) { return d.x; });
    });
}

function cross(a, b) {
    const c = [], n = a.length, m = b.length;
    let i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}

function updateScatter(var1, var2, data, svg, size, padding){
    //console.log(svg);
    const tooltip = document.getElementById("tooltip");
    console.log(var1);
    const unit1 = ' ' + getUnit(var1.selectedX)
    const unit2 = ' ' + getUnit(var2.selectedY)

    const width = size - padding;
    const height = size - padding;
    
    const countsX = new Map();
    data.forEach(function(d) {
        const value = d[var1.selectedX];
        countsX.set(value, countsX.get(value)+ 1);
        
    });

    const valueArrayX = Array.from(countsX, function(array){
        if(Number(array[0]) == 0){
            console.log(array)
        }
        return Number(array[0]);
    });

    const maxX = Math.max(...valueArrayX);
    const minX = Math.min(...valueArrayX);

    const countsY = new Map();
    data.forEach(function(d) {
        const value = d[var2.selectedY];
        if(countsY.has(value)){
            countsY.set(value, countsY.get(value)+ 1);
        }
        else{
            if((var2.selectedY === 'Last Round Average Time' && value == 'DNF') || value === ""){
                return;                         
            }
            countsY.set(value, 1);
        }
    });
    //should simplify

    const valueArrayY = Array.from(countsY, function(array){
        if(Number(array[0]) == 0){
            console.log(array)
        }
        return Number(array[0]);
    });

    const maxY = Math.max(...valueArrayY);
    const minY = Math.min(...valueArrayY);

    //Template got from: https://d3-graph-gallery.com/graph/scatter_basic.html
    svg.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding + ")");

    const isNumerical = var1.xClass == 'Num' && var2.yClass == 'Num';
    const bothCat = var1.xClass == 'Cat' && var2.yClass == 'Cat';
    if(isNumerical){
        let x;
        let y;
        if(var1.selectedX == 'Rank'){    
            x = d3.scaleLog()
                .domain([1, maxX])
                .range([ 0, width ]);
        }
        else{
            x = d3.scaleLinear()
                .domain([0, maxX])
                .range([ 0, width ]);
        }


        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
            .tickSize(-height) 
            .tickPadding(10))
            .selectAll(".tick line")  
            .style("stroke", "#ccc"); 
        
        if(var2.selectedY == 'Rank'){    
            y = d3.scaleLog()
            .domain([1, maxY])
            .range([ height, 0]);
        }
        else{
            y = d3.scaleLinear()
            .domain([0, maxY])
            .range([ height, 0]);
        }

        svg.append("g")
        .call(d3.axisLeft(y)
            .tickSize(-width)  
            .tickPadding(10))   
        .selectAll(".tick line") 
        .style("stroke", "#ccc"); 
        
        

        svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d){
                return  d[var1.selectedX] !== 'DNF' && d[var1.selectedX] !== ""
                        && d[var2.selectedY] !== 'DNF' && d[var2.selectedY] !== ""
            }))
            .join("circle")
            .attr("cx", function (d) { 
                //console.log(d[var1.selectedX]);
                return x(+d[var1.selectedX]); } )
            .attr("cy", function (d) { return y(+d[var2.selectedY]); } )
            .attr("r", 5)
            .attr('opacity', '.55')
            .style("fill", "#69b3a2")
            //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
            .on("mouseover", function(event, d){
                let num =  +d[var1.selectedX] + unit1 + ', ' + +d[var2.selectedY] + unit2;
                console.log(num);
                tooltip.innerHTML = `${num}`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .style('fill', '#D397F8') 
                    .attr('stroke', 'black')
                    .attr("r", 15)
                    .attr('stroke-width', 2);
                })
                .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .style("fill", "#69b3a2")
                        .attr('stroke', 'none')
                        .attr("r", 5)
                    tooltip.style.visibility="hidden";
                });
    }
    else if(bothCat){
        //Template got from: https://d3-graph-gallery.com/graph/scatter_basic.html
        const x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) {
                return getabbrevs(d[var1.selectedX]); }))
            .padding(0.5);
        console.log("IM IN HERE")

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height)
        
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .tickSize(-height) 
                .tickPadding(10))
            .selectAll(".tick line")  
            .style("stroke", "#ccc")
        
        svg.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-45)");


            // Add Y axis
        const y = d3.scaleBand()
            .range([ height, 0])
            .domain(data.map(function(d) {
                return getabbrevs(d[var2.selectedY]); }))
            .padding(0.5);

        svg.append("g")
            .call(d3.axisLeft(y)
            .tickSize(-width)  
            .tickPadding(10))   
        .selectAll(".tick line") 
        .style("stroke", "#ccc");
        
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2) 
            .attr("y", -padding)
            .attr("transform", "rotate(-90)")

        
            // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("cx", function (d) { 
                const jitter = (Math.random() - 0.5) *  x.bandwidth() * 0.7;
                return x(getabbrevs(d[var1.selectedX])) + x.bandwidth() / 2 + jitter; } )
            .attr("cy", function (d) {
                const jitter = (Math.random() - 0.5) * y.bandwidth() * 0.7;
                return y(getabbrevs(d[var2.selectedY])) + y.bandwidth() / 2 + jitter; } )
            .style("fill", "#69b3a2")
            .attr("r", 5)
            .attr('opacity', '.55')
            .on("mouseover", function(event, d){
                //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
                let num =  d[var1.selectedX] + ', ' + d[var2.selectedY];
                console.log(num);
                tooltip.innerHTML = `${num}`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                    d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .style('fill', '#D397F8') 
                    .attr('stroke', 'black')
                    .attr("r", 15)
                    .attr('stroke-width', 2);
                })
                .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .style("fill", "#69b3a2")
                        .attr('stroke', 'none')
                        .attr("r", 5)
                    tooltip.style.visibility="hidden";
                });
    }
    else{
        //Template got from: https://d3-graph-gallery.com/graph/scatter_basic.html
        let x;
        let y;
        if(var1.xClass == 'Cat'){
            x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(function(d) {
                    return getabbrevs(d[var1.selectedX]); }))
                .padding(0.2);
            
            y = d3.scaleLinear()
                .domain([0, maxY])
                .range([ height, 0]);

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height)
            
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", -height / 2) 
                .attr("y", -padding)
                .attr("transform", "rotate(-90)")

            
            
        }
        else if(var1.xClass == 'Num'){
            x = d3.scaleLinear()
                .domain([0, maxX])
                .range([ 0, width ]);
            
            y = d3.scaleBand()
                .range([ height, 0])
                .domain(data.map(function(d) {
                    return getabbrevs(d[var2.selectedY]); }))
                .padding(0.2);

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height)
            
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", -height / 2) 
                .attr("y", -padding)
                .attr("transform", "rotate(-90)")
        }

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .tickSize(-height) 
                .tickPadding(10))
            .selectAll(".tick line")  
            .style("stroke", "#ccc") 
        
        svg.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")  // Adjust label distance from axis
            .attr("dy", "0.15em")  // Adjust label vertical offset
            .attr("transform", "rotate(-45)"); 
                
        svg.append("g")
            .call(d3.axisLeft(y)
                .tickSize(-width)  
                .tickPadding(10))   
            .selectAll(".tick line") 
            .style("stroke", "#ccc");


        if(var1.xClass == 'Cat'){
            svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d){
                return d[var1.selectedX] !== 'DNF' && d[var1.selectedX] !== ""
                        && d[var2.selectedY] !== 'DNF' && d[var2.selectedY] !== ""
            }))
            .join("circle")
            .attr("cx", function (d) { 
                //onst jitter = (Math.random() - 0.5) *  x.bandwidth() * 0.7;
                return x(getabbrevs(d[var1.selectedX])) + x.bandwidth() / 2 ; } )
            .attr("cy", function (d) {return y(+d[var2.selectedY])})
            .style("fill", "#69b3a2")
            .attr("r", 5)
            .attr('opacity', '.55')
            .on("mouseover", function(event, d){
                //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
                let num =  d[var1.selectedX] + ', ' + d[var2.selectedY];
                console.log(num);
                tooltip.innerHTML = `${num}`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                    d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .style('fill', '#D397F8') 
                    .attr('stroke', 'black')
                    .attr("r", 15)
                    .attr('stroke-width', 2);
                })
                .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .style("fill", "#69b3a2")
                        .attr('stroke', 'none')
                        .attr("r", 5)
                    tooltip.style.visibility="hidden";
                });
        }
        else if(var1.xClass == 'Num'){
            svg.append('g')
            .selectAll("dot")
            .data(data.filter(function(d){
                return d[var1.selectedX] !== 'DNF' && d[var1.selectedX] !== ""
                        && d[var2.selectedY] !== 'DNF' && d[var2.selectedY] !== ""
            }))
            .join("circle")
            .attr("cx", function (d) {return x(+d[var1.selectedX]);} )
            .attr("cy", function (d) {
                const jitter = (Math.random() - 0.5) * y.bandwidth() * 0.7;
                return y(getabbrevs(d[var2.selectedY])) + y.bandwidth() / 2 + jitter; } )
            .style("fill", "#69b3a2")
            .attr("r", 5)
            .attr('opacity', '.55')
            //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
            .on("mouseover", function(event, d){
                let num =  d[var1.selectedX] + unit1 + ', ' + d[var2.selectedY];
                console.log(num);
                tooltip.innerHTML = `${num}`;
                tooltip.style.left=(event.pageX + 15)  + "px";
                tooltip.style.top= (event.pageY - 28)  + "px";
                tooltip.style.visibility="visible";

                    d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .style('fill', '#D397F8') 
                    .attr('stroke', 'black')
                    .attr("r", 15)
                    .attr('stroke-width', 2);
                })
                .on("mouseout", function(event, d) {
                //console.log(arcGenerator);
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .style("fill", "#69b3a2")
                        .attr('stroke', 'none')
                        .attr("r", 5)
                    tooltip.style.visibility="hidden";
                });
        }
        
    }
}
