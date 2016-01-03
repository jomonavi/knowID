app.controller('HomeCtrl', ['$scope', 'NodesFactory', function($scope, NodesFactory) {

	$scope.query;
	
	var page = 1;
	$scope.getArtist = function() {
		artistURL = $scope.query;
		console.log($scope.query);
		d3.select("svg").remove();
		NodesFactory.getNodes({artist: artistURL, page: page});
	}

	$scope.nextPage = function(){
		page ++;
		console.log(artistURL);
		d3.select("svg").remove();
		NodesFactory.getNodes({artist: artistURL, page: page});
	}
}]);