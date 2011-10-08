// ==UserScript==
// @name          Allscripts Integration
// @namespace     http://yehster.no-ip.org/
// @description   
// @include       https://eprescribe.allscripts.com/*
// @include       */openemr/interface/main/main_title.php
// @include       */openemr/interface/patient_file/summary/demographics.php*
// @exclude       
// @exclude       
// @require http://code.jquery.com/jquery-1.6.4.min.js
// ==/UserScript==


var pages={
    interstitial: "/InterstitialAd.aspx",
    addPatient: "/AddPatient.aspx?Mode=Add",
    def: "/default.aspx",
    allergy: "/PatientAllergy.aspx",
    Login: "/Login.aspx",
    oemrMain: "/openemr/interface/main/main_title.php",
    oemrDemo: "openemr/interface/patient_file/summary/demographics.php"
}

var asContID={
    lblPatientName: "ctl00_lblPatientName",
    txtPatLNAME: "ctl00_ContentPlaceHolder1_PatientSearch_txtLastName_text",
    txtPatFNAME: "ctl00_ContentPlaceHolder1_PatientSearch_txtFirstName_text",
    txtPatDOB: "ctl00_ContentPlaceHolder1_PatientSearch_rdiDOB_text",
    tblViewPatients: "ctl00_ContentPlaceHolder1_grdViewPatients_ctl00"
}


function resetInfo()
{
    GM_setValue("OpenEMR Server","");
    GM_setValue("OpenEMR Session","");
    
    // Patient Info
    GM_setValue("patientFNAME","");
    GM_setValue("patientLNAME","");
    
    GM_setValue("patientDOBYear","");
    GM_setValue("patientDOBMonth","");
    GM_setValue("patientDOBDay","");
    
    // Prescription Info
    GM_setValue("MedName","") // The Med Name
    GM_setValue("MedSTR",""); // The Med Strength
    GM_setValue("MedSIG",""); // The Med SIG
    
    GM_setValue("patientSearch","not started");
    
}

//TODO: Can I add a dialog div that displays the drugs from OpenEMR?

// Retrieve the patient information from the OpenEMR demographics page.
function findPatientInfo()
{
    text=$(this).html()
    marker="top.window.parent.left_nav.setPatient("
    loc=text.indexOf(marker);
    if(loc>=0)
    {
        resetInfo();
        //window.alert(text);
        end=text.indexOf(")",loc)
        rest=text.substr(loc+marker.length,end-(loc+marker.length));
        toks=rest.split(",");
        name=toks[0]
        nameParts=name.split(" ");
        fname=nameParts[0].replace("'","");
        lname=nameParts[1].replace("'","");
        pid=toks[1];
        pubpid=toks[2];
        dobSTR=toks[4]
        DOBHeader="DOB: ";
        AgeHeader="Age:";
        start = DOBHeader.length + dobSTR.indexOf(DOBHeader)
        DOB=dobSTR.substr(start,(dobSTR.indexOf(AgeHeader)-start));
        DOB.replace(" ","");
        DOBParts=DOB.split("-");
        DOBYear=DOBParts[0].substr(0,4);
        DOBMonth=DOBParts[1].substr(0,2);
        DOBDay=DOBParts[2].substr(0,2);

        GM_setValue("patientFNAME",fname);
        GM_setValue("patientLNAME",lname);
    
        GM_setValue("patientDOBYear",DOBYear);
        GM_setValue("patientDOBMonth",DOBMonth);
        GM_setValue("patientDOBDay",DOBDay);
        
        
    }
}

function safeClick(id)
{
        var element = document.getElementById(id);
        if (element != null)
        {
            element.click();
        }

}
function patDOB()
{
    retVal=GM_getValue("patientDOBMonth");
    retVal=retVal.concat("/");
    retVal=retVal.concat(GM_getValue("patientDOBDay"))
    retVal=retVal.concat("/")
    retVal=retVal.concat(GM_getValue("patientDOBYear"));
    return retVal;
 
}

function asPopulateAndSearchPatientInfo()
{
    $("#"+asContID['txtPatLNAME']).val(GM_getValue("patientLNAME"));
    $("#"+asContID['txtPatFNAME']).val(GM_getValue("patientFNAME"));


}

function asFindPatientInResults()
{
    myHTML=$(this).html();
    foundPatient=myHTML.indexOf(GM_getValue("patientLNAME")+", "+GM_getValue("patientFNAME"));
    if(foundPatient>=0)
        {
            foundDOB=myHTML.indexOf(patDOB(),foundPatient);
            if(foundDOB>=0)
                {
                    safeClick($(this).find("input[id]").attr("id"));
                }
        }
}
var loc=window.location.href;
if(loc.indexOf(pages['interstitial'])>=0)
    {
        var adButton = document.getElementById("adControl_closeButton");
        if (adButton != null)
        {
            adButton.click();
        }
    
    }



if((loc.toLowerCase().indexOf(pages['def'])>=0) || (loc.indexOf(pages['Login'])>=0))
    {
//        if(GM_getValue("patientFound")=="not started")
        {
            $(document).ready(asPopulateAndSearchPatientInfo());
        }
        tblViewPatients=$("#"+asContID['tblViewPatients']);
        if(tblViewPatients.length>0)
            {
                rows=tblViewPatients.find("tbody tr");
                rows.each(asFindPatientInResults);
            }
    }



if(loc.indexOf(pages['oemrMain'])>=0)
    {
        allScriptsLink="<a href='https://eprescribe.allscripts.com/default.aspx' target='Allscripts' class='css_button_small' style='float:right;'>"+"<span>Allscripts</span>"+"</a>";
        $("#current_patient_block").append(allScriptsLink);
    }

if(loc.indexOf(pages['oemrDemo'])>=0)
    {
        $("script[language='JavaScript']").each(findPatientInfo);
    }
