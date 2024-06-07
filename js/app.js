// Array of movies
var data = [
    {"label": "The Seven Samurai", "value": 1, "question": "The Seven Samurai by Akira Kurosawa"},
    {"label": "Tokyo Story", "value": 1, "question": "Tokyo Story by Yasujiro Ozu"},
    {"label": "Some Like it Hot", "value": 1, "question": "Some Like it Hot by Billy Wilder"},
    {"label": "Gladiator", "value": 1, "question": "Gladiator by Ridley Scott"},
    {"label": "Gone with the Wind", "value": 1, "question": "Gone with the Wind by Victor Fleming"},
    {"label": "La Dolce Vita", "value": 1, "question": "La Dolce Vita by Federico Fellini"},
    {"label": "Schindler's List", "value": 1, "question": "Schindler's List by Steven Spielberg"},
    {"label": "It's a Wonderful Life", "value": 1, "question": "It's a Wonderful Life by Frank Capra"},
    {"label": "Star Wars", "value": 1, "question": "Star Wars by George Lucas"},
    {"label": "GoodFellas", "value": 1, "question": "GoodFellas by Martin Scorsese"},
];

// Chart elements
var padding = {top: 20, right: 40, bottom: 0, left: 0},
    w = 500 - padding.left - padding.right,
    h = 500 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    picked = 100000,
    color = d3.scale.category20();

var svg = d3.select('#chart')
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

const defs = svg.append("defs");

const filter = defs.append("filter")
    .attr("id", "blur");

filter.append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 5);

var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");

var vis = container
    .append("g");

// Pie generator
var pie = d3.layout.pie().value(function () {
    return 1;
});

// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);

// Select paths, use arc generator to draw
var arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

arcs.append("path")
    .attr("fill", function (d, i) {
        return color(i);
    })
    .attr("d", function (d) {
        return arc(d);
    });

// Add the text
arcs.append("text").attr("transform", function (d) {
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
})
    .attr("text-anchor", "end")
    .text(function (d, i) {
        return data[i].label;
    });

// Make arrow
svg.append("g")
    .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h / 2) + padding.top) + ")")
    .append("path")
    .attr("d", "M-" + (r * .15) + ",0L0," + (r * .05) + "L0,-" + (r * .05) + "Z")
    .style({"fill": "#fda904"});

function drawWheel() {
    vis.selectAll("*").remove();

    arcs = vis.selectAll("g.slice")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "slice");

    arcs.append("path")
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", function (d) {
            return arc(d);
        });

    arcs.append("text").attr("transform", function (d) {
        d.innerRadius = 0;
        d.outerRadius = r;
        d.angle = (d.startAngle + d.endAngle) / 2;
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
    })
        .attr("text-anchor", "end")
        .text(function (d, i) {
            return data[i].label;
        });
}

drawWheel();

d3.select("#spinButton").on("click", function () {
    spin();
});

d3.select("#nextButton").on("click", function () {
    d3.select("#nextButton").style("display", "none");
    d3.select("#spinButton").style("display", "block");
    d3.select("#question h3").text("");
    container.style("filter", "none");
    drawWheel();
});

function rotate() {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}

function spin() {
    if (data.length === 0) return;

    var ps = 360 / data.length,
        rng = Math.floor((Math.random() * 1440) + 360);

    rotation = (Math.round(rng / ps) * ps);

    picked = Math.round(data.length - (rotation % 360) / ps);
    picked = picked >= data.length ? (picked % data.length) : picked;

    rotation += 90 - Math.round(ps / 2);

    vis.transition()
        .duration(3000)
        .attrTween("transform", rotate)
        .each("end", function () {
            //Add picked background
            d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                .attr("fill", "grey");

            //Add wheel blur
            container.style("filter", "url(#blur)");

            // Update the question text in the center of the wheel
            d3.select("#question h3")
                .text(data[picked].question);

            // Delete the selected item from the array
            data.splice(picked, 1);

            // Update status of buttons
            d3.select("#spinButton").style("display", "none");
            d3.select("#nextButton").style("display", "block");

            oldrotation = rotation;
        });
}