$w=New-Object -ComObject Word.Application
$w.Visible=$false
$d=$w.Documents.Add()
$d.Range.Text='test'
$d.SaveAs([ref]'C:\\Users\\ayana\\OneDrive\\Desktop\\med_hr\\test_word.docx')
$d.Close()
$w.Quit()
Write-Host 'ok'
