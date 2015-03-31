(function() {
	'use strict';
	angular
		.module('ngCoolAudio', [])
		.directive('ngCoolAudio', [
			'$timeout',
			'$sce',
			function($timeout, $sce) {
				return {
					restrict: 'AE',
					scope: {
						source: '=source'
					},
					replace: true,
					template: '<div class="ng-cool-audio-container"><audio>Your browser seems to be upgraded! :)</audio><div class="ng-cool-audio-preview"><div class="ncv-audio-left"><div class="ncv-img-container"><img ng-src="{{audio.cover}}" alt="Photo"></div></div><div class="ncv-audio-right"><div class="ncv-audio-right-top"><div class="ncv-header"><div class="ncv-header-title">{{audio.author}}</div><div class="ncv-header-subtitle">{{audio.name}}</div><div class="ncv-audio-sound"><i class="fa fa-volume-up" ng-show="!isMuted" ng-click="volumeOff()"></i><i class="fa fa-volume-off" ng-show="isMuted" ng-click="volumeOn()"></i><input type="range" max="10" min="0" value="5"></div></div></div><div class="ncv-audio-right-bottom"><div class="ncv-audio-controls"><i class="fa fa-backward" ng-click="playBackward()"></i><i class="fa fa-play" ng-click="pause()" ng-show="isPlaying"></i><i class="fa fa-pause" ng-click="play()" ng-show="!isPlaying"></i><i class="fa fa-forward" ng-click="playForward()"></i></div><div class="ncv-progress"><progress class="ncv-progress-bar" ng-click="skipProgress($event)" max="100" value="{{progressValue}}"></progress></div><div class="ncv-time"><span class="ncv-current-time">{{currentTime}}</span></div></div></div></div></div>',
					controller: ['$scope', '$element', function($scope, $element) {
						//check source file
						if (!$scope.source || !$scope.source.audio) {
							throw new Error('Source seems not to config right!');
							return;
						}

						var container = $element[0].querySelector('.ng-cool-audio-container');
						var audio = $element[0].querySelector('audio');

						var volume_range = $element[0].querySelector('.ncv-audio-sound input[type="range"]');

						var $audio = angular.element(audio);

						$scope.audio = {};


						//private method
						var calCulateTime = function() {
							var secs = parseInt(audio.currentTime % 60);
							var mins = parseInt((audio.currentTime / 60) % 60);

							// Ensure it's two digits. For example, 03 rather than 3.
							secs = ("0" + secs).slice(-2);
							mins = ("0" + mins).slice(-2);
							return mins + ':' + secs;
						}

						var calCulateProgress = function() {
							var percent = (100 / audio.duration) * audio.currentTime;
							return percent;
						}

						var generateAudio = function(audio) {
              if (!audio.src) {
                throw new Error('Not found src in your audio config');
                return;
              }
							$audio.attr('src', audio.src);
							$scope.audio.cover = audio.cover || './media/a-lin.png';
							$scope.audio.author = audio.author || 'Unknow';
							$scope.audio.name = audio.name || 'Unknow';
						}

						$scope.currentTrack = 0;
            $scope.jumpInterval = 10;
						$scope.init = function() {
							$scope.currentTime = '00:00';
							$scope.progressValue = 0;
							$scope.isPlaying = false;
							$scope.isMuted = false;
							$scope.setInterface($scope.currentTrack);
							$scope.addEvents();
						};

						$scope.setInterface = function(index) {
							var isArray = angular.isArray($scope.source.audio);
							if (isArray) {
								$scope.audioCollection = $scope.source.audio;
								generateAudio($scope.audioCollection[index]);
							} else {
								generateAudio($scope.source.audio);
							}

							if ($scope.source.config) {
								if ($scope.source.config.autoplay) {
									audio.autoplay = true;
								}
								if ($scope.source.config.loop) {
									audio.loop = true;
								}
							}
						};

						//toggle play pause
						$scope.play = function() {
							audio.play();
							$scope.isPlaying = true;
						};

						$scope.pause = function() {
							audio.pause();
							$scope.isPlaying = false;
						};

						//toggle mute
						$scope.volumeOn = function() {
							audio.muted = false;
							$scope.isMuted = false;
						};

						$scope.volumeOff = function() {
							audio.muted = true;
							$scope.isMuted = true;
						};

						//backward forward
						$scope.playBackward = function() {
							//here jump to pre song
							if ($scope.audioCollection && $scope.audioCollection.length > 0) {
								$scope.currentTrack -= 1;
								if ($scope.currentTrack < 0) {
									$scope.currentTrack = $scope.audioCollection.length-1;
								}
								$scope.init();
								$scope.play();
							} else {
								var toTime = audio.currentTime - $scope.jumpInterval;
								if (toTime < 0) {
									audio.currentTime = 0;
								} else {
									audio.currentTime = toTime;
								}
								$scope.currentTime = calCulateTime();
								$scope.progressValue = calCulateProgress();
							}
						};

						$scope.playForward = function() {
							//here jump to next song
							if ($scope.audioCollection && $scope.audioCollection.length > 0) {
								$scope.currentTrack += 1;

								if ($scope.currentTrack > $scope.audioCollection.length-1) {
									$scope.currentTrack = 0;
								}
								$scope.init();
								$scope.play();
							} else {
								var toTime = audio.currentTime + $scope.jumpInterval;
								if (toTime > audio.duration) {
									audio.currentTime = audio.duration;
								} else {
									audio.currentTime = toTime;
								}
								$scope.currentTime = calCulateTime();
								$scope.progressValue = calCulateProgress();
							}
						};

						//skip progress
						$scope.skipProgress = function(e) {
							//update time and progress
							var target = e.target;
							var offsetX = 0;
							if (!e.pageX || !target.offsetLeft) {
								offsetX = e.offsetX ? e.offsetX : e.layerX;
							} else {
								offsetX = e.pageX - target.offsetLeft;
							}
							var pos = offsetX / target.offsetWidth;
							audio.currentTime = pos * audio.duration;
							$scope.currentTime = calCulateTime();
							$scope.progressValue = calCulateProgress();
						}


						$scope.addEvents = function() {

							//time update
							// progress update
							audio.addEventListener('timeupdate', function() {
								$scope.currentTime = calCulateTime();
								$scope.progressValue = calCulateProgress();
								$scope.$apply();
							}, false);

							audio.addEventListener('ended', function() {
								//auto play next
								if ($scope.audioCollection && $scope.audioCollection.length > 0) {
									$scope.playForward();
								}
							});

							//angular seems dont support input[range] stuff so let's do it event
							volume_range.addEventListener('change', function() {
								audio.volume = parseFloat(this.value / 10);
							}, false);
						}

					}],
					link: function(scope, ele, attrs) {
						scope.init();
					}
				}
			}
		])
})();
