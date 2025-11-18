$testEmail = "test_$(Get-Random)@example.com"
$body = @{
    email = $testEmail
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Testing registration with:"
Write-Host "Email: $testEmail"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "Success!"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
