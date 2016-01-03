app.factory('NodesFactory', function($http, $sce){

	function _handleError(response) {
	  // TODO: Do something here. Probably just redirect to error page
	  console.log('%c ' + response, 'color:red'); 
	}

	Array.prototype.getIndexBy = function (name, value) {
	    for (var i = 0; i < this.length; i++) {
	        if (this[i][name] == value) {
	            return i;
	        }
	    }
	    return -1;
	}

	return {
		getNodes: function(payload){
			$('#loading').show();
			var artistQ = payload.artist.split(" ").join("-");
			$http.post('/home', {artist: artistQ, page: payload.page}).then(function(allNodes){
				if(!Array.isArray(allNodes.data)){
					alert("Check the spelling on your search!");
				}

				var nodeArr = [], linkArr = [], sliceStart;
				allNodes.data.forEach(function(node, idx){
					node.level = "core" + idx, node.isParent = true;		
					node.samplesCollection.forEach(function(aNode, idex){
		        		aNode.level = idx;
		        		aNode.branchRef = "branch" + idex;
		        		aNode.otherSamplers.forEach(function(branch, i){
		        			branch.original = aNode.songName;
		        			branch.leafLevel = idx;
		        			if(branch.songName === node.songName){
		        		 		aNode.otherSamplers.splice(i, 1);
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
						console.log(nodeArr.length, sampleNode.otherSamplers);
						Array.prototype.splice.apply(nodeArr, [nodeArr.length, 0].concat(sampleNode.otherSamplers));
					});
				});

				nodeArr.forEach(function(node, idx){
					console.log("it's failing here? node.orig is here", node.original);
					if(node.original){
						console.log("another thing", node.original);
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

				$('#loading').hide();

				var svg = d3.select("#svg-canvas").append("svg")
					.attr("width", width)
					.attr("height", height);

				svg.append("rect")
					.attr("class", "background")
					.attr("width", width)
					.attr("height", height);

				var n = nodes.length;

			    force.nodes(nodes).links(links);

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
			        .attr("id", function(d){return d.level})
			        .attr("cx", function(d) { return d.x; })
			        .attr("cy", function(d) { return d.y; })
			        .attr("r", function(d){
			        	if(d.samplesCollection){return 5;} 
		        		else {return 3.5;}
			        })
			        .style("fill", function(d) { return "gold"; })
			        .call(force.drag);

		        $('svg circle').tipsy({ 
			        gravity: 'w', 
			        html: true, 
			        title: function() {
			          var d = this.__data__, songName = d.songName, artist = d.artistName;
			          return songName + " by " + artist;
			        }
			      });

		        node.on("click", function(d) {
		        	if(d.songLink.indexOf("https") === -1){
		        		var songURL = d.songLink.split("http").join("https");
		        	} else {
		        		var songURL = d.songLink;
		        	}
		        	var imgURL = d.imgLink.split("http").join("https");
		        	if(!d.samplesCollection) {
	        			var coreNode = d3.select("#core" + d.level).property("__data__");
	        			if(coreNode.songLink.indexOf("https") === -1){
			        		var songURLCore = coreNode.songLink.split("http").join("https");
			        	} else {
			        		var songURLCore = coreNode.songLink;
			        	}
		        		$(".original-song-link iframe").attr("src", songURLCore);
		        		$(".original-song-link h5").empty().text(d.sampleAppearance.sampler);
		        		$("#sample-elem").empty().text(d.sampleElement.sampler);
		        		$(".song-link h5").empty().text(d.sampleAppearance.original)
		        		$(".hide-content").show();
		        	} else {
		        		$(".hide-content").hide();
		        		$(".song-link iframe").attr("height", "200");
		        	}
		        	$(".img-link img").attr("src", imgURL);
		        	$(".song-link iframe").attr("src", songURL);
		        	$("#song-name").empty().text(d.songName);
		        	$("#artist-name").empty().text("by " + d.artistName);
		        	$("#album-name").empty().text(d.album);
		        	$("#song-yr").empty().text(d.year);
		        	$("#label").empty().text(d.recLabel);
		        	$("#genre").empty().text(d.genre);
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