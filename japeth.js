var JAPETH = (function () {
  var my = {},
      privateVariable = 1;

  var theScripts = document.getElementsByTagName('SCRIPT');
  for (var i = 0; i < theScripts.length; i++) {
    if (theScripts[i].src.match(/japeth.js$/)) {
      my.wrapper = document.createElement("div");
      theScripts[i].parentNode.insertBefore(my.wrapper, theScripts[i]);
      if (theScripts[i].innerHTML) {
        try {
          my.init =  theScripts[i].innerHTML;
        }
        catch(err) {   my.init = {}; }
      }
    }
  }

  function request(){
   var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
   if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    for (var i=0; i<activexmodes.length; i++){
     try{
      return new ActiveXObject(activexmodes[i])
     }
     catch(e){
      //suppress error
     }
    }
   }
   else if (window.XMLHttpRequest) // if Mozilla, Safari etc
    return new XMLHttpRequest()
   else
    return false
  }





  my.moduleProperty = 1;

  my.mkqueryuri = function(query, base) {
    if (/^[a-zA-Z0-9-]+$/.exec(base)) {
      return 'http://api.talis.com/stores/' + base + '/services/sparql?output=json&query=' + encodeURIComponent(query);
      //return 'http://wip.local/store-proxy.php/' + base + '/services/sparql?output=json&query=' + encodeURIComponent(query);
    }
  };

  my.q = function(query, base) {
    uri = my.mkqueryuri(query, base);
    req = request();
    req.open('GET', uri, false);
    req.setRequestHeader("Accept", "application/json");
    req.send(null);
    return new my.Table(eval('('+ req.responseText +')'));
  };


  my.Table = function(data) {
    this.data = data;
  };


  my.Table.prototype = {
    eh: function(t) {
      return t.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    ,table: function(id, caption) {
      parent = my.wrapper;
      theTable = document.createElement("table");
      theTable.id = id;
      theCaption = document.createElement("caption");
      theCaption.appendChild(document.createTextNode(caption));
      theTable.appendChild(theCaption);
      theTableHead = document.createElement("thead");

      theTableHeadRow = document.createElement("tr");

      for (var i = 0; i < this.data.head.vars.length; i++) {
        var aCell = document.createElement('th');
        aCell.appendChild(document.createTextNode(this.data.head.vars[i]));
        theTableHeadRow.appendChild(aCell);
      }

      theTableHead.appendChild(theTableHeadRow);
      theTable.appendChild(theTableHead);

      theTableBody = document.createElement("tbody");
      for (var r =0;r < this.data.results.bindings.length; r++) {
        var aRow = document.createElement("tr");
        for (var i = 0; i < this.data.head.vars.length; i++) {
          var aCell = document.createElement('td');
          aCell.appendChild(document.createTextNode(this.data.results.bindings[r][this.data.head.vars[i]].value));
          aRow.appendChild(aCell);
        }
        theTableBody.appendChild(aRow);
      }

      theTable.appendChild(theTableBody);
      parent.appendChild(theTable);
    }

    ,ul: function(id, template) {
      var parent = my.wrapper;
      var theList = document.createElement("ul");
      theList.id = id;
      for (var r =0;r < this.data.results.bindings.length; r++) {
        var aItem = document.createElement('li');
        v = template;
        for (var i = 0; i < this.data.head.vars.length; i++) {
          if (this.data.results.bindings[r].hasOwnProperty(this.data.head.vars[i])) {
            vbits = v.split('${' + this.data.head.vars[i] + '}');
            v = vbits.join(this.data.results.bindings[r][this.data.head.vars[i]].value);
          }
        }
        aItem.innerHTML = v;
        theList.appendChild(aItem);
      }
      parent.appendChild(theList);
    }


  };

  return my;
}());

eval(JAPETH.init)


