var sentimood = new Sentimood();
// word cloud
var filr=[];
var wordsMapHillary={};
var wordsMapTrump={};
var frequency_list=[];
var data1;

var notable_keywords = [ "JOB", "BORDER", "MOSUL", "MONEY", "TAX", "ISIS",
             			"PUTIN", "LAW", "IRAQ" ]
var ignore =["thats","very","going","shes","go","dont","because","when","she","has","are","no","do","about",'well','at','will','with','so','not','was','on','is','be','would','were','in','have','a','of','for','as','i',"the","to","i", "i'll", "i've", "i'm", "me", 			"myself", "my", "mine","we", "we're", "we'll", "we've", "us", "ourselves", "our", "ours","you", "you're", "you'll", "you've", "yourself", "yourselves", "your", "yours",			"she", "she'll", "she's", "her", "he'll", "he's", "he", "him", "it", 
              "it'll", "it's", "they", "they'll", "they're", "they've", "them", "himself", 
              "herself", "itself", "themselves", "his", "her", "its",
               "their", "theirs","that", "which", "who", "whom", "whose", "whichever", "whoever",
               "whomever", "that'll", "who'll", "who've","this", "that", "these", "those","anybody", "anyone", "anything", "each", "either", "everybody", 
               "everyone", "everything", "neither", "nobody", "no one", "nothing", 
               "one", "somebody", "someone", "something", "both", "few", "many",
               "several", "all", "any", "most", "none", "some","what", "who", "which", "whom", "whose"];


	ignore = (function(){
		var o = {}; // object prop checking > in array checking
		var iCount = ignore.length;
		
		for (var i=0;i<iCount;i++){
			o[ignore[i]] = true;
			//console.log(o);
		}
		
		return o;
	}());


window.onload = function() {
	d3.csv("debate.csv", function(data) {
		 data1 = data;
		 getTagData(data);
		 getSentimentScore(data);
		 findFrequency(data);
	});

}
function getTagData(dataset) {

	
	new Taggle('tags', {
		tags : notable_keywords,
		onBeforeTagAdd : function(event, tag) {
			return true;
		},
		onTagAdd : function(event, tag) {
			notable_keywords.push(tag.toUpperCase())
			maketreeDatasets(notable_keywords ,dataset)
			return true;
		},
		onBeforeTagRemove : function(event, tag) {
			return true;
		},
		onTagRemove : function(event, tag) {
			notable_keywords = removeA(notable_keywords, tag.toUpperCase())
			maketreeDatasets(notable_keywords ,dataset)
			return true;
		}
	});
	console.log(dataset)
	maketreeDatasets(notable_keywords, dataset);

}
function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}
function maketreeDatasets(notable_keywords, data) {


	console.log("notable_keywords", notable_keywords)
	var totaldebate = ""
	var nesteddata = []
	for ( var int = 0; int < notable_keywords.length; int++) {
		nesteddata.push({
			"name" : notable_keywords[int],
			"children" : []
		})
	}
	var datasets = [ {
		"name" : "Debate",
		"children" : nesteddata
	} ]

		
	
	
	for ( var i = 0; i < data.length; i++) {

		totaldebate.concat(data[i].Text)
		var keyboard_Arr = datasets[0].children
		for ( var j = 0; j < keyboard_Arr.length; j++) {
			var keyword = keyboard_Arr[j].name;
			var reg = new RegExp(keyword);
			var regex = new RegExp( '(' + keyword + ')', 'gi' );
			//var pattern = '/'+keyword+'/i'
			var result = data[i].Text.match(regex);
			if (result) {
				
				var analysis = sentimood.analyze(data[i].Text);
				if(analysis.score > 5){
					keysent = "Positive"
				}
				else{
					keysent = "Negative"
				}
				

					var obj = hasValueByKey(data[i].Speaker,
							keyboard_Arr[j].children)
							
					
					if (obj != -1) {
						var obj_sent = hasValueByKey(keysent,
								keyboard_Arr[j].children[obj].children)
							
							if(obj_sent != -1){
								keyboard_Arr[j].children[obj].children[obj_sent].children.push({
									"name" : data[i].Text
								})
							}	
							else{

								keyboard_Arr[j].children[obj].children.push({
									"name" : keysent,
									"children" : [ {
										"name" : data[i].Text
									} ]
								})
							}
				

					}

					else {

						keyboard_Arr[j].children.push({
							"name" : data[i].Speaker,
							"children" : [ {
								"name" : keysent,
								"children" : [ {
									"name" : data[i].Text
								} ]
							} ]
						})
					}
				
			}
		}

	}
	console.log("dasets",datasets)
	makeTree(datasets[0])

}

