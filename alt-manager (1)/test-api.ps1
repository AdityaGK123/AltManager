$body = @{
    email = "maddurihasini25@gmail.com"
    password = "test123456"
    name = "Hasini Madduri"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response:" $responseBody
}
