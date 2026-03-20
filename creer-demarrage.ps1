$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\discord-bot.lnk")
$Shortcut.TargetPath = "C:\Users\desou\discord-bot\start-bot.bat"
$Shortcut.Save()
Write-Host "Raccourci de démarrage créé !"