function hasValueByKey(value, data) {
	var i, len = data.length;

	for (i = 0; i < len; i++) {
		if (data[i].hasOwnProperty("name") && data[i].name == value) {
			return i;
		}
	}

	return -1;
}

function makeTree(datasets) {

	var margin = {
		top : 30,
		right : 20,
		bottom : 30,
		left : 20
	}, width = 1000 - margin.left - margin.right, barHeight = 20, barWidth = width * 0.8;

	var i = 0, duration = 400, root;

	var tree = d3.layout.tree().nodeSize([ 0, 20 ]);

	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [ d.y, d.x ];
	});
	if (d3.select("#tree").select("svg") != null) {
		d3.select("#tree").select("svg").remove()
	}

	var svg = d3.select("#tree").append("svg").attr("width",
			width + margin.left + margin.right).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	datasets.x0 = 0;
	datasets.y0 = 0;
	
	function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d._children.forEach(collapse);
	      d.children = null;
	    }
	  }

	datasets.children.forEach(collapse);
	update(root = datasets);

	function update(source) {

		// Compute the flattened node list. TODO use d3.layout.hierarchy.
		var nodes = tree.nodes(root);
		console.log("nodes ====",nodes)
		var height = Math.max(500, nodes.length * barHeight + margin.top
				+ margin.bottom);

		d3.select("svg").transition().duration(duration).attr("height", height);
		
		
		
		//TIP
		

		var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
			var regex = new RegExp( '(' + d.parent.parent.parent.name + ')', 'gi' );
			var make = "<span style='background-color: #FFFFFF'>" + d.parent.parent.parent.name + "</span>";
			var str = d.name.replace(regex,make);
			return " <span style='color:black'>" + str + "</span>";
		  })
		
		svg.call(tip)
		d3.select(self.frameElement).transition().duration(duration).style(
				"height", height + "px");

		// Compute the "layout".
		nodes.forEach(function(n, i) {
			n.x = i * barHeight;
			
		});

		
		// Update the nodes…
		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id || (d.id = ++i);
		});

		var nodeEnter = node.enter().append("g").attr("class", "node").attr(
				"transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
			}).style("opacity", 1e-6);

		// Enter any new nodes at the parent's previous position.
		nodeEnter.append("rect").attr("y", -barHeight / 2).attr("height",
				barHeight).attr("width", barWidth).style("fill", color).on(
						"click", click);
		nodeEnter.selectAll("rect")
				  .filter(function(d) { return d.depth >= 4 })
			      .on('click', tip.show)
			      .on('mouseout', tip.hide)
			      .on('mouseleave', tip.hide);
		var textg = nodeEnter.append("text").attr("dy", 3.5).attr("dx", 5.5).text(
				function(d) {
					return d.name;
					//return d.name.replace(/Well/g,"<h1> job </h1>");
				});
		
		
		// Transition nodes to their new position.
		nodeEnter.transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				}).style("opacity", 1);

		node.transition().duration(duration).attr("transform", function(d) {
			return "translate(" + d.y + "," + d.x + ")";
		}).style("opacity", 1).select("rect").style("fill", color);

		// Transition exiting nodes to the parent's new position.
		node.exit().transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				}).style("opacity", 1e-6).remove();

		// Update the links…
		var link = svg.selectAll("path.link").data(tree.links(nodes),
				function(d) {
					return d.target.id;
				});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g").attr("class", "link").attr("d",
				function(d) {
					var o = {
						x : source.x0,
						y : source.y0
					};
					return diagonal({
						source : o,
						target : o
					});
				}).transition().duration(duration).attr("d", diagonal);

		// Transition links to their new position.
		link.transition().duration(duration).attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition().duration(duration).attr("d", function(d) {
			var o = {
				x : source.x,
				y : source.y
			};
			return diagonal({
				source : o,
				target : o
			});
		}).remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
		
	}
	// Toggle children on click.
	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	function color(d) {
		return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}

}

