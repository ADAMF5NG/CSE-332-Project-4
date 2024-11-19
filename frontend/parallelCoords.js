const units = [
  { varName: 'Last Round Single Time', unit: "seconds", type: "Num"},
  { varName: 'Last Round Average Time', unit: "seconds", type: "Num"},
  { varName: 'Best Single Time', unit: "seconds", type: "Num"},
  { varName: 'Best Average Time', unit: "seconds", type: "Num"},
  { varName: "Rank", unit: "place", type:"Num"},
  { varName: 'Name', type: "Cat"},
  { varName: 'Number of Competitors', unit: "Competitors", type: "Num"},
  { varName: 'Number of Penalties', unit: "Penalties", type: "Num"},
  { varName: 'Rounds Competed', unit: "Rounds", type: "Num"},
  { varName: 'Number of Competitions', unit: "Competitions", type: "Num"},
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

function getType(varName){
  const found = units.find(function(i){
      //console.log(i.type)
      return i.varName == varName
  });
  //console.log("FOUND", found)
  return found ? found.type : ''; 
}

let defaultColor = "#69b3a2"

export default function showPara(paraArr, colorChangeMap){
    const margin = {top: 30, right: 10, bottom: 10, left: 0},
      width = 1500 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;
    
    
    const svg = d3.select("#chart-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);

  
    
  Promise.all([
      d3.csv("../pandas/dataFromPython/para_attributes.csv?timestamp=" + new Date().getTime()),
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

      const tooltip = document.getElementById("tooltip");

      // clusterData.forEach(d => {
      //     //console.log(clusterColors(d.Cluster))
      //     d.color = clusterColors(d.Cluster); // Map cluster to a color
      // });

      data.forEach((d, i) => {
      const cluster = clusterData[i]; // Assume same order
      d.Cluster = cluster.Cluster;   // Add cluster label
      d.color = clusterColors(cluster.Cluster); // Assign color based on cluster
      });

      
    const dimensions = Object.keys(data[0])

    const numDim = dimensions.filter(d => {
      if(getType(d) === 'Num'){
        return data[0][d]
      }
    });
    console.log("THIS IS NUM", numDim)
    const catDim = dimensions.filter(d => {
      if(getType(d) === 'Cat'){
        return data[0][d]
      }});
    console.log("THIS IS CAT", catDim)

    const allDimensions = numDim.concat(catDim);
    
      const y = {}
      for (const i in numDim) {
        let name = numDim[i]
        //console.log("THIS IS NAME", name);
        y[name] = d3.scaleLinear()
          .domain( d3.extent(data, function(d) { 
            //console.log(+d[name])
            return +d[name]; }) )
          .range([height, 0])
      }
    
      const x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(allDimensions);

      const categoryScales = {};
        for (const i in catDim) {
          let name = catDim[i]
          categoryScales[name] = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) {
              return getabbrevs(d[name]); }))
          .padding(1);
        };

        console.log("CAT SCALES:", categoryScales)
        console.log("NUM SCALES:", y)

    
      
      function path(d) {
        return d3.line()(allDimensions.map(function (p) {
          //console.log("THIS IS THE P", p, y[p], p in y, d)
          // For continuous dimensions
          const continuousValue = p in y ? y[p](d[p]) : null;
          // For categorical dimensions
          //console.log("THIS IS THE CAT P", p, categoryScales, p in categoryScales )
          //console.log("AFTER EVERYTHING:", d[p], p in categoryScales ? categoryScales[p] : null)
          const categoricalValue = p in categoryScales ? categoryScales[p](getabbrevs(d[p])) : null;

          // Debugging values
          // console.log("AFTER EVERYTHING:", getabbrevs(d[p]));
          // console.log("P in categoryScales:", p in categoryScales);
          // console.log("Categorical mapped value:", categoricalValue);

          
      
          // Check if values are valid (not NaN)
          if (continuousValue === null || isNaN(continuousValue)) {
            //console.error("Invalid value for continuous dimension:", p, d[p]);
          }
          if (categoricalValue === null) {
           //console.error("Invalid value for categorical dimension:", p, d[p]);
          }

          if (continuousValue === null && categoricalValue === null) {
          return null;
        }

          //console.log("P GOING INTO X", continuousValue === null ? "CAT " + categoricalValue : "CONT " + continuousValue, x(p))
      
          return [x(p), continuousValue === null ? categoricalValue : continuousValue];
        }).filter(d => d !== null));
      }

      // if (isNaN(path)) {
      //   console.log("Invalid path:", path);
      // } else {
      //     console.log("Generated path:", path);
      // }

      // d3.select('path')
      //   .attr("d", path);

      paraArr = svg
        .selectAll("myPath")
        .data(data)
        .join("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", d => {
          console.log("COLOR", d, d.color)
          return d.color})
        .on("mouseover", function(event, d){
            let num =  "Name: " + d.Name + 
          ", <br>Cluster Group: " + (+d.Cluster + 1) + 
          ", <br>Rank: " + d.Rank +
          ", <br>Representation: " + d.Representation +
          ", <br>Last Round Single Time: " + d["Last Round Single Time"] +
          ", <br>Last Round Average Time: " + d["Last Round Average Time"] +
          ", <br>Best Single Time: " + d["Best Single Time"] +
          ", <br>Best Average Time: " + d["Best Average Time"] +
          ", <br>Number of Competitors: " + d["Number of Competitors"] +
          ", <br>Number of Penalties: " + d["Number of Penalties"] +
          ", <br>Rounds Competed: " + d["Rounds Competed"];
            console.log(d);
            tooltip.innerHTML = `${num}`;
            tooltip.style.left=(event.pageX + 15)  + "px";
            tooltip.style.top= (event.pageY - 28)  + "px";
            tooltip.style.visibility="visible";

            if (colorChangeMap && colorChangeMap.size > 0) {
              paraArr.each(function (d, i) {
                  let lineColor = defaultColor; // Default color
                  colorChangeMap.forEach((indices, color) => {
                      if (indices.includes(i)) {
                          lineColor = color; // Use the matching color for the index
                      }
                  });
                  d3.select(this).style("stroke", lineColor);
              });
          }

            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 0.85) 
                .style("stroke", "black") 
                .attr("stroke-width", "10px"); 
            })
            .on("mouseout", function(event, d) {
            //console.log(arcGenerator);
            if (colorChangeMap && colorChangeMap.size > 0) {
              paraArr.each(function (d, i) {
                  let lineColor = defaultColor; // Default color
                  colorChangeMap.forEach((indices, color) => {
                      if (indices.includes(i)) {
                          lineColor = color; // Use the matching color for the index
                      }
                  });
                  d3.select(this).style("stroke", lineColor);
              });
          }
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", d.color) 
                    .style("opacity", 1) 
                    .attr("stroke-width", 2); 
                tooltip.style.visibility="hidden";
            });
    


        svg.selectAll("myAxis")
        .data(allDimensions).enter()
        .append("g")
        .attr("transform", function (d) { 
          //console.log("D GOING INTO X",d, x(d))
          return "translate(" + x(d) + ")"; 
        })
        .each(function (d) {
          if (d in y) {
            d3.select(this).call(d3.axisLeft().scale(y[d])); // For continuous axes
          } else {
            // console.log("MY AXIS", d)
            d3.select(this).call(d3.axisLeft().scale(categoryScales[d])); // For categorical axes
          }
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", "black");
        if (colorChangeMap && colorChangeMap.size > 0) {
          paraArr.each(function (d, i) {
              let lineColor = defaultColor; // Default color
              colorChangeMap.forEach((indices, color) => {
                  if (indices.includes(i)) {
                      lineColor = color; // Use the matching color for the index
                  }
              });
              d3.select(this).style("stroke", lineColor);
          });
      }
    });
}