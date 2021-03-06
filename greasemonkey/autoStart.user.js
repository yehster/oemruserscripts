// ==UserScript==
// @name          OpenEMR Tools
// @require       http://code.jquery.com/jquery-1.6.4.min.js
// @namespace     http://yehster.no-ip.org/
// @description   
// @include       http://192.168.227.128/openemr/*
// @include       http://yehster.no-ip.org:5900/openemr/*
// @include       http://192.168.1.60:5900/openemr/* 
// @include       http://ubuntu/openemr/*
// @exclude       
// @exclude
// ==/UserScript==

var pages={
    leftNav: "/openemr/interface/main/left_nav.php",
    logon: "/openemr/interface/login/login.php",
    patientSelect: "/openemr/interface/main/finder/patient_select.php",
    demo: "/openemr/interface/patient_file/summary/demographics.php"
}
function initializeStartupValue()
{
    GM_setValue("leftNavSearch",true);
    GM_setValue("patientSelectSearch",true);
    
}

function clickLogon()
{
    initializeStartupValue();
    unsafeWindow.$("input[type='submit']").click();
}

function searchDoe()
{
    GM_setValue("leftNavSearch",false);
    $("input[class='inputtext'][type='entry']").val("Doe");
    unsafeWindow.findPatient('Last');
}

function clickRow()
{
    GM_setValue("patientSelectSearch",false);
    unsafeWindow.$("#1").click();
}

function addDoctrine()
{
    table=$("div.section-header").parent("td").parent.("tr").parent("tbody");
    window.alert(table.length);
}

var loc=window.location.href;

if(loc.indexOf(pages['logon'])>=0)
    {
        $(document).ready(clickLogon);
    }
else if(loc.indexOf(pages['leftNav'])>=0)
    {
        if(GM_getValue("leftNavSearch"))
            {
                $(document).ready(searchDoe);            
            }
    }
else if(loc.indexOf(pages['patientSelect'])>=0)
    {
        if(GM_getValue("patientSelectSearch"))
            {
                $(document).ready(clickRow);            
            }
    
    }
else if(loc.indexOf(pages['demo'])>=0)
    {
    
    }
