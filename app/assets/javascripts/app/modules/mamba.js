!function () {
    "use strict";
    var directives = angular.module("CommonDirectives", []).directive("ngFbField", [function () {
        return{link: function ($scope, iElm, iAttrs, controller) {
            if ($scope.field.inputType == "Calendar") {
                var getYearRange = function () {
                    var getYear = function (f) {
                        return parseInt(f.split("-")[0])
                    };
                    var range = [];
                    var s = getYear($scope.field.startDate);
                    var e = getYear($scope.field.endDate);
                    for (var i = s; i <= e; i++) {
                        range.push(i)
                    }
                    return range
                };
                $scope.field.yearsRange = getYearRange()
            }
        }}
    }]).directive("ngFormBuilder", [function () {
        return{restrict: "AE", templateUrl: fixTplUrl("partials/form_builder.html"), link: function link($scope) {
            $scope._ = $scope.$root._;
            $scope.getType = function getType(blockField, field) {
                if (blockField == "registration" && field.field == "gender") {
                    return"SwitcherTab"
                } else if (field.inputType === "MultiSelect" && field.field === "languages1") {
                    return"MultiSelectMore"
                }
                return field.inputType
            };
            $scope.initBlock = function initBlock(blockField) {
                if (!(blockField in $scope.Blocks)) {
                    $scope.Blocks[blockField] = {}
                }
            };
            $scope.initFieldValue = function initFieldValue(blockField, field) {
                if (!(blockField in $scope.Blocks) || !(field.field in $scope.Blocks[blockField])) {
                    $scope.Blocks[blockField][field.field] = field.value || undefined
                }
                if ((field.inputType === "HeightInput" || field.inputType === "WeightInput") && field.value === 0) {
                    $scope.Blocks[blockField][field.field] = 0
                }
                if ($scope.getType(blockField, field) === "MultiSelectMore") {
                    var FIRST_SHOWN = 6;
                    if (field.variants && field.variants.length > FIRST_SHOWN) {
                        angular.forEach(field.variants, function (variant, i) {
                            if (i >= FIRST_SHOWN) {
                                variant.hideMe = true
                            }
                        });
                        $scope.expand = function expand() {
                            angular.forEach(field.variants, function (variant, i) {
                                variant.hideMe = false
                            });
                            $scope.collapsed = false
                        };
                        $scope.collapsed = true
                    }
                }
            }
        }}
    }]).directive("flashNote", ["$timeout", function ($timeout) {
        return{restrict: "AE", scope: {data: "="}, replace: true, template: '<div class="b-message_system" ng-class="{\'b-message_system__error\': isError, \'b-message_system__success\': isMessage}"><i class="icon i-close i-close__blue" ng-class="{\'i-close__red\': isError}" ng-click="close()"></i><span ng-repeat="m in messages">[[m]]</span></div>', link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var isShown = false;
            $scope.$watch("data", function (data) {
                if ((!data || !data.messages) && !isShown) {
                    return
                }
                if (data && data.messages) {
                    showFlash(data)
                } else {
                    $scope.close()
                }
            });
            function showFlash(data) {
                if (!isShown) {
                    $el.addClass("show");
                    isShown = true
                }
                $scope.messages = data.messages;
                $scope.isError = data.type === "error";
                $scope.isMessage = !$scope.isError
            }

            $scope.close = function close() {
                $scope.messages = [];
                $el.removeClass("show");
                isShown = false;
                $el.css("display", "none");
                $timeout(function () {
                    $el.css("display", "")
                }, 100)
            }
        }}
    }]).directive("selectorGender", [function () {
        return{restrict: "E", transclude: true, replace: true, template: '<div class="b-button__groups">' + '<label class="b-button b-button__white b-button__half" ng-repeat="tab in variants" ng-class="{ \'button-active\': tab.selected }" ng-click="tabClicked(tab)">' + "[[tab.name]] " + '<input type="radio" style="position: absolute; z-index: -1;" ng-checked="!! tab.selected" name="[[tab.field]]" value="[[tab.key]]" />' + '<i ng-show="tab.iconClass" class="icon" ng-class="tab.iconClass"></i>' + "</label>" + "</div>", link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            $scope.variants = [];
            var blockField = "";
            $scope.$watch("field_", function (data) {
                if (!data) {
                    return
                }
                angular.forEach(data.variants, function (v, i) {
                    v.iconClass = v.key == "M" ? "i-male" : v.key == "F" ? "i-female" : "";
                    v.field = data.field;
                    $scope.variants.push(v);
                    if (v.selected) {
                        setValue(v)
                    }
                })
            });
            $scope.$watch("block", function (data) {
                blockField = data.field;
                if ($scope.variants) {
                    angular.forEach($scope.variants, function (v, i) {
                        if (v.selected) {
                            setValue(v)
                        }
                    })
                }
            });
            $scope.tabClicked = function (tab) {
                for (var i = 0, l = $scope.variants.length; i < l; i++) {
                    $scope.variants[i].selected = $scope.variants[i].$$hashKey === tab.$$hashKey
                }
                setValue(tab)
            };
            function setValue(tab) {
                if (blockField) {
                    $scope.Blocks[blockField][tab.field] = tab.key
                }
            }
        }}
    }]).directive("range", ["Translation", function range(Translation) {
        return{restrict: "E", replace: true, template: "<div>" + '<select class="b-field__type" ng-model="min_" ng-options="v for v in valsForMin" ng-disabled="disabled"></select>' + '<select class="b-field__type" ng-model="max_" ng-options="v for v in valsForMax" ng-disabled="disabled"></select>' + "</div>", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var params = {min: null, max: null, step: 1, isEnabled: null, value: null}, fieldName, blockFieldName;
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    !function () {
                        var key = k;
                        attrs.$observe(key, function (value) {
                            if (!value) {
                                return
                            }
                            $scope.$watch(value, function (value) {
                                if (!value) {
                                    return
                                }
                                params[key] = value;
                                render()
                            })
                        })
                    }()
                }
            }
            $scope.$watch("field_", function (data) {
                if (!data) {
                    return
                }
                fieldName = data.field;
                render()
            });
            $scope.$watch("block", function (data) {
                if (!data) {
                    return
                }
                blockFieldName = data.field;
                render()
            });
            var noVal = Translation.FORMBUILDER.NO_ANSWER;

            function render() {
                function setMinVals() {
                    var from = params.min, to = $scope.max_ && $scope.max_ != noVal ? Math.min($scope.max_, params.max) : params.max;
                    $scope.valsForMin = [noVal];
                    for (var i = from; i <= to; i += params.step) {
                        $scope.valsForMin.push(i)
                    }
                    if ((!$scope.min_ || $scope.min_ < from) && $scope.min != noVal) {
                        $scope.min_ = from
                    } else if ($scope.min_ > to) {
                        $scope.min_ = to
                    }
                }

                function setMaxVals() {
                    var from = $scope.min_ && $scope.min_ != noVal ? Math.max($scope.min_, params.min) : params.min, to = params.max;
                    $scope.valsForMax = [noVal];
                    for (var i = from; i <= to; i += params.step) {
                        $scope.valsForMax.push(i)
                    }
                    if ($scope.max_ !== undefined && $scope.max_ !== noVal && $scope.max_ < from) {
                        $scope.max_ = from
                    } else if (!$scope.max_ || $scope.max_ > to) {
                        $scope.max_ = to
                    }
                }

                function setValue() {
                    $scope.Blocks[blockFieldName][fieldName] = [fixVal($scope.min_), fixVal($scope.max_)];
                    function fixVal(val) {
                        return val === noVal ? 0 : val
                    }
                }

                if (params.min && params.max && params.value && fieldName && blockFieldName) {
                    $scope.disabled = !params.isEnabled;
                    $scope.min_ = params.value[0] === 0 ? noVal : params.value[0];
                    $scope.max_ = params.value[1] === 0 ? noVal : params.value[1];
                    setValue();
                    $scope.$watch("min_", function () {
                        setMaxVals();
                        setValue()
                    });
                    $scope.$watch("max_", function () {
                        setMinVals();
                        setValue()
                    })
                }
            }
        }}
    }]).directive("selectorGeo", [function () {
        return{restrict: "E", replace: true, template: '<select name="[[ block.field ]].[[ field_.field ]]" ' + 'class="b-field__type" ' + 'ng-model="modelGeo"' + 'ng-options="v as v.name for v in variants" ng-change="onSelect()">' + "</select>", link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            $scope.variants = [];
            var blockFieldName = "", fieldName = "", fieldData = {}, otherKeyName = "other";
            $scope.$watch("field_", function (data) {
                if (!data) {
                    return
                }
                fieldName = data.field;
                fieldData = data;
                angular.forEach(data.variants, function (v, i) {
                    $scope.variants.push(v)
                });
                setValue()
            });
            $scope.$watch("block", function (data) {
                if (!data) {
                    return
                }
                blockFieldName = data.field;
                setValue()
            });
            function setValue() {
                if (blockFieldName && fieldName) {
                    angular.forEach($scope.variants, function (v, i) {
                        if (v.selected || i == 0) {
                            $scope.modelGeo = v
                        }
                    })
                }
            }

            var lastSelected;
            $scope.$watch("modelGeo", function (data) {
                if (!data) {
                    return
                }
                if (data.key.toLowerCase() !== otherKeyName) {
                    lastSelected = data;
                    $scope.Blocks[blockFieldName][fieldName] = data.key
                }
            });
            $scope.onSelect = function () {
                if ($scope.modelGeo.key.toLowerCase() === otherKeyName) {
                    $scope.$emit("selectorGeo.other_chosen", {level: fieldData.level})
                }
            };
            $scope.$on("selectorGeo.externally_chosen", function (e, params) {
                var location, alreadyHaveLocation;
                if ("location"in params) {
                    location = params.location;
                    angular.forEach($scope.variants, function (v, i) {
                        if (v.key === location.key) {
                            alreadyHaveLocation = i
                        }
                    });
                    if (alreadyHaveLocation) {
                        location = $scope.variants[alreadyHaveLocation]
                    } else {
                        $scope.variants.push(location)
                    }
                } else {
                    location = lastSelected
                }
                $scope.modelGeo = location
            })
        }}
    }]).directive("pager", ["$location", function pager($location) {
        return{restrict: "E", replace: true, scope: {}, template: '<ul class="b-page" ng-show="firstPage || middlePages.length > 1">' + '<li class="b-page_item b-page_item__first-child" ng-show="firstPage" ng-class="{ \'b-page_item__current\' : curPage == firstPage}"><a href="[[renderHref(firstPage)]]" class="b-page_link">[[firstPage]]</a>' + '<li class="b-page_item b-page_item__more" ng-show="showMoreLeft"><span class="b-page_item__more-inner">...</span>' + '<li class="b-page_item" ng-repeat="page in middlePages" ng-class="{ \'b-page_item__current\' : curPage == page, \'b-page_item__first-child\': ! $index && ! firstPage}"><a href="[[renderHref(page)]]" class="b-page_link">[[page]]</a>' + "</ul>", link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var params = {total: null, perPage: null, offset: null, maxPages: 5};
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    !function () {
                        var key = k;
                        attrs.$observe(key, function (value) {
                            if (!value) {
                                return
                            }
                            if (!isNum(value)) {
                                params[key] = $scope.$parent.$eval(value);
                                $scope.$parent.$watch(value, function (value) {
                                    params[key] = value;
                                    render()
                                })
                            } else {
                                params[key] = value
                            }
                            render()
                        })
                    }()
                }
            }
            function isNum(input) {
                return input - 0 == input && (input + "").replace(/^\s+|\s+$/g, "").length > 0
            }

            function render() {
                if (!params.total || !params.perPage || !params.maxPages || params.offset === null) {
                    if (!params.total) {
                        $scope.firstPage = $scope.showMoreLeft = $scope.middlePages = $scope.curPage = 0
                    }
                    return
                }
                var totalPages = Math.ceil(params.total / params.perPage), firstPage, showMoreLeft, maxMiddlePages = params.maxPages - 1, middlePages = [];
                if (totalPages > 0) {
                    var curPage = Math.ceil((parseInt(params.offset, 10) + 1) / params.perPage);
                    curPage = curPage < 1 ? 1 : curPage > totalPages ? totalPages : curPage;
                    var startFrom = curPage > maxMiddlePages ? curPage - maxMiddlePages : 1, endAt = curPage < totalPages - maxMiddlePages ? curPage + maxMiddlePages : totalPages;
                    if (curPage <= Math.floor(maxMiddlePages / 2)) {
                        maxMiddlePages += 1
                    }
                    while (endAt > startFrom && endAt - startFrom >= maxMiddlePages) {
                        if (curPage >= Math.floor((endAt - startFrom) / 2) + startFrom) {
                            startFrom++
                        } else {
                            endAt--
                        }
                    }
                    for (var i = startFrom; i <= endAt; i++) {
                        middlePages.push(i)
                    }
                    firstPage = startFrom > 1 ? 1 : undefined;
                    showMoreLeft = startFrom > firstPage + 1
                }
                $scope.firstPage = firstPage;
                $scope.showMoreLeft = showMoreLeft;
                $scope.middlePages = middlePages;
                $scope.curPage = curPage
            }

            function getCleanPath() {
                return $location.$$path.replace(/\/offset\/[0-9]+$/, "")
            }

            function offsetByPageNum(pageNum) {
                pageNum = pageNum || 0;
                var offsetPage = pageNum > 1 ? pageNum - 1 : 0;
                return offsetPage * params.perPage
            }

            var locationPath = getCleanPath();
            $scope.renderHref = function (pageNum) {
                return"#" + locationPath + "/offset/" + offsetByPageNum(pageNum)
            }
        }}
    }]).directive("datepicker", [function () {
        return{restrict: "E", replace: true, template: "<div>" + '<select ng-model="day" ng-change="onDayChange()" class="b-field__type day" ng-disabled="disabled">' + '<option ng-repeat="d in days" value="[[d]]" ng-selected="d == day">[[d]]</option>' + "</select>" + '<select ng-model="month" ng-change="onMonthChange()" class="b-field__type month" ng-disabled="disabled">' + '<option ng-repeat="m in months" value="[[m.v]]" ng-selected="m.v == month">[[m.label]]</option>' + "</select>" + '<select ng-model="year" ng-change="onYearChange()" class="b-field__type year" ng-disabled="disabled">' + '<option ng-repeat="y in years" value="[[y]]" ng-selected="y == year">[[y]]</option>' + "</select>" + "</div>", link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var params = {dateFrom: null, dateTo: null, value: null, isEnabled: true, monthNames: []};
            for (var k in params) {
                if (params.hasOwnProperty(k) && k != "monthNames") {
                    !function () {
                        var key = k;
                        attrs.$observe(key, function (value) {
                            if (!value) {
                                return
                            }
                            if (key === "isEnabled") {
                                value = $scope.$eval(value)
                            }
                            params[key] = value;
                            if (key in{dateFrom: 1, dateTo: 1, value: 1, isEnabled: 1}) {
                                if (params.dateFrom && params.dateTo && params.monthNames) {
                                    render()
                                }
                            } else {
                                $scope[key] = params[key]
                            }
                        })
                    }()
                }
            }
            var field, blockField;
            attrs.$observe("datepickerModel", function (value) {
                if (!value) {
                    return
                }
                $scope.$watch("field_", function (data) {
                    if (!data) {
                        return
                    }
                    field = data.field;
                    setModelData(params.dateTo || "")
                });
                $scope.$watch("block", function (data) {
                    if (!data) {
                        return
                    }
                    blockField = data.field;
                    setModelData(params.dateTo || "")
                })
            });
            attrs.$observe("monthNames", function (value) {
                if (!value) {
                    return
                }
                value = $scope.$eval(value);
                params.monthNames = value || [];
                if (params.dateFrom && params.dateTo && params.monthNames) {
                    render()
                }
            });
            function render() {
                var dateFrom = new Date(params.dateFrom), dateTo = new Date(params.dateTo), yearFrom = dateFrom.getFullYear(), yearTo = dateTo.getFullYear(), monthFrom = dateFrom.getMonth(), monthTo = dateTo.getMonth(), dayFrom = dateFrom.getDate(), dayTo = dateTo.getDate(), selectedYear = yearTo, selectedMonth = monthTo, selectedDay = dayTo;
                $scope.disabled = !params.isEnabled;
                var years = [], months, days;
                for (var i = yearTo; i >= yearFrom; i--) {
                    years.push(i)
                }
                $scope.years = years;
                function setMonths() {
                    var mFrom = 0, mTo = 11, names = params.monthNames || [];
                    months = [];
                    if (selectedYear == yearFrom) {
                        mFrom = monthFrom
                    }
                    if (selectedYear == yearTo) {
                        mTo = monthTo
                    }
                    for (var i = mFrom; i <= mTo; i++) {
                        months.push({v: i + 1, label: i in names ? names[i] : i + 1})
                    }
                    $scope.months = months;
                    if ($scope.month < mFrom + 1) {
                        $scope.month = mFrom + 1
                    } else if ($scope.month > mTo + 1) {
                        $scope.month = mTo + 1
                    }
                }

                function setDays() {
                    var dFrom = 1, dTo = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                    days = [];
                    if (selectedYear == yearFrom && selectedMonth == monthFrom) {
                        dFrom = dayFrom
                    }
                    if (selectedYear == yearTo && selectedMonth == monthTo) {
                        dTo = dayTo
                    }
                    for (var i = dFrom; i <= dTo; i++) {
                        days.push(i)
                    }
                    $scope.days = days;
                    if ($scope.day < dFrom) {
                        $scope.day = dFrom
                    } else if ($scope.day > dTo) {
                        $scope.day = dTo
                    }
                }

                $scope.onYearChange = function () {
                    selectedYear = $scope.year;
                    setMonths();
                    setDays();
                    setModelData()
                };
                $scope.onMonthChange = function () {
                    selectedMonth = $scope.month - 1;
                    setDays();
                    setModelData()
                };
                $scope.onDayChange = function () {
                    selectedDay = $scope.day;
                    setModelData()
                };
                if (params.value) {
                    var t = new Date(params.value);
                    if (t < dateTo && t > dateFrom) {
                        selectedYear = t.getFullYear();
                        selectedMonth = t.getMonth();
                        selectedDay = t.getDate()
                    }
                }
                setMonths();
                setDays();
                $scope.year = selectedYear;
                $scope.month = selectedMonth + 1;
                $scope.day = selectedDay;
                setModelData()
            }

            function setModelData(string) {
                if (field && blockField) {
                    var val = "";
                    if (string !== undefined) {
                        val = string
                    } else if ($scope.year && $scope.month && $scope.day) {
                        var m = $scope.month, d = $scope.day;
                        val = $scope.year + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d)
                    }
                    $scope.Blocks[blockField][field] = val
                }
            }
        }}
    }]).directive("checkboxModel", [function () {
        return{restrict: "A", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            attrs.$observe("checkboxModel", function (value) {
                if (!value) {
                    return
                }
                $scope.variants = $scope.field_.variants;
                var blockField = $scope.$eval("block.field");
                var field = $scope.$eval("field_.field");
                $scope.$watch("variants", function (values) {
                    var selectedVals = [];
                    angular.forEach($scope.variants, function (v, i) {
                        if (v.selected) {
                            selectedVals.push(v.key)
                        }
                        $scope.$watch("variants[i]", function (value) {
                        })
                    });
                    $scope.Blocks[blockField][field] = selectedVals
                }, true)
            })
        }}
    }]).directive("carousel", ["$rootScope", function ($rootScope) {
        return{restrict: "AE", replace: true, scope: {}, templateUrl: fixTplUrl("partials/carousel.html"), link: function ($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var params = {photos: [], startWith: undefined, show: false, cycle: false, extra: {}}, $img = $el.find("li"), loadedImagesBySrc = {};
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    !function () {
                        var key = k;
                        attrs.$observe(key, function (value) {
                            if (!value) {
                                return
                            }
                            $scope.$parent.$watch(value, function (value) {
                                params[key] = value;
                                if (params.photos && params.photos.length && params.startWith !== undefined && params.show && params.cycle !== undefined) {
                                    render()
                                } else if (!params.show && $scope.showCarousel_ == true) {
                                    closeCarousel()
                                }
                            })
                        })
                    }()
                }
            }
            function render() {
                var startWith = params.startWith > 0 && params.startWith < params.photos.length ? params.startWith : 0, currentPos = startWith, lastPos = -1;
                $scope.showCarousel_ = true;
                $rootScope.hidePageForPopup = true;
                showCurrentPhoto();
                function showCurrentPhoto() {
                    if (!params.photos[currentPos]) {
                        currentPos = 0;
                        if (!params.photos[currentPos]) {
                            closeCarousel()
                        }
                    }
                    var photo = params.photos[currentPos], src = photo.hugePhotoUrl;
                    setArrows();
                    $img.removeClass("img-not-loaded");
                    if (loadedImagesBySrc[src]) {
                        setSrc(src)
                    } else {
                        $img.addClass("img-preload");
                        $img.removeAttr("src");
                        var img = new Image;
                        img.onload = function () {
                            if (img.width) {
                                $img.removeClass("img-preload");
                                setSrc(img.src);
                                loadedImagesBySrc[src] = true
                            } else {
                                this.onerror()
                            }
                        };
                        img.onerror = function () {
                            $img.removeClass("img-preload");
                            $img.addClass("img-not-loaded");
                            backToLastPos()
                        };
                        img.src = src
                    }
                    setModerationStatus(photo);
                    $scope.photoDescription = photo.name;
                    $scope.extra = params.extra ? params.extra : {};
                    $scope.extraTypeSimple = $scope.extra.type === "simple";
                    if ($scope.extra.showEditBtn && $scope.extra.anketa && $scope.extra.album && photo.status !== "Blocked") {
                        $scope.editUrl = "/users/" + $scope.extra.anketa.id + "/albums/" + $scope.extra.album.id + "/edit_photo/" + currentPos
                    }
                }

                function getNextPos() {
                    var newPos = 0;
                    if (currentPos < params.photos.length - 1) {
                        newPos = +currentPos + 1
                    }
                    return params.cycle || newPos != startWith ? newPos : false
                }

                function getPrevPos() {
                    var newPos = +currentPos - 1;
                    if (newPos < 0) {
                        newPos = params.photos.length - 1
                    }
                    return params.cycle || currentPos != startWith ? newPos : false
                }

                function setModerationStatus(photo) {
                    $scope.photoStatus = "Approved";
                    if (photo.status in{Moderating: 1, Blocked: 1}) {
                        $scope.photoStatus = photo.status
                    }
                }

                function setArrows() {
                    $scope.showArrowLeft = getPrevPos() !== false;
                    $scope.showArrowRight = getNextPos() !== false
                }

                function setSrc(src) {
                    $img.attr("style", "background-image: url('" + src + "')")
                }

                function backToLastPos() {
                    if (lastPos > -1) {
                        currentPos = lastPos;
                        setArrows();
                        if (!$scope.$$phase) {
                            $scope.$digest()
                        }
                    }
                }

                $scope.moveLeft = function () {
                    var pos = getPrevPos();
                    if (pos !== false) {
                        lastPos = currentPos;
                        currentPos = pos;
                        showCurrentPhoto()
                    }
                };
                $scope.moveRight = function () {
                    var pos = getNextPos();
                    if (pos !== false) {
                        lastPos = currentPos;
                        currentPos = pos;
                        showCurrentPhoto()
                    }
                };
                $scope.close = function close() {
                    closeCarousel()
                }
            }

            function closeCarousel() {
                loadedImagesBySrc = {};
                $img.attr("src", "");
                $scope.showArrowLeft = $scope.showArrowRight = $scope.showCarousel_ = false;
                $rootScope.hidePageForPopup = false
            }
        }}
    }]).directive("ngSrcPreload", [function () {
        return{restrict: "A", link: function (scope, $el, attrs) {
            scope._ = scope.$root._;
            $el.addClass("img-empty");
            attrs.$observe("ngSrcPreload", function (value) {
                if (!value) {
                    return
                }
                $el.addClass("b-loader");
                $el.removeClass("img-empty");
                var img = new Image;
                img.onload = function () {
                    if (img.width) {
                        $el.removeClass("b-loader");
                        $el.attr("src", value)
                    } else {
                        this.onerror()
                    }
                };
                img.onerror = function () {
                    $el.removeClass("b-loader");
                    $el.addClass("img-not-loaded")
                };
                img.src = value
            })
        }}
    }]).directive("unreadMessages", ["Translation", function (Translation) {
        return{restrict: "AE", replace: true, scope: {count: "="}, template: '<span class="status orange" ng-show="count != 0"><ng-pluralize count="count" ' + 'when="{one: &quot;{} ' + Translation.MESSAGES_NEW.ONE + "&quot;, few: &quot;{} " + Translation.MESSAGES_NEW.FEW + "&quot;, many: &quot;{} " + Translation.MESSAGES_NEW.MANY + "&quot;, other: &quot;{} " + Translation.MESSAGES_NEW.OTHER + '&quot;}"' + "></ng-pluralize></span>", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._
        }}
    }]).directive("uploadPhoto", ["$rootScope", "FlashMsgService", "Translation", "PhotoUploadUrlService", "PhotoUploaderService", function ($rootScope, FlashMsgService, Translation, PhotoUploadUrlService, PhotoUploaderService) {
        return{restrict: "AE", scope: {ngShow: "=ngShow", uploadPhotoAlbum: "=uploadPhotoAlbum"}, transclude: true, template: '<form class="b-form b-form__upload" method="post" action="[[uploadUrl]]" enctype="multipart/form-data" encoding="multipart/form-data" ng-hide="notSupported">' + "<div ng-transclude></div>" + '<input class="b-button__upload" type="file" name="photo" accept="image/*">' + '<div class="b-loader_bar" style="width: [[100 - progressWidth]]%;" ng-show="showProgress"></div>' + "</form>", controller: function controller($scope) {
            $scope._ = $scope.$root._;
            $scope.$watch("progressWidth", function (progressWidth) {
                $scope.showProgress = progressWidth && progressWidth < 100
            });
            $scope.upload = function upload($form) {
                var files = $scope.files;
                if (files.length) {
                    PhotoUploadUrlService.get(function (response) {
                        $scope.uploadUrl = response.uploadUrl;
                        var uploader = PhotoUploaderService({onStart: onStart, onLoad: onLoad, onError: onError, onComplete: onComplete, onProgress: onProgress});
                        if ($scope.uploadPhotoAlbum) {
                            $scope.uploadUrl += "&albumId=" + $scope.uploadPhotoAlbum.id
                        }
                        uploader.upload($form, $scope.uploadUrl, $scope.files)
                    })
                }
            };
            function onStart(file) {
                $scope.progressWidth = 0
            }

            function onLoad(e, file, response) {
                var msg = Translation.MISC.PHOTO_LOADED;
                try {
                    var responseObj = angular.fromJson(response)
                } catch (e) {
                }
                if (responseObj) {
                    if ("message"in responseObj) {
                        msg = responseObj.message
                    } else if ("error"in responseObj || "errorCode"in responseObj) {
                        return onError(e, file)
                    }
                }
                $scope.$emit("photo_upload.finished", {album: $scope.uploadPhotoAlbum || false, file: file});
                FlashMsgService.showMessage(msg, true)
            }

            function onError(e, file, response) {
                var msg = angular.isString(response) ? response : Translation.PHOTO_LOAD_ERRORS.DEFAULT;
                if (angular.isObject(response) && "httpStatus"in response) {
                    switch (response.httpStatus) {
                        case 413:
                            msg = Translation.PHOTO_LOAD_ERRORS.TOO_BIG;
                            break;
                        default:
                            msg = Translation.PHOTO_LOAD_ERRORS.DEFAULT
                    }
                }
                $scope.$emit("photo_upload.failed", {album: $scope.uploadPhotoAlbum || false, file: file});
                FlashMsgService.showError(msg, true)
            }

            function onComplete(e, file) {
                $scope.progressWidth = 100
            }

            function onProgress(e, file) {
                if (e.total) {
                    var percent = e.loaded / e.total * 100;
                    percent = percent > 100 ? 100 : percent;
                    $scope.progressWidth = percent
                }
            }
        }, link: function link($scope, $el, attrs) {
            if (!PhotoUploaderService().checkCanUpload()) {
                $scope.notSupported = true;
                return
            }
            $scope.$watch("ngShow", function (ngShow) {
                if (ngShow) {
                    $el.css("display", "inline-block")
                }
            });
            var $form = $el.find("form"), $input = $el.find("input");
            $input.bind("change", function onFileChosen(e) {
                $scope.files = e.target.files;
                $scope.upload($form)
            })
        }}
    }]).directive("profileControlPanel", ["$rootScope", "FlashMsgService", "ProfileDataService", function profileControlPanel($rootScope, FlashMsgService, ProfileDataService) {
        return{restrict: "AE", replace: true, template: '<div class="b-panel">' + '<div class="b-panel_item" ng-show="showPlace">' + '<a class="b-panel_item-inner" ng-show="profile.place" href="#/showcases/maketop"><i class="icon i-riseup"></i>[[session.profile.place]]</a>' + '<a class="b-panel_item-inner" ng-show="profile.placeHint" href="javascript:;" ng-click="showFullHint()"><i class="icon i-search__no"></i></a>' + "</div>" + '<div class="b-panel_item" ng-show="showBalance">' + '<a class="b-panel_item-inner" href="#/profile/account">[[profile.accountBalance]]<i class="icon i-coints"></i></a>' + "</div>" + '<div class="b-panel_item b-panel_item__fixed" ng-class="{active: pageType == \'settings\'}">' + '<a class="b-panel_item-inner b-panel__link-icon" href="#/profile/settings"><i class="icon i-settings__blue"></i></a>' + "</div>" + "</div>", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var profile = $scope.profile = ProfileDataService.get();
            $scope.showBalance = profile && "accountBalance"in profile;
            $scope.showPlace = profile && ("place"in profile || "placeHint"in profile)
        }, controller: function controller($scope) {
            $scope.showFullHint = function showFullHint() {
                if ($scope.profile.placeHint) {
                    FlashMsgService.showMessage($scope.profile.placeHint)
                }
            }
        }}
    }]).directive("formatTime", ["Translation", function formatTime(Translation) {
        var rHours = /^[0-9]+h$/, rMinutes = /^[0-9]+m$/;
        return{restrict: "AE", scope: {value: "=formatTime"}, template: "<span>" + '<ng-pluralize count="hours" ng-show="hours" ' + 'when="{one: &quot;{} ' + Translation.TIME.HOURS_AGO.ONE + "&quot;, few: &quot;{} " + Translation.TIME.HOURS_AGO.FEW + "&quot;, many: &quot;{} " + Translation.TIME.HOURS_AGO.MANY + "&quot;, other: &quot;{} " + Translation.TIME.HOURS_AGO.OTHER + '&quot;}"' + "></ng-pluralize>" + '<ng-pluralize count="minutes" ng-show="minutes" ' + 'when="{one: &quot;{} ' + Translation.TIME.MINUTES_AGO.ONE + "&quot;, few: &quot;{} " + Translation.TIME.MINUTES_AGO.FEW + "&quot;, many: &quot;{} " + Translation.TIME.MINUTES_AGO.MANY + "&quot;, other: &quot;{} " + Translation.TIME.MINUTES_AGO.OTHER + '&quot;}"' + '"></ng-pluralize>' + '<span ng-show="cleanVal">[[cleanVal]]</span>' + "</span>", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            $scope.$watch("value", function (value) {
                if (!value) {
                    return
                }
                $scope.hours = $scope.minutes = $scope.cleanVal = null;
                if (rHours.test(value)) {
                    $scope.hours = parseInt(value, 10)
                } else if (rMinutes.test(value)) {
                    $scope.minutes = parseInt(value, 10)
                } else {
                    $scope.cleanVal = value
                }
            })
        }}
    }]).directive("captcha", ["SessionLocal", "$rootScope", function (SessionLocal, $rootScope) {
        return{restrict: "AE", replace: true, templateUrl: "ng-template-captcha", link: function link($scope, $el, attrs) {
            $scope._ = $scope.$root._;
            var showWhenRootScopeName;
            attrs.$observe("showWhen", function (showWhen) {
                if (showWhen === undefined) {
                    return
                }
                showWhenRootScopeName = showWhen;
                $scope.$watch(showWhen, function (value) {
                    if (value) {
                        $scope.getCaptcha()
                    }
                })
            });
            $scope.getCaptcha = function getCaptcha() {
                $scope.src = "/mobile/api/v5.1.1.1/captcha?sid=" + SessionLocal.getSid() + "&v=" + Math.random()
            };
            $scope.saveVal = function saveVal() {
                $rootScope.captchaEnteredValue = $scope.mCaptcha;
                $rootScope[showWhenRootScopeName] = false
            }
        }}
    }]).directive("inlineAd", ["$rootScope", "$route", "$timeout", "$compile", "$templateCache", "ProfileDataService", function ($rootScope, $route, $timeout, $compile, $templateCache, ProfileDataService) {
        var templateUrl = "ng-template-inline_ad";
        return{restrict: "AE", replace: true, scope: {frameSrcBase: "@frameSrcBase", position: "@position", showAd: "=showAd"}, templateUrl: templateUrl, link: function link($scope, $el, attrs) {
            var anketaId;
            $scope.$watch("frameSrcBase + position + showAd", function () {
                render()
            });
            function render() {
                if (angular.isDefined($scope.frameSrcBase) && angular.isDefined($scope.position)) {
                    anketaId = ProfileDataService.anketaId();
                    if (checkCanShow()) {
                        $scope.showFrame = true;
                        setSrc()
                    } else {
                        $scope.showFrame = false
                    }
                }
            }

            function checkCanShow() {
                if ($scope.showAd) {
                    return true
                }
                return false
            }

            var setAlready = false;
            var cachedTemplate;

            function setSrc() {
                if (setAlready) {
                    cachedTemplate = cachedTemplate || $templateCache.get(templateUrl);
                    var $newEl = $compile(cachedTemplate)($scope);
                    $el.replaceWith($newEl);
                    $el = $newEl
                }
                setAlready = true;
                var obj = {pid: $scope.position || 91, aid: anketaId || null, partner: window.$partner_id || 81449119, oper: window.$operator_id || null, phone: window.$phone_id || null, ilang: window.$lang_id_num || null, nohead: 1};
                var str = "";
                angular.forEach(obj, function (v, k) {
                    if (v !== null) {
                        if (str.length) {
                            str += "&"
                        }
                        str += k + "=" + v
                    }
                });
                $scope.frameSrc = $scope.frameSrcBase + "?" + str
            }
        }}
    }]);
    angular.forEach(["Touchstart", "Touchend"], function (eName) {
        var aName = "ng" + eName, eName = eName.toLowerCase();
        directives.directive(aName, ["$parse", function ($parse) {
            return{restrict: "A", link: function link($scope, $element, attrs) {
                var fn = $parse(attrs[aName]);
                $element.bind(eName, function ($event) {
                    $scope.$apply(function () {
                        fn($scope, {$event: $event})
                    })
                })
            }}
        }])
    })
}();
"use strict";
angular.module("CommonFilters", ["ngLocale"]).filter("empty_avatar", [function () {
    return function empty_avatar(anketaData) {
        return fixImgUrl("i/no-photo.gif")
    }
}]).filter("avatar", [function () {
    return function avatar(anketaData) {
        if (!anketaData) {
            return""
        }
        return anketaData.squarePhotoUrl || anketaData.photo && anketaData.photo.squarePhotoUrl || fixImgUrl("i/no-photo.gif")
    }
}]).filter("gift_photo", [function () {
    return function gift_photo(name) {
        if (!name) {
            return""
        }
        return"http://images.wambacdn.net/images/upload/gifts/" + name + ".png"
    }
}]).filter("month_names", ["$locale", function ($locale) {
    return function month_names() {
        return $locale.DATETIME_FORMATS.MONTH
    }
}]).filter("range", [function () {
    return function range(input, min, max, step) {
        min = parseInt(min, 10);
        max = parseInt(max, 10);
        step = parseInt(step, 10) || 1;
        for (var i = min; i <= max; i += step) {
            input.push(i)
        }
        return input
    }
}]).filter("range_no_answer", ["Translation", function (Translation) {
    return function range(input, min, max, step) {
        input.push({k: Translation.FORMBUILDER.NO_ANSWER, v: 0});
        min = parseInt(min, 10);
        max = parseInt(max, 10);
        step = parseInt(step, 10) || 1;
        for (var i = min; i <= max; i += step) {
            input.push({k: i, v: i})
        }
        return input
    }
}]).filter("formatTime", ["$filter", "Translation", function ($filter, Translation) {
    var reDt = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    function isValid(dt) {
        if (Object.prototype.toString.call(dt) === "[object Date]" && !isNaN(dt.getTime())) {
            return true
        }
        return false
    }

    function asDate(input) {
        var dt = new Date(input);
        if (!isValid(dt) && reDt.test(input)) {
            dt = new Date(input.replace(" ", "T"));
            dt.setTime(dt.getTime() + dt.getTimezoneOffset() * 60 * 1e3)
        }
        return dt
    }

    return function formatTime(input, nowStr) {
        var date = asDate(input), dateNow = angular.isDefined(nowStr) ? new Date(nowStr) : new Date, diff = dateNow - date, perDay = 864e5, perHour = 36e5, perMinute = 6e4, d;
        if (!isValid(date) || diff < 0) {
            return input
        }
        if (diff / perDay > 1) {
            d = new Date(dateNow.toISOString());
            d.setDate(d.getDate() - 1);
            if (d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()) {
                return Translation.TIME.YESTERDAY + ", " + $filter("date")(date, "H:mm")
            } else {
                if (date.getFullYear() !== dateNow.getFullYear()) {
                    return $filter("date")(date, "d MMMM y, H:mm")
                }
                return $filter("date")(date, "d MMMM, H:mm")
            }
        } else if (diff / perHour > 1) {
            return Math.floor(diff / perHour) + "h"
        } else if (diff / perMinute > 1) {
            return Math.floor(diff / perMinute) + "m"
        }
        return Translation.TIME.JUST_NOW
    }
}]).filter("shorten", [function () {
    var LEN_DEFAULT = 20, END_DEFAULT = "...";
    return function shorten(input, len, endWith) {
        len = len || LEN_DEFAULT;
        if (!input || !angular.isString(input) || input.length <= len) {
            return input
        }
        if (endWith === undefined) {
            endWith = END_DEFAULT
        }
        var lenCut = len - endWith.length;
        if (lenCut <= 0) {
            lenCut = 1
        }
        return input.substr(0, lenCut) + endWith
    }
}]).filter("shorten_by_long_word", [function () {
    var LEN_DEFAULT = 20, END_DEFAULT = "...";
    return function shorten_by_long_word(input, len, endWith) {
        len = len || LEN_DEFAULT;
        if (!input || !angular.isString(input) || input.length <= len) {
            return input
        }
        if (endWith === undefined) {
            endWith = END_DEFAULT
        }
        var words = input.split(/[\s\-]/), longWord;
        for (var i = 0, l = words.length; i < l && !longWord; i++) {
            if (words[i].length > len) {
                longWord = words[i]
            }
        }
        if (longWord) {
            var longWordStart = input.indexOf(longWord);
            return input.substr(0, longWordStart + len - endWith.length) + endWith
        }
        return input
    }
}]);
!function () {
    "use strict";
    var staticPathPrefix = window.$static_end_point || "/ru/mobile/touch/app/", tplPathPrefix = window.$template_end_point || "views/", tplSuffix = window.$tpl_suf || "", cacheVersion = window.$cache_version || Math.random();
    window.fixTplUrl = function fixTplUrl(url) {
        return tplPathPrefix + (url || "") + tplSuffix + "?v=" + cacheVersion
    };
    window.fixImgUrl = function fixImgUrl(url) {
        if (!url || url.substr(0, 7) === "http://" || url.substr(0, 8) === "https://") {
            return url
        }
        return staticPathPrefix + (url || "")
    }
}();
!function () {
    "use strict";
    var app = angular.module("touch", ["CommonFilters", "CommonServices", "CommonDirectives", "CommonControllers", "ngCookies", "AuthModule", "ProfileModule", "UserModule", "ChatModule", "AlbumModule", "SettingsModule", "SearchModule", "ProductsModule", "FeedbackModule", "MambaTranslations"]);
    if (window.bugsense) {
        app.factory("$exceptionHandler", [function () {
            return function (exception, cause) {
                bugsense.notify(exception, cause)
            }
        }])
    }
    app.config(["$routeProvider", "$interpolateProvider", function ($routeProvider, $interpolateProvider) {
        $interpolateProvider.startSymbol("[[").endSymbol("]]");
        $routeProvider.when("/profile", {templateUrl: fixTplUrl("users/card.html"), controller: "UserDetailCtrl", page: "profile", activetab: "profile"}).when("/profile/question_groups", {templateUrl: fixTplUrl("users/profile/question_group.html"), controller: "ProfileQuestionGroupCtrl", page: "question_groups", activetab: "profile"}).when("/hitlist", {templateUrl: fixTplUrl("users/profile/hitlist.html"), controller: "HitListCtrl", page: "hit_list", pageType: "hitlist"}).when("/hitlist/offset/:offset", {templateUrl: fixTplUrl("users/profile/hitlist.html"), controller: "HitListCtrl", page: "hit_list", pageType: "hitlist"}).when("/profile/settings/:tag", {templateUrl: fixTplUrl("users/profile/settings_edit.html"), controller: "SettingsTagCtrl", page: "settings_form", pageType: "settings"}).when("/profile/settings/:tag/:extra", {templateUrl: fixTplUrl("users/profile/settings_edit.html"), controller: "SettingsTagCtrl", page: "settings_form_special", pageType: "settings"}).when("/profile/settings", {templateUrl: fixTplUrl("users/profile/settings_menu.html"), controller: "SettingsCtrl", page: "settings_list", pageType: "settings"}).when("/profile/account", {templateUrl: fixTplUrl("users/profile/account.html"), controller: "AccountCtrl", page: "account"}).when("/users/:anketa_id", {templateUrl: fixTplUrl("users/card.html"), controller: "UserDetailCtrl", page: "user_card"}).when("/users/:anketa_id/gifts", {templateUrl: fixTplUrl("users/gifts.html"), controller: "UserGiftsCtrl", page: "user_gifts"}).when("/users/:anketa_id/gifts/offset/:offset", {templateUrl: fixTplUrl("users/gifts.html"), controller: "UserGiftsCtrl", page: "user_gifts"}).when("/users/:anketa_id/albums/:album_id", {templateUrl: fixTplUrl("albums/card.html"), controller: "AlbumCardCtrl", page: "user_album"}).when("/users/:anketa_id/albums/:album_id/fullscreen", {templateUrl: fixTplUrl("albums/fullscreen.html"), controller: "AlbumFullScreenCtrl", page: "user_album_fullscreen"}).when("/users/:anketa_id/albums/:album_id/fullscreen/:start_with", {templateUrl: fixTplUrl("albums/fullscreen.html"), controller: "AlbumFullScreenCtrl", page: "user_album_fullscreen"}).when("/users/:anketa_id/albums/:album_id/fullscreen_by_id/:start_with_id", {templateUrl: fixTplUrl("albums/fullscreen.html"), controller: "AlbumFullScreenCtrl", page: "user_album_fullscreen"}).when("/users/:anketa_id/albums/:album_id/edit_photo/:pos", {templateUrl: fixTplUrl("albums/edit_photo.html"), controller: "AlbumEditPhotoCtrl", page: "user_album_edit_photo"}).when("/users/:anketa_id/albums/:album_id/edit", {templateUrl: fixTplUrl("albums/edit.html"), controller: "AlbumEditCtrl", page: "user_album_edit"}).when("/albums/add", {templateUrl: fixTplUrl("albums/edit.html"), controller: "AlbumAddCtrl", page: "user_album_add"}).when("/users/:anketa_id/albums", {templateUrl: fixTplUrl("albums/index.html"), controller: "AlbumListCtrl", page: "user_album_list"}).when("/auth", {templateUrl: fixTplUrl("auth/auth.html"), controller: "LoginCtrl", page: "auth_form", isSpecialForm: true}).when("/restore_password", {templateUrl: fixTplUrl("auth/restore_password.html"), controller: "RestorePasswordCtrl", page: "restore_password", isSpecialForm: true}).when("/logout", {template: "<div></div>", controller: "LogoutCtrl"}).when("/register", {templateUrl: fixTplUrl("auth/reg.html"), controller: "RegisterCtrl", page: "reg_form", isSpecialForm: true}).when("/register/confirm", {templateUrl: fixTplUrl("auth/reg_confirm.html"), controller: "RegisterConfirmCtrl", page: "reg_confirm"}).when("/register/get_real", {templateUrl: fixTplUrl("auth/get_real.html"), controller: "GetRealCtrl", page: "get_real"}).when("/register/confirmed_by/:confirmedBy", {templateUrl: fixTplUrl("auth/reg_confirmed_by.html"), controller: "RegisterConfirmedByCtrl", page: "reg_confirmed_by"}).when("/top", {templateUrl: fixTplUrl("top.html"), controller: "TopCtrl", page: "top"}).when("/search", {templateUrl: fixTplUrl("search/res.html"), controller: "SearchResCtrl", page: "search_res", pageType: "search"}).when("/search/form", {templateUrl: fixTplUrl("search/form.html"), controller: "SearchFormCtrl", page: "search_form", pageType: "search"}).when("/search/:tag", {templateUrl: fixTplUrl("search/res.html"), controller: "SearchResCtrl", page: "search_res", pageType: "search"}).when("/search/:tag/offset/:offset", {templateUrl: fixTplUrl("search/res.html"), controller: "SearchResCtrl", page: "search_res", pageType: "search"}).when("/search/offset/:offset", {templateUrl: fixTplUrl("search/res.html"), controller: "SearchResCtrl", page: "search_res", pageType: "search"}).when("/chat_by_anketa/:anketa_id", {templateUrl: fixTplUrl("messages/chat.html"), controller: "ChatCtrl", page: "msg_chat", pageType: "msg"}).when("/chat_by_contact/:contact_id/:anketa_id", {templateUrl: fixTplUrl("messages/chat.html"), controller: "ChatCtrl", page: "msg_chat", pageType: "msg"}).when("/folders", {templateUrl: fixTplUrl("messages/folders/list.html"), controller: "FolderListCtrl", page: "msg_folder_list", pageType: "msg"}).when("/folders/:folder_id/edit", {templateUrl: fixTplUrl("messages/folders/edit.html"), controller: "FolderEditCtrl", page: "msg_folder_edit", pageType: "msg"}).when("/folders/new", {templateUrl: fixTplUrl("messages/folders/edit.html"), controller: "FolderEditCtrl", page: "msg_folder_add", pageType: "msg"}).when("/folders/:folder_id", {templateUrl: fixTplUrl("messages/folders/card.html"), controller: "FolderCardCtrl", page: "msg_folder_card", pageType: "msg"}).when("/folders/:folder_id/offset/:offset", {templateUrl: fixTplUrl("messages/folders/card.html"), controller: "FolderCardCtrl", page: "msg_folder_card", pageType: "msg"}).when("/notifications", {templateUrl: fixTplUrl("messages/notifications/section_list.html"), controller: "NotificationCardCtrl", page: "msg_notification_card", pageType: "notification"}).when("/notifications/:tag", {templateUrl: fixTplUrl("messages/notifications/section_card.html"), controller: "NotificationCardCtrl", page: "msg_notification_card", pageType: "notification"}).when("/notifications/:tag/offset/:offset", {templateUrl: fixTplUrl("messages/notifications/section_card.html"), controller: "NotificationCardCtrl", page: "msg_notification_card", pageType: "notification"}).when("/showcases/vip", {templateUrl: fixTplUrl("showcases/vip.html"), controller: "VipShowcaseCtrl", page: "showcase_vip"}).when("/showcases/vip/:anketa_id", {templateUrl: fixTplUrl("showcases/vip.html"), controller: "VipShowcaseCtrl", page: "showcase_vip"}).when("/showcases/maketop", {templateUrl: fixTplUrl("showcases/maketop.html"), controller: "MakeTopShowcaseCtrl", page: "showcase_maketop"}).when("/showcases/maketop/:anketa_id", {templateUrl: fixTplUrl("showcases/maketop.html"), controller: "MakeTopShowcaseCtrl", page: "showcase_maketop"}).when("/showcases/gift/:anketa_id", {templateUrl: fixTplUrl("showcases/gifts.html"), controller: "GiftListShowcaseCtrl", page: "showcase_gift"}).when("/showcases/gift/:anketa_id/pay", {templateUrl: fixTplUrl("showcases/gift.html"), controller: "GiftShowcaseCtrl", page: "showcase_gift_pay"}).when("/showcases/account_recharge", {templateUrl: fixTplUrl("showcases/account_recharge.html"), controller: "AccountRechargeShowcaseCtrl", page: "showcase_recharge_account"}).when("/feedback", {templateUrl: fixTplUrl("feedback/form.html"), controller: "FeedbackSendCtrl", page: "feedback"}).when("/tips/vip", {templateUrl: fixTplUrl("tips/vip.html"), controller: "StaticCtrl", page: "tips_vip"}).when("/tips/question_group_rejected", {templateUrl: fixTplUrl("tips/question_group_rejected.html"), controller: "StaticCtrl", page: "tips_question_group"}).when("/tips/agreement", {templateUrl: fixTplUrl("tips/agreement.html"), controller: "StaticCtrl", page: "tips_agreement"}).when("/tips/feedback_success", {templateUrl: fixTplUrl("tips/feedback_success.html"), controller: "StaticCtrl", page: "tips_feedback_success"}).when("/tips/no_photo", {templateUrl: fixTplUrl("tips/no_photo.html"), controller: "StaticCtrl", page: "tips_no_photo"}).when("/tips/no_anketa", {templateUrl: fixTplUrl("tips/no_anketa.html"), controller: "StaticCtrl", page: "tips_no_anketa"}).when("/tips/auth_required", {templateUrl: fixTplUrl("tips/auth_required.html"), controller: "StaticCtrl", page: "tips_auth_required"}).when("/tips/you_are_deleted", {templateUrl: fixTplUrl("tips/you_are_deleted.html"), controller: "StaticCtrl", page: "tips_you_are_deleted"}).when("/tips/vip_required", {templateUrl: fixTplUrl("tips/vip_required.html"), controller: "StaticCtrl", page: "tips_vip_required"}).when("/tips/account_recharge_success", {templateUrl: fixTplUrl("tips/account_recharge_success.html"), controller: "StaticCtrl", page: "tips_account_recharge_success"}).when("/tips/account_recharge_failure", {templateUrl: fixTplUrl("tips/account_recharge_failure.html"), controller: "StaticCtrl", page: "tips_account_recharge_failure"}).when("/tips/info_terminal", {templateUrl: fixTplUrl("tips/info_terminal.html"), controller: "StaticCtrl", page: "info_terminal"}).otherwise({redirectTo: "/top"})
    }]);
    app.run(["$rootScope", "$location", "$route", "Session", "SessionLocal", "BrowserHistoryService", "FlashMsgService", "LangSwitcherService", "PopupTipService", "GeoUpdateService", function ($rootScope, $location, $route, Session, SessionLocal, BrowserHistoryService, FlashMsgService, LangSwitcherService, PopupTipService, GeoUpdateService) {
        $rootScope.$on("$locationChangeStart", function (e, next, current) {
            if (SessionLocal.getSid()) {
                SessionLocal.checkAndSetSid(window.$mmbsid)
            } else {
                e.preventDefault();
                Session.get(function (response) {
                    SessionLocal.put(response);
                    SessionLocal.checkAndSetSid(window.$mmbsid);
                    $location.path($location.url());
                    $location.$$parse(next);
                    $rootScope.$broadcast("$locationChangeSuccess", next, current);
                    $rootScope.$broadcast("session_loaded")
                })
            }
            setServerLang()
        });
        $rootScope.$watch("captchaNeeded + showPopupTip + controllerDataLoaded + controllerDataLoadError + routeError", function () {
            $rootScope.hideMainView = $rootScope.captchaNeeded || $rootScope.showPopupTip || !$rootScope.controllerDataLoaded || $rootScope.controllerDataLoadError || $rootScope.routeError
        });
        $rootScope.$on("$locationChangeSuccess", function (e, current, previous) {
            trackPageView();
            BrowserHistoryService.save($location.url())
        });
        $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
            $rootScope.isSpecialForm = current.$$route ? current.$$route.isSpecialForm : false;
            FlashMsgService.flush();
            $rootScope.pageType = current.pageType;
            $rootScope.pageId = current.page;
            $rootScope.showSidebar = false;
            resetRootScopeVars();
            GeoUpdateService.updateAndSaveCoords();
            $rootScope.middleAdShown = false
        });
        function trackPageView() {
            if (window._gaq) {
                window._gaq.push(["_trackPageview", $location.url() + "?__touch_1m=1"])
            }
        }

        $rootScope._ = function _(text) {
            return text
        };
        $rootScope.fixTplUrl = window.fixTplUrl;
        $rootScope.fixImgUrl = window.fixImgUrl;
        function resetRootScopeVars() {
            $rootScope.hidePageForPopup = false;
            $rootScope.captchaNeeded = false;
            PopupTipService.reset()
        }

        var setServerLang = function () {
            LangSwitcherService.setServerLang();
            setServerLang = function () {
            }
        };
        $rootScope.mainSiteDomain = window.$main_site_domain || "mamba.ru";
        !function () {
            $rootScope.routeError = false;
            $rootScope.$on("$routeChangeError", function (event, current, prev, rejection) {
                $rootScope.routeError = true
            });
            $rootScope.$on("requests.rerun", function (event, current, prev, rejection) {
                if ($rootScope.routeError) {
                    $route.reload();
                    $rootScope.routeError = false
                }
            });
            $rootScope.$on("requests.get_queue_length", function () {
                $rootScope.$broadcast("requests.has_route_error", {hasError: $rootScope.routeError})
            })
        }();
        if (!window.angularLoaded) {
            window.angularLoaded = true;
            if (window.bodyClassToggler && window.bodyClassToggler.removeAngularLoading) {
                window.bodyClassToggler.removeAngularLoading()
            }
        }
    }])
}();
!function () {
    "use strict";
    angular.module("UserModule", [])
        .controller("UserDetailCtrl", ["$scope", "ProfileService", function UserDetailCtrl($scope, $routeParams, Redirect, CustomStylesheets, LoadRendererService, Translation, UserService, ProfileService, ProfileDataService) {
        LoadRendererService.setNotLoaded();
        if ($routeParams.anketa_id) {
            UserService.get({anketaId: $routeParams.anketa_id}, function (response) {
                LoadRendererService.setLoaded();
                if (response.anketa) {
                    var hisId = response.anketa.id;
                    $scope.is_my_anketa = ProfileDataService.anketaId() == hisId;
                    setAnketaData(response.anketa);
                    setDistance(response.anketa);
                    $scope.anketa = response.anketa;
                    $scope.wink = function wink() {
                        UserService.wink({anketaId: hisId})
                    };
                    $scope.addToFavorite = function addToFavorite() {
                        UserService.addToFavorite({anketaId: hisId}, function (response) {
                            if (response.message) {
                                $scope.anketa.isInFavorite = true
                            }
                        })
                    }
                } else if (response.errorCode) {
                    $scope.errorCode = response.errorCode
                }
                var actionsAvailable = [
                    {v: "", label: Translation.MISC.SELECT_HEADER_ACTION},
                    {v: "vip", label: Translation.SERVICES.SELECT.VIP_PRESENT},
                    {v: "fav", label: Translation.SERVICES.SELECT.FAVORITE},
                    {v: "wink", label: Translation.SERVICES.SELECT.WINK},
                    {v: "maketop", label: Translation.SERVICES.SELECT.MAKETOP}
                ];
                $scope.actions = actionsAvailable;
                fixActions();
                $scope.$watch("anketa", function () {
                    fixActions()
                });
                function fixActions() {
                    if ($scope.anketa && $scope.anketa.isInFavorite || $scope.is_my_anketa) {
                        delete $scope.actions.fav
                    }
                }

                var userActionLast;
                $scope.userAction = "";
                $scope.$watch("userAction", function (value) {
                    if (!value) {
                        return
                    }
                    userActionLast = value;
                    switch (value) {
                        case"vip":
                        case"maketop":
                            Redirect.toShowcase(value, hisId);
                            break;
                        case"fav":
                            $scope.addToFavorite();
                            break;
                        case"wink":
                            $scope.wink();
                            break;
                        case"ignore":
                            break;
                        default:
                    }
                });
                $scope.sendGift = function sendGift() {
                    toggleGiftsShowcase(true);
                    $scope.$broadcast("product.gifts.showcase.need", {anketa: response.anketa})
                };
                $scope.$on("product.gifts.showcase.closed", function (e, params) {
                    toggleGiftsShowcase(false)
                });
                $scope.$on("product.gifts.showcase.payed", function (e, params) {
                    toggleGiftsShowcase(false);
                    UserService.get({anketaId: $scope.anketa.id}, function (response) {
                        $scope.anketa = response.anketa
                    })
                })
            })
        } else {
            ProfileService.get(function (response) {
                LoadRendererService.setLoaded();
                $scope.is_my_anketa = ProfileDataService.anketaId() == response.anketa.id;
                $scope.anketa = response.anketa;
                setAnketaData(response.anketa)
            })
        }
        function setAnketaData(anketa) {
            setHrRegion(anketa);
            $scope.mainPhotoSrc = anketa.photo && anketa.photo.squarePhotoUrl;
            $scope.mainPhotoUrl = "#/users/" + anketa.id + "/albums";
            if (anketa.photo && anketa.photo.id && anketa.photo.albumId) {
                $scope.mainPhotoUrl += "/" + anketa.photo.albumId + "/fullscreen_by_id/" + anketa.photo.id
            }
        }

        function setHrRegion(anketa) {
            var regions = [], keys = ["country", "city", "metro"];
            angular.forEach(keys, function (k) {
                if (k in anketa && anketa[k]) {
                    regions.push(anketa[k])
                }
            });
            anketa.region_hr = regions.join(", ")
        }

        function setDistance(anketa) {
            var d, type = "km", showTilda = false;
            if (d = anketa.distance) {
                if (d > 1e4) {
                    d = Math.round(d / 1e3)
                } else if (d >= 1e3) {
                    d = Math.round(d / 1e3);
                    showTilda = true
                } else {
                    d = Math.round(d / 10) * 10;
                    type = "m"
                }
                anketa.distanceObj = {quantity: d, type: type, showTilda: showTilda}
            }
        }

        function toggleGiftsShowcase(show) {
            $scope.showcaseGiftsIsActive = !!show
        }
    }]).controller("UserGiftsCtrl", ["$scope", "$routeParams", "CustomStylesheets", "LoadRendererService", "UserService", "ProfileDataService", function UserGiftsCtrl($scope, $routeParams, CustomStylesheets, LoadRendererService, UserService, ProfileDataService) {
        LoadRendererService.setNotLoaded();
        $scope.offset = $routeParams.offset || 0;
        UserService.gifts({anketaId: $routeParams.anketa_id, offset: $scope.offset, limit: 4}, function (response) {
            LoadRendererService.setLoaded();
            if (response.gifts) {
                $scope.is_my_anketa = ProfileDataService.anketaId() == response.anketa.id;
                $scope.anketa = response.anketa;
                $scope.gifts = response.gifts.gifts;
                $scope.giftsCount = response.gifts.totalCount
            }
        });
        $scope.canViewFullGift = function canViewFullGift(gift) {
            if (gift.isAuthorHidden && !$scope.is_my_anketa && gift.user.id !== $scope.anketa.id) {
                return false
            }
            return true
        }
    }]).factory("UserService", ["Resource", function (Resource) {
        var methods = {query: {method: "GET", params: {anketaId: "users", offset: "@offset"}}, gifts: {method: "GET", params: {extra: "gifts", offset: "@offset", limit: "@limit"}}, wink: {method: "POST", params: {anketaId: "@anketaId", extra: "wink", agree: true}}, addToFavorite: {method: "POST", params: {anketaId: "@anketaId", extra: "favorite", agree: true}}, saveSearchForm: {method: "POST", params: {anketaId: "users", reqType: "json"}}};
        methods.queryPost = methods.saveSearchForm;
        return Resource("users/:anketaId/:extra", {extra: ""}, methods)
    }]).factory("ProfileService", ["Resource", function ProfileService(Resource) {
        return Resource("profile/")
    }])
}();
!function () {
    "use strict";
    angular.module("FeedbackModule", []).controller("FeedbackSendCtrl", ["$scope", "Redirect", "LoadRendererService", "FormBuilderService", "SupportService", function FeedbackSendCtrl($scope, Redirect, LoadRendererService, FormBuilderService, SupportService) {
        LoadRendererService.setNotLoaded();
        SupportService.get(function (response) {
            LoadRendererService.setLoaded();
            onFormLoad(response)
        });
        $scope.save = function () {
            SupportService.save($scope.Blocks, function (response) {
                if (FormBuilderService.hasNothingToShow(response)) {
                    Redirect.to("/tips/feedback_success");
                    $scope.sent = true
                }
                onFormLoad(response)
            })
        };
        function onFormLoad(response) {
            FormBuilderService.prepare($scope, response)
        }
    }]).factory("SupportService", ["Resource", function SupportService(Resource) {
        return Resource("feedback", {}, {save: {method: "POST", params: {reqType: "json"}}})
    }])
}();
!function () {
    "use strict";
    angular.module("ChatModule", []).controller("FolderListCtrl", ["$scope", "$rootScope", "$q", "Async", "Redirect", "LoadRendererService", "PopupTipService", "FolderService", "NotificationService", function FolderListCtrl($scope, $rootScope, $q, Async, Redirect, LoadRendererService, PopupTipService, FolderService, NotificationService) {
        LoadRendererService.setNotLoaded();
        $q.all([Async(FolderService.query), Async(NotificationService.get)]).then(function (responses) {
            PopupTipService.reset();
            $scope.folders = responses[0].folders;
            $scope.sections = responses[1].sections && responses[1].sections.items || [];
            LoadRendererService.setLoaded()
        })
    }]).controller("FolderCardCtrl", ["$scope", "$routeParams", "Redirect", "LoadRendererService", "FolderService", "ContactsService", function FolderCardCtrl($scope, $routeParams, Redirect, LoadRendererService, FolderService, ContactsService) {
        LoadRendererService.setNotLoaded();
        $scope.offset = $routeParams.offset || 0;
        $scope.limit = 10;
        FolderService.getWithContacts({folder_id: $routeParams["folder_id"], offset: $scope.offset, limit: $scope.limit}, function (response) {
            $scope.folder = response.folder;
            $scope.selectedFolderId = response.folder.id;
            $scope.folders = response.folders;
            $scope.contacts = response.contacts;
            $scope.totalCount = $scope.folder.count;
            LoadRendererService.setLoaded()
        });
        $scope.switchFolder = function switchFolder() {
            var id = $scope.selectedFolderId;
            if (id !== undefined && id !== $scope.folder.id) {
                Redirect.to("/folders/" + id)
            }
        };
        $scope.editMode = false;
        $scope.toggleEdit = function toggleEdit() {
            $scope.editMode = !$scope.editMode
        };
        $scope.clearFolder = function clearFolder() {
            if ($scope.folder.canClear) {
                FolderService.clear($scope.folder, function (response) {
                    $scope.contacts = [];
                    $scope.totalCount = 0
                })
            }
        };
        var selectedContacts = {};
        $scope.selectedContactsNum = 0;
        $scope.selectContact = function selectContact(contact) {
            if (!(contact.contactId in selectedContacts)) {
                selectedContacts[contact.contactId] = contact;
                contact.selected = true;
                $scope.selectedContactsNum++
            } else {
                delete selectedContacts[contact.contactId];
                contact.selected = false;
                $scope.selectedContactsNum--
            }
        };
        $scope.canMoveContacts = function canMoveContacts() {
            return $scope.selectedContactsNum > 0 && $scope.moveToFolderId !== undefined && $scope.moveToFolderId != $scope.folder.id
        };
        $scope.moveContacts = function moveContacts() {
            if ($scope.canMoveContacts()) {
                var contactIds = [];
                angular.forEach(selectedContacts, function (v, k) {
                    contactIds.push(k)
                });
                ContactsService.save({folderId: $scope.moveToFolderId, contactIds: contactIds}, function () {
                    hideContacts(selectedContacts);
                    selectedContacts = {}
                })
            }
        };
        $scope.deleteContact = function deleteContact(contact) {
            ContactsService.save({contactIds: [contact.contactId], agree: true}, function () {
                var contactIds = {};
                contactIds[contact.contactId] = 1;
                hideContacts(contactIds)
            })
        };
        function hideContacts(contactIds) {
            angular.forEach($scope.contacts, function (contact) {
                if (contact.contactId in contactIds) {
                    if (contact.contactId in selectedContacts) {
                        $scope.selectContact(contact)
                    }
                    contact.isHidden = true
                }
            })
        }
    }]).controller("FolderEditCtrl", ["$scope", "$routeParams", "$q", "Async", "SessionLocal", "Redirect", "FormBuilderService", "LoadRendererService", "PopupTipService", "FolderService", function FolderEditCtrl($scope, $routeParams, $q, Async, SessionLocal, Redirect, FormBuilderService, LoadRendererService, PopupTipService, FolderService) {
        if (!SessionLocal.get().isAuth) {
            Redirect.toAuth();
            return
        }
        var folderId = $routeParams["folder_id"];
        LoadRendererService.setNotLoaded();
        if (folderId) {
            $q.all([Async(FolderService.get, {folder_id: folderId}), Async(FolderService.getEditForm, {folder_id: folderId})]).then(function (responses) {
                $scope.folder = responses[0].folder;
                FormBuilderService.prepare($scope, responses[1]);
                LoadRendererService.setLoaded();
                PopupTipService.reset()
            });
            $scope.save = function () {
                FolderService.saveEditForm({folder_id: folderId}, $scope.Blocks, function (response) {
                    onSave(response)
                })
            }
        } else {
            $scope.folder = new FolderService({name: ""});
            FolderService.getNewForm(function (response) {
                FormBuilderService.prepare($scope, response);
                LoadRendererService.setLoaded()
            });
            $scope.save = function () {
                FolderService.saveNewForm($scope.Blocks, function (response) {
                    onSave(response)
                })
            }
        }
        function onSave(response) {
            if (FormBuilderService.hasNothingToShow(response)) {
                backToFolders()
            } else {
                FormBuilderService.prepare($scope, response)
            }
        }

        $scope.cancel = function () {
            backToFolders()
        };
        $scope.canDelete = function () {
            return $scope.folder && $scope.folder.id && $scope.folder.canDelete
        };
        $scope.deleteFolder = function () {
            if ($scope.canDelete()) {
                FolderService.deleteFolder({folder_id: $scope.folder.id}, function (response) {
                    backToFolders(true)
                })
            }
            return $scope.folder.id && $scope.folder.canDelete
        };
        function backToFolders(forceFolders) {
            Redirect.to("/folders" + (!forceFolders && folderId ? "/" + folderId : ""))
        }
    }]).controller("ChatCtrl", ["$scope", "$routeParams", "$filter", "$q", "Async", "Redirect", "Translation", "ProfileDataService", "LoadRendererService", "ComplainService", "StopChatService", "MessageDecoratorService", "ChatByContactService", "ChatByAnketaService", "FlashMsgService", function ChatCtrl($scope, $routeParams, $filter, $q, Async, Redirect, Translation, ProfileDataService, LoadRendererService, ComplainService, StopChatService, MessageDecoratorService, ChatByContactService, ChatByAnketaService, FlashMsgService) {
        LoadRendererService.setNotLoaded();
        var anketaId = $routeParams["anketa_id"], contactId = $routeParams["contact_id"], chatService = contactId ? ChatByContactService : ChatByAnketaService, params, loadedMessageIds = {}, tag = "message", selectDefault = {cause: "", text: Translation.MISC.SELECT_HEADER_REASON};
        if (anketaId) {
            params = {limit: 10};
            if (contactId) {
                params.contact_id = contactId
            } else {
                params.anketa_id = anketaId
            }
            $q.all([Async(chatService.get, params), Async(ComplainService.get, {tag: tag, anketaId: anketaId})]).then(function (responses) {
                onLoad(responses[0]);
                $scope.complainReasons = responses[1].causes || [];
                $scope.complainReasons.unshift(selectDefault);
                LoadRendererService.setLoaded()
            })
        } else {
            Redirect.to("/folders")
        }
        $scope.loadMore = function loadMore() {
            chatService.get(angular.extend({}, params, {offset: $scope.messages.length}), function (response) {
                onLoad(response)
            })
        };
        $scope.loadNew = function loadNew() {
            chatService.get(params, function (response) {
                var messages = angular.isArray(response.messages) ? response.messages : [], newMessages = [];
                angular.forEach(messages, function (message) {
                    if (!(message.id in loadedMessageIds)) {
                        newMessages.push(message)
                    }
                });
                response.messages = newMessages;
                onLoad(response, true)
            })
        };
        $scope.postMessage = function postMessage() {
            if ($scope.canPostNewMessage) {
                $scope.canPostNewMessage = false;
                chatService.save(angular.extend({}, params, {reqType: "json", suppressMessage: true}), {message: $scope.newMessage}, function (response) {
                    $scope.loadNew();
                    $scope.canPostNewMessage = true;
                    $scope.newMessage = ""
                })
            }
        };
        $scope.stopChat = function stopChat() {
            StopChatService.stop({contactId: $scope.contactId}, {}, function (response) {
                $scope.hideStopChatBtn = true;
                $scope.loadNew()
            })
        };
        $scope.$watch("newMessage", function watchNewMessage(value) {
            $scope.canPostNewMessage = !$scope.isChatBlocked && value && value.length >= 1
        });
        $scope.complainReason = selectDefault;
        $scope.$watch("complainReason", function (complainReason) {
            if (!complainReason || !angular.isObject(complainReason) || !complainReason.cause) {
                return
            }
            complainReason = angular.extend({entityId: $scope.hisAnketa.id}, complainReason);
            ComplainService.save({tag: tag, anketaId: $scope.hisAnketa.id}, {complaint: complainReason}, function (response) {
                $scope.complainReasons = null
            })
        });
        function onLoad(response, isNew) {
            $scope.myAnketa = response.profile;
            $scope.hisAnketa = response.recipient.anketa;
            $scope.contactId = response.recipient.contactId;
            $scope.chatData = response.recipient;
            $scope.alreadyComplaint = response.complaint;
            delete $scope.chatData.anketa;
            if (!$scope.messages) {
                $scope.messages = []
            }
            var messages_ = angular.isArray(response.messages) ? response.messages : [], messages = [];
            angular.forEach(messages_, function (message) {
                message.message = MessageDecoratorService.decorate(message.message);
                messages.push(message)
            });
            if (messages[0]) {
                $scope.lastUnread = !messages[0].incoming && messages[0].unread
            }
            messages.reverse();
            $scope.messages[isNew ? "push" : "unshift"].apply($scope.messages, messages);
            $scope.hasMore = $scope.messages.length < ($scope.chatData && $scope.chatData.messages);
            $scope.folderId = response.recipient.folderId;
            $scope.isChatBlocked = response.recipient.isChatBlocked;
            $scope.chatBlockedKey = response.recipient.chatBlockedKey;
            $scope.chatBlockedReason = response.recipient.chatBlockedReason;
            if (response.notice) {
                $scope.extraMessage = response.notice;
                if (response.notice.type == "over50mess") {
                    $scope.extraMessage.showGiftButton = true
                }
            }
            if ($scope.hisAnketa.deleted) {
                $scope.recipientDeleted = true
            }
            setBlockedButtons();
            rememberMessages(messages)
        }

        function rememberMessages(messages) {
            angular.forEach(messages, function (message) {
                loadedMessageIds[message.id] = 1
            })
        }

        function setBlockedButtons() {
            var key = $scope.chatBlockedKey, buttonsByKeys = {vip: {vip: 1, photo: 1, geo_vip: 1, photo_or_vip: 1, UnreadMessagesLimit: 1}, photo: {photo: 1, photo_or_vip: 1}, real: {realuser: 1}};
            $scope.showVipButton = key in buttonsByKeys.vip;
            $scope.showUploadButton = key in buttonsByKeys.photo;
            $scope.showRealButton = key in buttonsByKeys.real
        }

        $scope.showReal = function showReal() {
            toggleShowReal(true);
            $scope.$broadcast("get_real.need", {})
        };
        $scope.$on("get_real.cancelled", function (e) {
            toggleShowReal(false)
        });
        $scope.$on("get_real.done", function (e) {
            toggleShowReal(false);
            chatService.get(params, function (response) {
                onLoad(response)
            })
        });
        function toggleVipShowcase(show) {
            $scope.showcaseVipIsActive = !!show
        }

        function toggleShowReal(show) {
            $scope.realStatusFormIsActive = !!show
        }

        $scope.$on("photo_upload.finished", function (e) {
            chatService.get(params, function (response) {
                onLoad(response)
            })
        });
        $scope.showOldComplaint = function showOldComplaint(e) {
            if ($scope.alreadyComplaint) {
                var msg = Translation.COMLAIN.ALREADY_SENT;
                msg += " " + $filter("formatTime")($scope.alreadyComplaint.created * 1e3) + ". ";
                msg += Translation.COMLAIN.REASON;
                msg += " " + $scope.alreadyComplaint.text + ".";
                FlashMsgService.showMessage(msg)
            } else {
                e.preventDefault();
                e.stopPropagation()
            }
        }
    }]).controller("NotificationCardCtrl", ["$scope", "$routeParams", "Redirect", "LoadRendererService", "ProfileDataService", "NotificationService", function NotificationListCtrl($scope, $routeParams, Redirect, LoadRendererService, ProfileDataService, NotificationService) {
        LoadRendererService.setNotLoaded();
        var currentTag = $routeParams.tag;
        $scope.profile = ProfileDataService.get();
        $scope.offset = $routeParams.offset || 0;
        NotificationService.get({tag: currentTag}, function (response) {
            $scope.navSectionTag = currentTag;
            $scope.sections = response.sections && response.sections.items || [];
            $scope.notifications = response.notifications;
            $scope.totalCount = response.totalNotifications;
            LoadRendererService.setLoaded()
        });
        $scope.$watch("navSectionTag", function (navSectionTag) {
            angular.forEach($scope.sections, function (section) {
                if (section.tag === navSectionTag) {
                    $scope.navSection = section
                }
            });
            if (navSectionTag && navSectionTag !== currentTag) {
                Redirect.to("/notifications/" + navSectionTag)
            }
        })
    }]).factory("FolderService", ["Resource", function (Resource) {
        return Resource("folders/:folder_id/:extra", {reqType: "json", extra: ""}, {query: {method: "GET", params: {folder_id: ""}}, clear: {method: "POST", params: {folder_id: "@id", extra: "clear", agree: "true"}}, getWithContacts: {method: "GET", params: {extra: "contacts"}}, deleteFolder: {method: "DELETE", params: {folder_id: "@id", agree: "true"}}, getEditForm: {method: "GET", params: {folder_id: "@id", extra: "edit"}}, saveEditForm: {method: "PUT", params: {folder_id: "@id"}}, getNewForm: {method: "GET", params: {extra: "new"}}, saveNewForm: {method: "POST", params: {}}})
    }]).factory("ChatByAnketaService", ["Resource", function (Resource) {
        return Resource("users/:anketa_id/:action", {action: "chat"}, {save: {method: "POST", params: {action: "post"}}})
    }]).factory("ChatByContactService", ["Resource", function (Resource) {
        return Resource("contacts/:contact_id/:action", {action: ""}, {save: {method: "POST", params: {action: "post"}}})
    }]).factory("NotificationService", ["Resource", function (Resource) {
        return Resource("notifications/:tag")
    }]).factory("ContactsService", ["Resource", function (Resource) {
        return Resource("contacts/:action/", {reqType: "json", agree: true, action: "move"}, {ignore: {method: "POST", params: {action: "ignore"}}})
    }]).factory("ComplainService", ["Resource", function (Resource) {
        return Resource("complaint/:tag/:anketaId", {}, {save: {method: "POST", params: {reqType: "json"}}})
    }]).factory("StopChatService", ["Resource", function (Resource) {
        return Resource("contacts/:contactId/stopchat", {}, {stop: {method: "POST"}})
    }]).factory("MessageDecoratorService", ["Resource", function (Resource) {
        var smilesByImg = {"1-new.gif": {"default": ":)", code: ":-) :) +) =) :smile: *smile*"}, "2-new.gif": {"default": ":(", code: ":("}, "3-new.gif": {"default": ";)", code: ";-) ;) ^_~ :wink: *wink*"}, "4-new.gif": {"default": " :/", code: ":/ :-/ :\\ :-\\ *mda*"}, "5-new.gif": {"default": "O_O", code: "O_O"}, "6-new.gif": {"default": ";(", code: ";("}, "7-new.gif": {"default": ":]", code: ":] :-] :-)))) :-))))) :-)))))) :)))) :))))) :)))))) =)))) =))))) =)))))) *ROFL* :ROFL: :rofl: *rofl*"}, "16-new.gif": {"default": ":O", code: ":O"}, "17-new.gif": {"default": ":D", code: ":-D :D +D =D :biggrin: *grin*"}, "20-new.gif": {"default": "8)", code: "8-) 8) B) :COOL: :cool: *dirol*"}, "8-new.gif": {"default": "*angry*", code: "*angry*"}, "9-new.gif": {"default": "*sleep*", code: "*sleep*"}, "10-new.gif": {"default": "*zombie*", code: "*zombie*"}, "11-new.gif": {"default": "*flower*", code: "*flower*"}, "12-new.gif": {"default": "*meal*", code: "*meal*"}, "13-new.gif": {"default": "*beer*", code: "*beer*"}, "14-new.gif": {"default": "*party*", code: "*party*"}, "15-new.gif": {"default": "*kiss*", code: "*kiss*"}, "18-new.gif": {"default": "*by*", code: "*by*"}, "19-new.gif": {"default": "*invate*", code: "*invate*"}, "21-new.gif": {"default": "*sport*", code: "*sport*"}, "22-new.gif": {"default": "*love*", code: "*love*"}, "23-new.gif": {"default": "*gift*", code: "*gift*"}, "24-new.gif": {"default": "*computer*", code: "*computer*"}, "25-new.gif": {"default": "*hug*", code: "*hug*"}, "26-new.gif": {"default": "*dance*", code: "*dance*"}, "27-new.gif": {"default": "*drink*", code: "*drink*"}, "28-new.gif": {"default": "*hapiness*", code: "*hapiness*"}, "29-new.gif": {"default": "*baby*", code: "*baby*"}, "30-new.gif": {"default": "*mamba*", code: "*mamba*"}, "31-new.gif": {"default": "*work*", code: "*work*"}, "32-new.gif": {"default": "*hi*", code: "*hi*"}}, smileRegs = [];

        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        }

        function makeSmileRegs() {
            angular.forEach(smilesByImg, function (data, img) {
                var smiles = data.code.split(" ");
                angular.forEach(smiles, function (smile) {
                    smileRegs.push({smile: smile, regexp: new RegExp("(\\s|^)" + escapeRegExp(smile) + "(\\s|$)", "g"), img: img})
                })
            })
        }

        return{decorate: function decorate(message) {
            if (!smileRegs.length) {
                makeSmileRegs()
            }
            angular.forEach(smileRegs, function (smileData) {
                message = message.replace(smileData.regexp, '<img alt="' + smileData.smile + '" src="http://images.wambacdn.net/images/default2/default/smiles/' + smileData.img + '" />')
            });
            return message
        }}
    }])
}();
!function () {
    "use strict";
    angular.module("AuthModule", []).controller("LoginCtrl", ["$scope", "$rootScope", "SessionLocal", "Redirect", "LoadRendererService", "LoginService", function LoginCtrl($scope, $rootScope, SessionLocal, Redirect, LoadRendererService, LoginService) {
        if (SessionLocal.isAuth()) {
            Redirect.toProfile();
            return
        }
        LoadRendererService.setLoaded();
        $scope.save = function () {
            LoginService.save($scope.User, function (response) {
                if (response.isAuth) {
                    SessionLocal.put(response);
                    Redirect.toProfile()
                }
            })
        }
    }]).controller("LogoutCtrl", ["$scope", "SessionLocal", "Redirect", "LogoutService", function LogoutCtrl($scope, SessionLocal, Redirect, LogoutService) {
        LogoutService.get(function (response) {
            SessionLocal.put(response);
            if (!response.isAuth) {
                Redirect.toAuth()
            }
        })
    }]).controller("RestorePasswordCtrl", ["$scope", "RestorePassService", "FormBuilderService", "LoadRendererService", function RestorePasswordCtrl($scope, RestorePassService, FormBuilderService, LoadRendererService) {
        LoadRendererService.setNotLoaded();
        RestorePassService.get(function (response) {
            onLoad(response)
        });
        $scope.save = function save() {
            RestorePassService.save($scope.Blocks, function (response) {
                onLoad(response)
            })
        };
        function onLoad(response) {
            LoadRendererService.setLoaded();
            FormBuilderService.prepare($scope, response);
            if (FormBuilderService.hasNothingToShow(response)) {
                $scope.formSaved = true
            }
        }
    }]).controller("RegisterConfirmCtrl", ["$scope", "ProfileDataService", "Redirect", "FormBuilderService", "LoadRendererService", "RegisterConfirmService", function RegisterConfirmCtrl($scope, ProfileDataService, Redirect, FormBuilderService, LoadRendererService, RegisterConfirmService) {
        LoadRendererService.setNotLoaded();
        RegisterConfirmService.get(function (response) {
            LoadRendererService.setLoaded();
            onLoad(response)
        });
        $scope.save = function save() {
            RegisterConfirmService.save($scope.Blocks, function (response) {
                onLoad(response)
            })
        };
        function onLoad(response) {
            FormBuilderService.prepare($scope, response);
            if (FormBuilderService.hasNothingToShow(response)) {
                var confirmType = ProfileDataService.getKey("confirmType");
                Redirect.to("/register/confirmed_by/" + confirmType)
            }
        }
    }]).controller("RegisterConfirmedByCtrl", ["$scope", "$routeParams", "SessionLocal", "Redirect", "FormBuilderService", "LoadRendererService", "RegisterConfirmService", function RegisterConfirmedByCtrl($scope, $routeParams, SessionLocal, Redirect, FormBuilderService, LoadRendererService, RegisterConfirmService) {
        LoadRendererService.setNotLoaded();
        RegisterConfirmService.get(function (response) {
            LoadRendererService.setLoaded();
            onLoad(response)
        });
        $scope.save = function save() {
            RegisterConfirmService.save($scope.Blocks, function (response) {
                onLoad(response)
            })
        };
        function onLoad(response) {
            FormBuilderService.prepare($scope, response);
            if (FormBuilderService.hasNothingToShow(response)) {
                $scope.isAuth = SessionLocal.isAuth();
                $scope.confirmedBy = $routeParams.confirmedBy
            }
        }
    }]).controller("RegisterCtrl", ["$rootScope", "$scope", "$q", "Redirect", "Geo", "SessionLocal", "FormBuilderService", "LoadRendererService", "RegisterService", function RegisterCtrl($rootScope, $scope, $q, Redirect, Geo, SessionLocal, FormBuilderService, LoadRendererService, RegisterService) {
        var lat = 0, lng = 0;
        LoadRendererService.setNotLoaded();
        $q.when(Geo.getCoords()).then(function (coords) {
            lat = coords.latitude;
            lng = coords.longitude;
            getReg()
        }, function () {
            getReg()
        });
        function getReg() {
            RegisterService.get({lat: lat, lng: lng, geoListEnable: true}, function (response) {
                LoadRendererService.setLoaded();
                $scope.save = function () {
                    RegisterService.save($scope.Blocks, function (response) {
                        if (FormBuilderService.hasNothingToShow(response) && response.isAuth) {
                            SessionLocal.put(response);
                            return Redirect.toProfile()
                        }
                        FormBuilderService.prepare($scope, response)
                    })
                };
                FormBuilderService.prepare($scope, response);
                $scope.showRegistration = true
            })
        }

        $scope.$on("selectorGeo.other_chosen", function (e, params) {
            $scope.showRegistration = false;
            $scope.$broadcast("extendedGeoSelector.need", {level: params.level})
        });
        $scope.$on("extendedGeoSelector.show", function () {
            $scope.showGeoSelector = true
        });
        $scope.$on("extendedGeoSelector.chosen", function (e, params) {
            $scope.$broadcast("selectorGeo.externally_chosen", params);
            $scope.showGeoSelector = false;
            $scope.showRegistration = true
        })
    }]).controller("GetRealCtrl", ["$scope", "Redirect", "GetRealService", "ProfileDataService", "FormBuilderService", "LoadRendererService", function GetRealCtrl($scope, Redirect, GetRealService, ProfileDataService, FormBuilderService, LoadRendererService) {
        $scope.$on("get_real.need", function (e, params) {
            LoadRendererService.setNotLoaded();
            $scope.show = true;
            loadForm()
        });
        var onDistinctPage = false;
        $scope.$watch("immediateInit", function (immediateInit) {
            if (immediateInit) {
                onDistinctPage = true;
                loadForm()
            }
        });
        $scope.save = function () {
            GetRealService.save($scope.Blocks, function (response) {
                onLoad(response)
            })
        };
        function loadForm() {
            GetRealService.get({anketaId: ProfileDataService.anketaId()}, function (response) {
                onLoad(response)
            })
        }

        function onLoad(response) {
            LoadRendererService.setLoaded();
            if (FormBuilderService.hasNothingToShow(response)) {
                return onFinish()
            }
            FormBuilderService.prepare($scope, response)
        }

        $scope.select = function select(product) {
            $scope.product = product;
            $scope.show = false
        };
        function onFinish() {
            if (onDistinctPage) {
                var confirmType = ProfileDataService.getKey("confirmType");
                Redirect.to("/register/confirmed_by/" + confirmType);
                $scope.hideButtons = true
            } else {
                $scope.$emit("get_real.done");
                $scope.show = false
            }
        }

        $scope.cancel = function cancel() {
            $scope.$emit("get_real.cancelled");
            $scope.show = false
        }
    }]).factory("LoginService", ["Resource", function LoginService(Resource) {
        return Resource("login/", {}, {save: {method: "POST", params: {reqType: "json"}}})
    }]).factory("LogoutService", ["Resource", function LogoutService(Resource) {
        return Resource("logout/")
    }]).factory("GetRealService", ["Resource", function GetRealService(Resource) {
        return Resource("get_real", {}, {})
    }]).factory("RegisterService", ["Resource", function RegisterService(Resource) {
        return Resource("registration/", {}, {get: {method: "GET", params: {lat: "@lat", lng: "@lng", geoListEnable: true}}, save: {method: "POST", params: {reqType: "json"}}})
    }]).factory("RegisterConfirmService", ["Resource", function RegisterConfirmService(Resource) {
        return Resource("registration/confirm", {}, {save: {method: "POST", params: {reqType: "json"}}})
    }]).factory("RestorePassService", ["Resource", function RestorePassService(Resource) {
        return Resource("profile/restore_password/")
    }])
}();
!function () {
    "use strict";
    angular.module("ProfileModule", ["ngLocale"]).controller("ProfileQuestionGroupCtrl", ["$scope", "FormBuilderService", "LoadRendererService", "QuestionGroupService", function ProfileQuestionGroupCtrl($scope, FormBuilderService, LoadRendererService, QuestionGroupService) {
        LoadRendererService.setNotLoaded();
        QuestionGroupService.get(function (response) {
            LoadRendererService.setLoaded();
            FormBuilderService.prepare($scope, response);
            $scope.save = function save() {
                QuestionGroupService.save($scope.Blocks)
            }
        })
    }]).controller("HitListCtrl", ["$scope", "$routeParams", "$locale", "Translation", "LoadRendererService", "HitListService", function HitListCtrl($scope, $routeParams, $locale, Translation, LoadRendererService, HitListService) {
        LoadRendererService.setNotLoaded();
        $scope.perPage = 10;
        $scope.offset = $routeParams.offset || 0;
        HitListService.get({limit: $scope.perPage, offset: $scope.offset}, function (response) {
            LoadRendererService.setLoaded();
            $scope.users = [];
            var perDay = 864e5, lastDayId = null, dtTodayMidnight = new Date;
            dtTodayMidnight.setHours(0, 0, 0, 0);
            angular.forEach(response.users, function (user) {
                if (user.lastHit) {
                    var dt = new Date, dayHuman, dtDiff, dayId;
                    dt.setTime(user.lastHit * 1e3);
                    dayId = "" + dt.getFullYear() + dt.getMonth() + dt.getDate();
                    if (dayId !== lastDayId) {
                        user.dayChanged = true
                    }
                    lastDayId = dayId;
                    dtDiff = dtTodayMidnight - dt;
                    if (dtDiff <= 0) {
                        dayHuman = Translation.TIME.TODAY
                    } else if (dtDiff <= perDay) {
                        dayHuman = Translation.TIME.YESTERDAY
                    } else {
                        dayHuman = dt.getDate() + " " + $locale.DATETIME_FORMATS.MONTH[dt.getMonth()]
                    }
                    user.dayHuman = dayHuman;
                    user.time = fixTimeZeroes(dt.getHours()) + ":" + fixTimeZeroes(dt.getMinutes());
                    $scope.users.push(user)
                }
            });
            $scope.totalCount = response.totalCount;
            function fixTimeZeroes(val) {
                return val < 10 ? "0" + val : val
            }
        })
    }]).controller("AccountCtrl", ["$scope", "LoadRendererService", "ProfileDataService", function AccountCtrl($scope, LoadRendererService, ProfileDataService) {
        var profile = ProfileDataService.get();
        $scope.accountBalance = profile.accountBalance || 0;
        LoadRendererService.setLoaded()
    }]).factory("QuestionGroupService", ["Resource", function QuestionGroupService(Resource) {
        return Resource("question_groups/", {}, {save: {method: "PUT", params: {reqType: "json"}}})
    }]).factory("HitListService", ["Resource", function (Resource) {
        return Resource("hit_list/", {limit: 10})
    }])
}();
!function () {
    "use strict";
    angular.module("ProductsModule", []).controller("GiftListShowcaseCtrl", ["$scope", "$routeParams", "Redirect", "LoadRendererService", "ProductLocalStorageService", "ProductService", function GiftListShowcaseCtrl($scope, $routeParams, Redirect, LoadRendererService, ProductLocalStorageService, ProductService) {
        LoadRendererService.setNotLoaded();
        var anketaId = $routeParams.anketa_id;
        ProductService.giftsShowcase({anketaId: anketaId}, function (response) {
            LoadRendererService.setLoaded();
            var products = response.products, giftsByGroupId = {}, giftGroups = [];
            if (angular.isArray(products)) {
                products.sort(function (a, b) {
                    return parseInt(a.coins, 10) > parseInt(b.coins, 10) ? -1 : 1
                });
                angular.forEach(products, function (product) {
                    if (!(product.groupId in giftsByGroupId)) {
                        giftsByGroupId[product.groupId] = {groupName: product.groupName, gifts: []}
                    }
                    giftsByGroupId[product.groupId].gifts.push(product)
                });
                var iconIds = {1: 1, 2: 1, 3: 1, 6: 1};
                angular.forEach(giftsByGroupId, function (giftsData, groupId) {
                    var iconId = groupId in iconIds ? groupId : 0;
                    giftGroups.push({groupId: groupId, groupName: giftsData.groupName, gifts: giftsData.gifts, selected: false, iconId: iconId})
                })
            }
            giftGroups.sort(function (g1, g2) {
                return parseInt(g1.groupId, 10) > parseInt(g2.groupId, 10) ? 1 : -1
            });
            $scope.giftGroups = giftGroups;
            $scope.show = true;
            $scope.anketa = response.anketa;
            var storedGift = ProductLocalStorageService.get(), groupIndex;
            if (storedGift) {
                storedGift = storedGift.product;
                angular.forEach(giftGroups, function (group, index) {
                    if (group.groupId == storedGift.groupId) {
                        groupIndex = index
                    }
                })
            }
            if (groupIndex !== undefined) {
                $scope.selectGiftsGroup(groupIndex);
                angular.forEach($scope.giftGroups[groupIndex].gifts, function (gift) {
                    if (gift.id == storedGift.id) {
                        $scope.selectGift(gift)
                    }
                });
                $scope.comment = storedGift.comment;
                $scope.hideSender = storedGift.hide
            } else {
                $scope.selectGiftsGroup(0);
                if ($scope.giftGroups[0].gifts.length) {
                    $scope.selectGift($scope.giftGroups[0].gifts[0])
                }
            }
            $scope.commentMaxLen = 60;
            $scope.$watch("comment", function (comment) {
                var len = comment && comment.length || 0;
                $scope.commentCharsLeft = len < $scope.commentMaxLen ? $scope.commentMaxLen - len : 0
            });
            ProductLocalStorageService.flush()
        });
        $scope.selectGiftsGroup = function selectGiftsGroup(index) {
            if ($scope.giftGroups[index]) {
                var group = null;
                if (!$scope.selectedGiftGroup || $scope.giftGroups[index].groupId != $scope.selectedGiftGroup.groupId) {
                    group = $scope.giftGroups[index];
                    $scope.selectGroup(group);
                    $scope.selectGift(null)
                }
            }
        };
        $scope.selectGroup = function selectGroup(group) {
            $scope.selectedGiftGroup = group
        };
        $scope.selectGift = function selectGift(gift) {
            $scope.selectedGift = gift
        };
        $scope.payGift = function payGift() {
            if ($scope.selectedGift) {
                var product = angular.extend({}, $scope.selectedGift, {comment: $scope.comment || "", hide: !!$scope.hideSender});
                ProductLocalStorageService.save(anketaId, product);
                Redirect.to("/showcases/gift/" + anketaId + "/pay")
            }
        }
    }]).controller("GiftShowcaseCtrl", ["$scope", "$routeParams", "Redirect", "LoadRendererService", "ProductLocalStorageService", "ProductService", "UserService", function GiftShowcaseCtrl($scope, $routeParams, Redirect, LoadRendererService, ProductLocalStorageService, ProductService, UserService) {
            LoadRendererService.setNotLoaded();
            var anketaId = $routeParams.anketa_id, productData = ProductLocalStorageService.get();
            $scope.gotoEditGift = function gotoEditGift() {
                if (productData) {
                    ProductLocalStorageService.save(productData.anketaId, productData.product)
                }
                Redirect.to("/showcases/gift/" + anketaId)
            };
            if (!productData) {
                return $scope.gotoEditGift()
            }
            UserService.get({anketaId: anketaId}, function (response) {
                $scope.product = productData.product;
                $scope.hisAnketa = response.anketa;
                $scope.show = true;
                $scope.$broadcast("payment.product_ready", {product: productData.product, anketaId: productData.anketaId});
                LoadRendererService.setLoaded()
            });
            $scope.$on("payment.done", function () {
                $scope.payment_done = true
            })
        }]).controller("MakeTopShowcaseCtrl", ["$scope", "$routeParams", "$q", "Async", "LoadRendererService", "PopupTipService", "ProductLocalStorageService", "ProductService", "UserService", "ProfileDataService", function MakeTopShowcaseCtrl($scope, $routeParams, $q, Async, LoadRendererService, PopupTipService, ProductLocalStorageService, ProductService, UserService, ProfileDataService) {
            LoadRendererService.setNotLoaded();
            var myId = ProfileDataService.anketaId(), params = {anketaId: $routeParams.anketa_id ? $routeParams.anketa_id : myId};
            $scope.show = false;
            $q.all([Async(ProductService.makeTopShowCase, params), Async(UserService.get, params)]).then(function (responses) {
                $scope.products = responses[0] && responses[0].products ? responses[0].products : [];
                if ($scope.products && $scope.products.length) {
                    $scope.product = $scope.products[0];
                    $scope.show = true
                }
                $scope.anketa = angular.extend({}, responses[0].anketa || {}, responses[1].anketa || {});
                $scope.is_my_anketa = params.anketaId == myId;
                $scope.$broadcast("payment.product_ready", {product: $scope.product, anketaId: params.anketaId});
                LoadRendererService.setLoaded();
                PopupTipService.reset()
            });
            $scope.speedometerType = getSpeedometerType(ProfileDataService.getKey("place"));
            function getSpeedometerType(place) {
                var type = 1;
                if (place <= 100) {
                    type = 7
                } else if (place <= 1e3) {
                    type = 6
                } else if (place <= 5e3) {
                    type = 5
                } else if (place <= 1e4) {
                    type = 4
                } else if (place <= 2e4) {
                    type = 3
                } else if (place <= 3e4) {
                    type = 2
                }
                return type
            }
        }]).controller("VipShowcaseCtrl", ["$scope", "$routeParams", "$q", "Async", "LoadRendererService", "PopupTipService", "ProductLocalStorageService", "Redirect", "ProductService", "UserService", "ProfileDataService", function VipShowcaseCtrl($scope, $routeParams, $q, Async, LoadRendererService, PopupTipService, ProductLocalStorageService, Redirect, ProductService, UserService, ProfileDataService) {
            LoadRendererService.setNotLoaded();
            var myId = ProfileDataService.anketaId(), params = {anketaId: $routeParams.anketa_id ? $routeParams.anketa_id : myId};
            $scope.show = false;
            $q.all([Async(ProductService.vipShowCase, params), Async(UserService.get, params)]).then(function (responses) {
                $scope.show = true;
                $scope.products = responses[0] && responses[0].products ? responses[0].products : [];
                $scope.anketa = angular.extend({}, responses[0].anketa || {}, responses[1].anketa || {});
                $scope.is_my_anketa = params.anketaId == myId;
                LoadRendererService.setLoaded();
                PopupTipService.reset();
                onLoad()
            });
            function onLoad() {
                if ($scope.products && $scope.products.length) {
                    $scope.select($scope.products[0]);
                    $scope.showOneProductInTitle = false;
                    if ($scope.products.length === 1) {
                        $scope.showOneProductInTitle = $scope.products[0]
                    }
                }
            }

            $scope.select = function select(product) {
                angular.forEach($scope.products, function (product) {
                    product.selected = false
                });
                product.selected = true;
                $scope.$broadcast("payment.product_ready", {product: product, anketaId: params.anketaId})
            };
            $scope.$on("payment.methods_ready", function (e, params) {
                if (params.noPaymentMethods) {
                    $scope.noPaymentMethods = true
                }
            })
        }]).controller("AccountRechargeShowcaseCtrl", ["$scope", "$routeParams", "LoadRendererService", "FlashMsgService", "Translation", "AccountRechargeService", function AccountRechargeShowcaseCtrl($scope, $routeParams, LoadRendererService, FlashMsgService, Translation, AccountRechargeService) {
            LoadRendererService.setNotLoaded();
            AccountRechargeService.getCardMethods(function (response) {
                LoadRendererService.setLoaded();
                $scope.products = response.products;
                if ($scope.products.length) {
                    $scope.selectProduct($scope.products[0])
                }
            });
            $scope.hasBonus = function hasBonus(product) {
                return product.bonus > 0
            };
            $scope.selectProduct = function selectProduct(product) {
                $scope.selectedProduct = product
            };
            $scope.isSelected = function isSelected(product) {
                return $scope.selectedProduct && angular.equals(product, $scope.selectedProduct)
            };
            $scope.startRecharge = function startRecharge() {
                if ($scope.selectedProduct) {
                    var host = window.location.protocol + "//" + window.location.host;
                    angular.extend($scope.selectedProduct, {declineUrl: host + "/tips/account_recharge_success", successUrl: host + "/tips/account_recharge_failure"});
                    AccountRechargeService.urlize({product: $scope.selectedProduct}, function (response) {
                        if (response.product && "url"in response.product) {
                            window.location.href = response.product.url
                        } else {
                            FlashMsgService.showError(Translation.ERRORS.GENERIC)
                        }
                    })
                }
            }
        }]).controller("PaymentCtrl", ["$scope", "$routeParams", "Translation", "FlashMsgService", "ProductLocalStorageService", "PaymentService", "PurchaseService", function ($scope, $routeParams, Translation, FlashMsgService, ProductLocalStorageService, PaymentService, PurchaseService) {
            var signature = $routeParams.signature, productData = null;
            $scope.showPayment = false;
            $scope.product = null;
            if (signature) {
                productData = ProductLocalStorageService.get();
                if (productData && productData.product.signature != signature) {
                    productData = null
                }
            }
            if (productData) {
                onLoad(productData.product, productData.anketaId)
            } else if ($routeParams.signature) {
                FlashMsgService.showError(Translation.ERRORS.PAYMENT_PRODUCT_NOT_FOUND)
            }
            $scope.$on("payment.product_ready", function (e, params) {
                if (params.product && params.anketaId) {
                    onLoad(params.product, params.anketaId)
                }
            });
            function onLoad(product, anketaId) {
                $scope.product = product;
                $scope.anketaId = anketaId;
                PaymentService.getMethods({product: product, anketaId: anketaId}, function (response) {
                    if (!response.methods || !response.methods.length) {
                        $scope.noPaymentMethods = true
                    }
                    $scope.$emit("payment.methods_ready", {noPaymentMethods: $scope.noPaymentMethods});
                    angular.forEach(response.methods, function (method) {
                        $scope["pay_by_" + method.type] = method
                    });
                    $scope.toggleMethod();
                    $scope.showPayment = true;
                    ProductLocalStorageService.flush()
                });
                var lastSelectedMethod = {};
                $scope.toggleMethod = function toggleMethod(method) {
                    if (method && "pay_by_" + method in $scope && $scope["pay_by_" + method].active) {
                        return
                    }
                    lastSelectedMethod.active = false;
                    if (!method || !("pay_by_" + method in $scope)) {
                        method = null;
                        if ("pay_by_account"in $scope) {
                            method = "account"
                        } else if ("pay_by_ppc"in $scope) {
                            method = "ppc"
                        } else if ("pay_by_sms"in $scope) {
                            method = "sms"
                        }
                    }
                    if (method) {
                        $scope["pay_by_" + method].active = true;
                        lastSelectedMethod = $scope["pay_by_" + method];
                        if (method === "sms" && $scope.pay_by_sms.operators.length) {
                            $scope.pay_by_sms.selectedOperator = $scope.pay_by_sms.operators[0]
                        }
                    }
                };
                $scope.payByMethod = function payByMethod(method) {
                    if (method && $scope.product && !$scope.paymentStarted) {
                        $scope.paymentStarted = true;
                        PurchaseService.pay({noStoreRequest: true}, {product: $scope.product, method: method, anketaId: $scope.anketaId}, function () {
                            $scope.$emit("payment.done");
                            $scope.paymentStarted = false;
                            $scope.showPayment = false
                        })
                    }
                }
            }
        }]).factory("ProductService", ["Resource", function ProductService(Resource) {
            return Resource("products/:product", {}, {giftsShowcase: {method: "GET", params: {product: "gift"}}, makeTopShowCase: {method: "GET", params: {product: "up"}}, vipShowCase: {method: "GET", params: {product: "vip"}}})
        }]).factory("ProductLocalStorageService", ["$rootScope", function ProductLocalStorageService($rootScope) {
            return{save: function save(anketaId, product) {
                product.signature = this._generateSignature();
                $rootScope.productDataForPayment = {product: product, anketaId: anketaId};
                return product.signature
            }, get: function get() {
                return $rootScope.productDataForPayment
            }, flush: function flush() {
                $rootScope.productDataForPayment = undefined
            }, _generateSignature: function _generateSignature() {
                return Math.floor(Math.random() * 1e5)
            }}
        }]).factory("PaymentService", ["Resource", function PaymentService(Resource) {
            return Resource("payment_methods", {}, {getMethods: {method: "POST", params: {reqType: "json"}}})
        }]).factory("PurchaseService", ["Resource", function PurchaseService(Resource) {
            return Resource("purchase", {}, {pay: {method: "POST", params: {reqType: "json"}}})
        }]).factory("AccountRechargeService", ["Resource", function AccountRechargeService(Resource) {
            return Resource("/products/card/:action", {action: ""}, {getCardMethods: {method: "GET"}, urlize: {method: "POST", params: {action: "urlize"}}})
        }])
}();
!function () {
    "use strict";
    angular.module("AlbumModule", []).controller("AlbumListCtrl", ["$scope", "$routeParams", "ProfileDataService", "Redirect", "LoadRendererService", "AlbumService", function AlbumListCtrl($scope, $routeParams, ProfileDataService, Redirect, LoadRendererService, AlbumService) {
        LoadRendererService.setNotLoaded();
        $scope.limit = 10;
        AlbumService.query({anketa_id: $routeParams.anketa_id, photos: $scope.limit}, function (response) {
            $scope.anketa = response.anketa;
            $scope.anketa_id = response.anketa.id;
            $scope.albums = response.albums;
            $scope.is_my_anketa = ProfileDataService.anketaId() == $scope.anketa_id;
            LoadRendererService.setLoaded();
            $scope.urlToBig = function urlToBig(album, $index) {
                return urlToFullscreen($scope.anketa_id, album.id, $index)
            };
            $scope.$on("photo_upload.finished", function (e, params) {
                if (params.album) {
                    var albumWithNewPhoto;
                    angular.forEach($scope.albums, function (album) {
                        if (albumWithNewPhoto === undefined && album.id == params.album.id) {
                            albumWithNewPhoto = album
                        }
                    });
                    if (albumWithNewPhoto !== undefined) {
                        AlbumService.get({anketa_id: $scope.anketa_id, album_id: albumWithNewPhoto.id, offset: 0, limit: 1e4}, function (response) {
                            albumWithNewPhoto.photos = response.album.photos
                        })
                    }
                }
            });
            $scope.showMore = function showMore(album) {
                AlbumService.get({anketa_id: $scope.anketa_id, album_id: album.id, offset: album.photos.length, limit: $scope.limit}, function (response) {
                    album.photos.push.apply(album.photos, response.album.photos)
                })
            }
        })
    }]).controller("AlbumCardCtrl", ["$scope", "$routeParams", "ProfileDataService", "LoadRendererService", "Redirect", "AlbumService", "PhotoEditService", function AlbumDetailsCtrl($scope, $routeParams, ProfileDataService, LoadRendererService, Redirect, AlbumService, PhotoEditService) {
        LoadRendererService.setNotLoaded();
        $scope.limit = 1e4;
        $scope.album_id = $routeParams.album_id;
        var anketaId = $routeParams.anketa_id, curAlbumId = $scope.album_id;
        AlbumService.get({anketa_id: anketaId, album_id: curAlbumId, limit: $scope.limit}, function (response) {
            onLoad(response)
        });
        function onLoad(response) {
            $scope.anketa = response.anketa;
            $scope.anketa_id = response.anketa.id;
            $scope.album = response.album;
            $scope.is_my_anketa = ProfileDataService.anketaId() == $scope.anketa_id;
            LoadRendererService.setLoaded();
            $scope.urlToBig = function urlToBig(album, $index) {
                return urlToFullscreen($scope.anketa_id, album.id, $index)
            }
        }

        $scope.togglePhotoMoveMode = function togglePhotoMoveMode() {
            if (!$scope.photoMoveMode) {
                LoadRendererService.setNotLoaded();
                AlbumService.getNames({anketa_id: anketaId}, function (response) {
                    $scope.albumsToMove = [];
                    angular.forEach(response.albums || [], function (album) {
                        $scope.albumsToMove.push(album);
                        if (album.id == curAlbumId) {
                            $scope.selectedAlbumToMove = album
                        }
                    });
                    $scope.photoMoveMode = !$scope.photoMoveMode;
                    LoadRendererService.setLoaded()
                })
            } else {
                $scope.photoMoveMode = !$scope.photoMoveMode
            }
        };
        var selectedPhotos = {}, selectedPhotosCnt = 0;
        $scope.selectPhoto = function selectPhoto(photo) {
            photo.selected = !photo.selected;
            if (photo.selected) {
                selectedPhotos[photo.id] = photo;
                selectedPhotosCnt += 1
            } else {
                delete selectedPhotos[photo.id];
                selectedPhotosCnt -= 1
            }
        };
        $scope.hasSelectedPhotos = function hasSelectedPhotos() {
            return selectedPhotosCnt > 0
        };
        $scope.canMove = function canMove() {
            return $scope.hasSelectedPhotos() && $scope.selectedAlbumToMove && $scope.selectedAlbumToMove.id != curAlbumId
        };
        function getSelectedPhotoIds() {
            var photoIds = [];
            angular.forEach(selectedPhotos, function (selectedPhoto) {
                photoIds.push(selectedPhoto.id)
            });
            return photoIds
        }

        function clearSelectedPhotos() {
            selectedPhotos = {};
            selectedPhotosCnt = 0
        }

        $scope.movePhotos = function movePhotos() {
            if ($scope.canMove()) {
                LoadRendererService.setNotLoaded();
                PhotoEditService.move({albumId: $scope.selectedAlbumToMove.id, photoIds: getSelectedPhotoIds()}, function () {
                    clearSelectedPhotos();
                    AlbumService.get({anketa_id: anketaId, album_id: curAlbumId, limit: $scope.limit, forceMessage: true}, function (response) {
                        onLoad(response)
                    })
                })
            }
        };
        $scope.removePhotos = function removePhotos() {
            if ($scope.hasSelectedPhotos()) {
                LoadRendererService.setNotLoaded();
                PhotoEditService.removeBatch({photoIds: getSelectedPhotoIds()}, function () {
                    clearSelectedPhotos();
                    AlbumService.get({anketa_id: anketaId, album_id: curAlbumId, limit: $scope.limit, forceMessage: true}, function (response) {
                        onLoad(response)
                    })
                })
            }
        }
    }]).controller("AlbumEditCtrl", ["$scope", "$routeParams", "FormBuilderService", "Redirect", "LoadRendererService", "AlbumEditService", function AlbumEditCtrl($scope, $routeParams, FormBuilderService, Redirect, LoadRendererService, AlbumEditService) {
        LoadRendererService.setNotLoaded();
        $scope.anketaId = $routeParams.anketa_id;
        $scope.albumId = $routeParams.album_id;
        AlbumEditService.get({album_id: $scope.albumId}, function (response) {
            LoadRendererService.setLoaded();
            onFormLoad(response)
        });
        $scope.save = function save() {
            AlbumEditService.save({album_id: $scope.albumId}, $scope.Blocks, function (response) {
                if (FormBuilderService.hasNothingToShow(response)) {
                    return redir()
                }
                onFormLoad(response)
            })
        };
        $scope.cancel = function cancel() {
            redir()
        };
        $scope.removeAlbum = function removeAlbum() {
            AlbumEditService.remove({album_id: $scope.albumId, suppressMessage: true}, function () {
                Redirect.to("/users/" + $scope.anketaId + "/albums")
            })
        };
        function onFormLoad(response) {
            FormBuilderService.prepare($scope, response)
        }

        function redir() {
            return Redirect.to("/users/" + $scope.anketaId + "/albums/" + $scope.albumId)
        }
    }]).controller("AlbumAddCtrl", ["$scope", "ProfileDataService", "FormBuilderService", "Redirect", "LoadRendererService", "AlbumEditService", function AlbumAddCtrl($scope, ProfileDataService, FormBuilderService, Redirect, LoadRendererService, AlbumEditService) {
        LoadRendererService.setNotLoaded();
        AlbumEditService.newForm(function (response) {
            LoadRendererService.setLoaded();
            onFormLoad(response)
        });
        $scope.save = function save() {
            AlbumEditService.create({}, $scope.Blocks, function (response) {
                if (FormBuilderService.hasNothingToShow(response)) {
                    return redir()
                }
                onFormLoad(response)
            })
        };
        $scope.cancel = function cancel() {
            redir()
        };
        function onFormLoad(response) {
            FormBuilderService.prepare($scope, response)
        }

        function redir() {
            return Redirect.to("/users/" + ProfileDataService.anketaId() + "/albums")
        }
    }]).controller("AlbumFullScreenCtrl", ["$scope", "$routeParams", "Redirect", "SessionLocal", "ProfileDataService", "LoadRendererService", "PopupTipService", "AlbumService", function AlbumFullScreenCtrl($scope, $routeParams, Redirect, SessionLocal, ProfileDataService, LoadRendererService, PopupTipService, AlbumService) {
        if (!SessionLocal.isAuth()) {
            LoadRendererService.setLoaded();
            return PopupTipService.show("need_auth")
        }
        LoadRendererService.setNotLoaded();
        AlbumService.get({anketa_id: $routeParams.anketa_id, album_id: $routeParams.album_id, limit: 1e4}, function (response) {
            $scope.anketa_id = response.anketa.id;
            $scope.album = response.album;
            LoadRendererService.setLoaded();
            var photos = $scope.album.photos;
            if (!photos || !photos.length) {
                return Redirect.to("/users/" + $routeParams.anketa_id + "/albums/" + $routeParams.album_id)
            }
            var startWith;
            if ($routeParams.start_with_id) {
                var swid = $routeParams.start_with_id;
                for (var i = 0, l = photos.length; i < l; i++) {
                    if (photos[i].id === swid) {
                        startWith = i;
                        break
                    }
                }
            }
            if (!startWith) {
                startWith = $routeParams.start_with && $routeParams.start_with < photos.length ? $routeParams.start_with : 0
            }
            $scope.carousel = {photos: photos, startWith: startWith};
            $scope.extraData = {type: "simple", anketa: response.anketa, album: $scope.album, showEditBtn: ProfileDataService.anketaId() == $scope.anketa_id};
            $scope.showCarousel = true
        })
    }]).controller("AlbumEditPhotoCtrl", ["$scope", "$routeParams", "Redirect", "ProfileDataService", "LoadRendererService", "FormBuilderService", "AlbumService", "PhotoEditService", function AlbumFullScreenCtrl($scope, $routeParams, Redirect, ProfileDataService, LoadRendererService, FormBuilderService, AlbumService, PhotoEditService) {
        LoadRendererService.setNotLoaded();
        var position = $routeParams.pos;
        if (ProfileDataService.anketaId() != $routeParams.anketa_id) {
            return redirBack()
        }
        function redirBack() {
            return Redirect.to("/users/" + $routeParams.anketa_id + "/albums/" + $routeParams.album_id + "/fullscreen/" + position)
        }

        AlbumService.get({anketa_id: $routeParams.anketa_id, album_id: $routeParams.album_id, offset: position, limit: 1}, function (response) {
            $scope.anketa_id = response.anketa.id;
            $scope.album = response.album;
            if (!$scope.album.photos || !$scope.album.photos.length) {
                return redirBack()
            }
            $scope.photoId = $scope.album.photos[0].id;
            var photos = $scope.album.photos;
            $scope.carousel = {photos: photos, startWith: 0};
            $scope.extraData = {type: "simple", anketa: response.anketa, album: $scope.album};
            $scope.showCarousel = true;
            PhotoEditService.get({photo_id: $scope.photoId}, function (response) {
                onFormLoad(response);
                LoadRendererService.setLoaded()
            })
        });
        $scope.save = function save() {
            PhotoEditService.save({photo_id: $scope.photoId}, $scope.Blocks, function (response) {
                if (FormBuilderService.hasNothingToShow(response)) {
                    return redirBack()
                }
                onFormLoad(response)
            })
        };
        $scope.cancel = function cancel() {
            return redirBack()
        };
        $scope.removePhoto = function removePhoto() {
            PhotoEditService.remove({photo_id: $scope.photoId})
        };
        function onFormLoad(response) {
            FormBuilderService.prepare($scope, response)
        }
    }]).factory("AlbumService", ["Resource", function (Resource) {
        return Resource("users/:anketa_id/albums/:album_id/:_photos", {_photos: "photos"}, {query: {method: "GET", params: {}, isArray: false}, getNames: {method: "GET", params: {_photos: ""}, isArray: false}})
    }]).factory("AlbumEditService", ["Resource", function (Resource) {
        return Resource("albums/:album_id/:action", {}, {get: {method: "GET", params: {action: "edit"}}, save: {method: "PUT", params: {reqType: "json"}}, newForm: {method: "GET", params: {action: "new"}}, create: {method: "POST", params: {reqType: "json"}}, remove: {method: "DELETE"}})
    }]).factory("PhotoEditService", ["Resource", function (Resource) {
        return Resource("photos/:photo_id/:action", {}, {get: {method: "GET", params: {action: "edit"}}, save: {method: "PUT"}, removeBatch: {method: "POST", params: {action: "delete", agree: "true"}}, remove: {method: "DELETE", params: {photo_id: "@photo_id", agree: "true"}}, move: {method: "POST", params: {action: "move", agree: "true"}}})
    }]);
    function urlToFullscreen(anketaId, albumId, startWith) {
        return"#/users/" + anketaId + "/albums/" + albumId + "/fullscreen/" + (startWith ? startWith : 0)
    }
}();
!function () {
    "use strict";
    angular.module("SearchModule", []).controller("SearchResCtrl", ["$scope", "SearchService", "$routeParams", "Redirect", "SessionLocal", "LoadRendererService", function UserListCtrl($scope, SearchService, $routeParams, Redirect, SessionLocal, LoadRendererService) {
        LoadRendererService.setNotLoaded();
        $scope.offset = $routeParams.offset || 0;
        $scope.currentTag = $routeParams.tag;
        var searchParams = SessionLocal.getKey("search_params");
        $scope.changeFilter = function changeFilter(filter) {
            Redirect.to("/search/" + filter.tag)
        };
        var params = {};
        if ($scope.currentTag) {
            params = {filter: $scope.currentTag}
        }
        params = angular.extend(params, {offset: $scope.offset});
        var method = "query";
        if (searchParams) {
            params = angular.extend({}, searchParams, params);
            method = "queryPost"
        }
        SearchService[method](params, function (response) {
            LoadRendererService.setLoaded();
            $scope.users = response.users;
            $scope.filters = response.filters;
            $scope.totalCount = response.totalCount;
            angular.forEach($scope.filters, function (filter) {
                if (filter.selected) {
                    $scope.currentTag = filter.tag
                }
            })
        })
    }]).controller("SearchFormCtrl", ["$scope", "Redirect", "SessionLocal", "FormBuilderService", "SearchFormService", "LoadRendererService", "SearchService", function SearchFormCtrl($scope, Redirect, SessionLocal, FormBuilderService, SearchFormService, LoadRendererService, SearchService) {
        LoadRendererService.setNotLoaded();
        var searchParams = SessionLocal.getKey("search_params");
        SearchFormService.save(searchParams, function (response) {
            LoadRendererService.setLoaded();
            onFormLoad(response, searchParams ? searchParams : {})
        });
        function onFormLoad(response, defaults) {
            FormBuilderService.prepare($scope, response, defaults);
            $scope.showMain = true
        }

        $scope.save = function save() {
            SearchService.saveSearchForm($scope.Blocks, function (response) {
                SessionLocal.setKey("search_params", $scope.Blocks);
                if (!FormBuilderService.hasNothingToShow(response)) {
                    onFormLoad(response)
                } else {
                    SessionLocal.setKey("search_params", $scope.Blocks);
                    $scope.redirBack()
                }
            })
        };
        $scope.redirBack = function redirBack() {
            Redirect.to("/search/all")
        };
        $scope.$on("selectorGeo.other_chosen", function (e, params) {
            $scope.showMain = false;
            $scope.$broadcast("extendedGeoSelector.need", {level: params.level})
        });
        $scope.$on("extendedGeoSelector.show", function () {
            $scope.showGeoSelector = true
        });
        $scope.$on("extendedGeoSelector.chosen", function (e, params) {
            $scope.$broadcast("selectorGeo.externally_chosen", params);
            $scope.showGeoSelector = false;
            $scope.showMain = true
        })
    }]).factory("SearchService", ["Resource", function (Resource) {
        var methods = {query: {method: "POST"}, saveSearchForm: {method: "POST"}};
        methods.queryPost = methods.saveSearchForm;
        return Resource("search", {}, methods)
    }]).factory("SearchFormService", ["Resource", function (Resource) {
        return Resource("search/form")
    }])
}();
!function () {
    "use strict";
    angular.module("SettingsModule", []).controller("SettingsCtrl", ["$scope", "LoadRendererService", "SettingsService", function SettingsCtrl($scope, LoadRendererService, SettingsService) {
        LoadRendererService.setNotLoaded();
        SettingsService.get(function (response) {
            LoadRendererService.setLoaded();
            $scope.groups = response.groups
        })
    }]).controller("SettingsTagCtrl", ["$scope", "$routeParams", "$q", "Async", "SettingsService", "SettingsServiceEdit", "Redirect", "ProfileDataService", "FormBuilderService", "LoadRendererService", "PopupTipService", function SettingsTagCtrl($scope, $routeParams, $q, Async, SettingsService, SettingsServiceEdit, Redirect, ProfileDataService, FormBuilderService, LoadRendererService, PopupTipService) {
        LoadRendererService.setNotLoaded();
        $scope.extraType = $routeParams.extra;
        if ($scope.extraType === "anketa_blocked") {
            $scope.myName = ProfileDataService.getKey("name")
        }
        $q.all([Async(SettingsServiceEdit.get, {tag: $routeParams.tag, geoListEnable: true}), Async(SettingsService.get)]).then(function (responses) {
            LoadRendererService.setLoaded();
            PopupTipService.reset();
            onFormLoad(responses[0]);
            $scope.tags = [];
            $scope.currentTag;
            angular.forEach(responses[1].groups, function (group) {
                angular.forEach(group.items, function (tag) {
                    $scope.tags.push(tag);
                    if (tag.tag == $routeParams.tag) {
                        $scope.currentTag = tag
                    }
                })
            })
        });
        $scope.$watch("currentTag", function (currentTag) {
            if (!currentTag || currentTag.tag == $routeParams.tag) {
                return
            }
            Redirect.to("/profile/settings/" + currentTag.tag)
        });
        $scope.save = function () {
            SettingsService.save({tag: $routeParams.tag}, $scope.Blocks, function (response) {
                if (FormBuilderService.hasNothingToShow(response)) {
                    return redir()
                } else if ("message"in response) {
                    $scope.messageShown = true
                }
                onFormLoad(response)
            })
        };
        $scope.cancel = function cancel() {
            redir()
        };
        function onFormLoad(response) {
            FormBuilderService.prepare($scope, response)
        }

        function redir() {
            return Redirect.to("/profile/settings")
        }
    }]).factory("SettingsService", ["Resource", function SettingsService(Resource) {
        return Resource("settings/:tag", {tag: "@tag"}, {save: {method: "PUT", params: {}}})
    }]).factory("SettingsServiceEdit", ["Resource", function SettingsServiceEdit(Resource) {
        return Resource("settings/:tag/:edit", {tag: "@tag", edit: "edit", geoListEnable: true}, {save: {method: "PUT", params: {}}})
    }])
}();
"use strict";
angular.module("CommonServices", ["ngResource"]).factory("Resource", ["$resource", "$http", "$rootScope", "Redirect", "SessionLocal", "ProfileDataService", "Translation", "FlashMsgService", "LoadRendererService", "PopupTipService", function ($resource, $http, $rootScope, Redirect, SessionLocal, ProfileDataService, Translation, FlashMsgService, LoadRendererService, PopupTipService) {
    var DEFAULT_ERROR_MSG = Translation.ERRORS.GENERIC, PARAM_IS_ASYNC_TYPE = "isAsyncRequest", PARAM_SUPPRESS_MSG = "suppressMessage", PARAM_FORCE_MSG = "forceMessage", PARAM_NO_STORE_REQUEST = "noStoreRequest", PARAM_DONT_HANDLE_RESPONSE = "dontHandleResponse", PARAM_SUCCESS_CB = "__success", PARAM_ERROR_CB = "__error", PARAM_REQ_ID = "__request_id", requestQueue = {}, errorCodes = {1: 1, 2: 1, 3: 1, 4: 1, 30: 1, 31: 1, 32: 1, 33: 1, 34: 1};
    var resourceFunction = function (url, paramDefaults, actions) {
        var resource = $resource(translateUrl(url), removeUnnecessaryParams(paramDefaults), actions);

        function translateUrl(url) {
            var majorVersion = "5", platform = "11", releaseVersion = "0", brand = "0", version = ["v" + majorVersion, platform, releaseVersion, brand].join(".");
            return"/mobile/api/" + version + "/" + url + "/"
        }

        var DEFAULT_ACTIONS = {get: {method: "GET"}, save: {method: "POST"}, query: {method: "GET", isArray: true}, remove: {method: "DELETE"}, "delete": {method: "DELETE"}};
        var allActions = angular.extend({}, DEFAULT_ACTIONS, actions);

        function resourceMethods(value) {
            angular.copy(value || {}, this)
        }

        angular.forEach(resource, function (v, i) {
            if (i === "bind") {
                resourceMethods[i] = function (additionalParamDefaults) {
                    return resource[i].call(resource, additionalParamDefaults)
                }
            } else {
                var action = allActions[i] || {}, hasBody = action.method == "POST" || action.method == "PUT" || action.method == "PATCH", isFunction = angular.isFunction;
                resourceMethods[i] = function (a1, a2, a3, a4) {
                    var params = {}, paramsDirty = {};
                    var data;
                    var success = function () {
                    };
                    var error = null;
                    switch (arguments.length) {
                        case 4:
                            error = a4;
                            success = a3;
                        case 3:
                        case 2:
                            if (isFunction(a2)) {
                                if (isFunction(a1)) {
                                    success = a1;
                                    error = a2;
                                    break
                                }
                                success = a2;
                                error = a3
                            } else {
                                params = a1;
                                data = a2;
                                success = a3;
                                break
                            }
                        case 1:
                            if (isFunction(a1)) {
                                success = a1
                            } else {
                                if (hasBody) {
                                    data = a1
                                } else {
                                    params = a1
                                }
                            }
                            break;
                        case 0:
                            break
                    }
                    paramsDirty = angular.extend({}, paramDefaults, params);
                    if (!paramsDirty[PARAM_FORCE_MSG]) {
                        FlashMsgService.flush()
                    }
                    removeRequestFromQueue(paramsDirty);
                    paramsDirty = mixinRequestId(paramsDirty);
                    paramsDirty[PARAM_SUCCESS_CB] = success;
                    paramsDirty[PARAM_ERROR_CB] = error;
                    if (!paramsDirty[PARAM_NO_STORE_REQUEST] && !paramsDirty[PARAM_DONT_HANDLE_RESPONSE]) {
                        addRequestToQueue(resource[i], resource, paramsDirty, data)
                    }
                    LoadRendererService.setLoadError(false);
                    params = mixinReqType(params);
                    params = mixinLang(params);
                    params = mixinSid(params);
                    params = mixinCaptcha(params);
                    params = removeUnnecessaryParams(params);
                    return function doRequest() {
                        if (checkSid(params)) {
                            _send()
                        } else {
                            $http({method: "GET", url: translateUrl("session/")}).success(function (response) {
                                SessionLocal.put(response);
                                SessionLocal.checkAndSetSid(window.$mmbsid);
                                $rootScope.$broadcast("session_loaded");
                                params = mixinSid(params);
                                _send()
                            })
                        }
                        function _send() {
                            resource[i].call(resource, params, data, function _onSuccess(response) {
                                onSuccess(response, paramsDirty)
                            }, function _onError(e) {
                                onError(e, paramsDirty)
                            })
                        }
                    }()
                }
            }
        });
        return resourceMethods
    };

    function onSuccess(response, paramsDirty) {
        if (paramsDirty[PARAM_DONT_HANDLE_RESPONSE]) {
            return
        }
        removeRequestFromQueue(paramsDirty);
        if (!paramsDirty[PARAM_IS_ASYNC_TYPE]) {
            PopupTipService.reset()
        }
        LoadRendererService.setLoadError(false);
        if ("sid"in response) {
            SessionLocal.checkAndSetSid(response.sid)
        }
        if ("exception"in response) {
            switch (response.exception.type) {
                case"UnauthorizedSession":
                case"InvalidSession":
                    SessionLocal.remove();
                case"UnauthorizedIUser":
                    Redirect.to("/auth");
                    break;
                case"ConfirmRegistration":
                    Redirect.to("/register/confirm");
                    break;
                case"NotRealReject":
                    Redirect.to("/register/get_real");
                    break;
                case"Captcha":
                    showCaptcha();
                    break;
                case"UserBlocked":
                    PopupTipService.show("user_blocked");
                    break;
                case"UserBlockedForCheating":
                    PopupTipService.show("user_blocked_cheating");
                    break;
                default:
                    showException(response.exception, paramsDirty)
            }
            LoadRendererService.setLoaded()
        } else if ("errorCode"in response && response.errorCode in errorCodes) {
            switch (response.errorCode) {
                case 1:
                    Redirect.to("/register/get_real", true);
                    break;
                case 2:
                    Redirect.to("/profile/settings/personal/anketa_blocked", true);
                    break;
                case 3:
                    PopupTipService.show("auth_required");
                    break;
                case 4:
                    PopupTipService.show("no_anketa");
                    break;
                case 30:
                    PopupTipService.show("you_are_deleted");
                    break;
                case 31:
                    SessionLocal.remove();
                    PopupTipService.show("need_auth_chat");
                    break;
                case 32:
                    PopupTipService.show("user_blocked");
                    break;
                case 33:
                    PopupTipService.show("user_blocked_cheating");
                    break;
                case 34:
                    PopupTipService.show("vip_required");
                    break;
                default:
                    showMessages(DEFAULT_ERROR_MSG, paramsDirty, true)
            }
            LoadRendererService.setLoaded()
        } else if (!("isAuth"in response) && !("sid"in response)) {
            showMessages(DEFAULT_ERROR_MSG, paramsDirty, true);
            LoadRendererService.setLoaded()
        } else {
            if ("profile"in response) {
                ProfileDataService.set(response.profile)
            }
            if ("message"in response) {
                showMessages(response.message, paramsDirty, false)
            }
            if ("errors"in response && "internal"in response.errors) {
                showMessages(response.errors.internal, paramsDirty, true);
                LoadRendererService.setLoaded()
            } else if (PARAM_SUCCESS_CB in paramsDirty && angular.isFunction(paramsDirty[PARAM_SUCCESS_CB])) {
                paramsDirty[PARAM_SUCCESS_CB](response)
            }
        }
    }

    function onError(e, paramsDirty) {
        if (paramsDirty[PARAM_DONT_HANDLE_RESPONSE]) {
            return
        }
        LoadRendererService.setLoadError(true);
        showMessages(DEFAULT_ERROR_MSG, paramsDirty, true);
        if (PARAM_ERROR_CB in paramsDirty && angular.isFunction(paramsDirty[PARAM_ERROR_CB])) {
            paramsDirty[PARAM_ERROR_CB](e)
        }
    }

    function showException(exception, paramsDirty) {
        var msg = DEFAULT_ERROR_MSG;
        switch (exception.type) {
            case"AuthIpBlocked":
                msg = Translation.ERRORS.AuthIpBlocked;
                break;
            case"AWarn":
                break;
            case"CreateContactLimit":
                msg = Translation.ERRORS.CreateContactLimit;
                break;
            case"NotRealReject":
                msg = Translation.ERRORS.NotRealReject;
                break;
            case"TotalMaxViewLimit":
            case"MaxViewLimit":
                msg = Translation.ERRORS.TotalMaxViewLimit;
                break;
            case"RegistrationNotAllowed":
                msg = Translation.ERRORS.RegistrationNotAllowed;
                break;
            case"UserDeleted":
                msg = Translation.ERRORS.UserDeleted;
                break;
            case"UserNotFound":
                msg = Translation.ERRORS.UserNotFound;
                break;
            case"VipOnly":
                msg = Translation.ERRORS.VipOnly;
                break;
            case"InsufficientFunds":
                msg = Translation.ERRORS.InsufficientFunds;
                break;
            case"UserBlockedOther":
                msg = Translation.ERRORS.UserBlockedOther;
                break
        }
        showMessages(msg, paramsDirty, true)
    }

    function showMessages(messages, paramsDirty, isError) {
        if (paramsDirty[PARAM_SUPPRESS_MSG] && !isError) {
            return
        }
        FlashMsgService.show(messages, isError)
    }

    function showCaptcha() {
        $rootScope.captchaNeeded = true
    }

    function mixinReqType(params) {
        params = angular.extend({}, {reqType: "json"}, params || {});
        return params
    }

    function mixinLang(params) {
        var lang = SessionLocal.getKey("lang");
        if (lang) {
            params = angular.extend({}, {lang_id: lang}, params || {})
        }
        return params
    }

    function mixinSid(params) {
        var sid = SessionLocal.getSid();
        if (sid) {
            params = angular.extend({}, {sid: sid}, params || {})
        }
        return params
    }

    function checkSid(params) {
        return"sid"in params
    }

    function mixinCaptcha(params) {
        if ("captchaEnteredValue"in $rootScope) {
            params = angular.extend({}, {captcha: $rootScope.captchaEnteredValue}, params || {});
            delete $rootScope.captchaEnteredValue
        }
        return params
    }

    function removeUnnecessaryParams(params) {
        var p = angular.extend({}, params);
        delete p[PARAM_IS_ASYNC_TYPE];
        delete p[PARAM_SUPPRESS_MSG];
        delete p[PARAM_FORCE_MSG];
        delete p[PARAM_NO_STORE_REQUEST];
        delete p[PARAM_DONT_HANDLE_RESPONSE];
        delete p[PARAM_ERROR_CB];
        delete p[PARAM_SUCCESS_CB];
        delete p[PARAM_REQ_ID];
        return p
    }

    function addRequestToQueue(action, resource, paramsDirty, data) {
        if (!PARAM_REQ_ID in paramsDirty) {
            mixinRequestId(paramsDirty)
        }
        requestQueue[paramsDirty[PARAM_REQ_ID]] = {action: action, resource: resource, paramsDirty: paramsDirty, data: data}
    }

    function removeRequestFromQueue(paramsDirty) {
        if (PARAM_REQ_ID in paramsDirty) {
            delete requestQueue[paramsDirty[PARAM_REQ_ID]]
        }
    }

    function mixinRequestId(paramsDirty) {
        paramsDirty[PARAM_REQ_ID] = Math.ceil(Math.random() * 1e16);
        return paramsDirty
    }

    $rootScope.$on("requests.rerun", function () {
        FlashMsgService.flush();
        angular.forEach(requestQueue, function (requestData) {
            var paramsDirty = requestData.paramsDirty, params = removeUnnecessaryParams(paramsDirty);
            params = mixinReqType(params);
            params = mixinLang(params);
            params = mixinSid(params);
            params = mixinCaptcha(params);
            requestData.action.call(requestData.resource, params, requestData.data, function _onSuccess(response) {
                onSuccess(response, paramsDirty)
            }, function _onError(e) {
                onError(e, paramsDirty)
            })
        })
    });
    $rootScope.$on("requests.get_queue_length", function () {
        var count = 0;
        angular.forEach(requestQueue, function () {
            ++count
        });
        $rootScope.$broadcast("requests.queue_length", {count: count})
    });
    return resourceFunction
}]).factory("Async", ["$q", function Async($q) {
        return function (ResCall, params) {
            params = angular.extend({isAsyncRequest: true}, params);
            var d = $q.defer();
            if (angular.isFunction(ResCall)) {
                ResCall(params, function (response) {
                    d.resolve(response)
                });
                return d.promise
            }
            throw new Error("wrong invocation with " + ResCall.toString())
        }
    }]).factory("Redirect", ["$location", "BrowserHistoryService", function ($location, BrowserHistoryService) {
        return{to: function to(url, checkCircularRedirect) {
            var urlReplacement;
            if (checkCircularRedirect) {
                urlReplacement = BrowserHistoryService.getOtherHistoryUrl(url)
            }
            $location.path(urlReplacement ? urlReplacement : url)
        }, toAuth: function toAuth(checkCircularRedirect) {
            this.to("/auth", checkCircularRedirect)
        }, toDefault: function toDefault(checkCircularRedirect) {
            this.to("/top", checkCircularRedirect)
        }, toProfile: function toProfile(checkCircularRedirect) {
            this.to("/profile", checkCircularRedirect)
        }, toFolder: function toFolder(id, checkCircularRedirect) {
            this.to("/folders/" + id, checkCircularRedirect)
        }, toShowcase: function toShowcase(type, anketaId, checkCircularRedirect) {
            if (anketaId) {
                this.to("/showcases/" + type + "/" + anketaId, checkCircularRedirect)
            } else {
                this.to("/showcases/" + type + "/" + anketaId)
            }
        }, toTips: function toTips(tipType, checkCircularRedirect) {
            this.to("/tips/" + tipType, checkCircularRedirect)
        }}
    }]).factory("Session", ["Resource", function (Resource) {
        return Resource("session/")
    }]).factory("SessionLocal", ["$rootScope", "$cookieStore", "LocalStorageService", function SessionLocal($rootScope, $cookieStore, LocalStorageService) {
        var storage = LocalStorageService.check() ? LocalStorageService : $cookieStore, _session, langId;

        function mixinLang(params) {
            return langId ? angular.extend({lang: langId}, params) : params
        }

        function setLangId(session) {
            session = session || _session;
            if (!langId && "lang"in session) {
                langId = session.lang
            }
        }

        return{get: function check() {
            if (!_session) {
                _session = storage.get("session")
            }
            if (!_session) {
                _session = {};
                this.put(_session)
            }
            if (!("session"in $rootScope)) {
                this.refreshRootScope()
            }
            setLangId();
            return _session
        }, put: function put(session) {
            setLangId(session);
            _session = mixinLang(session || {});
            storage.put("session", _session);
            this.refreshRootScope()
        }, remove: function remove() {
            _session = mixinLang({});
            this.put(_session);
            this.refreshRootScope()
        }, getSid: function getSid() {
            var session = this.get();
            return session && session.sid
        }, checkAndSetSid: function checkAndSetSid(sid) {
            sid = sid + "";
            var currentSid = this.getSid();
            if (sid && sid != currentSid && sid.length === 32) {
                this.setKey("sid", sid)
            }
        }, setKey: function setKey(k, v) {
            var session = this.get();
            if (session) {
                session[k] = v;
                this.put(session)
            }
            if (k == "lang") {
                setLangId({lang: v})
            }
        }, getKey: function getKey(k) {
            var session = this.get();
            return session && k in session ? session[k] : undefined
        }, isAuth: function isAuth() {
            return this.getKey("isAuth")
        }, refreshRootScope: function refreshRootScope(session) {
            session = session || _session || this.get();
            $rootScope.session = session
        }}
    }]).factory("ProfileDataService", ["$rootScope", "SessionLocal", function ProfileDataService($rootScope, SessionLocal) {
        var keys = ["id", "userId", "name", "isVip", "accountBalance", "place", "placeOn", "placeHint", "squarePhotoUrl", "unreadMessages", "unreadNotifications", "newVisits", "confirmType"];
        return{set: function set(data) {
            var filtered = this.get();
            angular.forEach(keys, function (k) {
                if (k in data) {
                    filtered[k] = data[k]
                }
            });
            SessionLocal.setKey("profile", filtered);
            SessionLocal.refreshRootScope()
        }, get: function get() {
            return SessionLocal.getKey("profile") || {}
        }, getKey: function (key) {
            var profile = this.get();
            return profile[key]
        }, anketaId: function anketaId() {
            return this.getKey("id")
        }}
    }]).factory("GeoSelect", ["Resource", function (Resource) {
        return Resource("geo_list")
    }]).factory("RatingService", ["Resource", function (Resource) {
        return Resource("new_faces/", {}, {query: {method: "GET", isArray: false}})
    }]).factory("PhotoUploadUrlService", ["Resource", function (Resource) {
        return Resource("photos/upload", {}, {})
    }]).factory("PhotoUploaderService", ["$timeout", function ($timeout) {
        return function (callbacks) {
            var pub = {upload: function upload($form, uploadUrl, files) {
                if (window.FormData && pub.checkUrlSameDomain(uploadUrl)) {
                    for (var i = 0, l = files.length, f; i < l; i++) {
                        f = files[i];
                        uploadByFormData(f, uploadUrl)
                    }
                } else {
                    uploadByIframe($form, uploadUrl)
                }
            }, checkCanUpload: function checkCanUpload() {
                if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
                    return false
                }
                var elem = document.createElement("input");
                elem.type = "file";
                return!elem.disabled
            }, checkUrlSameDomain: function checkUrlSameDomain(url) {
                var currentHost = location && "host"in location && location.host;
                if (currentHost) {
                    if (url.indexOf(currentHost) > -1) {
                        return true
                    }
                }
                return false
            }, onStart: function onStart(file) {
            }, onLoad: function onLoad(e, file, response) {
            }, onError: function onError(e, file) {
            }, onComplete: function onComplete(e, file) {
            }, onProgress: function onProgress(e, file) {
            }};
            if (callbacks && angular.isObject(callbacks)) {
                if ("upload"in callbacks) {
                    delete callbacks.upload
                }
                pub = angular.extend({}, pub, callbacks)
            }
            function emulateUpload(file) {
                pub.onStart(file);
                alert();
                var percents = [10, 15, 40, 60, 70, 90, 100];
                for (var i = 0, l = percents.length; i < l; i++) {
                    pub.onProgress({loaded: percents[i], total: 100}, file);
                    alert()
                }
                pub.onLoad({}, file);
                pub.onComplete({}, file)
            }

            function uploadByFormData(file, uploadUrl) {
                var formData = new FormData;
                formData.append("photo[]", file);
                var xhr = new (window.XDomainRequest || window.XMLHttpRequest);
                xhr.open("POST", uploadUrl, true);
                xhr.onload = function (e) {
                    if (xhr.status < 400) {
                        pub.onLoad(e, file, xhr.responseText)
                    } else {
                        pub.onError(e, file, {httpStatus: xhr.status})
                    }
                    pub.onComplete(e, file)
                };
                xhr.onerror = function (e) {
                    pub.onError(e, file);
                    pub.onComplete(e, file)
                };
                xhr.upload.onprogress = function (e) {
                    pub.onProgress(e, file)
                };
                pub.onStart(file);
                xhr.send(formData)
            }

            function uploadByIframe($form, uploadUrl) {
                var iframeName = "upload_iframe", iframe = document.createElement("iframe");
                iframe.setAttribute("id", iframeName);
                iframe.setAttribute("name", iframeName);
                iframe.setAttribute("width", "0");
                iframe.setAttribute("height", "0");
                iframe.setAttribute("border", "0");
                iframe.setAttribute("style", "width: 0; height: 0; border: none;");
                $form[0].appendChild(iframe);
                window.frames[iframeName].name = iframeName;
                var iframeId = document.getElementById(iframeName);
                var eventHandler = function () {
                    var content;
                    if (iframeId.detachEvent) {
                        iframeId.detachEvent("onload", eventHandler)
                    } else {
                        iframeId.removeEventListener("load", eventHandler, false)
                    }
                    try {
                        if (iframeId.contentDocument) {
                            content = iframeId.contentDocument.body.innerHTML
                        } else {
                            if (iframeId.contentWindow) {
                                content = iframeId.contentWindow.document.body.innerHTML
                            } else {
                                if (iframeId.document) {
                                    content = iframeId.document.body.innerHTML
                                }
                            }
                        }
                    } catch (e) {
                    }
                    pub.onLoad({}, {type: "iframe", content: content}, content);
                    pub.onComplete({}, {});
                    stopUpdatingPercent();
                    setTimeout(function () {
                        iframeId.parentNode.removeChild(iframeId)
                    }, 250)
                };
                if (iframeId.addEventListener)iframeId.addEventListener("load", eventHandler, true);
                if (iframeId.attachEvent)iframeId.attachEvent("onload", eventHandler);
                $form[0].setAttribute("action", uploadUrl);
                $form[0].setAttribute("target", iframeName);
                $form[0].submit();
                pub.onStart({});
                updatePercent();
                var timer, percentCurrent = 0, percentStep = 10;

                function updatePercent() {
                    timer = $timeout(function () {
                        percentCurrent += percentStep;
                        if (percentCurrent >= 100) {
                            percentCurrent = 0
                        }
                        var obj = {total: 100, loaded: percentCurrent};
                        pub.onProgress(obj, {});
                        updatePercent()
                    }, 100)
                }

                function stopUpdatingPercent() {
                    $timeout.cancel(timer)
                }
            }

            return pub
        }
    }]).factory("CustomStylesheets", ["$rootScope", function ($rootScope) {
        return{set: function set_(stylesheets) {
            if (!angular.isArray(stylesheets)) {
                stylesheets = [stylesheets]
            }
            $rootScope.customStylesheets = stylesheets
        }, setForGifts: function setForGifts() {
            this.set("http://images.wambacdn.net/images/upload/gifts/styles/style_gifts.css")
        }}
    }]).factory("CustomJs", ["$rootScope", function ($rootScope) {
        return{set: function set(customJsFiles) {
            if (!angular.isArray(customJsFiles)) {
                customJsFiles = [customJsFiles]
            }
            $rootScope.customJsFiles = customJsFiles
        }, remove: function remove(removeJsFiles) {
            var customJsFiles = $rootScope.customJsFiles, newFiles = [];
            if (!customJsFiles.length) {
                return
            }
            if (!angular.isArray(removeJsFiles)) {
                removeJsFiles = [removeJsFiles]
            }
            angular.forEach(customJsFiles, function (customJsFile) {
                var needToRemove = false;
                angular.forEach(removeJsFiles, function (removeJsFile) {
                    if (customJsFile === removeJsFile) {
                        needToRemove = true
                    }
                });
                if (!needToRemove) {
                    newFiles.push(customJsFile)
                }
            });
            $rootScope.customJsFiles = newFiles
        }}
    }]).factory("FormBuilderService", [function () {
        return{prepare: function prepare($scope, response, defaultValues) {
            $scope.form = response.formBuilder;
            $scope.Blocks = defaultValues ? defaultValues : {}
        }, hasNothingToShow: function hasNothingToShow(response) {
            var hasFields = false, blocks = response.formBuilder ? response.formBuilder.blocks : [];
            angular.forEach(blocks, function (block) {
                if ("field"in block && block.field !== "secure" && "fields"in block) {
                    hasFields = true
                }
            });
            return!hasFields
        }}
    }]).factory("Geo", ["$q", "$rootScope", "GeoService", function Geo($q, $rootScope, GeoService) {
        var currentPosition;

        function getCurrentPosition() {
            var deferred = $q.defer();

            function onSuccess(position) {
                currentPosition = position;
                deferred.resolve(position);
                $rootScope.$apply()
            }

            function onFail() {
                currentPosition = null;
                deferred.reject();
                $rootScope.$apply()
            }

            if (currentPosition !== undefined) {
                setTimeout(function () {
                    if (currentPosition) {
                        onSuccess(currentPosition)
                    } else {
                        onFail()
                    }
                }, 0)
            } else {
                if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                    navigator.geolocation.getCurrentPosition(onSuccess, onFail, {timeout: 3e3})
                } else {
                    setTimeout(function () {
                        onFail()
                    }, 0)
                }
            }
            return deferred.promise
        }

        return{getCoords: function () {
            var q = $q.defer();
            $q.when(getCurrentPosition()).then(function (position) {
                q.resolve({latitude: position.coords.latitude, longitude: position.coords.longitude})
            }, function () {
                q.reject()
            });
            return q.promise
        }, getUpdatedCoords: function updateCoords() {
            currentPosition = undefined;
            return this.getCoords()
        }}
    }]).factory("GeoUpdateService", ["$q", "$cookieStore", "Geo", "GeoService", "LocalStorageService", function GeoUpdateService($q, $cookieStore, Geo, GeoService, LocalStorageService) {
        var STORAGE_KEY = "last_geo_update_time", INTERVAL_MS = 36e5, storage = LocalStorageService.check() ? LocalStorageService : $cookieStore;

        function haveToSend() {
            var storedTimestamp = storage.get(STORAGE_KEY);
            if (!storedTimestamp) {
                return true
            }
            return storedTimestamp < +new Date
        }

        function storeNextUpdateTime() {
            storage.put(STORAGE_KEY, +new Date + INTERVAL_MS)
        }

        return{updateAndSaveCoords: function updateAndSaveCoords() {
            if (haveToSend()) {
                $q.when(Geo.getUpdatedCoords()).then(function (coords) {
                    GeoService.save({lat: coords.latitude, lng: coords.longitude})
                });
                storeNextUpdateTime()
            }
        }}
    }]).factory("GeoService", ["Resource", function GeoService(Resource) {
        return Resource("profile/update_coords/", {dontHandleResponse: true})
    }]).factory("LangSwitcherService", ["$rootScope", "SessionLocal", "CustomJs", function GetRealService($rootScope, SessionLocal, CustomJs) {
        var langSettings = {ru: {title: "Русский", flagFnameOld: "l2"}, en: {title: "English", flagFnameOld: "l3", flagFname: "gb"}, de: {title: "Deutsch", flagFnameOld: "l5"}, es: {title: "Español", flagFnameOld: "l7"}, it: {title: "Italiano", flagFnameOld: "l8"}, fr: {title: "Français", flagFnameOld: "l6"}, bg: {title: "Български", flagFnameOld: "l17"}, pt: {title: "Português", flagFnameOld: "l37"}, el: {title: "Ελληνικά", flagFnameOld: "l21", flagFname: "gr"}, hi: {title: "हिंदी", flagFnameOld: "l26", flagFname: "in"}, id: {title: "Bahasa Indonesia", flagFnameOld: "l60"}, ko: {title: "한국어", flagFnameOld: "l63", flagFname: "kr"}, ms: {title: "Bahasa Melayu", flagFnameOld: "l72"}, sr: {title: "Српски", flagFnameOld: "l42", flagFname: "si"}, sv: {title: "Svenska", flagFnameOld: "l43", flagFname: "se"}, th: {title: "ไทย", flagFnameOld: "l87"}, tr: {title: "Türkçe", flagFnameOld: "l44"}}, langsOrder = ["ru", "en", "de", "es", "it", "fr", "bg", "pt", "el", "hi", "id", "ko", "ms", "sr", "sv", "th", "tr"], langsForSelect = [], localeLoaded = null, currentLang = null;
        var me = {getLangsForSelect: function getLangsForSelect() {
            if (!langsForSelect.length) {
                angular.forEach(langsOrder, function (key) {
                    langsForSelect.push({k: key, v: langSettings[key].title})
                })
            }
            return langsForSelect
        }, getCurrentLang: function getCurrentLang() {
            if (!currentLang) {
                currentLang = SessionLocal.getKey("lang")
            }
            if (!currentLang) {
                me.setServerLang()
            }
            if (!currentLang) {
                if (navigator.language) {
                    me.setCurrentLang(navigator.language.substr(0, 2))
                } else {
                    me.setCurrentLang("en", true)
                }
            }
            return currentLang
        }, setServerLang: function setServerLang() {
            if (window.$lang_id) {
                me.setCurrentLang(window.$lang_id, true)
            }
        }, setCurrentLang: function setCurrentLang(lang, force) {
            if (!force && !(lang in langSettings)) {
                return false
            }
            var isChanged = lang !== currentLang;
            SessionLocal.setKey("lang", lang);
            currentLang = lang;
            if (isChanged) {
                $rootScope.$broadcast("lang_changed")
            }
            return true
        }, getFlag: function getFlag(lang) {
            lang = lang || me.getCurrentLang();
            if (!(lang in langSettings)) {
                lang = "en"
            }
            var fname = "flagFname"in langSettings[lang] ? langSettings[lang].flagFname : lang;
            return"http://images.wambacdn.net/images/default2/default/flags/32/" + fname + ".png"
        }};
        return me
    }]).factory("FlashMsgService", ["$rootScope", function FlashMsgService($rootScope) {
        var TIMEOUT_FOR_CLOSE = 5e3, timeout;

        function closeByTimeout() {
            clearTimer();
            timeout = setTimeout(function () {
                obj.flush();
                if (!$rootScope.$$phase) {
                    $rootScope.$digest()
                }
            }, TIMEOUT_FOR_CLOSE)
        }

        function clearTimer() {
            if (timeout) {
                clearTimeout(timeout)
            }
        }

        var obj = {show: function show(messages, isError, digest) {
            if (!angular.isArray(messages)) {
                messages = [messages]
            }
            $rootScope.flashMessages = {messages: messages, type: isError ? "error" : "message"};
            if (digest && !$rootScope.$$phase) {
                $rootScope.$digest()
            }
            if (isError) {
                clearTimer()
            } else {
                closeByTimeout()
            }
        }, showMessage: function showMessage(msg, digest) {
            this.show(msg, false, digest)
        }, showError: function showError(msg, digest) {
            this.show(msg, true, digest)
        }, flush: function flush() {
            $rootScope.flashMessages = []
        }};
        return obj
    }]).factory("BrowserHistoryService", ["$rootScope", function BrowserHistoryService($rootScope) {
        var MAX_LENGTH = 10, historyObj = {}, history = [];
        return{save: function save(url) {
            var lastUrl;
            while (history.length >= MAX_LENGTH) {
                lastUrl = history.shift();
                if (historyObj[lastUrl] > 1) {
                    historyObj[lastUrl] -= 1
                } else {
                    delete historyObj[lastUrl]
                }
            }
            historyObj[url] = url in historyObj ? historyObj[url] + 1 : 1;
            history.push(url)
        }, getOtherHistoryUrl: function (tipUrl) {
            if (!(tipUrl in historyObj)) {
                return null
            }
            var len = history.length;
            if (history[len - 2] && history[len - 2] === tipUrl && history[len - 4]) {
                return history[len - 4]
            }
        }}
    }]).factory("LoadRendererService", ["$rootScope", function LoadRendererService($rootScope) {
        function setFlag(isLoaded) {
            $rootScope.controllerDataLoaded = !!isLoaded
        }

        function setFlagLoadError(isError) {
            $rootScope.controllerDataLoadError = !!isError
        }

        return{setLoaded: function setLoaded() {
            setFlag(true)
        }, setNotLoaded: function setLoaded() {
            setFlag(false)
        }, setLoadError: function setLoadError(isError) {
            setFlagLoadError(isError)
        }}
    }]).factory("PopupTipService", ["$rootScope", function LoadRendererService($rootScope) {
        return{show: function show(template, isFullUrl) {
            if (!isFullUrl) {
                template = fixTplUrl("tips/" + template + ".html")
            }
            $rootScope.showPopupTip = template
        }, reset: function reset() {
            $rootScope.showPopupTip = false
        }}
    }]).factory("LocalStorageService", [function LocalStorageService() {
        var prefix = "__touch_angular_data__";

        function _check() {
            function _t() {
                var t = "__pewpewpew__";
                localStorage.setItem(t, t);
                localStorage.removeItem(t)
            }

            try {
                _t();
                return true
            } catch (e) {
                return false
            }
        }

        return{check: function check() {
            return _check()
        }, get: function get(key) {
            var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/;
            var val = localStorage.getItem(prefix + key);
            if (JSON_START.test(val) && JSON_END.test(val)) {
                return angular.fromJson(val)
            }
            return val
        }, put: function put(key, value) {
            if (angular.isObject(value) || angular.isArray(value)) {
                value = angular.toJson(value)
            }
            localStorage.setItem(prefix + key, value);
            return true
        }, remove: function remove(key) {
            localStorage.removeItem(prefix + key)
        }}
    }]);
