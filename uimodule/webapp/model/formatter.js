sap.ui.define([], function () {
    "use strict";
    //private scope
    var colorByRange = function (sValue) {
        return 1;
    };
    return {
        cantInput: function (sValue) {
            // var num = parseFloat(sValue);
            // if (Number.isNaN(num)){
            //     num = 0;
            // }
            // return num;
            return sValue;
        },
    };
});
