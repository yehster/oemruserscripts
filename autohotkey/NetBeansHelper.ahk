#SingleInstance force

#IfWinActive ahk_class SunAwtFrame
~^s::
	WinGetTitle, winTitle
		if(InStr(winTitle,"oemruserscripts"))
	{
		run "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" "c:\users\yehster\documents\netbeansprojects\oemruserscripts\greasemonkey\allScriptsInterface.user.js"
	}
	if(InStr(winTitle,"oemrdoc"))
	{
		MsgBox, "OEMRDOC"
	}
 
