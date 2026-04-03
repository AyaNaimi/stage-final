$w=New-Object -ComObject Word.Application
$w.Visible=$false
$w.DisplayAlerts=0
try {
  $d = $w.Documents.Add()
  'ok'
} catch { $_.Exception.HResult; $_.Exception.Message }
$w.Quit()
