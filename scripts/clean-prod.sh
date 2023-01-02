# Temporary clean sccript for replacing eval() code from the backgroud script
VAR='new Function("return this;")().Promise)'
VAR2="(function() { return this ? this : typeof self !== 'undefined' ? self : undefined})() || Function('return this')()"

cd ./dist/js
sed -i -e "s/${VAR}/${VAR2}/g" backgroundPage.js
cd ../../
