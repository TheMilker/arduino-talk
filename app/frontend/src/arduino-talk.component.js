(function(app) {
  app.AppComponent = ng.core
    .Component({
      selector: 'arduino-talk',
      template: '<h1>Angular 2 beta in the house!</h1>'
    })
    .Class({
      constructor: function() {}
    });
})(window.app || (window.app = {}));