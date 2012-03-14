// ==UserScript==
// @name          Allscripts Integration
// @namespace     http://yehster.no-ip.org/
// @description   
// @include       http://www.icd9data.com/2012/Volume1/default.htm
// @include       http://www.icd9data.com/2012/Volume1/*
// @exclude       
// @exclude       
// @require http://code.jquery.com/jquery-1.7.1.min.js
// ==/UserScript==

var loc=window.location.href;

var baseURL="http://www.icd9data.com/2012/Volume1/"
var pages={
    start: "default.htm"
}
$(document).ready(function(){dispatch(loc)});

function debugInfo(text)
{
    debugDiv=$("body").find("#gmDebugInfo");
    if(debugDiv.length==0)
        {
            debugDiv=$("<div id='#gmDebugInfo'></div>").prependTo($("body"));
        }
    $("<div>"+text+"</div>").appendTo(debugDiv);
}

function handleCodeAnchor(idx,element)
{
window.alert(idx);
anchor=$(element);
GM_xmlhttpRequest({
  method: "GET",
  url:     anchor.attr("href"),
  onload: function(data){window.alert(data.responseText);}
});
}
function dispatch(location)
{
    debugInfo(location);
    codeList=$("div.codeList ul");
    if(codeList.length==1)
        {
            codesAnchors=codeList.find("a");
            codesAnchors.each(handleCodeAnchor);
        }
        else
            {
                ulCodeList=$("ul.codeList");
                if(ulCodeList.length==1)
                    {
                        codes=ulCodeList.find("a");
                        codes.each(parseCodeLink)
                    }
            }
}