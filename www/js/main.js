
var deploy = "DEV"

// DOM Ready =============================================================
$(document).ready(function() {
    if(deploy=="DEV"){
        initApp();
    } else {
        document.addEventListener("deviceready", onDeviceReady, false);
    }
});

function onDeviceReady(){
   // $.support.cors = true;
   initApp();
}


function initApp(){
  
    $('#escanBtn').click(function(){
     scanStart();
    });

    $(document).on("pageshow","#scanResult", function() {
       showResultsScreen();
    });

    $(document).on("pageshow","#scanHistory", function() {
       showHistory();
    })
    //resString = 'http://semadet.jalisco.gob.mx/?VQNN9e1FQVV+kX9ZIFRRsuhoD1tlyA0tda8zy9r6vgIZPpLsmSX8ocnM9WZ8P0bfidPnbtjob23fMG8NhvbieU+QmA+40tVU'
   
   //$.mobile.changePage('#scanResult') 

   setTimeout(function () {
       scanStart();
    }, 1000);

}



function loadTemplate (objTo,rs,div){
    console.log(objTo.file)
     $.ajax({
            type: "GET",
            url: objTo.file,
            cache: false,
            dataType : "text",
            crossDomain: true,
            success: function (data) {
                objTo.template = data;
                renderTemplate(objTo,rs,div);
            },
            error : function(err){
                alert(JSON.stringify(err));
            }
    }); 
}   

var format;
var resString;
var cancelled;


function scanStart(){

 var scanner = cordova.require("cordova/plugin/BarcodeScanner");

 scanner.scan( function (result) { 

           format = result.format;
           resString = result.text;
           cancelled = result.cancelled
            //alert(JSON.stringify(result))
           // if (args.format == "QR_CODE") {
            //    window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
            //}

             $.mobile.changePage('#scanResult') 
             
            

        }, function (error) { 
            alert("Escaneo Fallido: ", error); 
        } );

}

function showResultsScreen(){

  // DEcrypt

  if(!cancelled){

     var frase = "X45RTY78";


    var cutURL = String(resString.slice(0,resString.indexOf("?")))

    var cutEncrypted = String(resString.slice(resString.indexOf("?")+1))

   // var decrypted = CryptoJS.AES.decrypt(cutEncrypted, frase); 
   //var decrypted = Aes.Ctr.decrypt(cutEncrypted, frase, 128);

  //  var toBase = decrypted.toString(CryptoJS.enc.Utf8)
    var toBase = Aes.Ctr.decrypt(cutEncrypted, frase, 128);
    //var encrypted = Aes.Ctr.encrypt(enc, values.frase, 128);
    

    var exp = toBase.split("_");

     $('#url').text("");
    $('#folio').text("");
    $('#format').text("");
    $('#entidad').text("");
    $('#emision').text("");

    if(exp[0]!=frase){
      alert("Codigo inválido para este dispositivo, Enviando información a Administrador Remoto")
       $.mobile.changePage('#home') 

    }else{
         $('#url').append('<a target="_blank" href="'+ cutURL +'">'+ cutURL +'</a>');
        $('#folio').text(exp[1] + " " + exp[2]);
        $('#format').append(exp[3]);
        $('#entidad').text(exp[4]);
        $('#emision').text(exp[5]);

        var reg = {};
        reg.url = String(cutURL)
        reg.folio   =  String(exp[1]) + " " + String(exp[2])
        reg.formato = String(exp[3])
        reg.entidad = String(exp[4])
        reg.emision = String(exp[5]) 
        reg.timestamp = String(Math.floor(Date.now() / 1000));


      saveReg(reg);
    }

   
 }else{
   $.mobile.changePage('#home') 

}


}

function decodeQR(string){
  var resObj = {}

  return resObj;
}

var historyRS;

function saveReg(val){

  historyRS = [];
  try {
  var value = window.localStorage.getItem("historial");
  } catch (e) { alert(e)};

  if(value==null || value==""){

    historyRS = [];
  } else{

    try {
   historyRS = JSON.parse(value);
     } catch (e) { alert(e)};
  }

  try{
    historyRS.push(val);
   } catch (e) { alert(e)};

  
  var stringReady = JSON.stringify(historyRS)

  window.localStorage.setItem("historial", stringReady)


}
function clearHistory(){
    window.localStorage.clear();
     $('#listaLecturas').empty();
     $('#listaLecturas').listview('refresh')
}

function showHistory(){
  var value = window.localStorage.getItem("historial");
   var lHistory = JSON.parse(value);

   var html=''

     $('#listaLecturas').empty();
     $('#listaLecturas').listview('refresh')

    

    for (var i in lHistory){

      var rec = lHistory[i];
      
      html+='      <li>'
    //  html+='          <a href="#lec1">'
      html+='          <div class="listReg">'+ rec.folio  +'</div>'
      html+='          <div class="listReg">'+ rec.formato  +'</div>'
      html+='          <div class="listReg">'+ rec.entidad  +'</div>'
      html+='          <div class="listReg">'+ rec.emision  +'</div>'
      html+='          <div class="listReg">'+ timeConverter(rec.timestamp)  +'</div>'
     // html+='          </a>'
      html+='      </li>'

      

    }

    $('#listaLecturas').append(html).listview('refresh')


}

function showSplash(){

}

function hideSplash(){

}



function generateTS() {
    return Math.round(+new Date() / 1000);
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}