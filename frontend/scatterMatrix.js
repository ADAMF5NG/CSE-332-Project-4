export default function displayScatterMatrix() {
    const size = 150,
    padding = 30;

    const x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    const y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    const xAxis = d3.axisBottom(x)
        .ticks(6);

    const yAxis = d3.axisLeft(y)
        .ticks(6);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.csv("../pandas/dataFromPython/scatter_attributes.csv").then(function (data) {
        console.log(data); 
        if (data.length === 0){
            console.log("Data is empty");
        }
        
        const domainByTrait = {};
        console.log(data[0]); 
        const traits = Object.keys(data[0]).filter(function (d) { return d !== "species"; });
        const n = traits.length;

        traits.forEach(function (trait) {
            domainByTrait[trait] = d3.extent(data, function (d) { return +d[trait]; });
        });

        xAxis.tickSize(size * n);
        yAxis.tickSize(-size * n);

        const svg = d3.select("#chart-container").append("svg")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "x axis")
            .attr("transform", function (d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
            .each(function (d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

        svg.selectAll(".y.axis")
            .data(traits)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function (d, i) { return "translate(0," + i * size + ")"; })
            .each(function (d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

        const cell = svg.selectAll(".cell")
            .data(cross(traits, traits))
            .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function (d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
            .each(plot);

        cell.filter(function (d) { return d.i === d.j; }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function (d) { return d.x; });

        cell.call(brush);

        function plot(p) {
            const cell = d3.select(this);

            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);

            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", size - padding)
                .attr("height", size - padding);

            cell.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) { return x(+d[p.x]); })
                .attr("cy", function (d) { return y(+d[p.y]); })
                .attr("r", 4)
                .style("fill", function (d) { return color(d.species); });
        }
    });
}

function cross(a, b) {
    const c = [], n = a.length, m = b.length;
    let i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}
