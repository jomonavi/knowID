'use strict';
var app = angular.module('app', ['ngRoute', 'ngResource'])

app.config(['$routeProvider', function($routeProvider) {
  	$routeProvider
    	.when('/', {
      		templateUrl: 'home.html',
          controller: 'HomeCtrl'
    	})
    	.otherwise({
      		redirectTo: '/'
    	});
}]);


app.controller('HomeCtrl', ['$scope', '$http', "$sce", function($scope, $http, $sce) {
	$scope.query;

	$scope.getArtist = function() {
		d3.select("svg").remove();
		var artistQ = $scope.query.split(" ").join("-");
		$http.post('/home', {artist: artistQ}).then(function(allNodes){
			console.log(allNodes.data);
			if(!Array.isArray(allNodes.data)){
				alert("Check the spelling on your search!");
			}
			var nodeArr = [], linkArr = [], sliceStart;
			allNodes.data.forEach(function(node, idx){
				node.level = "core" + idx, node.isParent = true;		
				node.samplesCollection.forEach(function(aNode){
	        		aNode.level = idx; 
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
			});

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
		        	var youtubeURL = d.songLink.split("http").join("https");
		        	var imgURL = d.imgLink.split("http").join("https");
		        	console.log(d);
		        	if(!d.samplesCollection) {
		        		console.log("here");
	        			var coreNode = d3.select("#core" + d.level).property("__data__");
		        		$(".original-song-link iframe").attr("src", coreNode.songLink);
		        		$(".original-song-link h5").empty().text(d.sampleAppearance.sampler);
		        		$("#sample-elem").empty().text(d.sampleElement.sampler);
		        		$(".song-link h5").empty().text(d.sampleAppearance.original)
		        		$(".hide-content").show();
		        	} else {
		        		console.log("there");
		        		$(".hide-content").hide();
		        		$(".song-link iframe").attr("height", "200");
		        	}
		        	$(".img-link img").attr("src", imgURL);
		        	$(".song-link iframe").attr("src", d.songLink);
		        	$("#song-name").empty().text(d.songName);
		        	$("#artist-name").empty().text("by " + d.artistName);
		        	$("#album-name").empty().text(d.album);
		        	$("#song-yr").empty().text(d.year);
		        	$("#label").empty().text(d.recLabel);
		        	$("#genre").empty().text(d.genre);
		        	$("#song-panel").show();


		        	// $scope.$apply(function(){
		        	// 	console.log("im applying!")
			        // 	$scope.imgLink = d.imgLink;
			        // 	$scope.songName = d.songName;
			        // 	$scope.artistName = d.artistName;
			        // 	$scope.album = d.album;
			        // 	$scope.year = d.year;
			        // 	$scope.sampleElement = d.sampleElement;
			        // 	$scope.songLink = $sce.trustAsResourceUrl(youtubeURL);
			        // 	$scope.recLabel = d.recLabel;
			        // 	$scope.genre = d.genre;
			        // 	console.log("aNode", $scope);
		        	// })
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

		}, function(error){
			alert("Check the spelling of your search");
			_handleError(error);
		})
	}

}]);


function _handleError(response) {
  // TODO: Do something here. Probably just redirect to error page
  console.log('%c ' + response, 'color:red'); 
}