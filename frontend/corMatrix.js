export default function showCorMatrix(){
    const margin = {top: 30, right: 200, bottom: 150, left: 200},
            width = 1500 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;


    const svg = d3.select("#chart-container")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("../pandas/dataFromPython/correlation_matrix.csv").then(function(rows) {
            const data = [];

            console.log(rows);
            rows.forEach(function(d) {
               const x = d[""];
                delete d[""];
                for (var prop in d) {
                    var y = prop,
                        value = +d[prop]; 
                    data.push({ x: x, y: y, value: value });
                }
            });

            const domain = Array.from(new Set(data.map(function(d) { return d.x; })));

            
            var x = d3.scaleBand()
              .range([ 0, width ])
              .domain(domain)
              .padding(0.05);
            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            
            var y = d3.scaleBand()
              .range([ height, 0 ])
              .domain(domain)
              .padding(0.05);
            svg.append("g")
              .call(d3.axisLeft(y));

            
            const  color = d3.scaleLinear()
              .domain([-0.16, -0.01, 0, 0.15, 0.29, 1.00]) 
              .range(["blue", "lightblue", "white", "#ee6b6e", "#f01e2c", "#c30010"]);

              svg.selectAll()
              .data(data, function(d) { return d.x + ':' + d.y; })
              .enter()
              .append("rect")
                .attr("x", function(d) { return x(d.x); })
                .attr("y", function(d) { return y(d.y); })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function(d) { return color(d.value); }) 
                .style("stroke-width", 4)
                .style("stroke", "none")
                .style("opacity", 0.8);

            svg.selectAll()
              .data(data, function(d) { return d.x + ':' + d.y; })
              .enter()
              .append("text")
                .attr("x", function(d) { return x(d.x) + x.bandwidth() / 2; })
                .attr("y", function(d) { return y(d.y) + y.bandwidth() / 2; })
                .style("text-anchor", "middle")
                .text(function(d) { return d.value.toFixed(2); })
                .style("fill", "black");

            const tooltip = d3.select("body").append("div")
              .attr("class", "tooltip");

            svg.selectAll("rect")
              .on("mouseover", function(event, d) {
                tooltip.transition()
                  .duration(200)
                  .style("visibility", "visible");
                tooltip.html("Correlation: " + d.value.toFixed(2))
                  .style("left", (event.pageX + 5) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function(d) {
                tooltip.transition()
                  .duration(500)
                  .style("visibility", "hidden");
              });
        });
}