(function() {
  goog.provide('ga_help_directive');

  goog.require('ga_help_service');

  var module = angular.module('ga_help_directive',
      ['ga_help_service']);

  /* Help Directive
   *
   * This directives places a help button into the html.
   * When clicked, the help is displayed in a popup
   *
   * The directive has one attribute for configuration:
   * ga-help="your-help-id". This help id is used to get
   * the corresponding html snippet from the help service.
   * You need to add your id to the help service
   *
   * Sample html:
   * <div ga-help="11"></div>
   * Multiple id's can be specified, separated by commas and
   * they will appear in the same window
   * <span ga-help="12,13,14"></div>
  */
  module.directive('gaHelp',
      function($document, gaHelpService, gaPopup) {
        var popupContent = '<div class="ga-help-content" ' +
                              'ng-repeat="res in options.results">' +
                                 '<h2 ng-bind="res[1]"></h2>' +
                                 '<div ng-bind="res[2]"></div>' +
                                 '<img ng-src="{{res[4]}}"/>' +
                           '</div>';

        return {
          restrict: 'A',
          scope: {
            helpIds: '@gaHelp'
          },
          replace: true,
          templateUrl: 'components/help/partials/help.html',
          link: function(scope, element, attrs) {
            var popup;
            var results = [];

            scope.displayHelp = function() {
              if (angular.isDefined(popup)) {
                popup.open();
              } else {
                var ids = scope.helpIds.split(',');

                var waitClass = 'metadata-popup-wait';
                var bodyEl = angular.element($document[0].body);
                bodyEl.addClass(waitClass);

                var len = ids.length;
                var resCount = 0;
                var i, id;
                for (i = 0; i < len; i++) {

                  gaHelpService.get(ids[i])
                  .then(function(res) {
                    resCount++;
                    if (resCount == len) {
                      bodyEl.removeClass(waitClass);
                    }
                    if (results.length === 0) {
                      popup = gaPopup.create({
                        className: 'ga-help-popup',
                        destroyOnClose: false,
                        title: 'help',
                        content: popupContent,
                        results: results
                      });
                      popup.open();
                    }
                    results.push(res.rows[0]);
                  }, function() {
                    resCount++;
                    if (resCount == len) {
                      bodyEl.removeClass(waitClass);
                    }
                    //FIXME: better error handling
                    var msg = 'No help found for id ' + ids[i];
                    alert(msg);
                  });
                }
              }
            };
          }
        };
      });
})();

