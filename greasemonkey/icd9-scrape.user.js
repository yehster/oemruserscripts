// ==UserScript==
// @name          ICD9 Scraper
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
styleIframe();
$(document).ready(function(){dispatch(loc)});

function debugInfo(text)
{
    debugDiv=$("body").find("#gmDebugInfo");
    if(debugDiv.length==0)
        {
            debugDiv=$("<div id='gmDebugInfo'></div>").prependTo($("body"));
            debugDiv=$("body").find("#gmDebugInfo");
        }
    $("<div>"+text+"</div>").appendTo(debugDiv);
}
function tagInfo(location,code,info,parent,type)
{
    var data="code="+escape(code)+"&info="+escape(info)+"&location="+escape(location)+"&type="+escape(type);
    if(parent!=null)
        {
            data=data+"&parent="+escape(parent);
        }
    if($("#links").length==1)
        {
            data=data+"&links="+escape($("#links").text());
        }
    GM_xmlhttpRequest({
    method: "POST",
    data: data, 
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    url:     "http://192.168.81.200/openemr/library/doctrine/maint/icd9scrape/icd9scrape.php",
    onload: function() {}
});
}

function createDefinition(code,seq,info)
{
    var data="code="+escape(code)+"&info="+escape(info)+"&seq="+escape(seq)
    GM_xmlhttpRequest({
    method: "POST",
    data: data, 
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    url:     "http://192.168.81.200/openemr/library/doctrine/maint/icd9scrape/createDefinition.php",
    onload: function() {}
});
}


function handleCodeAnchor(idx,element)
{
anchor=$(element);
li=anchor.parent("li");
$("<div><iframe class='nav' src='"+anchor.attr("href")+"'/><div>").appendTo($("body"));
}

function styleIframe()
{
    $("<style>iframe.nav{width:1200px;height:800px;}</style>").appendTo($("body"));
}

var nonSpecificImage="/Images/multiNonSpecificRed.gif";
var SpecificImage="/Images/SpecificGreen.gif";

function parseCodeInfo(data)
{
    fullInfo=$(data.responseText);
    info=fullInfo.find("div.codeHierarchyInnerWrapper");
    $("#gmDebugInfo").after(info);
    codes=info.children("div");
    var parents={};
    for(var idx=0;idx<codes.length;idx++)
        {
            var curCode=codes.eq(idx);
            desc=curCode.find("div.threeDigitCodeListDescription");
            var code=curCode.find("a.codeLink");
            var img=curCode.find("img.specificImage").attr("src")==SpecificImage;
            
            var codeText=code.attr("name");
            var level=parseInt(curCode.attr("class").substr(1,1));
            var codeParent="";
            
            parents[level]=codeText;
            if(level>1)
                {
                    codeParent=parents[level-1];
                }
                else
                    {
                        codeParent=codeSpan.text();
                    }
                    
            description =desc.text();
            var type;
            if(img)
                {
                    type="SP";
                }
                else
                    {
                        type="NS";
                    }
            tagInfo("",codeText,description,codeParent,type);
            debugInfo(codeText+":"+description+":"+level+":"+codeParent+":"+img);
            definitions=curCode.find("ul.definitionList li");
            if(definitions.length>0)
                {
                    for(var defIdx=0;defIdx<definitions.length;defIdx++)
                        {
                            curDef=definitions.eq(defIdx);
                            createDefinition(codeText,defIdx,curDef.text())
                        }
                }
        }
}

function handleLowestCode(idx,element)
{
    links=$("#links");
    if(links.length==0)
        {
            links=$("<div id='links'></div>").prependTo($("body"));
        }
    anchor=$(element);
    codeName=anchor.parent("li").text();
    links.text(links.text()+anchor.attr("href")+"|"+anchor.text()+"|"+codeName+"#");
        GM_xmlhttpRequest({
        method: "GET",
        url:anchor.attr("href"),
        onload: parseCodeInfo
        });
    
}

function dispatch(location)
{
    debugInfo(location);
    codeList=$("div.codeList ul");
    codeIdentifier=$("div.codeIdentifier");
    if(codeIdentifier.length==1)
        {
           ulCodeList=$("ul.codeList");
           if(ulCodeList.length==1)
           {
               codes=ulCodeList.find("a");
               codes.each(handleLowestCode);
           }

            codeSpan=codeIdentifier.find("span.identifier");
            parentElem=$("div.navBreadcrumb a.identifier");
            if(parentElem.length==1)
                {
                    parentText=parentElem.text();
                }
                else
                    {
                        parentText=null;
                    }
            tagInfo(location,codeSpan.text(),codeIdentifier.text(),parentText,"SECTION");
        }
    if(codeList.length==1)
        {
            codesAnchors=codeList.children("li a");
            codesAnchors.each(handleCodeAnchor);
        }
}