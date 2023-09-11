const ipRangeCheck = require("ip-range-check");

let allowed = "";

const fetchIps = () => {
    let newAllowed = "";
    let request = new WSC.httpRequest();
    request.onload = function(e) {
        newAllowed += e.target.response.toString();
        let request2 = new WSC.httpRequest();
        request2.onload = function(e) {
            newAllowed += "\n"+e.target.response.toString();
            allowed = newAllowed;
        }
        request2.onerror = function(e) {
            //dont do anything
        }
        request2.open("GET", "https://www.cloudflare.com/ips-v6", false);
        request2.send();
    }
    request.onerror = function(e) {
        //dont do anything
    }
    request.open("GET", "https://www.cloudflare.com/ips-v4", false);
    request.send();
    
}

function onStart(server, options) {
    fetchIps();
    setInterval(fetchIps, 86400000); //24 hours
}

function onRequest(req, res, options, preventDefault) {
  if (options.cloudflare === true && !ipRangeCheck(req.socket.remoteAddress, allowed.split("\n"))) {
    preventDefault();
    res.statusCode = 403;
    res.statusMessage = "Forbidden";
    res.end("Not allowed");
  }
}


module.exports = {onStart, onRequest};
