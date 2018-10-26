// Dimensions of sunburst.
var width = 1110;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: 350, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
    "Ruoli Tradizionali": "#5687d1",
    "Ruoli Strategici": "#9C807B",
    "CAPACITY & AVAILABILITY  MGMT": "#DF34CE",
    "CLOUD INFRASTRUCTURE": "#599A69",
    "COLLABORATION SOLUTION": "#3BC655",
    "DATA COMUNICATION": "#52B087",
    "DATA INFRASTRUCTURE": "#6FBF7A",
    "DATACENTER INFRASTRUCTURE": "#B0895E",
    "DEVOPS INFRASTRUCTURE": "#50C893",
    "DR&BC INFRASTRUCTURE": "#70A77A",
    "END USER INFRASTRUCTURE": "#C28F54",
    "INFRASTRUCTURE AUTOMATION AND CONFIGURATION": "#4F905E",
    "INFRASTRUCTURE FINANTIAL & CONTRACTS": "#B671D7",
    "INFRASTRUCTURE for INNOVATION TECHONLOGY": "#6AA779",
    "INFRASTRUCTURE MONITORING": "#D66BB8",
    "INFRASTRUCTURE SERVICE MANAGEMENT": "#BA9858",
    "INFRASTRUCTURE TRANSFORMATION": "#6ab975",
    "NETWORK INFRASTRUCTURE": "#D55DF2",
    "SOFTWARE DEFINED INFRASTRUCTURE": "#5A9B66",
    "SECURITY INFRASTRUCTURE": "#E55EBF",


    "Functional Testing Engineer": "#D3D3D3",
    "API Specialist": "#D3D3D3",
    "Build and Deploy Specialist": "#D3D3D3",
    "DevOps Operator": "#D3D3D3",
    "DevOps Specialist": "#D3D3D3",
    "Build and Deploy Engineer": "#D3D3D3",
    "Infrastructure Referent Application Transformation": "#D3D3D3",
    "Mobile Specialist ": "#D3D3D3",
    "PaaS & Container Specialist": "#D3D3D3",
    "Performance Test Specialist ": "#D3D3D3",
    "Test Automation Specialist": "#D3D3D3",

    "Delivery Manager": "#D0D0D0",
    "IT Supplier Relationship Manager": "#D0D0D0",
    "ITO Process Specialist": "#D0D0D0",
    "Knowledge Management specialist": "#D0D0D0",
    "Open Source Software Specialist": "#D0D0D0",
    "Program & Transition Manager": "#D0D0D0",
    "Project Manager ": "#D0D0D0",
    "Infrastructure Solution Architect": "#D0D0D0",

    "Data Base Engineer": "#C8C8C8",
    "Data Management Specialist": "#C8C8C8",
    "Data Solution Architect": "#C8C8C8",
    "Infrastructure Data Analyst/Scientist ": "#C8C8C8",

    "Artificial Intelligence Specialist": "#C0C0C0",
    "Blockchain Specialist": "#C0C0C0",
    "IoT Specialist": "#C0C0C0",
    "Technology Innovation Expert": "#C0C0C0",

    "Cloud Mgmt Platform & Contract Expert": "#B8B8B8",
    "Cloud Service Broker Specialist": "#B8B8B8",
    "Private & Public Cloud Infrastructure Architect": "#B8B8B8",

    "DataCenter Automation Specialist": "#B0B0B0",
    "End User Automation Specialist": "#B0B0B0",
    "Configuration Specialist": "#B0B0B0",

    "Software Defined Data Center Specialist ": "#A9A9A9",
    "Software Defined Network Specialist": "#A9A9A9",
    "Software Defined Storage Specialist": "#A9A9A9",

    "Data Communication Engineer": "#A5A5A5",
    "Data Communication Specialist": "#A5A5A5",

    "Collaboration Specialist": "#A5A5A5",

    "Data Base Engineer": "#A0A0A0",
    "Data Management Specialist": "#A0A0A0",
    "Data Solution Architect": "#A0A0A0",
    "Infrastructure Data Analyst/Scientist ": "#A0A0A0",

    "Data Center Operator ": "#989898",
    "Data Center System Engineer": "#989898",
    "Data Center System Engineer": "#989898",
    "Data Center System Specialist": "#989898",
    "Scheduling Specialist": "#989898",

    "End User IMAC Specialist": "#959595",
    "End User Operator": "#959595",
    "End User System Engineer ": "#959595",

    "Problem Manager": "#909090",
    "Service Catalog Manager": "#909090",
    "Service Owner": "#909090",

    "DR & Business Continuity Engineer": "#929292",
    "DR & Business Continuity Specialist": "#929292",

    "Data Communication Engineer": "#929292",
    "Data Communication Specialist": "#929292",

    "Infrastructure Contract Specialist": "#888888",
    "Infrastructure Financial Specialist": "#888888",

    "Network System Engineer": "#787878",
    "Network Automation Specialist": "#787878",

    "Capacity & Availability Specialist": "#696969",

    "Monitoring Infrastructure engineer": "#696969",

    "Security Infrastructure Specialist": "#696969"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function (d) { return d.x0; })
    .endAngle(function (d) { return d.x1; })
    .innerRadius(function (d) { return Math.sqrt(d.y0); })
    .outerRadius(function (d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("visit-sequences.csv", function (text) {
    var csv = d3.csvParseRows(text);
    var json = buildHierarchy(csv);
    createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
    drawLegend();
    d3.select("#togglelegend").on("click", toggleLegend);

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    var root = d3.hierarchy(json)
        .sum(function (d) { return d.size; })
        .sort(function (a, b) { return b.value - a.value; });

    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition(root).descendants()
        .filter(function (d) {
            return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function (d) { return colors[d.data.name]; })
        .style("opacity", 1)
        .on("mouseover", mouseover);

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.datum().value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
        percentageString = "< 0.1%";
    }

    d3.select("#percentage")
        .text(percentageString);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, percentageString);

    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function (node) {
            return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .on("end", function () {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#explanation")
        .style("visibility", "hidden");
}

function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", width)
        .attr("height", 50)
        .attr("id", "trail");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function (d) { return d.data.name + d.depth; });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("svg:g");

    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function (d) { return colors[d.data.name]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("class", "label")
        .text(function (d) { return d.data.name; });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function (d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
        .style("visibility", "");

}

function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 350, h: 30, s: 3, r: 7
    };

    var legend = d3.select("#legend").append("svg:svg")
        .attr("width", li.w)
        .attr("height", (d3.keys(colors).length + 3) * (li.h + li.s) + li.s * 3);

    legend.append("svg:text")
        .attr("x", (li.w / 3) + 25)
        .attr("y", (li.h / 2) + 6)
        .text("CLASSI")
        .attr("class", "header")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("fill", "black");

    legend.append("svg:text")
        .attr("x", (li.w / 3) + 16)
        .attr("y", 122)
        .text("FAMIGLIE")
        .attr("class", "header")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("fill", "black");

    legend.append("svg:text")
        .attr("x", (li.w / 3) + 32)
        .attr("y", 750)
        .text("RUOLI")
        .attr("class", "header")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .attr("fill", "black");

    var g = legend.selectAll("g")
        .data(d3.entries(colors))
        .enter().append("svg:g")
        .attr("transform", function (d, i) {
            if (i > 19)
                return "translate(0," + (i + 3) * (li.h + li.s) + ")";
            if (i > 1)
                return "translate(0," + (i + 2) * (li.h + li.s) + ")";
            else
                return "translate(0," + (i + 1) * (li.h + li.s) + ")";
        });



    g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function (d) {
            return d.value;
        });

    g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.key;
        });
}

function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
        legend.style("visibility", "");
    } else {
        legend.style("visibility", "hidden");
    }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
    var root = { "name": "root", "children": [] };
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i][0];
        var size = +csv[i][1];
        if (isNaN(size)) { // e.g. if this is a header row
            continue;
        }
        var parts = sequence.split("-");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = { "name": nodeName, "children": [] };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = { "name": nodeName, "size": size };
                children.push(childNode);
            }
        }
    }
    return root;
};