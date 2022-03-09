// set up graph canvas

var margins = 10;

var width = parseInt(d3.select("#scatter").style("width"));

var height = 3*width/4;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width",width)
    .attr("height",height)
    .attr("class","chart");

var radius;

function getRad() {
    if (width <= 550) {
        radius = 5;
    }
    else {
        radius = 10;
    }
}

getRad();

// x-axis labels
svg
    .append("g")
    .attr("class","xLabel");

var xLabel = d3.select(".xLabel");

function xPickLabel() {
    xLabel.attr("transform",
                "translate(" +
                (width/2 + 50) +
                ", " +
                (height - 40) +
                ")"
            );
}

xPickLabel();

// poverty
xLabel
    .append("text")
    .attr("data-name","poverty")
    .attr("data-axis","x")
    .attr("class","aLabel active x")
    .attr("y",-25)
    .text("In Poverty (%)");
// age
xLabel
    .append("text")
    .attr("data-name","age")
    .attr("data-axis","x")
    .attr("class","aLabel inactive x")
    .attr("y",0)
    .text("Median Age");
// income
xLabel
    .append("text")
    .attr("data-name","income")
    .attr("data-axis","x")
    .attr("class","aLabel inactive x")
    .attr("y",25)
    .text("Median Household Income");

// y-axis labels

svg
    .append("g")
    .attr("class","yLabel");

var yLabel = d3.select(".yLabel");

function yPickLabel() {
    yLabel.attr("transform",
                "translate(" +
                40 + 
                ", " +
                (height/2 - 50) +
                ")rotate(-90)"
                );
}

yPickLabel();

// healthcare
yLabel
    .append("text")
    .attr("data-name","healthcare")
    .attr("data-axis","y")
    .attr("class","aLabel active y")
    .attr("y",-25)
    .text("Lack of Healthcare (%)");
// obesity
yLabel
    .append("text")
    .attr("data-name","obesity")
    .attr("data-axis","y")
    .attr("class","aLabel inactive y")
    .attr("x",0)
    .text("Obesity (%)");
// smokes
yLabel
    .append("text")
    .attr("data-name","smokes")
    .attr("data-axis","y")
    .attr("class","aLabel inactive y")
    .attr("y",25)
    .text("Smokes (%)");


// load in the data
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

// visualize data function

function visualize(data) {
    var activeX = "poverty";
    var activeY = "healthcare";

    var xMin;
    var xMax;
    var yMin;
    var yMax;

    var toolTip = d3
        .tip()
        .attr("class","d3-tip")
        .offset([40,-60])
        .html(function(d) {
            var xKey;
            var state = "<div>" + d.state + "%</div>";
            var yKey = "<div>" + activeY + ": " + d[activeY] + "%</div>";
            if (activeX === "poverty") {
                xKey = "<div>" + activeX + ": " + d[activeX] + "%</div>";
            }
            else {
                xKey = "<div>" + activeX + ": " + parseFloat(d[activeX]).toLocaleString("en") + "</div>";
            }
            return state + xKey + yKey;
        });
    
    svg.call(toolTip);

    function xMinMax() {
        xMin = d3.min(data, function(d) {
            return 0.9*parseFloat(d[activeX]);
        });
        xMax = d3.max(data, function(d) {
            return 1.1*parseFloat(d[activeX])
        });
    }

    function yMinMax() {
        yMin = d3.min(data, function(d) {
            return 0.9*parseFloat(d[activeY]);
        });
        yMax = d3.max(data, function(d) {
            return 1.1*parseFloat(d[activeY])
        });
    }

    function changeLabel(axis, activeLabel) {
        d3
            .selectAll(".aLabel")
            .filter("." + axis)
            .filter(".active")
            .classed("active",false)
            .classed("inactive",true);
        
        activeLabel
            .classed("inactive", false)
            .classed("active", true);
    }

    xMinMax();

    yMinMax();

    var xRange = d3
        .scaleLinear()
        .domain([xMin,xMax])
        .range([110,width-10]);
    
    var yRange = d3
        .scaleLinear()
        .domain([yMin,yMax])
        .range([height-110,10]);
    
    var xAxis = d3.axisBottom(xRange);
    var yAxis = d3.axisLeft(yRange);

    function tickNum() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        }
        else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }

    tickNum();

    svg
        .append("g")
        .call(xAxis)
        .attr("class","xAxis")
        .attr("transform",
            "translate(0," +
            (height - 110) + 
            ")");
    
    svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform",
            "translate(" +
            110 +
            ", 0)");
    
    var dataPoints = svg.selectAll("g dataPoints").data(data).enter();

    dataPoints
        .append("circle")
        .attr("cx", function(d) {
            return xRange(d[activeX]);
        })
        .attr("cy", function(d) {
            return yRange(d[activeY]);
        })
        .attr("r", radius)
        .attr("class", function(d) {
            return "statePoint" + d.abbr;
        })
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#a45ee5");
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3");
        });

    dataPoints
        .append("text")
        .text(function(d) {
            return d.abbr;
        })
        .attr("dx", function(d) {
            return xRange(d[activeX]);
        })
        .attr("dy", function(d) {
            return yRange(d[activeY]) + radius/2;
        })
        .attr("font-size", radius)
        .attr("class", "stateLabel")
        .on("mouseover", function(d) {
            toolTip.show(d);
            d3.select("." + d.abbr).style("stroke", "#a45ee5");
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });

    d3.selectAll(".aLabel").on("click", function() {
        
        var label = d3.select(this);

        if (label.classed("inactive")) {
            
            var name = label.attr("data-name");
            var axis = label.attr("data-axis");

            if (axis === "x") {

                activeX = name;

                xMinMax();

                xRange.domain([xMin, xMax]);

                svg
                    .select(".xAxis")
                    .transition()
                    .duration(200)
                    .call(xAxis)
                
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xRange(d[activeX]);
                        })
                        .duration(200);
                });

                d3.selectAll(".stateLabel").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xRange(d[activeX]);
                        })
                        .duration(200);
                });

                changeLabel(axis, label);
            }

            else {
                activeY = name;

                yMinMax();

                yRange.domain([yMin, yMax]);

                svg
                    .select(".yAxis")
                    .transition()
                    .duration(200)
                    .call(yAxis);
                
                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cy", function(d) {
                            return yRange(d[activeY]);
                        })
                        .duration(200);
                });

                d3.selectAll(".stateLabel").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dy", function(d) {
                            return yRange(d[activeY]) + radius/2;
                        })
                        .duration(200);
                });

                changeLabel(axis, label);
            }
        }
    });

    d3.select(window).on("resize", resize);
    
    function resize() {

        width = parseInt(d3.select("#scatter").style("width"));
        height = 3*width/4;
        labelY = height/2 - 50;

        svg
            .attr("width", width)
            .attr("height", height);
        
        xRange.range([110, width - 10]);
        yRange.range([height - 110, 10]);

        svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform",
                "translate(0," +
                (height - 110) +
                ")");
        
        svg.select(".yAxis").call(yAxis);

        tickCount();

        xPickLabel();

        yPickLabel();
        
        getRad();

        d3
            .selectAll("circle")
            .attr("cx", function(d) {
                return xRange(d[activeX]);
            })
            .attr("cy", function(d) {
                return yRange(d[activeY]);
            })
            .attr("r", function() {
                return radius;
            });
        
        d3
            .selectAll(".stateLabel")
            .attr("dx", function(d) {
                return xRange(d[activeX]) + radius/2;
            })
            .attr("dy", function(d) {
                return yRange(d[activeY]) + radius/2;
            })
            .attr("r", radius/2);
    }
}