function getSentimentScore(datasets) {
	
	var dataCounter = [],TrumpCount = 0,ClintonCount = 0, PenceCount = 0, KaineCount = 0 ;
	var y = 0, x = 0,y1 = 0, x1 = 0,y2 = 0, x2 = 0,y3 = 0, x3 = 0, wordcount = 0 , wordcount1 = 0 , wordcount2 = 0 , wordcount3 = 0;
	//for ( var i = 0; i < datasets.length; i++) {

		var i = datasets.length
		while (i--) {	
		
		var analysis = sentimood.analyze(datasets[i].Text);
		datasets[i].Score = analysis.score;
		//console.log(datasets[i].Speaker,"===",datasets[i].Score)
		
		if (datasets[i].Score > 0 && datasets[i].Score < 30) {
			datasets[i].Sentiment = "Positive";
		} else if (datasets[i].Score > 30) {
			datasets[i].Sentiment = "Verry Positive";
		} else if (datasets[i].Score < 0 && datasets[i].Score > -11) {
			datasets[i].Sentiment = "Negative";
		} else if (datasets[i].Score < -11) {
			datasets[i].Sentiment = "Verry Negative";
		} else if (datasets[i].Score == 0) {
			datasets[i].Sentiment = "Neutral";
		}
		function countWords(s){
			s = s.replace(/(^\s*)|(\s*$)/gi,"");
			s = s.replace(/[ ]{2,}/gi," ");
			s = s.replace(/\n /,"\n");
			return s.split(' ').length;
		}
		if (datasets[i].Speaker == "Trump") {
			
			x = x + 1;
			if (datasets[i].Sentiment == "Positive") {
				y += 1;
			} else if (datasets[i].Sentiment == "Verry Positive") {
				y += 2;
			} else if (datasets[i].Sentiment == "Negative") {
				y -= 1;
			} else if (datasets[i].Sentiment == "Verry Negative") {
				y -= 2;
			}
			datasets[i].Y = y;
			datasets[i].X = x;
			TrumpCount += countWords(datasets[i].Text);
		}
		else if (datasets[i].Speaker == "Clinton") {
			x1 = x1 + 1;
			if (datasets[i].Sentiment == "Positive") {
				y1 += 1;
			} else if (datasets[i].Sentiment == "Verry Positive") {
				y1 += 2;
			} else if (datasets[i].Sentiment == "Negative") {
				y1 -= 1;
			} else if (datasets[i].Sentiment == "Verry Negative") {
				y1 -= 2;
			}
			datasets[i].Y = y1;
			datasets[i].X = x1;
			ClintonCount += countWords(datasets[i].Text);
		}
		else if (datasets[i].Speaker == "Kaine") {
			x2 = x2 + 1;
			if (datasets[i].Sentiment == "Positive") {
				y2 += 1;
			} else if (datasets[i].Sentiment == "Verry Positive") {
				y2 += 2;
			} else if (datasets[i].Sentiment == "Negative") {
				y2 -= 1;
			} else if (datasets[i].Sentiment == "Verry Negative") {
				y2 -= 2;
			}
			datasets[i].Y = y2;
			datasets[i].X = x2;
			KaineCount += countWords(datasets[i].Text);
		}
		else if (datasets[i].Speaker == "Pence") {
			x3 = x3 + 1;
			if (datasets[i].Sentiment == "Positive") {
				y3 += 1;
			} else if (datasets[i].Sentiment == "Verry Positive") {
				y3 += 2;
			} else if (datasets[i].Sentiment == "Negative") {
				y3 -= 1;
			} else if (datasets[i].Sentiment == "Verry Negative") {
				y3 -= 2;
			}
			
			datasets[i].Y = y3;
			datasets[i].X = x3;
			PenceCount += countWords(datasets[i].Text);

	}
		else{
			datasets.splice(i, 1);
		}
		
		
		
		
		
	}
	datasets.sort(function(obj1, obj2) {
		
		return obj1.X - obj2.X;
	})
	
	console.log("datasets",datasets)
	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	}, width = 560 - margin.left - margin.right, height = 600 - margin.top
			- margin.bottom;

	var x = d3.scale.linear().range([ 0, width ]);

	var y = d3.scale.linear().range([ height, 0 ]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis().scale(x).orient("bottom");

	var yAxis = d3.svg.axis().scale(y).orient("left");

	var svg = d3.select("#ascatter").append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");
	
	x.domain(d3.extent(datasets, function(d) {
		return d.X;
	})).nice();
	y.domain(d3.extent(datasets, function(d) {
		return d.Y;
	})).nice();
	
	

	
	

	svg.append( "line" )
	  .attr("x1", 0)
	  .attr("x2", width )
	  .attr("y1", y( 0 ) )   // whatever the y-val should be
	  .attr("y2", y( 0 ) )
	  .style("stroke", "black");
	svg.append("text")
		.attr("x", width-80)
		.attr("y", y(10)).style("text-anchor", "end").style("font-size","18px").style("font-weight", "bold").text(
					"positive")
	svg.append("text")
		.attr("x", width-80)
		.attr("y", y(-10)).style("text-anchor", "end").style("font-size","18px").style("font-weight", "bold").text(
					"negative")
					
					
	svg.append("g").attr("class", "x axis").attr("transform",
			"translate(0," + height + ")").call(xAxis).append("text").attr(
			"class", "label").attr("x", width).attr("y", -6).style(
			"text-anchor", "end").text("Time(arb)");

	svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
			"class", "label").attr("transform", "rotate(-90)").attr("y", 6)
			.attr("dy", ".71em").style("text-anchor", "end").text(
					"Sentiment(arb)")
		
	for ( var i = 0; i <= datasets.length-1; ++i ) {
    svg.append( 'circle' )
        .attr( 'r', 0 )
        .attr( 'cx',  x(datasets[i].X) )
        .attr( 'cy', y(datasets[i].Y) )
        .attr(
			"class", "dot")
        .style("fill", function(d) {
		return color(datasets[i].Speaker)})
		.attr('fill-opacity', 0.4)
        .transition()
        .delay( 20 * i )
        .attr( 'r', 6 );
  }

	
	
	
	svg.append("text")
	.attr("x", width-60)
	.attr("y", y(50)).style("text-anchor", "end").style("font-size","18px").style("font-weight", "bold").text(
				"WordCount")
				
