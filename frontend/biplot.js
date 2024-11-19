import { showPCA } from "./PCA.js"; 

export default function showBi(biArr, colorChangeMap){
    console.log("IN HERE")
    
const margin = {top: 30, right: 30, bottom: 30, left: 50},
width = 800 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width",width + 500)
            .attr("height", height + 500)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        console.log(svg);


        const xVector = d3.scaleLinear().range([0, width]);
        const yVector = d3.scaleLinear().range([height, 0]);
    


        Promise.all([
            d3.csv('../pandas/dataFromPython/pca_result.csv'), 
            d3.csv('../pandas/dataFromPython/biPlot.csv')
        ]).then(([pcaData, vectorData]) => {
            
            pcaData.forEach(d => {
                d.PC1 = +d.PC1;
                d.PC2 = +d.PC2;
            });

            vectorData.forEach(d => {
                d.PC1 = +d.PC1;
                d.PC2 = +d.PC2;
            });
            
            showPCA(svg, pcaData, biArr, colorChangeMap);

            xVector.domain([d3.min(vectorData, d => d.PC1) - 0.5, d3.max(vectorData, d => d.PC1) + 0.5]);
            yVector.domain([d3.min(vectorData, d => d.PC2) - 0.5, d3.max(vectorData, d => d.PC2) + 0.5]);
    
            console.log("xVector domain:", xVector.domain());
            console.log("yVector domain:", yVector.domain());

            
 
        svg.append("g")
            .attr("transform", `translate(0,0)`)
            .call(d3.axisTop(xVector));


        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yVector));


        svg.selectAll(".arrow")
            .data(vectorData)
            .enter()
            .append("line")
            .attr("class", "arrow")
            .attr("x1", xVector(0))  
            .attr("y1", yVector(0))  
            .attr("x2", d => xVector(d.PC1)) 
            .attr("y2", d => yVector(d.PC2))
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)");


        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", "5")
            .attr("refY", "5")
            .attr("markerWidth", "6")
            .attr("markerHeight", "6")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z")
            .attr("fill", "red");


        svg.selectAll(".label")
            .data(vectorData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xVector(d.PC1) + 5) 
            .attr("y", d => yVector(d.PC2) + 5)
            .text(d => d.Feature)  
            .attr("fill", "red");
    });
}