"use strict";
angular.module("CommonControllers", []).controller("NavCtrl", ["$scope", "$rootScope", "$timeout", "ProfileDataService", function NavCtrl($scope, $rootScope, $timeout, ProfileDataService) {
    $rootScope.$watch("session", function () {
        $scope.profile = ProfileDataService.get()
    });
    $scope.toggleSidebar = function toggleSidebar() {
        $rootScope.showSidebar = !$rootScope.showSidebar
    };
    $scope.highlightMenuItem = function highlightMenuItem($event) {
        var $el = angular.element($event.target);
        if ($el.hasClass("js-menu-item")) {
            $el.addClass("hover")
        }
        $timeout(function () {
            $el.removeClass("hover")
        }, 500)
    }
}]).controller("GeoSelectCtrl", ["$scope", "GeoSelect", "LoadRendererService", function GeoSelectCtrl($scope, GeoSelect, LoadRendererService) {
    $scope.$on("extendedGeoSelector.need", function (e, params) {
        LoadRendererService.setNotLoaded();
        var locations = [];
        GeoSelect.get({level: params.level}, function (response) {
            $scope.geo = response;
            $scope.$emit("extendedGeoSelector.show");
            LoadRendererService.setLoaded()
        });
        $scope.select = function (location) {
            if (!location.last) {
                LoadRendererService.setNotLoaded();
                GeoSelect.get({location: location.key, level: params.level}, function (response) {
                    $scope.geo = response;
                    LoadRendererService.setLoaded()
                })
            }
            $scope.selectedLocation = location;
            locations.push(location);
            $scope.canChoose = locations.length >= params.level
        };
        $scope.choose = function choose() {
            if ($scope.canChoose) {
                var loc = $scope.selectedLocation;
                loc.name = $scope.geo.name + ", " + loc.val;
                $scope.$emit("extendedGeoSelector.chosen", {location: loc});
                $scope.selectedLocation = undefined
            }
        };
        $scope.cancel = function cancel() {
            $scope.$emit("extendedGeoSelector.chosen", {});
            $scope.selectedLocation = undefined
        }
    })
}]).controller("TopCtrl", ["$scope", "$window", "LoadRendererService", "SessionLocal", "RatingService", function TopCtrl($scope, $window, LoadRendererService, SessionLocal, RatingService) {
    LoadRendererService.setNotLoaded();
    $scope.isAuth = SessionLocal.isAuth();
    RatingService.query({limit: 30}, function (response) {
        LoadRendererService.setLoaded();
        $scope.users_chunks = [];
        function chunk(arr, len) {
            var chunks = [], i = 0, n = arr && arr.length || 0;
            while (i < n) {
                chunks.push(arr.slice(i, i += len))
            }
            return chunks
        }

        var groupCnt = 11, users = response.users.slice(0, groupCnt * 2);
        if (users.length < groupCnt * 2) {
            var i = 0;
            while (users.length < groupCnt * 2) {
                users.push(users[i++])
            }
        }
        $scope.users_chunks = chunk(users, groupCnt);
        fixedBtnOnScroll.setIt()
    });
    $scope.totalUsers = window.$totalUsers || null;
    var fixedBtnOnScroll = function () {
        var rotateEvent = "onorientationchange"in window ? "orientationchange" : "resize";
        angular.element($window).bind("scroll " + rotateEvent, function () {
            setTimer()
        });
        var timer;

        function setTimer() {
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                _setBtnClass();
                timer && clearTimeout(timer)
            }, 50)
        }

        var idBtn = "js-register-btn", btn, idFooter = "js-footer", className = "b-fixed", classNameRegEx = new RegExp("(^|\\s)" + className + "($|\\s)");

        function _setBtnClass() {
            btn = btn || document.getElementById(idBtn);
            if (!btn) {
                return
            }
            if (_isFooterOnScreen(idFooter)) {
            } else if (btn.className.indexOf(className) < 0) {
            }
        }

        var footer, bod = document.body, html = document.documentElement;

        function _isFooterOnScreen(id) {
            footer = footer || document.getElementById(id);
            if (!footer) {
                return false
            }
            var docHeight = Math.max(bod.scrollHeight, bod.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            return docHeight - footer.offsetHeight <= (window.scrollY || window.pageYOffset) + bod.offsetHeight
        }

        return{setIt: setTimer}
    }()
}]).controller("LangSelectCtrl", ["$scope", "$route", "$timeout", "SessionLocal", "LangSwitcherService", function LangSelectCtrl($scope, $route, $timeout, SessionLocal, LangSwitcherService) {
    $scope.languages = LangSwitcherService.getLangsForSelect();
    onLoad();
    $scope.changeLang = function changeLang() {
        if (LangSwitcherService.setCurrentLang($scope.lang)) {
            $scope.flagSrc = LangSwitcherService.getFlag();
            var url = replaceLangInUrl(window.location, $scope.lang);
            $timeout(function () {
                window.location.href = url
            }, 100)
        } else {
            $scope.lang = LangSwitcherService.getCurrentLang()
        }
    };
    $scope.$on("session_loaded", function () {
        onLoad()
    });
    $scope.$on("lang_changed", function () {
        onLoad()
    });
    function onLoad() {
        $scope.lang = LangSwitcherService.getCurrentLang();
        $scope.flagSrc = LangSwitcherService.getFlag()
    }

    function replaceLangInUrl(location, langId) {
        var queryString = {};
        location.search.replace(/^.*?[\?#]/, "").replace(new RegExp("([^?=&#]+)(=([^#&]*))?", "g"), function ($0, $1, $2, $3) {
            queryString[$1] = $3
        });
        queryString.lang_id = langId;
        function joinObj(obj) {
            var strs = [];
            angular.forEach(obj, function (v, k) {
                strs.push(k + "=" + v)
            });
            return strs.join("&")
        }

        return location.origin + location.pathname + ("?" + joinObj(queryString)) + location.hash
    }
}]).controller("StaticCtrl", ["$scope", "LoadRendererService", "Redirect", "ProfileDataService", function StaticCtrl($scope, LoadRendererService, Redirect, ProfileDataService) {
    LoadRendererService.setLoaded();
    $scope.profile = ProfileDataService.get();
    $scope.$on("photo_upload.finished", function () {
        Redirect.to("/users/" + ProfileDataService.anketaId() + "/albums")
    })
}]).controller("LoadErrorCtrl", ["$scope", "$route", function LangSelectCtrl($scope, $route) {
    $scope.rerunRequests = function rerunRequests() {
        $scope.$emit("requests.rerun")
    };
    $scope.$watch("controllerDataLoadError", function () {
        checkHasRecoverableErrors()
    });
    $scope.$watch("routeError", function () {
        checkHasRecoverableErrors()
    });
    function checkHasRecoverableErrors() {
        if ($scope.controllerDataLoadError || $scope.routeError) {
            $scope.$emit("requests.get_queue_length")
        }
    }

    $scope.$on("requests.has_route_error", function (e, params) {
        $scope.hasRouteError = !!params.hasError
    });
    $scope.$on("requests.queue_length", function (event, params) {
        $scope.hasUnfinishedRequests = params.count > 0
    })
}]).controller("AppDownloadCtrl", ["$scope", "$rootScope", "LocalStorageService", function AppDownloadCtrl($scope, $rootScope, LocalStorageService) {
    var STORAGE_KEY = "app_download_closed", isClosedObj = LocalStorageService.get(STORAGE_KEY) || {is_closed: false, dt: null};
    setShowBanner();
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        if (current.$$route && angular.isDefined(current.$$route.page) && (current.$$route.page == "profile" || current.$$route.page == "top")) {
            setShowBanner()
        } else {
            setShowBanner(false)
        }
    });
    $scope.close = function close() {
        isClosedObj.is_closed = true;
        isClosedObj.dt = (new Date).getTime();
        LocalStorageService.put(STORAGE_KEY, isClosedObj);
        setShowBanner()
    };
    function setShowBanner(forcedVal) {
        if (angular.isDefined(forcedVal)) {
            $rootScope.showAppBanner = !!forcedVal;
            return
        }
        if (window.$osTouchType) {
            var DAY = 864e5;
            if (isClosedObj.is_closed && isClosedObj.dt) {
                $rootScope.showAppBanner = (new Date).getTime() - isClosedObj.dt > DAY
            } else {
                $rootScope.showAppBanner = true
            }
        }
    }
}]).controller("BannerTopCtrl", ["$scope", "$rootScope", "$route", "ProfileDataService", "LangSwitcherService", function BannerTopCtrl($scope, $rootScope, $route, ProfileDataService, LangSwitcherService) {
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        setCanShowAd()
    });
    $scope.$watch("showPopupTip + controllerDataLoaded + controllerDataLoadError + routeError + hidePageForPopup + showAppBanner", function () {
        setCanShowAd()
    });
    function setCanShowAd() {
        $scope.showAd = canShowAd();
        $rootScope.topAdShown = $scope.showAd
    }

    function canShowAd() {
        var pagesToshow = {top: 1, profile: 1, user_card: 1, msg_folder_list: 1}, anketaId = ProfileDataService.anketaId();
        if (anketaId && !$rootScope.showAppBanner && LangSwitcherService.getCurrentLang() === "ru" && $route.current && pagesToshow[$route.current.page] && !$rootScope.showPopupTip && $rootScope.controllerDataLoaded && !$rootScope.controllerDataLoadError && !$rootScope.routeError && !$rootScope.hidePageForPopup) {
            return true
        }
        return false
    }
}]).controller("BannerMiddleCtrl", ["$scope", "$rootScope", "$route", "ProfileDataService", "LangSwitcherService", function BannerMiddleCtrl($scope, $rootScope, $route, ProfileDataService, LangSwitcherService) {
    setCanShowAd();
    $scope.$watch("showPopupTip + controllerDataLoaded + controllerDataLoadError + routeError + hidePageForPopup", function () {
        setCanShowAd()
    });
    function setCanShowAd() {
        $scope.showAd = canShowAd();
        $rootScope.middleAdShown = $scope.showAd
    }

    function canShowAd() {
        var hasOffset = $route.current.params && $route.current.params.offset > 0, anketaId = ProfileDataService.anketaId();
        if (anketaId && LangSwitcherService.getCurrentLang() === "ru" && !hasOffset && !$rootScope.showPopupTip && $rootScope.controllerDataLoaded && !$rootScope.controllerDataLoadError && !$rootScope.routeError && !$rootScope.hidePageForPopup) {
            return true
        }
        return false
    }
}]).controller("BannerBottomCtrl", ["$scope", "$rootScope", "$route", "ProfileDataService", function BannerBottomCtrl($scope, $rootScope, $route, ProfileDataService) {
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        setCanShowAd()
    });
    $scope.$watch("showPopupTip + controllerDataLoaded + controllerDataLoadError + routeError + hidePageForPopup + topAdShown + middleAdShown", function () {
        setCanShowAd()
    });
    function setCanShowAd() {
        $scope.showAd = canShowAd()
    }

    function canShowAd() {
        var pagesToHide = {auth_form: 1, restore_password: 1, reg_form: 1, reg_confirm: 1, get_real: 1, reg_confirmed_by: 1, msg_folder_edit: 1, msg_folder_add: 1, msg_notification_card: 1, showcase_vip: 1, showcase_maketop: 1, showcase_gift: 1, showcase_gift_pay: 1, feedback: 1, tips_vip: 1, tips_question_group: 1, tips_agreement: 1, tips_feedback_success: 1, tips_no_photo: 1, tips_no_anketa: 1, tips_auth_required: 1, tips_you_are_deleted: 1, tips_vip_required: 1}, anketaId = ProfileDataService.anketaId();
        if (anketaId && !$rootScope.topAdShown && !$rootScope.middleAdShown && $route.current && !pagesToHide[$route.current.page] && !$rootScope.showPopupTip && $rootScope.controllerDataLoaded && !$rootScope.controllerDataLoadError && !$rootScope.routeError && !$rootScope.hidePageForPopup) {
            return true
        }
        return false
    }
}]);