var  start_val = 0,
	 duration = 15000;
	
	dataCounter = [{"name":"Clinton","end_val":ClintonCount},{"name":"Kaine","end_val":KaineCount},{"name":"Trump","end_val":TrumpCount},{"name":"Pence","end_val":PenceCount}]
	
	
	var counter = svg.selectAll(".counter").data(dataCounter).enter().append(
			"g").attr("class", "counter").attr("transform", function(d, i) {
		return "translate(0," + i * 20 + ")";
	});

	counter.append("text").attr("x", width - 150).attr("y", y(45))
	 .style("font-size","15px")
	 .text(function(d) {
				return d.name+": ";
			});

	counter.append("text").attr("x", width - 100).attr("y", y(45))
		  .style("font-size","15px")
		  .text(start_val)
	 .transition()
	 .duration(duration)
	 .ease('linear')
	 .tween("text", function(d) {
	 var i = d3.interpolate(this.textContent, d.end_val);
	 return function(t) {
	 this.textContent = Math.round(i(t));
	};
	});
				
				

	
	var legend = svg.selectAll(".legend").data(color.domain()).enter().append(
			"g").attr("class", "legend").attr("transform", function(d, i) {
		return "translate(0," + i * 20 + ")";
	});

	legend.append("rect").attr("x", width - 18).attr("width", 18).attr(
			"height", 18).style("fill", color);

	legend.append("text").attr("x", width - 24).attr("y", 9)
			.attr("dy", ".35em").style("text-anchor", "end").text(function(d) {
				return d;
			});

	var max = d3.extent(datasets,function(d){return d.Score});
	console.log("Extent: ",max);


}
function  makeallanimation(x,y,svg,data){
	
	

	svg.append( "line" )
	  .attr("x1", 0)
	  .attr("x2", width )
	  .attr("y1", y( 0 ) )   // whatever the y-val should be
	  .attr("y2", y( 0 ) )
	  .style("stroke", "black");

	svg.append("g").attr("class", "x axis").attr("transform",
			"translate(0," + height + ")").call(xAxis).append("text").attr(
			"class", "label").attr("x", width).attr("y", -6).style(
			"text-anchor", "end").text("Time(arb)");

	svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
			"class", "label").attr("transform", "rotate(-90)").attr("y", 6)
			.attr("dy", ".71em").style("text-anchor", "end").text(
					"Sentiment(arb)")

		
	for ( var i = 0; i <= data.length-1; ++i ) {
    svg.append( 'circle' )
        .attr( 'r', 0 )
        .attr( 'cx',  x(data[i].X) )
        .attr( 'cy', y(data[i].Y) )
        .attr(
			"class", "dot")
        .style("fill", function(d) {
		return color(data[i].Speaker)})
        .transition()
        .delay( 20 * i )
        .attr( 'r', 6 );
  }

	


}



