export default function showPara(){
    const margin = {top: 30, right: 10, bottom: 10, left: 0},
      width = 1000 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;
    
    
    const svg = d3.select("#chart-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);

    d3.csv("../pandas/dataFromPython/para_attributes.csv").then( function(data) {
        console.log(data); 
        if (data.length === 0){
            console.log("Data is empty");
        }
      
        const dimensions = Object.keys(data[0])
    
      const y = {}
      for (const i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain( d3.extent(data, function(d) { return +d[name]; }) )
          .range([height, 0])
      }
    
      const x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);
    
      
      function path(d) {
          return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
      }

      svg
        .selectAll("myPath")
        .data(data)
        .join("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("opacity", 0.5)
    
      
      svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")
    
    });
}