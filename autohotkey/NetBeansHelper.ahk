#SingleInstance force

#IfWinActive ahk_class MozillaWindowClass
F5::
WinGetTitle, winTitle
if(InStr(winTitle,"OpenEMR"))
{
	Send, +{F10}hr
}
else
{
	Send {F5}
}
return
F6::
if(InStr(winTitle,"OpenEMR"))
{
	WinActivate, ahk_class SunAwtFrame
}
return
#IfWinActive ahk_class SunAwtFrame
F5::
	Send ^s
	WinGetTitle, winTitle
	if(InStr(winTitle,"oemruserscripts"))
	{
		run "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" "c:\users\yehster\documents\netbeansprojects\oemruserscripts\greasemonkey\allScriptsInterface.user.js"
		WinWaitActive, Greasemonkey Installation,,6
		if(ErrorLevel=0)
		{
			sleep, 3500
			send, {Enter}
			WinWaitActive, ahk_class MozillaWindowClass
			if(ErrorLevel=0)
			{
				send, ^w
			}
		}
		
	}
	if(InStr(winTitle,"oemrdoc"))
	{
		Send ^s
		WinActivate, ahk_class MozillaWindowClass	
	}
	return
 
