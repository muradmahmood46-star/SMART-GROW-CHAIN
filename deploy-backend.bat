@echo off
echo Deploying backend to Hugging Face...
cd /d "c:\Users\pc\Desktop\ptc pro\backend"
git add -A
git commit -m "deploy update"
git push hfspace HEAD:main --force
echo.
echo Done! Backend deployed to Hugging Face.
pause
