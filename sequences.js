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
    "Ruoli Tradizionali": "#9C807B",
    "Ruoli Strategici": "#638CCA",
    "CAPACITY & AVAILABILITY  MGMT": "#6ab975",
    "CLOUD INFRASTRUCTURE": "#A07B52",
    "COLLABORATION SOLUTION": "#7C6040",
    "DATA COMUNICATION": "#679970",
    "DATA INFRASTRUCTURE": "#68B072",
    "DATACENTER INFRASTRUCTURE": "#B0895E",
    "DEVOPS INFRASTRUCTURE": "#70A77A",
    "DR&BC INFRASTRUCTURE": "#90DB99",
    "END USER INFRASTRUCTURE": "#C28F54",
    "INFRASTRUCTURE AUTOMATION AND CONFIGURATION": "#CB7F29",
    "INFRASTRUCTURE FINANTIAL & CONTRACTS": "#6AA779",
    "INFRASTRUCTURE for INNOVATION TECHONLOGY": "#BA772C",
    "INFRASTRUCTURE MONITORING": "#73CA7F",
    "INFRASTRUCTURE SERVICE MANAGEMENT": "#8ACA92",
    "INFRASTRUCTURE TRANSFORMATION": "#50C893",
    "NETWORK INFRASTRUCTURE": "#5A9B66",
    "SOFTWARE DEFINED INFRASTRUCTURE": "#906E48",
    "SECURITY INFRASTRUCTURE": "#71AF95",


    "Functional Testing Engineer": "#989898",
    "API Specialist": "#989898",
    "Build and Deploy Specialist": "#989898",
    "DevOps Operator": "#989898",
    "DevOps Specialist": "#989898",
    "Build and Deploy Engineer": "#989898",
    "Infrastructure Referent Application Transformation": "#989898",
    "Mobile Specialist ": "#989898",
    "PaaS & Container Specialist": "#989898",
    "Performance Test Specialist ": "#989898",
    "Test Automation Specialist": "#989898",

    "Delivery Manager": "#A5A5A5",
    "IT Supplier Relationship Manager": "#D0D0D0",
    "ITO Process Specialist": "#A5A5A5",
    "Knowledge Management specialist": "#A5A5A5",
    "Open Source Software Specialist": "#D0D0D0",
    "Program & Transition Manager": "#A5A5A5",
    "Project Manager ": "#A5A5A5",
    "Infrastructure Solution Architect": "#A5A5A5",

    "Data Base Engineer": "#C8C8C8",
    "Data Management Specialist": "#C8C8C8",
    "Data Solution Architect": "#C8C8C8",
    "Infrastructure Data Analyst/Scientist ": "#C8C8C8",

    "Artificial Intelligence Specialist": "#696969",
    "Blockchain Specialist": "#696969",
    "IoT Specialist": "#C0C0C0",
    "Technology Innovation Expert": "#C0C0C0",

    "Cloud Mgmt Platform & Contract Expert": "#B8B8B8",
    "Cloud Service Broker Specialist": "#696969",
    "Private & Public Cloud Infrastructure Architect": "#B8B8B8",

    "DataCenter Automation Specialist": "#696969",
    "End User Automation Specialist": "#B0B0B0",
    "Configuration Specialist": "#B0B0B0",

    "Software Defined Data Center Specialist ": "#696969",
    "Software Defined Network Specialist": "#696969",
    "Software Defined Storage Specialist": "#787878",

    "Data Communication Engineer": "#787878",
    "Data Communication Specialist": "#787878",

    "Collaboration Specialist": "#787878",

    "Data Base Administrator": "#929292",
    "Data Management Specialist": "#929292",
    "Data Solution Architect": "#929292",
    "Infrastructure Data Analyst/Scientist ": "#929292",

    "Data Center Operator ": "#D0D0D0",
    "Data Center System Engineer": "#989898",
    "Data Center System Engineer": "#C8C8C8",
    "Data Center System Specialist": "#D3D3D3",
    "Scheduling Specialist": "#C8C8C8",

    "End User IMAC Specialist": "#959595",
    "End User Operator": "#959595",
    "End User System Engineer ": "#959595",

    "Problem Manager": "#B2B1B1",
    "Service Catalog Manager": "#A5A5A5",
    "Service Owner": "#B2B1B1",

    "DR & Business Continuity Engineer": "#929292",
    "DR & Business Continuity Specialist": "#B2B1B1",

    "Data Communication Engineer": "#C0C0C0",
    "Data Communication Specialist": "#C0C0C0",

    "Infrastructure Contract Specialist": "#B2B1B1",
    "Infrastructure Financial Specialist": "#B2B1B1",

    "Network System Engineer": "#BDBDBD",
    "Network Automation Specialist": "#BDBDBD",

    "Capacity & Availability Specialist": "#B2B1B1",

    "Monitoring Infrastructure engineer": "#B2B1B1",

    "Security Infrastructure Specialist": "#B2B1B1"
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
        .sum(function (d) {
            return d.size;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

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

    var percentage = d.value;
    /*var percentageString = percentage + "%";
    if (percentage < 0.1) {
        percentageString = "< 0.1%";
    }
    */
    d3.select("#percentage")
        .text(percentage);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift(); // remove root node from the array
    updateBreadcrumbs(sequenceArray, percentage);

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