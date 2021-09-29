sap.ui.define(["sap/m/ObjectNumber"], function (ObjectNumber) {
  "use strict";

  return ObjectNumber.extend("godrej.pedidoscrea.control.EventObjNumber", {
    metadata: {
      events: {
        press: {},
      }
    },

    // the  event handlers:
    onclick: function (evt) {
      this.firePress();
    },

    renderer: {},
  });
});