// Nilay CLoud


function findFrequency(data) {
	
	data.forEach(function(d) {
		if (d.Speaker=="Clinton") {
		      var wordarr= d.Text.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "").split(" ");
		//toLowerCase().trim().replace(/[,;.]/g,'').split(/[\s\/]+/g).sort();				
			
			    wordarr.forEach(function(key) {		
				if (key != "" && !ignore[key]) {
					if (wordsMapHillary.hasOwnProperty(key)) {
						wordsMapHillary[key]++;
					} 
					else {
						wordsMapHillary[key] =1;
					}
				}	
			});			
		}
		if (d.Speaker=="Trump") {
		     var wordarr= d.Text.toLowerCase().trim().replace(/[^a-zA-Z ]/g, "").split(" ");
			
			 wordarr.forEach(function(key){		
				if (key != "" && !ignore[key]) {
					if (wordsMapTrump.hasOwnProperty(key)) {
						wordsMapTrump[key]++;
					} 
					else {
						wordsMapTrump[key] =1;
					}
				}	
			});			
		}
	});
createCloud((sortByCount(wordsMapHillary).slice(0,50)),"Clinton");
createCloud((sortByCount(wordsMapTrump).slice(0,50)),"Trump");
}

function sortByCount (wordsMap) {
	
	  // sort by count in descending order
	  var finalWordsArray = [];
	  finalWordsArray = Object.keys(wordsMap).map(function(key) {
	  
	  //console.log("keys")
		return {
		  text: key,
		  size: wordsMap[key]
		};
	  });

	  finalWordsArray.sort(function(a, b) {
		return b.total - a.total;
	  });

	  return finalWordsArray;
	}
 function createCloud(frequency_list,name){
		redcolor=["#ff0000","#e50000","#cc0000","#b20000","#990000","#7f0000","#660000","#4c0000","#330000"]
		bluecolor=["#0000ff","#0000e5","#0000cc","#0000b2","#000099","#00007f","#000066","#00004c","#000033"]
		console.log(name)
		if (name =="Clinton") {
			//console.log("Clinton");
			color=bluecolor;
		}
		else if (name=="Trump") {
			//console.log("Trump");
			color=redcolor;
		}
	//console.log(color);

	
	id= "#"+name;
	cloud1 = d3.select(id).append("svg")
                .attr("width", 800)
                .attr("height", 450)
				
    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(color);

    d3.layout.cloud().size([800, 350])
            .words(frequency_list)
            .rotate(0)
            .fontSize(function(d) { return d.size +5; })
            .on("end", draw)
            .start();
	
    function draw(words) {
				 cloud1
                .attr("class", "wordcloud")
                .append("g")
                .attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
				.attr("class","tt")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });

	}
	
	cloud1.selectAll("text").on("click", function (d) {
		
		console.log(d.text);	    
		
		if(!(d.text.toUpperCase() in notable_keywords)){
			notable_keywords.push(d.text.toUpperCase());
			maketreeDatasets(notable_keywords ,data1);	
		}
		
		})
	}
