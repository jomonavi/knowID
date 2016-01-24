app.controller('HomeCtrl', ['$scope', 'NodesFactory', '$location', function($scope, NodesFactory, $location) {

	$scope.query;
	
	var page = 1;
	$scope.getArtist = function() {
		$location.path('/');
		artistURL = $scope.query;
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