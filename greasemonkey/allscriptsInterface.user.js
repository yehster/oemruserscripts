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
    oemrMain: "/interface/main/main_title.php",
    oemrDemo: "/interface/patient_file/summary/demographics.php",
    oemrDemoFull: "/interface/patient_file/summary/demographics_full.php"
}

var asContID={
    lblPatientName: "ctl00_lblPatientName",
    lblGenderDOB: "ctl00_lblGenderDob",
    txtPatLNAME: "ctl00_ContentPlaceHolder1_PatientSearch_txtLastName",
    txtPatFNAME: "ctl00_ContentPlaceHolder1_PatientSearch_txtFirstName",
    txtPatDOB: "ctl00_ContentPlaceHolder1_PatientSearch_rdiDOB",
    tblViewPatients: "ctl00_ContentPlaceHolder1_grdViewPatients_ctl00",
    btnSearch: "ctl00_ContentPlaceHolder1_PatientSearch_btnSearch"
}

var asAddPatientControls={
    btnAllergy: "ctl00_ContentPlaceHolder1_btnAddAllergy"
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
    
    GM_setValue("searchState","not found");
    
}

//TODO: Can I add a dialog div that displays the drugs from OpenEMR?

function setOEMRDOB(DOB)
{
        DOBParts=DOB.split("-");
        DOBYear=DOBParts[0].substr(0,4);
        DOBMonth=DOBParts[1].substr(0,2);
        DOBDay=DOBParts[2].substr(0,2);

    
        GM_setValue("patientDOBYear",DOBYear);
        GM_setValue("patientDOBMonth",DOBMonth);
        GM_setValue("patientDOBDay",DOBDay);    
}
// Retrieve the patient information from the OpenEMR demographics page.
function findPatientInfo()
{
    text=$(this).html()
    marker="top.window.parent.left_nav.setPatient("
    var loc=text.indexOf(marker);
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
        setOEMRDOB(DOB);
        
        GM_setValue("patientFNAME",fname);
        GM_setValue("patientLNAME",lname);
    
        
        
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
function delayClick(elemID,delay)
{

        setTimeout(function() {
         
        
        var element = document.getElementById(elemID);
        if (element != null)
        {
            element.click();
        }
            
        },delay);
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
    safeClick(asContID['btnSearch']);
    GM_setValue("searchState","searching");    
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
                    rowID=$(this).find("input[id]").attr("id");                    
                    safeClick(rowID);
                    
                }
        }
}

function asCheckPatientInfo()
{
    pn=$("#"+asContID['lblPatientName']).text();
    foundPatient=pn.indexOf(GM_getValue("patientLNAME")+", "+GM_getValue("patientFNAME"));
    if(foundPatient===0)
        {
            DOB=$("#"+asContID['lblGenderDOB']).text();
            foundDOB=DOB.indexOf(patDOB());
            if(foundDOB>=0)
            {
                GM_setValue("searchState","found");
            }

        }

}
function asSearchDispatcher()
{
       asCheckPatientInfo();
       if(GM_getValue("searchState").indexOf("not found")==0)
        {
            asPopulateAndSearchPatientInfo();
        }
        if(GM_getValue("searchState").indexOf("searching")==0)
        {
            tblViewPatients=$("#"+asContID['tblViewPatients']);
            if(tblViewPatients.length>0)
            {
                GM_setValue("searchState","results scanning")
                rows=tblViewPatients.find("tbody tr");
                rows.each(asFindPatientInResults);
            }
        }    
}

function findInHTML(data,controlID)
{
    idTag="id='"+controlID+"'";
    locID=data.indexOf(idTag);
    const val="value='";
    locVal=data.indexOf(val,locID)+val.length;
    valEnd=data.indexOf("'",locVal)

    retVal=data.substr(locVal,valEnd-locVal);
    return retVal;
}

function processOEMRDemographics(data)
{
    $("#demoLoading").hide();
    text=data.responseText;
    fname=findInHTML(text,"form_fname");
    lname=findInHTML(text,"form_lname");
    dob=findInHTML(text,"form_DOB");
    zip=findInHTML(text,"form_postal_code");
    window.alert(fname+":"+lname+":"+patDOB()+":"+zip);
    setOEMRDOB(dob);


}
function loadDemographicsFromOpenEMR()
{
    demoFullURL=GM_getValue("OpenEMR Server")+pages['oemrDemoFull'];
    loading=$("#demoLoading");
    if(loading.length===0)
        {
            $("#gmOEMRImport").before("<SPAN id='demoLoading' float:right>Loading</SPAN>")    
            loading=$("#demoLoading");
        }
        loading.show();
GM_xmlhttpRequest({
  method: "GET",
  url:     demoFullURL,
  onload: processOEMRDemographics
});
}
function asAddPatientUpdate()
{

    btnAll=$("#"+asAddPatientControls['btnAllergy']);
    btnAll.after("<DIV id='GMControls' style='float:right;'></DIV>");
    $("#GMControls").append("<input type='button' value='Load from OpenEMR' id='gmOEMRImport' >")
    $("#GMControls").append("<div  id='gmOEMRInfo' style='display:none' >OpenEMRInfo</DIV")

    $("#gmOEMRImport").click(loadDemographicsFromOpenEMR);
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
        $(document).ready(asSearchDispatcher);
    }


if(loc.indexOf(pages['addPatient'])>=0)
    {
        $(document).ready(asAddPatientUpdate)
    }
if(loc.indexOf(pages['oemrMain'])>=0)
    {
        allScriptsLink="<a href='https://eprescribe.allscripts.com/default.aspx' target='Allscripts' class='css_button_small' style='float:right;'>"+"<span>Allscripts</span>"+"</a>";
        $("#current_patient_block").append(allScriptsLink);
    }
pos=loc.indexOf(pages['oemrDemo']);
if(pos>=0)
    {
        
        $("script[language='JavaScript']").each(findPatientInfo);
        server=loc.substr(0,pos);

        GM_setValue("OpenEMR Server",server);

    }
