var _load = require("./components/parseData.js");

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

var p = {
        config: { 
                debug: true,
                pir_chip: 4,
                pir_gpio: 3
        },
        sendSocketNotification: function(s, d) {
                console.log(s);
        }
};

void async function doit() {
   await _load.init(p);
   await _load.parse(p);
   await p.pir.start();
   await delay(10000);
}();