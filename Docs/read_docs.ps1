Add-Type -AssemblyName System.IO.Compression.FileSystem
$files = @(
    "VISION & SCOPE.docx",
    "0-Level Architecture Design.docx",
    "API & REQUEST FLOW.docx",
    "Behavioral Document.docx",
    "DATABASE DESIGN V1&V2.docx",
    "IMPLEMENTATION BLUEPRINT.docx",
    "FUTURE EXPANSION BLUEPRINT.docx"
)
foreach ($f in $files) {
    Write-Output "`n========== $f ==========`n"
    $path = "c:\Users\shafi\Documents\MERN\Docs\$f"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $xml = $reader.ReadToEnd()
    $reader.Close(); $stream.Close(); $zip.Dispose()
    $doc = [xml]$xml
    $ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
    $paras = $doc.SelectNodes("//w:p", $ns)
    foreach ($para in $paras) {
        $runs = $para.SelectNodes(".//w:t", $ns)
        $line = ""
        foreach ($run in $runs) { $line += $run.InnerText }
        if ($line.Trim() -ne "") { Write-Output $line }
    }
}
