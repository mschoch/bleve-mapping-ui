function initBleveIndexMappingController(
    $scope, $http, $log, $uibModal,
    analyzerNames, dateTimeParserNames, byteArrayConverterNames,
    indexMappingIn) {
    $scope.static_prefix = $scope.static_prefix || 'mapping_static';

    $scope.analyzerNames = analyzerNames;
    $scope.dateTimeParserNames = dateTimeParserNames;
    $scope.byteArrayConverterNames = byteArrayConverterNames;

	var indexMapping =
        $scope.indexMapping = JSON.parse(JSON.stringify(indexMappingIn));

    indexMapping.types =
        indexMapping.types || {};
    indexMapping.analysis =
        indexMapping.analysis || {};
	indexMapping.analysis.analyzers =
        indexMapping.analysis.analyzers || {};
	indexMapping.analysis.char_filters =
        indexMapping.analysis.char_filters || {};
	indexMapping.analysis.tokenizers =
        indexMapping.analysis.tokenizers ||{};
	indexMapping.analysis.token_filters =
        indexMapping.analysis.token_filters || {};
	indexMapping.analysis.token_maps =
        indexMapping.analysis.token_maps || {};

    if (indexMapping["default_mapping"]) {
        indexMapping.types[""] = indexMapping["default_mapping"];
    }

    var tmc = initBleveTypeMappingController($scope, indexMapping.types);

    $scope.isValid = function() {
        return tmc.isValid();
    };

    BleveAnalysisCtrl($scope, $http, $log, $uibModal);

    return {
        isValid: $scope.isValid,
        indexMapping: function() {
            var r = JSON.parse(JSON.stringify($scope.indexMapping));

            r.types = tmc.typeMapping();
            r.default_mapping = r.types[""];
            delete r.types[""];

            return JSON.parse(JSON.stringify(scrub(r)));
        }
    }

    // Recursively remove every entry with '$' prefix.
    function scrub(m) {
        if (typeof(m) == "object") {
            for (var k in m) {
                if (typeof(k) == "string" && k.charAt(0) == "$") {
                    delete m[k];
                    continue;
                }

                m[k] = scrub(m[k]);
            }
        }

        return m;
    }
}

function IndexMappingController($scope, $http) {
	$scope.analyzerNames = [];

	$scope.loadAnalyzerNames = function() {
        $http.post('/api/_analyzerNames', $scope.mapping).
        success(function(data) {
            $scope.analyzerNames = data.analyzers;
        }).
        error(function(data, code) {
			$scope.errorMessage = data;
        });
	};

	$scope.loadAnalyzerNames();

	$scope.datetimeParserNames = [];

	$scope.loadDatetimeParserNames = function() {
        $http.post('/api/_datetimeParserNames', $scope.mapping).
        success(function(data) {
            $scope.datetimeParserNames = data.datetime_parsers;
        }).
        error(function(data, code) {
			$scope.errorMessage = data;
        });
	};

	$scope.loadDatetimeParserNames();
}
