(function() {
  goog.provide('ga_layer_metadata_popup_service');

  goog.require('ga_map_service');
  goog.require('ga_popup');

  var module = angular.module('ga_layer_metadata_popup_service', [
    'ga_map_service',
    'ga_popup',
    'pascalprecht.translate'
  ]);

  module.provider('gaLayerMetadataPopup', function() {
    this.$get = function($document, $translate, gaPopup, gaLayers) {
          // Keep track of existing popups
          var popups = {};
          var getCloseCallback = function(bodid) {
            return function() {
              popups[bodid] = undefined;
            }
          };

          // This service acts as a toggle. Repeated calls with
          // the same bodid will 'toggle' the popup with the
          // meta information.
          return function(bodid) {
            var waitClass = 'ga-metadata-popup-wait';
            var bodyEl = angular.element($document[0].body);
            if (angular.isDefined(popups[bodid])) {
              popups[bodid].close();
            } else {
              bodyEl.addClass(waitClass);
              gaLayers.getMetaDataOfLayer(bodid)
                .success(function(data) {
                  bodyEl.removeClass(waitClass);
                  popups[bodid] = gaPopup.create({
                    title: $translate('metadata_window_title'),
                    content: data,
                    className: 'ga-tooltip-metadata',
                    x: 400,
                    y: 200,
                    showPrint: true,
                    onCloseCallback: getCloseCallback(bodid)
                  });
                  popups[bodid].open();
              })
              .error(function() {
                bodyEl.removeClass(waitClass);
                //FIXME: better error handling
                var msg = 'Could not retrieve information for ' + bodid;
                alert(msg);
              });
            }
          };
    };
  });
})();
