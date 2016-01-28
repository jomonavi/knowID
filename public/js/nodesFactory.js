app.factory('NodesFactory', function($http, $sce){

	function _handleError(response) {
	  // TODO: Do something here. Probably just redirect to error page
	  console.log('%c ' + response, 'color:red'); 
	}

	Array.prototype.getIndexBy = function (name, value) {
	    for (var i = 0; i < this.length; i++) {
	        if (this[i][name] === value) {
	            return i;
	        }
	    }
	    return -1;
	}

	return {
		getNodes: function(payload){
			$('#loading').toggle(true);
			var artistQ = payload.artist.split(" ").join("-");
			$http.post('/home', {artist: artistQ, page: payload.page}).then(function(allNodes){
				if(!Array.isArray(allNodes.data)){
					alert("Check the spelling on your search!");
				}

				var nodeArr = [], 
					linkArr = [], 
					sliceStart;
				allNodes.data.forEach(function(node, idx){
					node.level = "core" + idx; 
					node.isParent = true;		
					node.samplesCollection.forEach(function(innerLeaf, idex){
		        		innerLeaf.level = idx;
		        		innerLeaf.branchRef = "branch" + idex;
		        		innerLeaf.parentNode = node;
		        		innerLeaf.otherSamplers.forEach(function(outerLeaf, i){
		        			outerLeaf.original = innerLeaf.songName;
		        			outerLeaf.leafLevel = idex;
		        			outerLeaf.parentNode = innerLeaf;
		        			if(outerLeaf.songName === node.songName){
		        				outerLeaf.toSplice = true;
		        			}
		        		 })
		        	});
					nodeArr.push(node);
					sliceStart = nodeArr.length;

					Array.prototype.splice.apply(nodeArr, [sliceStart, 0].concat(node.samplesCollection));

					for(var i = sliceStart; i < nodeArr.length; i++) {
						var aLink = {
							'source': sliceStart - 1,
							'target': i,
							'weight': 3
						}
						linkArr.push(aLink);
					}
					node.samplesCollection.forEach(function(sampleNode){
						var rootNodeIdx = sampleNode.otherSamplers.getIndexBy("songName", node.songName);
						sampleNode.otherSamplers.splice(rootNodeIdx, 1);
						Array.prototype.splice.apply(nodeArr, [nodeArr.length, 0].concat(sampleNode.otherSamplers));
					});
				});

				nodeArr = nodeArr.filter(function(node, idx){
					return !node.toSplice;
				})

				nodeArr.forEach(function(node, idx){
					if(node.original){
						var sourcePos = nodeArr.getIndexBy("songName", node.original);

						var aLink = {
							'source': sourcePos,
							'target': idx,
							'weight': 3
						}
						linkArr.push(aLink);
					}
				})

				var nodes = nodeArr;
				var links = linkArr;

				var width = 823, height = 600;

				var color = d3.scale.category20();

				var fisheye = d3.fisheye.circular()
					.radius(120);

				var force = d3.layout.force()
					.charge(-150)
					.linkDistance(35)
					.size([width, height]);

				$('#loading').toggle(false);

				var svg = d3.select("#svg-canvas").append("svg")
					.attr("width", width)
					.attr("height", height);

				svg.append("rect")
					.attr("class", "background")
					.attr("width", width)
					.attr("height", height);

				var n = nodes.length;

			    force.nodes(nodes).links(links);

			    links.forEach(function(link, index, list) {
			        if (typeof nodes[link.source] === 'undefined') {
			        	console.log("prob node", nodes[link.source]);
			            console.log('undefined source', link);
			            link.shouldDelete = true;
			        }
			        if (typeof nodes[link.target] === 'undefined') {
			        	console.log("prob node", nodes[link.target]);
			            console.log('undefined target', link);
			            link.shouldDeleteT = true;
			        }
			    });

			    links = links.filter(function(link, idx){
			    	return !link.shouldDelete
			    });

				// Initialize the positions deterministically, for better results.
				// nodes.forEach(function(d, i) { d.x = d.y = width / n * i; });

				// Run the layout a fixed number of times.
				// The ideal number of times scales with graph complexity.
				// Of course, don't run too long—you'll hang the page!
			    force.start();
			    for (var i = n; i > 0; --i) force.tick();
			    force.stop();

			    // Center the nodes in the middle. 
			    var ox = 0, oy = 0;
			    nodes.forEach(function(d) { ox += d.x, oy += d.y; });
			    ox = ox / n - width / 2, oy = oy / n - height / 2;
			    nodes.forEach(function(d) { d.x -= -2, d.y -= -6; });

			    var link = svg.selectAll(".link")
			        .data(links)
			      	.enter().append("line")
			        .attr("class", "link")
			        .attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; })
			        .attr("stroke", "grey")
			        .style("stroke-width", function(d) { return 2; });

			    var node = svg.selectAll(".node")
			        .data(nodes)
			      	.enter().append("circle")
			        .attr("class", "node")
			        .attr("id", function(d){
			        	if(d.isParent){
			        		return d.level;
			        	} else if(d.branchRef) {
			        		return d.branchRef;
			        	}
			        })
			        .attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; })
			        .attr("r", function(d){
			        	if(d.samplesCollection){
			        		return 5;
			        	} else {
			        		return 3.5;
			        	}
			        })
			        .style("fill", function(d) {
			        	if(d.isParent){
			        		return "rgba(215,120,215,.85)";
			        	} else if(d.original){
			        		return "rgba(44,220,70,0.9)"
			        	}else {
			        		return "rgba(255,223,0,.85)";
			        	} 
			        }).style("stroke", "rgb(51, 51, 51)")
			        .style("stroke-width", 2)
			        .call(force.drag);

		        $('svg circle').tipsy({ 
			        gravity: 'w', 
			        html: true, 
			        title: function() {
			          var d = this.__data__, 
			          songName = d.songName, 
			          artist = d.artistName;
			          return songName + " by " + artist;
			        }
			      });

		        node.on("click", function(d) {
		        	var imgURL = d.imgLink.split("http").join("https"),
		        		songURL;
		        	if(d.songLink.indexOf("https") === -1){
		        		songURL = d.songLink.split("http").join("https");
		        	} else {
		        		songURL = d.songLink;
		        	}

		        	$(".img-link img").attr("src", imgURL);
		        	$("#song-name").empty().text(d.songName);
		        	$("#artist-name").empty().text("by " + d.artistName);
		        	$("#album-name").empty().text(d.album);
		        	$("#song-yr").empty().text(d.year);
		        	$("#label").empty().text(d.recLabel);
		        	$("#genre").empty().text(d.genre);

		        	$(".song-link iframe").attr("src", songURL);

		        	if(!d.isParent) {
	        			var coreNode = d.parentNode;
	        			if(coreNode.songLink.indexOf("https") === -1){
			        		var coreNodeURL = coreNode.songLink.split("http").join("https");
			        	} else {
			        		var coreNodeURL = coreNode.songLink;
			        	}
		        		if(d.branchRef){
		        			$(".song-link iframe").attr("src", coreNodeURL);
		        			$(".sample-link iframe").attr("src", songURL);
		        		} else {
		        			$(".sample-link iframe").attr("src", coreNodeURL);
		        		}
		        		$(".song-link h5").empty().text(d.sampleAppearance.sampler);
		        		$("#sample-elem").empty().text(d.sampleElement.sampler);
		        		$(".sample-link h5").empty().text(d.sampleAppearance.original)
		        		$(".hide-content").show();
		        	} else {
		        		$(".hide-content").hide();
		        	}

		        	$("#song-panel").show();
		        })

		        var nodeLabel = svg.selectAll("text")
				   .data(nodes)
				   .enter()
				   .append("text")
				   .text(function(d) {
				        if(d.samplesCollection) return d.songName;
				        else return d.originalSong;
				   })
				   .attr("x", function(d){return d.x})
				   .attr("y", function(d){return d.y})
				   .attr("id", function(d) {return "text" + d.level})
				   .attr("fill", "grey")
				   .style("visibility", "hidden");


			    svg.on("mousemove", function() {
			      fisheye.focus(d3.mouse(this));

			      node.each(function(d) { d.fisheye = fisheye(d); })
			          .attr("cx", function(d) { return d.fisheye.x; })
			          .attr("cy", function(d) { return d.fisheye.y; })
			          .attr("r", function(d) { 
			          	if(d.samplesCollection) return d.fisheye.z * 5;
			          	else return d.fisheye.z * 3.5;
			          });

			      link.attr("x1", function(d) { return d.source.fisheye.x; })
			          .attr("y1", function(d) { return d.source.fisheye.y; })
			          .attr("x2", function(d) { return d.target.fisheye.x; })
			          .attr("y2", function(d) { return d.target.fisheye.y; });
			    });

			    $("#navigation").show();	

			}, function(error){
				alert("Check the spelling of your search");
				_handleError(error);
			})
		}
	}
});