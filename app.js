(function() {
  'use strict';
  angular
    .module('app', [
      'ngCoolAudio'
    ])
    .controller('MainCtrl', function($scope) {
      $scope.source = {
        audio: {
          author: 'A-lin',
          cover: './media/a-lin.png',
          src: './media/leave-time.mp3',
          name: 'Leave Time'
        },
        config: {

        }
      }

      $scope.source2 = {
        audio: [
          {
            author: 'Echosmith',
            cover: './media/a-lin.png',
            src: './media/Echosmith - Cool Kids.mp3',
            name: 'Cool Kids'
          },
          {
            author: 'Iggy Azalea',
            cover: './media/a-lin.png',
            src: './media/Iggy Azalea - Heavy Crown (feat. Ellie Goulding).mp3',
            name: 'Heavy Crown'
          },
          {
            author: 'Meghan Trainor',
            cover: './media/a-lin.png',
            src: './media/Meghan Trainor - Title.mp3',
            name: 'Title'
          }
        ]
      }
    })
})();
