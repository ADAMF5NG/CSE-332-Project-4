

let margin = {top: 30, right: 200, bottom: 150, left: 200},
            width = 1500 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;


export default function showEverything(){
    margin = {top: 30, right: 200, bottom: 150, left: 200},
            width = 1500 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;
    showPCA(null, null);
    showScree();
}

function showScree(){
    d3.csv("../pandas/dataFromPython/explained_variance.csv").then(function(data) {

        console.log(data);
        data.forEach(function(d) {
            d['Explained Variance'] = +d['Explained Variance']; 
        });
    
        const tooltip = document.createElement('div'); 
        tooltip.style.position = 'absolute';
        tooltip.style.visibility = 'hidden';
        tooltip.style.background = 'white';
        tooltip.style.border = '1px solid black';
        tooltip.style.padding = '5px';
        document.body.appendChild(tooltip);
    
    
        const svg = d3.select("#chart-container2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        
        const indices = data.map((d, i) => i); 
    
        const x = d3.scaleBand()
            .range([0, width])
            .domain(indices.map(i => (i + 1).toString())) 
            .padding(0.1);
    
        const y = d3.scaleLog()
            .domain([0.5* d3.min(data, d => d['Explained Variance']), d3.max(data, d => d['Explained Variance'])])
            .range([height, 0]);
    

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat((d) => d)); 
    

        svg.append("g")
            .call(d3.axisLeft(y));
    
    
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => 
                
                x((i + 1).toString())
            ) 
            .attr("y", d => {
                const yValue = y(d['Explained Variance']);
                console.log("yValue:", yValue); 
                return yValue;
            })
            .attr("width", x.bandwidth())
            .attr("height", d => {
                const heightValue = height - y(d['Explained Variance']);
                console.log("heightValue:", heightValue); 
                return heightValue < 0 ? 0 : heightValue; 
            })
            .attr("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                tooltip.innerHTML = `Explained Variance: ${d['Explained Variance']}`;
                tooltip.style.left = (event.pageX + 15) + "px";
                tooltip.style.top = (event.pageY - 28) + "px";
                tooltip.style.visibility = "visible";
    
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', '.85')
                    .style('fill', '#D397F8') 
                    .attr('stroke', 'black') 
                    .attr('stroke-width', 2);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .style("fill", "#69b3a2")
                    .attr('stroke', 'none');
                tooltip.style.visibility = "hidden";
            });
    

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("Principal Components")
            .style("text-anchor", "middle")
            .style("font-size", "17px")
            .style("font-weight", "bold");
    
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Explained Variance")
            .style("font-size", "17px")
            .style("font-weight", "bold");
    }).catch(function(error) {
        console.error("Error loading the CSV data: ", error);
    });
}

export function showPCA(svg, pcaData){
    let newSVG = svg
    let marginLeft = 190;

d3.csv("../pandas/dataFromPython/pca_result.csv").then(function(data) {
    console.log(data)
    const tooltip = document.getElementById("tooltip");

    
    console.log("NOW IM IN HERE", svg);
    if(newSVG == null){
        console.log("going here");
        newSVG = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        console.log(newSVG)
    }else{
        margin = {top: 30, right: 30, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    }

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.PC1))
        .range([ 0, width ]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.PC2))
        .range([ height, 0]);

    
    if(svg != null){
        marginLeft = 60;
        x.domain([d3.min(pcaData, d => d.PC1) - 0.5, d3.max(pcaData, d => d.PC1) + 0.5]);
        y.domain([d3.min(pcaData, d => d.PC2) - 0.5, d3.max(pcaData, d => d.PC2) + 0.5]);
    }

    console.log(newSVG);
    
    //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
    newSVG.append("text")
            .attr("text-anchor", "end")
            .attr("x", width) 
            .attr("y", height - 5) 
            .text("PC1") // PC1
            .style("font-size", "12px")
            .style("fill", "black");

    console.log(x.domain);

    newSVG.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
        

    newSVG.append("g")
        .call(d3.axisLeft(y));

    newSVG.append("text")
        .attr("text-anchor", "end")  
        .attr("x", 0)                 
        .attr("y", -margin.left + marginLeft) 
        .text("PC2")                  
        .style("font-size", "12px")   
        .style("fill", "black")
        .attr("transform", "rotate(-90)");
    
    

    newSVG.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.PC1))
        .attr("cy", d => y(+d.PC2))
        .attr("r", 5)
        .attr('opacity', '.55')
        .style("fill", "#69b3a2")
        
        //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
        .on("mouseover", function(event, d){
            let num =  "PC1: " + (+d.PC1).toFixed(2) + ", PC2: " + (+d.PC2).toFixed(2);
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
});
}