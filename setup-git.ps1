# Stop any running Git processes
Get-Process | Where-Object {$_.ProcessName -like "*git*"} | Stop-Process -Force

# Remove existing Git repository
Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue

# Initialize new Git repository
git init

# Add remote repository
git remote add origin https://github.com/Tejas-Bipu-Shahi/DeployNavaVancer.git

# Create and switch to main branch
git branch -M main

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: School Management System"

# Push to remote repository
git push -u origin main --force

Write-Host "Git repository has been set up successfully!" 