$w=New-Object -ComObject Word.Application
$w.Visible=$true
$w.DisplayAlerts=0
try {
  $t = $w.NormalTemplate
  $d = $w.Documents.Add($t)
  $d.Range.Text='test'
  $d.SaveAs([ref]'C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\test_word2.docx')
  $d.Close()
  'ok'
} catch { $_.Exception.HResult; $_.Exception.Message }
$w.Quit()
