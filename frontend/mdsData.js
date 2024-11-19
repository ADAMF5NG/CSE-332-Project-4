export default function showData(mdsArr, colorChangeMap){

let defaultColor = "#69b3a2"

Promise.all([
    d3.csv("../pandas/dataFromPython/MDS(Data).csv"),
    d3.csv('../pandas/clustered_data.csv?timestamp=' + new Date().getTime())
]).then(([data, clusterData]) => {
      console.log(data); 
      if (data.length === 0){
          console.log("Data is empty");
      }


    console.log(clusterData)
    console.log(data)

    const clusterColors = d3.scaleOrdinal()
    .domain([0, 1, 2]) 
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // clusterData.forEach(d => {
    //     //console.log(clusterColors(d.Cluster))
    //     d.color = clusterColors(d.Cluster); // Map cluster to a color
    // });

    data.forEach((d, i) => {
    const cluster = clusterData[i]; // Assume same order
    d.Cluster = cluster.Cluster;   // Add cluster label
    d.color = clusterColors(cluster.Cluster); // Assign color based on cluster
    });

    const margin = {top: 30, right: 200, bottom: 150, left: 200},
    width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;
    let marginLeft = 180;

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

    
    //labeling from: https://stackoverflow.com/questions/11189284/d3-axis-labeling
    svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width) 
            .attr("y", height - 5) 
            .text("Dim1") // PC1
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

    mdsArr = svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.Dim1))
        .attr("cy", d => y(+d.Dim2))
        .attr("r", 5)
        .attr('opacity', '.55')
        .style("fill", d => {
            console.log("COLOR", d, d.color)
            return d.color})
        
        //used source to create on hover tooltip popup: https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
        .on("mouseover", function(event, d){
            let num =  "Dim 1: " + (+d.Dim1).toFixed(2) + ", Dim 2: " + (+d.Dim2).toFixed(2) + ", Cluster Group: " + (+d.Cluster + 1);
            console.log(num);
            tooltip.innerHTML = `${num}`;
            tooltip.style.left=(event.pageX + 15)  + "px";
            tooltip.style.top= (event.pageY - 28)  + "px";
            tooltip.style.visibility="visible";

            if (colorChangeMap && colorChangeMap.size > 0) {
                mdsArr.each(function (d, i) {
                    let circleColor = defaultColor; // Default color
                    colorChangeMap.forEach((indices, color) => {
                        if (indices.includes(i)) {
                            circleColor = color; // Use the matching color for the index
                        }
                    });
                    d3.select(this).style("fill", circleColor);
                });
            }

            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', '.85')
                .attr('stroke', 'black')
                .attr("r", 15)
                .attr('stroke-width', 2);
            })
            .on("mouseout", function(event, d) {
            //console.log(arcGenerator);

            if (colorChangeMap && colorChangeMap.size > 0) {
                mdsArr.each(function (d, i) {
                    let circleColor = defaultColor; // Default color
                    colorChangeMap.forEach((indices, color) => {
                        if (indices.includes(i)) {
                            circleColor = color; // Use the matching color for the index
                        }
                    });
                    d3.select(this).style("fill", circleColor);
                });
            }
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('stroke', 'none')
                    .attr("r", 5)
                tooltip.style.visibility="hidden";
            });
            if (colorChangeMap && colorChangeMap.size > 0) {
                mdsArr.each(function (d, i) {
                    let circleColor = defaultColor; // Default color
                    colorChangeMap.forEach((indices, color) => {
                        if (indices.includes(i)) {
                            circleColor = color; // Use the matching color for the index
                        }
                    });
                    d3.select(this).style("fill", circleColor);
                });
            }
});
}