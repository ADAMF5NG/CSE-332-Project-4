export default function showAttr(){
    d3.csv("../pandas/dataFromPython/MDS(Attributes).csv").then(function(data) {
    
        const margin = {top: 30, right: 200, bottom: 150, left: 200},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
        let marginLeft = 170;
    
        console.log(data)
        const tooltip = document.getElementById("tooltip");
    
        const svg = d3.select("#chart-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => +d.Dim1))
            .range([ 0, width ]);
    
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => +d.Dim2))
            .range([ height, 0]);
    
        
        svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width) 
                .attr("y", height - 5) 
                .text("Dim1")
                .style("font-size", "12px")
                .style("fill", "black");
    
        console.log(x.domain);
    
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));
            
    
        svg.append("g")
            .call(d3.axisLeft(y));
    
        svg.append("text")
            .attr("text-anchor", "end")  
            .attr("x", 0)                 
            .attr("y", -margin.left + marginLeft) 
            .text("Dim2")                  
            .style("font-size", "12px")   
            .style("fill", "black")
            .attr("transform", "rotate(-90)");
        
    
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(+d.Dim1))
            .attr("cy", d => y(+d.Dim2))
            .attr("r", 5)
            .attr('opacity', '.55')
            .style("fill", "#69b3a2")
            
            //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
            .on("mouseover", function(event, d){
                let num =  "Dim 1: " + (+d.Dim1).toFixed(2) + ", Dim 2: " + (+d.Dim2).toFixed(2) + ", Attribute: " + d.Attribute;
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